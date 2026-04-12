import { db } from "../index";
import { impactReports, donations, sessionsLog, corporatePartners } from "../schema";
import { sql, sum, count } from "drizzle-orm";

export async function getGlobalImpactStats() {
    const [stats] = await db
        .select({
            totalDonations: sum(donations.amount),
            totalHours: sum(sessionsLog.durationMinutes),
            totalMatches: count(sessionsLog.id), // Just an example
        })
        .from(donations);

    return stats;
}

export async function getCorporateImpact(partnerId: string) {
    const [partner] = await db
        .select()
        .from(corporatePartners)
        .where(sql`${corporatePartners.id} = ${partnerId}`);

    return partner;
}
