-- ─── 0020: Rename Looker Studio to Data Studio ───────────────────────────
--
-- Renames the columns in corporate_partners to reflect the Looker Studio to
-- Data Studio rebranding.

ALTER TABLE "corporate_partners" RENAME COLUMN "looker_report_id" TO "data_studio_report_id";
ALTER TABLE "corporate_partners" RENAME COLUMN "looker_share_url" TO "data_studio_share_url";

-- Update the constraint as well
ALTER TABLE "corporate_partners" DROP CONSTRAINT IF EXISTS "corporate_partners_looker_share_url_format";

ALTER TABLE "corporate_partners" ADD CONSTRAINT "corporate_partners_data_studio_share_url_format" CHECK (
    "data_studio_share_url" IS NULL
    OR "data_studio_share_url" LIKE 'https://lookerstudio.google.com/%'
    OR "data_studio_share_url" LIKE 'https://datastudio.google.com/%'
);
