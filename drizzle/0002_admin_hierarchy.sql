-- ─── 0002: Admin hierarchy + scope migration ─────────────────────────────────

-- 1. Ensure no rows use the 'user' enum value before recreating the type
UPDATE users SET role = 'Mentee' WHERE role = 'user';
UPDATE nda_signatures SET role_at_signing = 'Mentee' WHERE role_at_signing = 'user';
UPDATE invite_links SET role_assigned = 'Mentee' WHERE role_assigned = 'user';

-- 2. Recreate user_role enum without 'user'
ALTER TYPE user_role RENAME TO user_role_old;
CREATE TYPE user_role AS ENUM ('SuperAdmin', 'Moderator', 'CorporatePartner', 'Mentor', 'Mentee');

ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::text::user_role;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'Mentee';

ALTER TABLE nda_signatures ALTER COLUMN role_at_signing TYPE user_role USING role_at_signing::text::user_role;

ALTER TABLE invite_links ALTER COLUMN role_assigned TYPE user_role USING role_assigned::text::user_role;

DROP TYPE user_role_old;

-- 3. Migrate moderation_scope letter codes → semantic names
--    A → welfare, B → commerce, C → welfare, D → welfare, E → all
UPDATE users
SET moderation_scope = (
    SELECT jsonb_agg(sv)::text
    FROM (
        SELECT DISTINCT
            CASE v
                WHEN 'A' THEN 'welfare'::text
                WHEN 'B' THEN 'commerce'::text
                WHEN 'C' THEN 'welfare'::text
                WHEN 'D' THEN 'welfare'::text
                WHEN 'E' THEN 'all'::text
            END AS sv
        FROM jsonb_array_elements_text(moderation_scope::jsonb) AS v
    ) mapped
    WHERE sv IS NOT NULL
)
WHERE moderation_scope IS NOT NULL AND moderation_scope != '';

-- 4. Add 'suspended' to mentorship_status enum
ALTER TYPE mentorship_status ADD VALUE IF NOT EXISTS 'suspended';

-- 5. Add cosign columns to moderation_log
ALTER TABLE moderation_log
    ADD COLUMN IF NOT EXISTS capability text,
    ADD COLUMN IF NOT EXISTS cosigner_id uuid REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS cosigned_at timestamptz;

-- 6. Enforce moderation_scope as jsonb array of welfare|meal|commerce|all
ALTER TABLE users ADD CONSTRAINT moderation_scope_valid_values CHECK (
    moderation_scope IS NULL OR (
        jsonb_typeof(moderation_scope::jsonb) = 'array' AND
        NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(moderation_scope::jsonb) AS v
            WHERE v NOT IN ('welfare', 'meal', 'commerce', 'all')
        )
    )
);
