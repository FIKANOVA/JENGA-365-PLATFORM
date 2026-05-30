-- ─── 0018: backfill existing NGO partners onto the NGO role ──────────────────
--
-- Run AFTER 0017_add_ngo_role.sql has committed. Promotes every CorporatePartner
-- whose registration industry is NGO to the new first-class NGO role. metadata
-- (incl. orgType) is left untouched — it remains the canonical industry store.

BEGIN;

UPDATE users
SET role = 'NGO'
WHERE role = 'CorporatePartner'
  AND metadata IS NOT NULL
  AND metadata->>'orgType' = 'NGO';

COMMIT;
