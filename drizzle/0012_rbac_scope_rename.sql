-- ─── 0012: rename moderator scope values to founder-locked names ────────────
--
-- CLAUDE.md §3 / project_rbac_scopes memory: canonical scope strings are
-- mentor_applications | corporate | content | all. Migration 0002 shipped
-- the legacy welfare/meal/commerce names; this migration renames them in
-- existing rows + replaces the CHECK constraint.
--
-- Mapping:
--   welfare  → mentor_applications
--   meal     → corporate
--   commerce → content
--   all      → all   (unchanged)

BEGIN;

ALTER TABLE users DROP CONSTRAINT IF EXISTS moderation_scope_valid_values;

UPDATE users
SET moderation_scope = (
    SELECT jsonb_agg(
        CASE v
            WHEN 'welfare'  THEN 'mentor_applications'
            WHEN 'meal'     THEN 'corporate'
            WHEN 'commerce' THEN 'content'
            ELSE v
        END
    )::text
    FROM jsonb_array_elements_text(moderation_scope::jsonb) AS v
)
WHERE moderation_scope IS NOT NULL AND moderation_scope != '';

-- Postgres CHECK constraints cannot contain subqueries, so use jsonb
-- containment (<@) instead of a NOT EXISTS subquery: the array is "contained
-- by" the allowed-values array iff every element is in the allowed set.
ALTER TABLE users ADD CONSTRAINT moderation_scope_valid_values CHECK (
    moderation_scope IS NULL OR (
        jsonb_typeof(moderation_scope::jsonb) = 'array'
        AND moderation_scope::jsonb <@ '["mentor_applications","corporate","content","all"]'::jsonb
    )
);

COMMIT;
