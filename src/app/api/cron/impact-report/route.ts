import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { impactReports, donations, sessionsLog } from "@/lib/db/schema";
import { sum, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    // BUG-01 FIX: Enforce Vercel Cron secret — prevents unauthenticated triggering
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // BUG-02 FIX: Two separate queries — donations and sessionsLog are unrelated tables
        const [donationStats] = await db
            .select({ totalAmount: sum(donations.amount) })
            .from(donations);

        const [sessionStats] = await db
            .select({
                totalHours: sum(sessionsLog.durationMinutes),
                youthCount: count(sessionsLog.id),
            })
            .from(sessionsLog);

        await db.insert(impactReports).values({
            reportPeriod: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
            totalDonations: donationStats.totalAmount || "0",
            totalMentorshipHours: Number(sessionStats.totalHours) || 0,
            youthEngaged: Number(sessionStats.youthCount) || 0,
            treesPlanted: 0,
            clinicsHeld: 0,
        });

        return NextResponse.json({ success: true, message: "Nightly impact report generated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
