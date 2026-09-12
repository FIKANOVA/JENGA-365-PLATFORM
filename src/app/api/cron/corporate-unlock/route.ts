import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAndUnlockMilestones } from "@/lib/actions/corporateUnlock";
import { db } from "@/lib/db";
import { rateLimitBuckets } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import crypto from "crypto";

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
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

    await checkAndUnlockMilestones();

    await db
        .delete(rateLimitBuckets)
        .where(sql`${rateLimitBuckets.windowStart} < now() - interval '24 hours'`);

    return NextResponse.json({ ok: true });
}
