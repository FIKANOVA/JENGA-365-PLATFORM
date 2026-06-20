"use server"

import { db } from "@/lib/db";
import { corporatePartners, articles, users, vPublicImpactAggregate } from "@/lib/db/schema";
import { and, count, desc, eq } from "drizzle-orm";

export type GlobalImpactStats = {
    treesPlantedTotal: number;
    treesAliveLatestAudit: number;
    survivalRatePct: number;
    mentorshipHoursTotal: number;
    youthEngagedActive: number;
    activeCorporatePartners: number;
    activeNgoPartners: number;
    activeMentors: number;
};

// Reads v_public_impact_aggregate — unfiltered aggregates fed by tree_planting_events,
// DISTINCT ON latest tree_survival_checks, sessions_log, and active counts.
// See drizzle/0013_public_impact_view.sql and CLAUDE.md §11.
export async function getGlobalImpactStats(): Promise<GlobalImpactStats | null> {
    try {
        const [row] = await db.select().from(vPublicImpactAggregate).limit(1);

        const [mentorsRow] = await db
            .select({ count: count() })
            .from(users)
            .where(and(eq(users.role, "Mentor"), eq(users.isApproved, true), eq(users.status, "active")));

        if (!row) return null;
        if (!row) throw new Error("No data");
        return {
            treesPlantedTotal: Number(row.treesPlantedTotal ?? 0),
            treesAliveLatestAudit: Number(row.treesAliveLatestAudit ?? 0),
            survivalRatePct: Number(row.survivalRatePct ?? 0),
            mentorshipHoursTotal: Number(row.mentorshipHoursTotal ?? 0),
            youthEngagedActive: Number(row.youthEngagedActive ?? 0),
            activeCorporatePartners: Number(row.activeCorporatePartners ?? 0),
            activeNgoPartners: Number(row.activeNgoPartners ?? 0),
            activeMentors: Number(mentorsRow?.count ?? 0),
        };
    } catch (error) {
        console.error("Failed to fetch impact stats:", error);
        return null;
    }
}

export async function getPartnerLogos() {
    try {
        const partners = await db.query.corporatePartners.findMany({
            where: eq(corporatePartners.isActive, true),
            limit: 10
        });
        return partners;
    } catch (error) {
        console.error("Failed to fetch partner logos:", error);
        return [];
    }
}

export async function getLatestInsights() {
    try {
        const latestArticles = await db.query.articles.findMany({
            where: eq(articles.status, "published"),
            orderBy: [desc(articles.publishedAt)],
            limit: 3
        });
        return latestArticles;
    } catch (error) {
        console.error("Failed to fetch latest insights:", error);
        return [];
    }
}
