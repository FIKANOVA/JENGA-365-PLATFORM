import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAndUnlockMilestones } from "@/lib/actions/corporateUnlock";
import { db } from "@/lib/db";
import { rateLimitBuckets } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await checkAndUnlockMilestones();

    await db
        .delete(rateLimitBuckets)
        .where(sql`${rateLimitBuckets.windowStart} < now() - interval '24 hours'`);

    return NextResponse.json({ ok: true });
}
