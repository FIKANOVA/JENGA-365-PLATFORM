import { db } from "../index";
import { users, userProfileAssets, mentorshipPairs, userGoalTags } from "../schema";
import { and, eq, sql, desc, cosineDistance } from "drizzle-orm";

// Founder-locked weights (Bruce 2026-05-20, CLAUDE.md §4). Sum = 100%.
const W = {
    semantic:     0.40,
    location:     0.20,
    availability: 0.15, // score is 0.0 until users.availability column ships — weight reserved
    goal:         0.10,
    affiliation:  0.10,
    completeness: 0.05,
} as const;

export async function getMentorMatches(params: {
    menteeEmbedding: number[];
    menteeId?: string;
    locationRegion?: string;
    partnerId?: string;
    limit?: number;
}) {
    const { menteeEmbedding, menteeId, locationRegion, partnerId, limit = 5 } = params;

    const activePairCounts = db
        .select({
            mentorId: mentorshipPairs.mentorId,
            activeCount: sql<number>`cast(count(*) as int)`.as("active_count"),
        })
        .from(mentorshipPairs)
        .where(eq(mentorshipPairs.status, "active"))
        .groupBy(mentorshipPairs.mentorId)
        .as("active_pairs");

    const assetCounts = db
        .select({
            userId: userProfileAssets.userId,
            assetCount: sql<number>`cast(count(*) as int)`.as("asset_count"),
        })
        .from(userProfileAssets)
        .groupBy(userProfileAssets.userId)
        .as("asset_counts");

    const locationScore = locationRegion
        ? sql<number>`case when ${users.locationRegion} = ${locationRegion} then 1.0 else 0.0 end`
        : sql<number>`0.0`;

    const partnerScore = partnerId
        ? sql<number>`case when ${users.partnerId}::text = ${partnerId} then 1.0 else 0.0 end`
        : sql<number>`0.0`;

    const completenessScore = sql<number>`least(coalesce(${assetCounts.assetCount}, 0) / 3.0, 1.0)`;

    // Availability: column doesn't exist yet. Reserve the 15% weight; score = 0 for now.
    const availabilityScore = sql<number>`0.0`;

    // Goal-alignment: count of mentor's tags that intersect the mentee's tag set,
    // normalized by the mentee's total tag count. If no menteeId or mentee has no
    // tags, score is 0.
    const goalScore = menteeId
        ? sql<number>`
            coalesce(
                (select count(*)::float
                 from ${userGoalTags} tg
                 where tg.user_id = ${users.id}
                   and tg.category in (
                     select category from ${userGoalTags} where user_id = ${menteeId}
                   )
                ) / nullif(
                    (select count(*)::float from ${userGoalTags} where user_id = ${menteeId}),
                    0
                ),
                0
            )
        `
        : sql<number>`0.0`;

    const semanticScore = sql<number>`(1 - (${cosineDistance(users.embedding, menteeEmbedding)}))`;

    const totalScore = sql<number>`
        (${W.semantic} * ${semanticScore})
        + (${W.location} * ${locationScore})
        + (${W.availability} * ${availabilityScore})
        + (${W.goal} * ${goalScore})
        + (${W.affiliation} * ${partnerScore})
        + (${W.completeness} * ${completenessScore})
    `;

    const results = await db
        .select({
            id: users.id,
            name: users.name,
            image: users.image,
            metadata: users.metadata,
            locationRegion: users.locationRegion,
            profileScore: semanticScore,
            goalScore,
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
                sql`coalesce(${activePairCounts.activeCount}, 0) < 2`,
            )
        )
        .orderBy(desc(totalScore))
        .limit(limit);

    return results.map((r) => {
        const matchPct = Math.round((Number(r.totalScore) || 0) * 100);
        const profileMatch = Math.round((Number(r.profileScore) || 0) * 100);
        const goalAlignment = Math.round((Number(r.goalScore) || 0) * 100);
        const meta = (r.metadata || {}) as Record<string, any>;

        let reason = "Recommended based on your diagnostic profile";
        if (Number(r.goalScore) > 0.5 && Number(r.profileScore) > 0.8) {
            reason = "Strong alignment in career goals and technical expertise";
        } else if (Number(r.goalScore) > 0.5) {
            reason = "Direct match on your key career learning goals";
        } else if (r.locationRegion) {
            reason = `Top mentor in ${r.locationRegion} with strong background match`;
        } else if (Number(r.profileScore) > 0.85) {
            reason = "High synergy in professional background and mentorship style";
        }

        return {
            id: r.id,
            name: r.name,
            image: r.image ?? null,
            title: (meta.profession || meta.professionalTitle || "Mentor") as string,
            locationRegion: r.locationRegion,
            matchPercentage: Math.max(1, Math.min(99, matchPct)),
            insights: {
                profileMatch,
                goalAlignment,
                reason,
            },
        };
    });
}
