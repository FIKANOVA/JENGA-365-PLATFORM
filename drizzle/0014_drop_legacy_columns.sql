-- ─── 0014: drop legacy denormalized columns ────────────────────────────────
--
-- Per CLAUDE.md §10.2 / §10.4 and the follow-up flagged in 0010 + 0011:
--   - users.mentor_specialisations (text[])  → superseded by user_goal_tags
--   - mentee_intake.goal_categories (text[]) → superseded by user_goal_tags
--   - project_locations.trees_planted (int)  → superseded by tree_planting_events
--
-- Writers have been migrated:
--   - intake.ts seeds user_goal_tags inside the intake transaction.
--   - fundingMap.ts writes tree_planting_events inside addProjectLocation.
--
-- The backfills in 0010 and 0011 already moved historical data over.
-- Looker Studio reads aggregate views (v_project_location_plantings,
-- v_public_impact_aggregate), so dropping the columns is safe.

ALTER TABLE users           DROP COLUMN IF EXISTS mentor_specialisations;
ALTER TABLE mentee_intake   DROP COLUMN IF EXISTS goal_categories;
ALTER TABLE project_locations DROP COLUMN IF EXISTS trees_planted;
