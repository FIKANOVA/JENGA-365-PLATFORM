-- ─── 0009: Corporate partner Looker Studio dashboard links ──────────────────
--
-- Stores the Looker Studio report ID + login-free shareable URL for each
-- Corporate Partner. The Next.js partner dashboard reads these to render
-- (a) the embedded iframe and (b) the shareable link sponsors can forward
-- to their board / sustainability team without forcing Jenga365 accounts.
--
-- See CLAUDE.md §11 and IMPLEMENTATION_PLAN.md Phase 2.5.

ALTER TABLE corporate_partners
    ADD COLUMN IF NOT EXISTS looker_report_id  text,
    ADD COLUMN IF NOT EXISTS looker_share_url  text;

-- Cheap validation: shareable URL, if set, must be a Looker Studio link.
ALTER TABLE corporate_partners
    DROP CONSTRAINT IF EXISTS corporate_partners_looker_share_url_format;

ALTER TABLE corporate_partners
    ADD CONSTRAINT corporate_partners_looker_share_url_format CHECK (
        looker_share_url IS NULL
        OR looker_share_url LIKE 'https://lookerstudio.google.com/%'
    );
