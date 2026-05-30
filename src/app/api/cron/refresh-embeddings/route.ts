import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";
import { synthesizeUserProfile } from "@/lib/ai/profileSynthesizer";

// Bounded per-run batch so a backlog can't blow the function timeout or token budget.
// The cron runs daily; large backlogs drain over several runs.
const BATCH_SIZE = 25;

/**
 * Re-embeds users whose profile embedding is stale (or never generated). Matching quality
 * degrades as profiles change without re-embedding; this keeps `users.embedding` fresh.
 * Guarded by CRON_SECRET and excluded from the auth middleware (see middleware matcher).
 */
export async function GET(request: NextRequest) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stale = await db
        .select({ id: users.id })
        .from(users)
        .where(and(
            isNull(users.deletedAt),
            or(eq(users.embeddingStale, true), isNull(users.embedding)),
        ))
        .limit(BATCH_SIZE);

    let refreshed = 0;
    const failures: string[] = [];

    for (const row of stale) {
        try {
            await synthesizeUserProfile(row.id);
            refreshed += 1;
        } catch (err) {
            console.error(`[refresh-embeddings] user ${row.id} failed:`, err);
            failures.push(row.id);
        }
    }

    return NextResponse.json({
        scanned: stale.length,
        refreshed,
        failed: failures.length,
        remainingHint: stale.length === BATCH_SIZE ? "more may remain; next run continues" : "drained",
    });
}
