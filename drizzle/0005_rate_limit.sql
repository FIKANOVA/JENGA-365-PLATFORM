-- ─── 0005: Postgres-backed rate limit buckets ────────────────────────────────

CREATE TABLE rate_limit_buckets (
    key             text PRIMARY KEY,
    window_start    timestamptz NOT NULL,
    count           integer DEFAULT 0
);

CREATE INDEX rate_limit_window_idx ON rate_limit_buckets (window_start);
