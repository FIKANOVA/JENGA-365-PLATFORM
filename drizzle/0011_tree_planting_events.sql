-- ─── 0011: tree_planting_events + aggregate view ───────────────────────────
--
-- Per CLAUDE.md §9.2: Engine B backend requires a dedicated tree_planting_events
-- table separate from tree_survival_checks (which tracks audits, not plantings).
-- The legacy project_locations.trees_planted integer becomes a DERIVED value via
-- v_project_location_plantings (see CLAUDE.md §10.4) — but the column is NOT
-- dropped yet because lib/actions/fundingMap.ts still writes to it. Drop in a
-- follow-up after fundingMap is migrated to insert into tree_planting_events.

CREATE TABLE IF NOT EXISTS tree_planting_events (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_location_id   uuid NOT NULL REFERENCES project_locations(id) ON DELETE CASCADE,
    planted_at            timestamptz NOT NULL,
    trees_planted         integer NOT NULL CHECK (trees_planted > 0),
    species               text,
    planted_by            uuid REFERENCES users(id) ON DELETE SET NULL,
    kobo_submission_id    text UNIQUE,
    geo_lat               numeric(10, 7),
    geo_lng               numeric(10, 7),
    metadata              jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tree_planting_events_location
    ON tree_planting_events(project_location_id, planted_at DESC);

-- Backfill from existing project_locations.trees_planted >0
INSERT INTO tree_planting_events (project_location_id, planted_at, trees_planted, metadata)
SELECT
    id,
    coalesce(start_date, created_at),
    trees_planted,
    jsonb_build_object('source', 'backfill_from_project_locations')
FROM project_locations
WHERE trees_planted IS NOT NULL AND trees_planted > 0
ON CONFLICT DO NOTHING;

-- Aggregate view — single source of truth for "trees planted per location".
-- Looker Studio dashboards read this; in-app code should JOIN here rather than
-- reading project_locations.trees_planted directly.
CREATE OR REPLACE VIEW v_project_location_plantings AS
SELECT
    project_location_id,
    coalesce(sum(trees_planted), 0)::integer AS trees_planted_total,
    max(planted_at) AS last_planted_at,
    count(*)::integer AS planting_event_count
FROM tree_planting_events
GROUP BY project_location_id;

-- Grant to looker_reader if the role exists (won't fail if missing).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'looker_reader') THEN
        GRANT SELECT ON v_project_location_plantings TO looker_reader;
        GRANT SELECT ON tree_planting_events TO looker_reader;
    END IF;
END $$;
