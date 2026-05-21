import { db } from "@/lib/db";
import { rateLimitBuckets } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function checkRate(
    key: string,
    limit: number,
    windowSec: number
): Promise<boolean> {
    const windowStart = sql`to_timestamp(floor(extract(epoch from now()) / ${windowSec}) * ${windowSec})`;

    const rows = await db
        .insert(rateLimitBuckets)
        .values({
            key,
            windowStart: windowStart as unknown as Date,
            count: 1,
        })
        .onConflictDoUpdate({
            target: rateLimitBuckets.key,
            set: {
                count: sql`case when ${rateLimitBuckets.windowStart} = excluded.window_start then ${rateLimitBuckets.count} + 1 else 1 end`,
                windowStart: sql`excluded.window_start`,
            },
        })
        .returning({ count: rateLimitBuckets.count });

    const newCount = rows[0]?.count ?? 0;
    return (newCount ?? 0) <= limit;
}
