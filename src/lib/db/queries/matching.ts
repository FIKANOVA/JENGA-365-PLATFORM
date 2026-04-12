import { db } from "../index";
import { users, userProfileAssets, mentorshipPairs } from "../schema";
import { and, eq, sql, desc, cosineDistance } from "drizzle-orm";

const WEIGHTS = {
    semantic: 0.40,      // was 0.50 — founder directive 07/04/2026
    location: 0.20,
    availability: 0.00,
    affiliation: 0.10,
    completeness: 0.05,
    goalAlignment: 0.10, // NEW — entrepreneurship goal × entrepreneur specialisation
};

/**
 * Hybrid mentor matching with spec-defined 6-component weighted score.
 *
 * Weights (founder directive 07/04/2026):
 *   40% — Semantic similarity (cosine distance on 768-dim profile embedding)
 *   20% — Location match (same locationRegion)
 *    0% — Availability overlap (placeholder — no availabilityPreferences field exists)
 *   10% — Partner affiliation (same partnerId)
 *    5% — Profile completeness (CV / LinkedIn / Portfolio assets)
 *   10% — Goal alignment (entrepreneurship goal × entrepreneur specialisation)
 *
 * NOTE: Max score = 95% when both entrepreneur flags match, 85% otherwise.
 *   goalAlignment is computed in JS post-query (not in SQL) for testability.
 *
 * Pre-filters (hard exclusions before scoring):
 *   - role = 'Mentor'
 *   - status = 'active'
 *   - isApproved = true
 *   - active mentorship pairs < 2 (1:2 capacity protocol, FIX-05)
 */
export async function getMentorMatches(params: {
    menteeEmbedding: number[];
    locationRegion?: string;
    partnerId?: string;
    menteeGoalCategories?: string[];  // e.g. ['entrepreneurship'] — used for goal alignment
    menteeTimezone?: string;           // reserved for future availability matching
    limit?: number;
}) {
    const { menteeEmbedding, locationRegion, partnerId, menteeGoalCategories, limit = 5 } = params;

    // Subquery: count active pairs per mentor (for capacity enforcement)
    const activePairCounts = db
        .select({
            mentorId: mentorshipPairs.mentorId,
            activeCount: sql<number>`cast(count(*) as int)`.as("active_count"),
        })
        .from(mentorshipPairs)
        .where(eq(mentorshipPairs.status, "active"))
        .groupBy(mentorshipPairs.mentorId)
        .as("active_pairs");

    // Subquery: count profile assets per mentor (for completeness score)
    const assetCounts = db
        .select({
            userId: userProfileAssets.userId,
            assetCount: sql<number>`cast(count(*) as int)`.as("asset_count"),
        })
        .from(userProfileAssets)
        .groupBy(userProfileAssets.userId)
        .as("asset_counts");

    const cosineSim = sql<number>`1 - (${cosineDistance(users.embedding, menteeEmbedding)})`;
    const locationScore = locationRegion
        ? sql<number>`case when ${users.locationRegion} = ${locationRegion} then 1.0 else 0.0 end`
        : sql<number>`0.0`;
    const partnerScore = partnerId
        ? sql<number>`case when ${users.partnerId}::text = ${partnerId} then 1.0 else 0.0 end`
        : sql<number>`0.0`;
    // Divisor is 3.0 for the 3 named asset types (CV, LinkedIn, Portfolio). "Other" assets are excluded.
    const completenessScore = sql<number>`least(coalesce(${assetCounts.assetCount}, 0) / 3.0, 1.0)`;

    const totalScore = sql<number>`
        (${WEIGHTS.semantic} * (1 - (${cosineDistance(users.embedding, menteeEmbedding)})))
        + (${WEIGHTS.location} * ${locationScore})
        + (0.00)
        + (${WEIGHTS.affiliation} * ${partnerScore})
        + (${WEIGHTS.completeness} * ${completenessScore})
    `;

    const results = await db
        .select({
            id: users.id,
            name: users.name,
            locationRegion: users.locationRegion,
            mentorSpecialisations: users.mentorSpecialisations,
            profileScore: cosineSim,
            totalScore,
        })
        .from(users)
        .leftJoin(activePairCounts, eq(users.id, activePairCounts.mentorId))
        .leftJoin(assetCounts, eq(users.id, assetCounts.userId))
        .where(
            and(
                eq(users.role, "Mentor"),
                eq(users.isApproved, true),
                eq(users.status, "active"),
                // FIX-05: Enforce 1:2 capacity — exclude mentors at or above 2 active pairs
                sql`coalesce(${activePairCounts.activeCount}, 0) < 2`,
            )
        )
        .orderBy(desc(totalScore))
        .limit(limit);

    return results.map((r) => {
        // Goal alignment: JS-side — mentee entrepreneurship goal × mentor entrepreneur specialisation
        const goalAlignmentScore =
            menteeGoalCategories?.includes("entrepreneurship") &&
            r.mentorSpecialisations?.includes("entrepreneur")
                ? 1.0
                : 0.0;

        const basePercentage = Math.round((Number(r.totalScore) || 0) * 100);
        const goalAlignmentPoints = Math.round(goalAlignmentScore * WEIGHTS.goalAlignment * 100);

        return {
            id: r.id,
            name: r.name,
            locationRegion: r.locationRegion,
            matchPercentage: basePercentage + goalAlignmentPoints,
            insights: {
                profileMatch: Math.round((Number(r.profileScore) || 0) * 100),
                goalAlignment: goalAlignmentPoints,
                deepSkillMatch: goalAlignmentPoints,
            },
        };
    });
}
