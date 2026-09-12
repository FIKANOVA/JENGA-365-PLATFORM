import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";
import { synthesizeUserProfile } from "@/lib/ai/profileSynthesizer";
import crypto from "crypto";

// Bounded per-run batch so a backlog can't blow the function timeout or token budget.
// The cron runs daily; large backlogs drain over several runs.
const BATCH_SIZE = 25;

/**
 * Re-embeds users whose profile embedding is stale (or never generated). Matching quality
 * degrades as profiles change without re-embedding; this keeps `users.embedding` fresh.
 * Guarded by CRON_SECRET and excluded from the auth middleware (see middleware matcher).
 */
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

    const CONCURRENCY_LIMIT = 5;
    const executing = new Set<Promise<void>>();

    for (const row of stale) {
        const p = (async () => {
            try {
                await synthesizeUserProfile(row.id);
                refreshed += 1;
            } catch (err) {
                console.error(`[refresh-embeddings] user ${row.id} failed:`, err);
                failures.push(row.id);
            }
        })();

        executing.add(p);
        p.finally(() => {
            executing.delete(p);
        });

        if (executing.size >= CONCURRENCY_LIMIT) {
            await Promise.race(executing);
        }
    }
    await Promise.all(executing);

    return NextResponse.json({
        scanned: stale.length,
        refreshed,
        failed: failures.length,
        remainingHint: stale.length === BATCH_SIZE ? "more may remain; next run continues" : "drained",
    });
}
