# Jenga365 — KoBoToolbox XLSForms

Operational glue for the three field-data forms that feed `/api/webhooks/kobo`.

```
generate.js         Node script that builds the three XLSForms
tree_survival.xlsx  Periodic GPS-anchored audits (6/12/24 month)
tree_planting.xlsx  Tree planting event log
give_back.xlsx      Quarterly mentee/mentor Sweat Equity activities
```

## 1. Regenerate the forms

```bash
npm run kobo:forms
```

Outputs the three `.xlsx` files into this directory. Re-run any time you change
`generate.js` or the corresponding Zod schemas in
`src/app/api/webhooks/kobo/route.ts`. The schema and the form must always
match — the route rejects payloads with 422 if a field is missing or the wrong
type.

The `version` field on each form is stamped with the current date
(`YYYYMMDD`); KoBo uses this to detect form updates.

## 2. Upload to KoBoToolbox

1. Sign in to KoBoToolbox (EU server per GDPR requirement — `eu.kobotoolbox.org`).
2. **New → Upload an XLSForm** → pick one of the generated `.xlsx` files.
3. Repeat for all three.
4. **Deploy** each form so the public submission endpoint becomes available.

The forms share three KoBo-injected fields you don't have to define:

| Field | Source |
|---|---|
| `_id` | KoBo serial submission ID (integer in the JSON payload; the route normalizes to string) |
| `_submission_time` | KoBo submission timestamp |
| `_geolocation` | `[lat, lng]` of the first `geopoint` question (`gps_location` in our forms) |
| `_attachments` | Array of photo objects with `download_url` |

## 3. Configure the REST Service (webhook)

For each deployed form: **Settings → REST Services → Register a New Service**.

| Field | Value |
|---|---|
| Service Name | `Jenga365 Webhook` |
| Endpoint URL | `https://<your-deployment>/api/webhooks/kobo` |
| Type | JSON |
| Custom HTTP Headers | `x-kobo-token: <KOBO_WEBHOOK_SECRET>` |

The secret on the header **must match the `KOBO_WEBHOOK_SECRET` env var** in
Vercel (or your `.env.local` for local testing). Mismatches return 401.

Test the wiring by submitting a fake survey from KoBo's web form — the route
returns 200 OK immediately; the actual DB insert + milestone check happens
async (so the responder thread isn't blocked).

## 4. Field → table mapping

### `tree_survival.xlsx` → `tree_survival_checks` + `tree_survival_audits`

| Form field | Neon column | Notes |
|---|---|---|
| `_id` | `kobo_submission_id` | Unique; `ON CONFLICT DO NOTHING` |
| `survey_date` | `survey_date` | Parsed via `new Date()` |
| `check_interval_months` | `check_interval_months` | Must be 6, 12, or 24 (form constraint) |
| `project_location_id` | `project_location_id` | UUID; form-validated regex |
| `trees_planted` | `trees_planted` | Integer ≥ 0 |
| `trees_alive` | `trees_alive` | Integer 0 ≤ x ≤ `trees_planted` (form constraint) |
| `surveyor_name` | `surveyor_name` | Optional |
| `_geolocation` | `geo_lat`, `geo_lng` | `numeric(10, 7)` per `CLAUDE.md §2` |
| `_attachments[0].download_url` | `photo_url` | First photo (`tree_photo`) |
| `audit_notes` | `raw_payload.audit_notes` | Stored in raw_payload jsonb |

On insert, a `tree_survival_audits` row is also written with the computed
survival rate, then `checkAndUnlockMilestones("tree_survival")` fires to
evaluate any ESG milestone triggers.

### `tree_planting.xlsx` → `tree_planting_events`

| Form field | Neon column |
|---|---|
| `_id` | `kobo_submission_id` |
| `project_location_id` | `project_location_id` |
| `planted_at` | `planted_at` |
| `trees_planted` | `trees_planted` (integer > 0) |
| `species` | `species` |
| `planted_by` | `planted_by` (UUID, optional) |
| `_geolocation` | `geo_lat`, `geo_lng` |

This is the canonical planting log. `v_project_location_plantings` aggregates
it; `projectLocations.trees_planted` should be considered legacy (per
`CLAUDE.md §10.4`).

### `give_back.xlsx` → `give_back_tracking`

| Form field | Neon column |
|---|---|
| `_id` | `kobo_submission_id` |
| `user_id` | `user_id` (UUID, required) |
| `quarter` | `quarter` (e.g. `"2026-Q2"`) |
| `activity_type` | `activity_type` |
| `activity_description` | `activity_description` |
| `_geolocation` | `geo_lat`, `geo_lng` |
| `_attachments[0].download_url` | `photo_url` |

Powers the Three Strikes mentee compliance check (`/api/cron/three-strikes`)
which runs quarterly.

## 5. Env vars

| Name | Where set | Used by |
|---|---|---|
| `KOBO_WEBHOOK_SECRET` | Vercel + `.env.local` | Route validates `x-kobo-token` header |

## 6. Local testing

Submit a fake payload directly via curl:

```bash
curl -X POST http://localhost:3000/api/webhooks/kobo \
  -H "Content-Type: application/json" \
  -H "x-kobo-token: $KOBO_WEBHOOK_SECRET" \
  -d '{
    "form_type": "tree_survival",
    "_id": 12345,
    "_submission_time": "2026-05-24T10:00:00Z",
    "survey_date": "2026-05-24",
    "check_interval_months": 6,
    "project_location_id": "00000000-0000-0000-0000-000000000000",
    "trees_planted": 100,
    "trees_alive": 87,
    "surveyor_name": "Test User",
    "_geolocation": [-1.2921, 36.8219]
  }'
```

Expected: `200 {"received": true}`. A 422 means schema mismatch (check
the dev server log; the route prints `[kobo-webhook] 422 schema reject`
with the failed issues).

## 7. Common gotchas

- **KoBo serializes `_id` as a number** in REST Service payloads. The route
  accepts string or number and coerces (`KoboId` zod helper in `route.ts`).
- **Numeric fields use `z.coerce.number()`** because KoBo may emit them as
  strings depending on form settings.
- **Photo `download_url` requires a KoBo media token** to be opened; the
  attachment URL is captured into Neon but isn't currently fetched/cached
  server-side. Anyone accessing `photo_url` later needs KoBo credentials.
- **Project location UUIDs** must already exist in Neon's `project_locations`
  table. Form-side validation only checks the UUID shape, not existence —
  unknown UUIDs land in Neon but downstream views won't join. Auditors
  should grab UUIDs from the partner dashboard before going to the field.
