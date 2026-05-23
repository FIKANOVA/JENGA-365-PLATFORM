-- ─── 0015: merchandise variants + image gallery + sync timestamp ──────────
--
-- Stores the Sanity catalog snapshot on the Neon merchandise row so the
-- storefront can render variant labels and the full image gallery without
-- a second Sanity round-trip. stock_count remains product-level (variants
-- are display metadata only) so the existing atomic decrement in
-- decrementStock() continues to work without modification.

ALTER TABLE merchandise
    ADD COLUMN IF NOT EXISTS image_gallery TEXT[];

ALTER TABLE merchandise
    ADD COLUMN IF NOT EXISTS variants JSONB;

ALTER TABLE merchandise
    ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;

-- sanity_product_id is the upsert key; enforce uniqueness so ON CONFLICT works.
CREATE UNIQUE INDEX IF NOT EXISTS merchandise_sanity_product_id_uniq
    ON merchandise (sanity_product_id)
    WHERE sanity_product_id IS NOT NULL;
