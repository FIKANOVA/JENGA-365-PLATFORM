-- ─── 0016: split active_corporate_partners into corporate + ngo counts ────
--
-- NGOs share the corporate_partners table with `users.role = 'CorporatePartner'`
-- and are distinguished by `users.metadata->>'orgType' = 'ngo'` (set during the
-- /register/corporate?type=ngo flow). The public impact view previously bundled
-- both into one count, which hid NGO partnerships from the marketing site.
--
-- Extends v_public_impact_aggregate with active_ngo_partners and refines
-- active_corporate_partners to exclude NGOs.

CREATE OR REPLACE VIEW v_public_impact_aggregate AS
WITH latest_audit_per_location AS (
    SELECT DISTINCT ON (project_location_id)
        project_location_id,
        trees_planted,
        trees_alive,
        survey_date
    FROM tree_survival_checks
    ORDER BY project_location_id, survey_date DESC
),
total_planted AS (
    SELECT coalesce(sum(trees_planted), 0)::integer AS total
    FROM tree_planting_events
),
total_alive AS (
    SELECT coalesce(sum(trees_alive), 0)::integer AS total
    FROM latest_audit_per_location
),
total_mentorship_hours AS (
    SELECT coalesce(sum(duration_minutes), 0)::integer / 60 AS total
    FROM sessions_log
),
total_youth_engaged AS (
    SELECT count(DISTINCT id)::integer AS total
    FROM users
    WHERE role = 'Mentee' AND status = 'active'
),
total_corporate_partners AS (
    SELECT count(DISTINCT cp.id)::integer AS total
    FROM corporate_partners cp
    WHERE cp.is_active = true
      AND NOT EXISTS (
          SELECT 1 FROM users u
          WHERE u.partner_id = cp.id
            AND u.metadata->>'orgType' = 'ngo'
      )
),
total_ngo_partners AS (
    SELECT count(DISTINCT cp.id)::integer AS total
    FROM corporate_partners cp
    WHERE cp.is_active = true
      AND EXISTS (
          SELECT 1 FROM users u
          WHERE u.partner_id = cp.id
            AND u.metadata->>'orgType' = 'ngo'
      )
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
