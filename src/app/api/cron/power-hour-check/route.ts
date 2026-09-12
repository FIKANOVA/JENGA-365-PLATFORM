import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mentorCommitmentTracker, users } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { createNotifications } from "@/lib/notifications/service";

export const dynamic = "force-dynamic";

/**
 * Returns the previous month as 'YYYY-MM' (e.g. '2026-03').
 * Exported for unit testing.
 */
export function getPreviousMonth(date: Date = new Date()): string {
    const year = date.getFullYear();
    const zeroIndexedMonth = date.getMonth(); // 0=Jan, 11=Dec

    if (zeroIndexedMonth === 0) {
        return `${year - 1}-12`;
    }
    // zeroIndexedMonth as a 1-indexed number equals the previous calendar month
    // e.g. April → getMonth()=3 → previous month = March = '03' (1-indexed)
    return `${year}-${String(zeroIndexedMonth).padStart(2, "0")}`;
}

/**
 * GET /api/cron/power-hour-check
 *
 * Monthly Power Hour compliance check — runs on the 1st of each month.
 * Evaluates every active Mentor's commitment for the previous month.
 *
 * Rules:
 *   - hoursLogged >= 60 → already 'met', skip.
 *   - hoursLogged < 60 (row exists) → set status = 'failed', notify mentor.
 *   - No row found → create row with hoursLogged=0, status='failed', notify mentor.
 *
 * Cadence: 0 0 1 * *
 */
export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prevMonth = getPreviousMonth();

    try {
        const activeMentors = await db
            .select({ id: users.id })
            .from(users)
            .where(
                and(
                    eq(users.role, "Mentor"),
                    eq(users.status, "active"),
                    eq(users.isApproved, true)
                )
            );

        const mentorIds = activeMentors.map((m) => m.id);
        const trackersByMentorId = new Map();

        if (mentorIds.length > 0) {
            const allTrackers = await db
                .select()
                .from(mentorCommitmentTracker)
                .where(
                    and(
                        inArray(mentorCommitmentTracker.mentorId, mentorIds),
                        eq(mentorCommitmentTracker.month, prevMonth)
                    )
                );

            for (const t of allTrackers) {
                if (!trackersByMentorId.has(t.mentorId)) {
                    trackersByMentorId.set(t.mentorId, t);
                }
            }
        }

        let checked = 0;
        let failed = 0;

        const trackersToUpdate: string[] = [];
        const trackersToInsert: { mentorId: string; month: string; hoursLogged: number; status: "failed" }[] = [];
        const notificationsToInsert: Parameters<typeof createNotifications>[0] = [];

        for (const mentor of activeMentors) {
            const tracker = trackersByMentorId.get(mentor.id);

            if (tracker && (tracker.hoursLogged ?? 0) >= 60) {
                // Already met — nothing to do
                checked++;
                continue;
            }

            if (tracker) {
                // Row exists but hours insufficient
                trackersToUpdate.push(tracker.id);
            } else {
                // No sessions logged at all this month
                trackersToInsert.push({
                    mentorId: mentor.id,
                    month: prevMonth,
                    hoursLogged: 0,
                    status: "failed",
                });
            }

            notificationsToInsert.push({
                userId: mentor.id,
                type: "general",
                title: "Power Hour Commitment Not Met",
                body: `You logged fewer than 60 minutes of mentoring in ${prevMonth}. Please stay on track next month.`,
            });

            checked++;
            failed++;
        }

        if (trackersToUpdate.length > 0) {
            await db
                .update(mentorCommitmentTracker)
                .set({ status: "failed" })
                .where(inArray(mentorCommitmentTracker.id, trackersToUpdate));
        }

        if (trackersToInsert.length > 0) {
            await db.insert(mentorCommitmentTracker).values(trackersToInsert);
        }

        if (notificationsToInsert.length > 0) {
            await createNotifications(notificationsToInsert);
        }

        return NextResponse.json({ success: true, month: prevMonth, checked, failed });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
