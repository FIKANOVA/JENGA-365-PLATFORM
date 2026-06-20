CREATE TABLE tree_planting_events (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_location_id   uuid NOT NULL REFERENCES project_locations(id) ON DELETE CASCADE,
    planted_at            timestamptz NOT NULL,
    trees_planted         integer NOT NULL CHECK (trees_planted > 0),
    species               text,
    planted_by            uuid REFERENCES users(id),
    kobo_submission_id    text UNIQUE,
    geo_lat               numeric(10, 7),
    geo_lng               numeric(10, 7),
    metadata              jsonb DEFAULT '{}'::jsonb,
    created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tree_planting_events_location
    ON tree_planting_events(project_location_id, planted_at DESC);
