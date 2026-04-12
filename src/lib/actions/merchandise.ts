"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { merchandise } from "@/lib/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { headers } from "next/headers";

// Inventory management — only Moderators and SuperAdmins can upsert stock via the admin panel.
// Stock is sourced from Sanity CMS; this table only tracks counts and active status.
async function requireStockManager() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");
    const role = (session.user as any).role as string;
    if (!["Moderator", "SuperAdmin"].includes(role)) throw new Error("FORBIDDEN");
}

/**
 * Upsert stock count and active status for a Sanity product in the DB merchandise table.
 * Creates the row if it doesn't exist yet (first time a moderator edits it).
 */
export async function upsertMerchandiseStock(
    sanityProductId: string,
    name: string,
    stockCount: number,
    isActive: boolean,
    price: number,
) {
    await requireStockManager();

    const existing = await db.query.merchandise.findFirst({
        where: eq(merchandise.sanityProductId, sanityProductId),
    });

    if (existing) {
        await db.update(merchandise)
            .set({ stockCount, isActive })
            .where(eq(merchandise.sanityProductId, sanityProductId));
    } else {
        await db.insert(merchandise).values({
            sanityProductId,
            name,
            price: price.toString(),
            stockCount,
            isActive,
        });
    }

    return { success: true };
}

/**
 * Atomically decrements merchandise stock by 1.
 * Called from the purchase/checkout flow — NO auth required (guest checkout supported).
 * Inventory management (upsertMerchandiseStock) is admin-only via Sanity CMS sync.
 * Uses a single UPDATE with WHERE stock_count > 0 — no read-then-write race condition.
 * Throws OUT_OF_STOCK if the item is already at zero (DB guard blocked the update).
 */
export async function decrementStock(sanityProductId: string) {
    const [updated] = await db
        .update(merchandise)
        .set({ stockCount: sql`${merchandise.stockCount} - 1` })
        .where(
            and(
                eq(merchandise.sanityProductId, sanityProductId),
                gt(merchandise.stockCount, 0)
            )
        )
        .returning();

    if (!updated) throw new Error("OUT_OF_STOCK");
    return updated;
}

export async function getMerchandiseMap(): Promise<Record<string, { stockCount: number; isActive: boolean }>> {
    const rows = await db.select({
        sanityProductId: merchandise.sanityProductId,
        stockCount: merchandise.stockCount,
        isActive: merchandise.isActive,
    }).from(merchandise);

    return Object.fromEntries(
        rows
            .filter(r => r.sanityProductId)
            .map(r => [r.sanityProductId!, { stockCount: r.stockCount, isActive: r.isActive }])
    );
}
