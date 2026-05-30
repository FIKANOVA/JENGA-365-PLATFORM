-- ─── 0017: add NGO as a first-class user role ───────────────────────────────
--
-- NGOs were previously the CorporatePartner role distinguished only by
-- metadata.orgType === 'NGO'. They are now a real role so access control,
-- routing, and the edge middleware can separate them cleanly.
--
-- IMPORTANT: Postgres forbids using a newly-added enum value in the SAME
-- transaction that adds it. Run THIS file (the ALTER TYPE) and let it commit
-- BEFORE running 0018_backfill_ngo_role.sql. Do not wrap both in one transaction.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'NGO';
