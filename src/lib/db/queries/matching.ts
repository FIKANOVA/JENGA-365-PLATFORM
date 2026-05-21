import { db } from "../index";
import { users, userProfileAssets, mentorshipPairs } from "../schema";
import { and, eq, sql, desc, cosineDistance } from "drizzle-orm";

const W = {
    semantic:     0.50,
    location:     0.20,
    availability: 0.00, // hardcoded 0.0 until availability schema ships
    affiliation:  0.10,
    completeness: 0.05,
} as const;

export async function getMentorMatches(params: {
    menteeEmbedding: number[];
    locationRegion?: string;
    partnerId?: string;
    limit?: number;
}) {
    const { menteeEmbedding, locationRegion, partnerId, limit = 5 } = params;

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

    const totalScore = sql<number>`
        (${W.semantic} * (1 - (${cosineDistance(users.embedding, menteeEmbedding)})))
        + (${W.location} * ${locationScore})
        + (${W.affiliation} * ${partnerScore})
        + (${W.completeness} * ${completenessScore})
    `;

    const cosineSim = sql<number>`1 - (${cosineDistance(users.embedding, menteeEmbedding)})`;

    const results = await db
        .select({
            id: users.id,
            name: users.name,
            locationRegion: users.locationRegion,
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
                sql`coalesce(${activePairCounts.activeCount}, 0) < 2`,
            )
        )
        .orderBy(desc(totalScore))
        .limit(limit);

    return results.map((r) => ({
        id: r.id,
        name: r.name,
        locationRegion: r.locationRegion,
        matchPercentage: Math.round((Number(r.totalScore) || 0) * 100),
        insights: {
            profileMatch: Math.round((Number(r.profileScore) || 0) * 100),
        },
    }));
}
