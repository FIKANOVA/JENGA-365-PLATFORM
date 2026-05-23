"use server";

import { db } from "@/lib/db";
import { merchandise } from "@/lib/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { requireCapability } from "@/lib/auth/guard";
import { client as sanityClient } from "@/lib/sanity/client";
import { groq } from "next-sanity";
import { revalidatePath } from "next/cache";

const sanityCatalogQuery = groq`*[_type == "product"] {
  _id,
  title,
  category,
  price,
  description,
  isActive,
  "mainImageUrl": mainImage.asset->url,
  "galleryUrls": gallery[].asset->url,
  variants[] {
    sku,
    label,
    size,
    color,
    priceOverride
  }
}`;

interface SanityCatalogProduct {
    _id: string;
    title: string;
    category?: string | null;
    price?: number | null;
    description?: string | null;
    isActive?: boolean | null;
    mainImageUrl?: string | null;
    galleryUrls?: Array<string | null> | null;
    variants?: Array<{
        sku?: string | null;
        label?: string | null;
        size?: string | null;
        color?: string | null;
        priceOverride?: number | null;
    }> | null;
}

export interface MerchandiseSyncResult {
    success: true;
    syncedAt: string;
    productsProcessed: number;
    inserted: number;
    updated: number;
    skipped: number;
    errors: string[];
}

/**
 * Sync the Sanity product catalog into the Neon `merchandise` table.
 *
 * Updates: name, price, description, category, image URLs, variants snapshot, isActive.
 * Preserves: stock_count (managed manually by inventory staff via separate flow).
 *
 * Guarded by UPSERT_MERCHANDISE_STOCK — only Moderators with the `content`
 * scope or SuperAdmins can run this. Throws on auth failure.
 */
export async function upsertMerchandiseStock(): Promise<MerchandiseSyncResult> {
    await requireCapability("UPSERT_MERCHANDISE_STOCK");

    const products: SanityCatalogProduct[] = await sanityClient.fetch(sanityCatalogQuery);
    const errors: string[] = [];
    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const product of products) {
        if (!product._id || !product.title || product.price == null) {
            skipped += 1;
            errors.push(`Skipped product ${product._id ?? "<unknown>"}: missing required fields`);
            continue;
        }

        const mainImageUrl = product.mainImageUrl ?? null;
        const galleryUrls = (product.galleryUrls ?? []).filter((url): url is string => !!url);

        const variantsJson = (product.variants ?? [])
            .filter((v) => v.sku && v.label)
            .map((v) => ({
                sku: v.sku as string,
                label: v.label as string,
                size: v.size ?? undefined,
                color: v.color ?? undefined,
                priceOverride: v.priceOverride ?? undefined,
            }));

        try {
            const existing = await db.query.merchandise.findFirst({
                where: eq(merchandise.sanityProductId, product._id),
            });

            if (existing) {
                // Preserve stockCount — only catalog metadata is overwritten.
                await db.update(merchandise)
                    .set({
                        name: product.title,
                        description: product.description ?? null,
                        category: product.category ?? null,
                        price: String(product.price),
                        imageUrl: mainImageUrl,
                        imageGallery: galleryUrls.length ? galleryUrls : null,
                        variants: variantsJson.length ? variantsJson : null,
                        isActive: product.isActive !== false,
                        lastSyncedAt: new Date(),
                    })
                    .where(eq(merchandise.sanityProductId, product._id));
                updated += 1;
            } else {
                await db.insert(merchandise).values({
                    sanityProductId: product._id,
                    name: product.title,
                    description: product.description ?? null,
                    category: product.category ?? null,
                    price: String(product.price),
                    stockCount: 0,
                    imageUrl: mainImageUrl,
                    imageGallery: galleryUrls.length ? galleryUrls : null,
                    variants: variantsJson.length ? variantsJson : null,
                    isActive: product.isActive !== false,
                    lastSyncedAt: new Date(),
                });
                inserted += 1;
            }
        } catch (err) {
            skipped += 1;
            errors.push(`Failed to sync ${product.title} (${product._id}): ${(err as Error).message}`);
        }
    }

    revalidatePath("/shop");
    revalidatePath("/dashboard/moderator/inventory");

    return {
        success: true,
        syncedAt: new Date().toISOString(),
        productsProcessed: products.length,
        inserted,
        updated,
        skipped,
        errors,
    };
}

/**
 * Atomically decrement merchandise stock by 1.
 * Called from the purchase/checkout flow.
 * Uses a single UPDATE with WHERE stock_count > 0 — no read-then-write race condition.
 * Throws OUT_OF_STOCK if the item is already at zero (DB guard blocked the update).
 *
 * DO NOT MODIFY — race-safe per CLAUDE.md §8.
 */
export async function decrementStock(sanityProductId: string) {
    const [row] = await db
        .update(merchandise)
        .set({ stockCount: sql`${merchandise.stockCount} - 1` })
        .where(
            and(
                eq(merchandise.sanityProductId, sanityProductId),
                gt(merchandise.stockCount, 0)
            )
        )
        .returning();

    if (!row) throw new Error("OUT_OF_STOCK");
    return row;
}

/**
 * Manually adjust the stock count for a single Sanity product.
 * Used by the inventory editor in the moderator dashboard.
 */
export async function setMerchandiseStockCount(
    sanityProductId: string,
    stockCount: number,
    isActive: boolean
) {
    await requireCapability("UPSERT_MERCHANDISE_STOCK");

    if (!Number.isInteger(stockCount) || stockCount < 0) {
        throw new Error("INVALID_STOCK_COUNT");
    }

    const [row] = await db.update(merchandise)
        .set({ stockCount, isActive })
        .where(eq(merchandise.sanityProductId, sanityProductId))
        .returning();

    if (!row) throw new Error("MERCHANDISE_NOT_FOUND");

    revalidatePath("/shop");
    revalidatePath("/dashboard/moderator/inventory");
    return { success: true as const };
}

export interface StorefrontMerchandise {
    _id: string;
    title: string;
    description: string | null;
    category: string | null;
    price: number;
    stockCount: number;
    imageUrl: string | null;
    imageGallery: string[];
    variants: Array<{
        sku: string;
        label: string;
        size?: string;
        color?: string;
        priceOverride?: number;
    }>;
    isActive: boolean;
}

/**
 * Live storefront products from Neon. Filters to active items only.
 * `_id` is the Sanity product ID (the upsert key) so checkout's decrementStock
 * call (keyed by sanityProductId) keeps working without changes.
 */
export async function getStorefrontMerchandise(): Promise<StorefrontMerchandise[]> {
    const rows = await db.select().from(merchandise).where(eq(merchandise.isActive, true));

    return rows
        .filter((r): r is typeof r & { sanityProductId: string } => !!r.sanityProductId)
        .map((r) => ({
            _id: r.sanityProductId,
            title: r.name,
            description: r.description,
            category: r.category,
            price: Number(r.price),
            stockCount: r.stockCount,
            imageUrl: r.imageUrl,
            imageGallery: r.imageGallery ?? [],
            variants: r.variants ?? [],
            isActive: r.isActive,
        }));
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
