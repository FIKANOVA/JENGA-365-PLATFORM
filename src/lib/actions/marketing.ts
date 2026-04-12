"use server"

import { db } from "@/lib/db";
import { impactReports, corporatePartners, articles } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getGlobalImpactStats() {
    try {
        const stats = await db.query.impactReports.findFirst({
            orderBy: [desc(impactReports.generatedAt)]
        });
        return stats;
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
