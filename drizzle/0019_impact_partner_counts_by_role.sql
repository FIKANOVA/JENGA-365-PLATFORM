-- ─── 0019: count partners by signed-up, approved ACCOUNTS (not seeded org rows) ──
--
-- Problem: v_public_impact_aggregate counted rows in the corporate_partners table
-- (WHERE is_active = true). Seed/demo org rows made the public site show "15
-- corporate partners" when zero have actually signed up. The NGO split also
-- compared metadata->>'orgType' = 'ngo' (lowercase) while registration stores
-- 'NGO', so NGOs never counted.
--
-- Fix: count approved, active partner USER accounts by role. NGO is now a
-- first-class role (migrations 0017/0018), so the split is a clean role check.
-- Returns 0 until real partners sign up and are approved.
--
-- Apply AFTER 0017_add_ngo_role.sql (the 'NGO' enum value must exist).

CREATE OR REPLACE VIEW v_public_impact_aggregate AS
WITH latest_audit_per_location AS (
    SELECT DISTINCT ON (project_location_id)
        project_location_id, trees_planted, trees_alive, survey_date
    FROM tree_survival_checks
    ORDER BY project_location_id, survey_date DESC
),
total_planted AS (
    SELECT coalesce(sum(trees_planted), 0)::integer AS total FROM tree_planting_events
),
total_alive AS (
    SELECT coalesce(sum(trees_alive), 0)::integer AS total FROM latest_audit_per_location
),
total_mentorship_hours AS (
    SELECT coalesce(sum(duration_minutes), 0)::integer / 60 AS total FROM sessions_log
),
total_youth_engaged AS (
    SELECT count(DISTINCT id)::integer AS total
    FROM users
    WHERE role = 'Mentee' AND status = 'active'
),
total_corporate_partners AS (
    SELECT count(*)::integer AS total
    FROM users
    WHERE role = 'CorporatePartner'
      AND is_approved = true
      AND coalesce(banned, false) = false
      AND deleted_at IS NULL
),
total_ngo_partners AS (
    SELECT count(*)::integer AS total
    FROM users
    WHERE role = 'NGO'
      AND is_approved = true
      AND coalesce(banned, false) = false
      AND deleted_at IS NULL
)
SELECT
    (SELECT total FROM total_planted)              AS trees_planted_total,
    (SELECT total FROM total_alive)                AS trees_alive_latest_audit,
    CASE
        WHEN (SELECT total FROM total_planted) > 0
        THEN round((SELECT total FROM total_alive)::numeric / (SELECT total FROM total_planted) * 100, 1)
        ELSE 0
    END                                            AS survival_rate_pct,
    (SELECT total FROM total_mentorship_hours)     AS mentorship_hours_total,
    (SELECT total FROM total_youth_engaged)        AS youth_engaged_active,
    (SELECT total FROM total_corporate_partners)   AS active_corporate_partners,
    (SELECT total FROM total_ngo_partners)         AS active_ngo_partners;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'looker_reader') THEN
        GRANT SELECT ON v_public_impact_aggregate TO looker_reader;
    END IF;
END $$;
