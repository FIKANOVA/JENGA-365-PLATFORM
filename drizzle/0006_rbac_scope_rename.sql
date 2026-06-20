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

ALTER TABLE users ADD CONSTRAINT moderation_scope_valid_values CHECK (
    moderation_scope IS NULL OR (
        jsonb_typeof(moderation_scope::jsonb) = 'array'
        AND NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(moderation_scope::jsonb) AS v
            WHERE v NOT IN ('mentor_applications', 'corporate', 'content', 'all')
        )
    )
);

COMMIT;
