-- ─── 0010: user_goal_tags (normalized) for goal-alignment matching ──────────
--
-- Founder lock (Bruce 2026-05-20): matching algorithm includes 10% goal-alignment
-- using a normalized table — NOT the legacy text[] columns
-- (users.mentor_specialisations, mentee_intake.goal_categories).
-- See CLAUDE.md §10.2.
--
-- This migration:
--   1. Creates user_goal_tags(user_id, category).
--   2. Backfills from the two legacy text[] columns so scoring works immediately.
--   3. Leaves the legacy columns in place for now — drop in a follow-up after
--      intake / mentor-profile flows are migrated to write to user_goal_tags.

CREATE TABLE IF NOT EXISTS user_goal_tags (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category    text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_user_goal_tags_category
    ON user_goal_tags(category);

CREATE INDEX IF NOT EXISTS idx_user_goal_tags_user
    ON user_goal_tags(user_id);

-- Backfill from mentee_intake.goal_categories
INSERT INTO user_goal_tags (user_id, category)
SELECT mi.user_id, unnest(mi.goal_categories) AS category
FROM mentee_intake mi
WHERE mi.goal_categories IS NOT NULL
  AND array_length(mi.goal_categories, 1) > 0
ON CONFLICT (user_id, category) DO NOTHING;

-- Backfill from users.mentor_specialisations
INSERT INTO user_goal_tags (user_id, category)
SELECT u.id, unnest(u.mentor_specialisations) AS category
FROM users u
WHERE u.mentor_specialisations IS NOT NULL
  AND array_length(u.mentor_specialisations, 1) > 0
ON CONFLICT (user_id, category) DO NOTHING;
