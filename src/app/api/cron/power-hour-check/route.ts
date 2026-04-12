import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mentorCommitmentTracker, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/service";

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

        let checked = 0;
        let failed = 0;

        for (const mentor of activeMentors) {
            const [tracker] = await db
                .select()
                .from(mentorCommitmentTracker)
                .where(
                    and(
                        eq(mentorCommitmentTracker.mentorId, mentor.id),
                        eq(mentorCommitmentTracker.month, prevMonth)
                    )
                )
                .limit(1);

            if (tracker && (tracker.hoursLogged ?? 0) >= 60) {
                // Already met — nothing to do
                checked++;
                continue;
            }

            if (tracker) {
                // Row exists but hours insufficient
                await db
                    .update(mentorCommitmentTracker)
                    .set({ status: "failed" })
                    .where(eq(mentorCommitmentTracker.id, tracker.id));
            } else {
                // No sessions logged at all this month
                await db.insert(mentorCommitmentTracker).values({
                    mentorId: mentor.id,
                    month: prevMonth,
                    hoursLogged: 0,
                    status: "failed",
                });
            }

            await createNotification(mentor.id, "general", {
                title: "Power Hour Commitment Not Met",
                body: `You logged fewer than 60 minutes of mentoring in ${prevMonth}. Please stay on track next month.`,
            });

            checked++;
            failed++;
        }

        return NextResponse.json({ success: true, month: prevMonth, checked, failed });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
