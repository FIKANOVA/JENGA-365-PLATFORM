-- ─── 0004: Engine B audit tables + resilience delta view ─────────────────────

-- suspension_cosign_status enum
CREATE TYPE suspension_cosign_status AS ENUM ('pending', 'cosigned', 'expired');

-- tree_survival_audit_action enum
CREATE TYPE tree_survival_audit_action AS ENUM ('ingested', 'verified');

-- corporate_unlock_trigger_kind enum
CREATE TYPE corporate_unlock_trigger_kind AS ENUM ('manual_override', 'verified_unlock');

-- ── suspension_cosigns ────────────────────────────────────────────────────────
CREATE TABLE suspension_cosigns (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_by    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason          text NOT NULL,
    strike_count    integer NOT NULL,
    status          suspension_cosign_status NOT NULL DEFAULT 'pending',
    cosigner_id     uuid REFERENCES users(id) ON DELETE SET NULL,
    cosigned_at     timestamptz,
    expires_at      timestamptz NOT NULL,
    created_at      timestamptz DEFAULT now(),
    CONSTRAINT suspension_cosigns_strike_count_check CHECK (strike_count >= 3)
);

-- ── tree_survival_audits ──────────────────────────────────────────────────────
CREATE TABLE tree_survival_audits (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    check_id            uuid NOT NULL REFERENCES tree_survival_checks(id) ON DELETE CASCADE,
    action              tree_survival_audit_action NOT NULL,
    actor_id            uuid REFERENCES users(id) ON DELETE SET NULL,
    actor_role          text,
    new_survival_rate   numeric(5, 2),
    notes               text,
    created_at          timestamptz DEFAULT now()
);

-- ── corporate_unlock_triggers ─────────────────────────────────────────────────
CREATE TABLE corporate_unlock_triggers (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    milestone_id        uuid NOT NULL REFERENCES corporate_unlock_milestones(id) ON DELETE CASCADE,
    kind                corporate_unlock_trigger_kind NOT NULL,
    triggered_by        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    triggered_by_role   text NOT NULL,
    previous_status     text,
    new_status          text NOT NULL,
    evidence_url        text,
    notes               text,
    created_at          timestamptz DEFAULT now(),
    CONSTRAINT trigger_role_valid CHECK (
        (kind = 'manual_override' AND triggered_by_role = 'SuperAdmin')
        OR
        (kind = 'verified_unlock' AND triggered_by_role IN ('SuperAdmin', 'Moderator'))
    )
);

-- ── v_resilience_delta ────────────────────────────────────────────────────────
CREATE VIEW v_resilience_delta AS
SELECT
    r_base.user_id,
    r_base.score                        AS baseline_score,
    r_latest.score                      AS latest_score,
    r_latest.score - r_base.score       AS delta,
    r_base.assessed_at                  AS baseline_at,
    r_latest.assessed_at                AS latest_at,
    r_latest.reassessment_due_date
FROM resilience_assessments r_base
INNER JOIN LATERAL (
    SELECT *
    FROM resilience_assessments r2
    WHERE r2.user_id = r_base.user_id
      AND r2.is_baseline = false
    ORDER BY r2.assessed_at DESC
    LIMIT 1
) r_latest ON true
WHERE r_base.is_baseline = true;
