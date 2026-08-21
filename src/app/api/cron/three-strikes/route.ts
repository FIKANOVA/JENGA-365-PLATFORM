import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { giveBackTracking, users } from "@/lib/db/schema";
import { eq, and, count, inArray } from "drizzle-orm";
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

        if (activeMentees.length === 0) {
            return NextResponse.json({
                success: true,
                quarter: prevQuarter,
                processed: 0,
                flagged: 0,
            });
        }

        const menteeIds = activeMentees.map(m => m.id);

        // ── Pre-fetch completed tracking records for all mentees for the previous quarter
        const completedRecords = await db
            .select({ userId: giveBackTracking.userId })
            .from(giveBackTracking)
            .where(
                and(
                    inArray(giveBackTracking.userId, menteeIds),
                    eq(giveBackTracking.quarter, prevQuarter),
                    eq(giveBackTracking.activityCompleted, true)
                )
            );

        const completedUserIds = new Set(completedRecords.map(r => r.userId));

        // ── Pre-fetch failed quarter counts for all mentees
        const failedCounts = await db
            .select({
                userId: giveBackTracking.userId,
                failedCount: count()
            })
            .from(giveBackTracking)
            .where(
                and(
                    inArray(giveBackTracking.userId, menteeIds),
                    eq(giveBackTracking.activityCompleted, false)
                )
            )
            .groupBy(giveBackTracking.userId);

        const failedCountsMap = new Map(failedCounts.map(r => [r.userId, Number(r.failedCount)]));

        let processed = 0;
        let flagged = 0;

        const trackingInserts: {
            userId: string;
            quarter: string;
            activityCompleted: boolean;
            strikeCount: number;
        }[] = [];
        const flaggedMentees: string[] = [];
        const notificationPromises: Promise<void>[] = [];

        for (const mentee of activeMentees) {
            // ── 2. Did they complete their give-back this quarter? ────────────
            if (completedUserIds.has(mentee.id)) continue; // Participated — no strike

            // ── 3. Count total failed quarters (running strike total) ─────────
            const failedCount = failedCountsMap.get(mentee.id) || 0;

            // Strike count after recording this quarter's failure
            const newStrikeCount = failedCount + 1;

            // ── 4. Record this quarter's failure ─────────────────────────────
            trackingInserts.push({
                userId: mentee.id,
                quarter: prevQuarter,
                activityCompleted: false,
                strikeCount: newStrikeCount,
            });

            // ── 5. Take action based on strike count ──────────────────────────
            if (newStrikeCount >= 3) {
                flaggedMentees.push(mentee.id);
                flagged++;
            } else {
                notificationPromises.push(
                    createNotification(mentee.id, "general", {
                        title: "Give Back Reminder",
                        body: `You have ${newStrikeCount} strike${newStrikeCount > 1 ? "s" : ""} on the Give Back programme. Please complete an activity next quarter to keep your account in good standing.`,
                    })
                );
            }

            processed++;
        }

        // ── 6. Execute batch database operations ─────────────────────────────
        if (trackingInserts.length > 0) {
            await db.insert(giveBackTracking).values(trackingInserts);
        }

        if (flaggedMentees.length > 0) {
            await db
                .update(users)
                .set({ status: "under_review" })
                .where(inArray(users.id, flaggedMentees));
        }

        if (notificationPromises.length > 0) {
            await Promise.all(notificationPromises);
        }

        return NextResponse.json({
            success: true,
            quarter: prevQuarter,
            processed,
            flagged,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error occurred";
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
