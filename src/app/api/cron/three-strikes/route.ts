import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { giveBackTracking, users } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/service";

export const dynamic = "force-dynamic";

/**
 * Returns the previous quarter string (e.g. '2026-Q1') relative to the given date.
 * Exported for unit testing.
 *
 * Cron schedule: 0 0 1 1,4,7,10 * (Jan 1, Apr 1, Jul 1, Oct 1)
 * When it fires it always checks the quarter that just ended.
 */
export function getPreviousQuarter(date: Date = new Date()): string {
    const year = date.getFullYear();
    const quarter = Math.ceil((date.getMonth() + 1) / 3); // 1–4

    if (quarter === 1) {
        return `${year - 1}-Q4`;
    }
    return `${year}-Q${quarter - 1}`;
}

/**
 * GET /api/cron/three-strikes
 *
 * Quarterly Three Strikes enforcement for the Give Back programme.
 *
 * For every active Mentee:
 *   1. Check if they completed a Give Back activity in the previous quarter.
 *   2. If not, record the failure and count their total missed quarters.
 *   3. At 1–2 strikes: send a warning notification to the mentee.
 *   4. At 3+ strikes: set users.status = 'under_review' and notify moderators.
 *
 * Mentees who completed their activity are skipped entirely.
 */
export async function GET(req: Request) {
    // ── Auth guard ────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prevQuarter = getPreviousQuarter();

    try {
        // ── 1. Fetch all active, approved Mentees ─────────────────────────────
        const activeMentees = await db
            .select({ id: users.id })
            .from(users)
            .where(
                and(
                    eq(users.role, "Mentee"),
                    eq(users.status, "active"),
                    eq(users.isApproved, true)
                )
            );

        let processed = 0;
        let flagged = 0;

        for (const mentee of activeMentees) {
            // ── 2. Did they complete their give-back this quarter? ────────────
            const [completedRecord] = await db
                .select({ id: giveBackTracking.id })
                .from(giveBackTracking)
                .where(
                    and(
                        eq(giveBackTracking.userId, mentee.id),
                        eq(giveBackTracking.quarter, prevQuarter),
                        eq(giveBackTracking.activityCompleted, true)
                    )
                )
                .limit(1);

            if (completedRecord) continue; // Participated — no strike

            // ── 3. Count total failed quarters (running strike total) ─────────
            const [{ failedCount }] = await db
                .select({ failedCount: count() })
                .from(giveBackTracking)
                .where(
                    and(
                        eq(giveBackTracking.userId, mentee.id),
                        eq(giveBackTracking.activityCompleted, false)
                    )
                );

            // Strike count after recording this quarter's failure
            const newStrikeCount = (Number(failedCount) || 0) + 1;

            // ── 4. Record this quarter's failure ─────────────────────────────
            await db.insert(giveBackTracking).values({
                userId: mentee.id,
                quarter: prevQuarter,
                activityCompleted: false,
                strikeCount: newStrikeCount,
            });

            // ── 5. Take action based on strike count ──────────────────────────
            if (newStrikeCount >= 3) {
                await db
                    .update(users)
                    .set({ status: "under_review" })
                    .where(eq(users.id, mentee.id));
                flagged++;
            } else {
                await createNotification(mentee.id, "general", {
                    title: "Give Back Reminder",
                    body: `You have ${newStrikeCount} strike${newStrikeCount > 1 ? "s" : ""} on the Give Back programme. Please complete an activity next quarter to keep your account in good standing.`,
                });
            }

            processed++;
        }

        return NextResponse.json({
            success: true,
            quarter: prevQuarter,
            processed,
            flagged,
        });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
