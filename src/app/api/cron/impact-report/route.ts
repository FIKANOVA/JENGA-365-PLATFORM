import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { impactReports, donations, sessionsLog } from "@/lib/db/schema";
import { sum, countDistinct } from "drizzle-orm";
import crypto from "crypto";


export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    // BUG-01 FIX: Enforce Vercel Cron secret — prevents unauthenticated triggering
    const authHeader = req.headers.get("authorization");
    const secret = process.env.CRON_SECRET;

    if (!authHeader || !secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const tokenBuf = Buffer.from(token);
    const secretBuf = Buffer.from(secret);

    if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // BUG-02 FIX: Two separate queries — donations and sessionsLog are unrelated tables
        const [[donationStats], [sessionStats]] = await Promise.all([
            db.select({ totalAmount: sum(donations.amount) }).from(donations),
            db.select({
                totalMinutes: sum(sessionsLog.durationMinutes),
                youthCount: countDistinct(sessionsLog.pairId),
            }).from(sessionsLog),
        ]);

        await db.insert(impactReports).values({
            reportPeriod: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
            totalDonations: donationStats?.totalAmount || "0",
            totalMentorshipHours: Math.floor((Number(sessionStats?.totalMinutes) || 0) / 60),
            youthEngaged: Number(sessionStats?.youthCount) || 0,
            clinicsHeld: 0,
        });

        return NextResponse.json({ success: true, message: "Nightly impact report generated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

