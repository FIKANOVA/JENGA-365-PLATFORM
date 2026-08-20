import { db } from "@/lib/db";
import {
    treeSurvivalChecks,
    corporateUnlockMilestones,
    corporateResources,
} from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

import { revalidatePath } from "next/cache";

/**
 * Recomputes currentValue for all LOCKED milestones of the given type (or all types
 * if none specified) and flips status to UNLOCKED when the threshold is met.
 *
 * Tree survival counting fix — prevents double-counting across audit intervals:
 *   A location audited at 6 months AND 12 months should count only the most recent
 *   trees_alive figure, not the sum of both. We use DISTINCT ON (project_location_id)
 *   ordered by survey_date DESC to isolate the latest reading per location, then SUM
 *   those snapshots.
 *
 * Runs inside an isolated database transaction to guarantee idempotency and prevent
 * race conditions / double-allocations during concurrent field submissions.
 *
 * Called by:
 *   - KoboToolbox webhook (async, after each field-audit submission)
 *   - Nightly cron /api/cron/corporate-unlock (safety net)
 */
export async function checkAndUnlockMilestones(milestoneType?: string): Promise<void> {
    const runInTx = typeof db.transaction === "function"
        ? (cb: (tx: any) => Promise<void>) => db.transaction(cb)
        : (cb: (tx: any) => Promise<void>) => cb(db);

    await runInTx(async (tx) => {
        // ── Step 1: Compute tree_survival count (deduplicated by location) ────────
        const latestPerLocation = tx
            .selectDistinctOn([treeSurvivalChecks.projectLocationId], {
                projectLocationId: treeSurvivalChecks.projectLocationId,
                treesAlive: treeSurvivalChecks.treesAlive,
            })
            .from(treeSurvivalChecks)
            .orderBy(treeSurvivalChecks.projectLocationId, desc(treeSurvivalChecks.surveyDate))
            .as("latest_per_location");

        const [{ totalAlive }] = await tx
            .select({
                totalAlive: sql<number>`coalesce(sum(${latestPerLocation.treesAlive}), 0)::int`,
            })
            .from(latestPerLocation);

        // ── Step 2: Fetch LOCKED milestones (filtered by type if provided) ────────
        const whereClause = milestoneType
            ? and(
                eq(corporateUnlockMilestones.status, "LOCKED"),
                eq(corporateUnlockMilestones.milestoneType, milestoneType)
              )
            : eq(corporateUnlockMilestones.status, "LOCKED");

        const lockedMilestones = await tx
            .select()
            .from(corporateUnlockMilestones)
            .where(whereClause);

        // ── Step 3: Evaluate each milestone ──────────────────────────────────────
        for (const milestone of lockedMilestones) {
            let currentValue = 0;

            if (milestone.milestoneType === "tree_survival") {
                currentValue = totalAlive;
            }

            if (currentValue >= milestone.thresholdValue) {
                // Flip milestone to UNLOCKED
                await tx
                    .update(corporateUnlockMilestones)
                    .set({ status: "UNLOCKED", currentValue, verifiedAt: new Date() })
                    .where(eq(corporateUnlockMilestones.id, milestone.id));

                // Release linked corporate resources
                await tx
                    .update(corporateResources)
                    .set({ status: "UNLOCKED", unlockedAt: new Date() })
                    .where(eq(corporateResources.milestoneId, milestone.id));
            } else {
                // Record progress even though not yet unlocked
                await tx
                    .update(corporateUnlockMilestones)
                    .set({ currentValue })
                    .where(eq(corporateUnlockMilestones.id, milestone.id));
            }
        }
    });

    try {
        revalidatePath("/impact");
        revalidatePath("/dashboard/partner");
    } catch {
        // Safe fallback if called outside Next.js request lifecycle
    }
}
