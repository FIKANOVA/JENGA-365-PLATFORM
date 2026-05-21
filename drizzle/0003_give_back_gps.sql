-- ─── 0003: GPS + KoboToolbox fields on give_back_tracking ────────────────────

ALTER TABLE give_back_tracking
    ADD COLUMN IF NOT EXISTS geo_lat numeric(10, 7),
    ADD COLUMN IF NOT EXISTS geo_lng numeric(10, 7),
    ADD COLUMN IF NOT EXISTS kobo_submission_id text,
    ADD COLUMN IF NOT EXISTS photo_url text;

ALTER TABLE give_back_tracking
    ADD CONSTRAINT give_back_geo_both_or_neither CHECK (
        (geo_lat IS NULL) = (geo_lng IS NULL)
    );

CREATE UNIQUE INDEX give_back_kobo_submission_id_idx
    ON give_back_tracking (kobo_submission_id)
    WHERE kobo_submission_id IS NOT NULL;
