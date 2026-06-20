# Jenga365 — Implementation Plan
**Date:** 2026-05-22
**Authority:** Founder Bruce Nondies (2026-05-20 / 2026-05-21)
**Companion docs:** [`CLAUDE.md`](./CLAUDE.md) · [`Jenga365 Production Audit.md`](./Jenga365%20Production%20Audit.md)

This plan is **backend-only** per Bruce. UI/marketing/Studio restorations are out of scope until reopened.

---

## Phase 0 — Already shipped (this session)

Committed to `main` since `ad6867d`:

1. `feat(db)` migrations 0002–0005 + schema updates (admin hierarchy, GPS, Engine B audit, rate limit)
2. `feat(auth)` RBAC capability map + `requireCapability()` guard
3. `feat(api)` admin / clinic-approval / MEAL spatial endpoints
4. `feat(infra)` Postgres rate limiter, Kobo `form_type` discriminator, resilience-check cron
5. `feat(matching+ui)` matching weight rewrite *(weights MISMATCH Bruce's lock — see Phase 2.1)*, Header rewrite
6. `chore(deps)` drop `@upstash/*`, minor version bumps
7. `fix(middleware)` rename `proxy.ts` → `middleware.ts` so Next.js executes it
8. (implicit) Restored `src/app/api/auth/[...all]/route.ts`

**Still dirty in working tree (uncommitted):** 45 deletions + new `CLAUDE.md`, `IMPLEMENTATION_PLAN.md`, audit revision. To be committed as part of Phase 1 / 2 below.

---

## Phase 1 — Backend-critical restorations

All paths below have their supporting actions/components intact. Restore from `HEAD` then verify against current schema (`ndaSigned`, `intakeCompleted`, capability gating).

### 1.1 Auth & onboarding pages (BLOCKER — middleware redirects here)

```sh
git checkout HEAD -- \
  "src/app/(auth)/legal/nda/page.tsx" \
  "src/app/(auth)/register/corporate/page.tsx" \
  "src/app/(auth)/register/mentee/page.tsx" \
  "src/app/(auth)/register/mentor/page.tsx" \
  "src/app/(auth)/verify-email/[token]/page.tsx" \
  "src/app/(auth)/admin-setup/[token]/page.tsx" \
  "src/app/(auth)/moderator-invite/[token]/page.tsx" \
  "src/app/api/onboarding/complete/route.ts"
```

**Post-restore checks:**
- Mentee `register/mentee` must auto-approve (set `isApproved=true`) per CLAUDE.md §3 approval flow. Verify against `src/lib/actions/auth.ts` flow.
- `moderator-invite` calls `setModeratorScope()` — when Phase 2.2 ships, the scope-string change must propagate here.
- Each page should compile against current Better Auth `additionalFields` (`ndaSigned`, `intakeCompleted`).

**Acceptance:** Signup as Mentee → email verify → intake → dashboard works end-to-end. Signup as CorporatePartner → NDA gate → sign → dashboard works.

### 1.2 Accountability crons

```sh
git checkout HEAD -- \
  "src/app/api/cron/three-strikes/route.ts" \
  "src/app/api/cron/power-hour-check/route.ts" \
  "src/app/api/cron/impact-report/route.ts"
```

**Post-restore checks (CRITICAL — these crons predate the CRON_SECRET rule):**
- Each restored route must add the `Authorization: Bearer ${CRON_SECRET}` guard pattern from `corporate-unlock`/`resilience-check`. If missing, add it before committing.
- Three Strikes must transition users to `status='under_review'` after 3 strikes, matching the suspension cosign flow (`/api/admin/suspensions/[id]/cosign`).
- `vercel.json` already lists all five entries; no changes needed once routes are back.

**Acceptance:** `curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/three-strikes` returns 200. Existing tests `__tests__/cron/{three-strikes,power-hour-check,impact-report}.test.ts` pass.

### 1.3 Paystack webhook

```sh
git checkout HEAD -- "src/app/api/webhooks/paystack/route.ts"
```

Calls `verifyPaystackWebhook()` + `handlePaystackWebhook()` from `src/lib/paystack/webhooks.ts` (still present). No changes needed.

### 1.4 Admin / moderator dashboards (backend-facing surfaces)

```sh
git checkout HEAD -- \
  "src/app/dashboard/admin/nda/page.tsx" \
  "src/app/dashboard/admin/shadow/page.tsx" \
  "src/app/dashboard/moderator/inventory/page.tsx"
```

These are thin wrappers over `NDAManager`, `ShadowView`, `InventoryStockEditor` — all present in `src/components/dashboard/`.

> Shadow View is explicitly required by Audit §2 (SuperAdmin authority).

### 1.5 Role dashboard pages required by backend features

```sh
git checkout HEAD -- \
  "src/app/dashboard/mentor/mentees/[id]/page.tsx" \
  "src/app/dashboard/mentor/power-hour/page.tsx" \
  "src/app/dashboard/ngo/mou/page.tsx" \
  "src/app/dashboard/partner/mou/page.tsx"
```

- `mentor/power-hour/page.tsx` is required by Phase 1.2 (Power Hour cron evaluates `mentorCommitmentTracker` rows that this page writes).
- NGO + Partner MOU pages are required for Engine B partner workflow (Audit §2).
- Partner report pages (`partner/report/*`, `partner/reports/new/`) are **deferred** — they are reporting UI, and per CLAUDE.md §1 reporting is offloaded to Data Studio.

### 1.6 Optional dev-time restore

```sh
git checkout HEAD -- "src/app/api/email/preview/route.ts"
```

Only if the team uses local email template previews.

### 1.7 Stale tests

After Phase 1.2 restores the crons, the existing cron tests should pass as-is. The intake-components test (`src/__tests__/intake/components.test.tsx`) is also a stale deletion — restore it if `src/components/intake/` is intact (it is), else delete.

---

## Phase 2 — Sprint backend work

### 2.1 Matching algorithm — align to founder lock

Edit `src/lib/db/queries/matching.ts`:

```ts
const W = {
    semantic:     0.40,
    location:     0.20,
    availability: 0.15,  // score is 0.0 until users.availability column ships
    goal:         0.10,
    affiliation:  0.10,
    completeness: 0.05,
} as const;
```

- Add an `availabilityScore` SQL expression that returns `0.0` until the `users.availability` column lands.
- Add a `goalScore` SQL expression. Goal alignment compares the mentee's stated goal categories (from intake) against the mentor's tagged experience areas. **Schema is LOCKED (CLAUDE.md §10.2):** dedicated normalized table `user_goal_tags(user_id uuid fk, category text)` — do **not** use a `text[]` on `users`. Score expression (Jaccard-ish overlap, normalized by mentee goal count so a mentee with one goal can still score 1.0):
  ```sql
  coalesce(
    (select count(*)::float
     from user_goal_tags mg
     join user_goal_tags tg on tg.category = mg.category and tg.user_id = users.id
     where mg.user_id = :menteeId) / nullif(:menteeGoalCount, 0),
    0
  )
  ```
- Update `totalScore` SQL expression to include both new terms.
- Update callers in `src/lib/actions/matching.ts` to pass mentee goal categories from intake.

### 2.2 RBAC scope rename — `welfare`/`meal`/`commerce` → `mentor_applications`/`corporate`/`content`

Create `drizzle/0006_rbac_scope_rename.sql`:

```sql
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
```

In `src/lib/auth/roles.ts`:
- `ModeratorScope` type → `"mentor_applications" | "corporate" | "content" | "all"`.
- `CAPABILITIES` map → replace `"welfare"` → `"mentor_applications"`, `"meal"` → `"corporate"`, `"commerce"` → `"content"`.
- `parseScopes()` valid-set update.
- `defaultScopesForRole()` (SuperAdmin defaults) update.

Sweep references: `grep -rn '"welfare"\|"meal"\|"commerce"' src/` and fix each.

### 2.3 Add `tree_planting_events` table

Create `drizzle/0007_tree_planting_events.sql`:

```sql
CREATE TABLE tree_planting_events (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_location_id   uuid NOT NULL REFERENCES project_locations(id) ON DELETE CASCADE,
    planted_at            timestamptz NOT NULL,
    trees_planted         integer NOT NULL CHECK (trees_planted > 0),
    species               text,
    planted_by            uuid REFERENCES users(id),
    kobo_submission_id    text UNIQUE,
    geo_lat               numeric(10, 7),
    geo_lng               numeric(10, 7),
    metadata              jsonb DEFAULT '{}'::jsonb,
    created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tree_planting_events_location
    ON tree_planting_events(project_location_id, planted_at DESC);
```

Mirror in `src/lib/db/schema.ts`. Update `/api/webhooks/kobo/route.ts` so a third `form_type: 'tree_planting'` variant inserts here.

**LOCKED (CLAUDE.md §10.4):** the legacy `project_locations.treesPlanted` integer becomes **derived via a Drizzle `pgView`** — not denormalized. Add to schema:

```ts
export const vProjectLocationPlantings = pgView("v_project_location_plantings").as((qb) =>
  qb
    .select({
      projectLocationId: treePlantingEvents.projectLocationId,
      treesPlanted: sql<number>`coalesce(sum(${treePlantingEvents.treesPlanted}), 0)`.as("trees_planted"),
      lastPlantedAt: sql<Date>`max(${treePlantingEvents.plantedAt})`.as("last_planted_at"),
    })
    .from(treePlantingEvents)
    .groupBy(treePlantingEvents.projectLocationId)
);
```

Then drop `project_locations.treesPlanted` and migrate any reader to JOIN against the view. This view is also the canonical source for Data Studio dashboards (CLAUDE.md §11), so denormalizing would risk drift.

### 2.4 Atomic merchandise decrement — audit and harden

```sh
grep -rn "stock_count\|merchandise" src/lib/actions/ src/app/api/
```

For every code path that decrements stock (checkout success, manual `upsertMerchandiseStock` decrement, order fulfilment), replace any read-then-write with:

```sql
UPDATE merchandise
SET stock_count = stock_count - $1
WHERE id = $2 AND stock_count >= $1
RETURNING *;
```

Empty RETURNING → out of stock → fail purchase. Add a unit test exercising concurrent decrements (`Promise.all([decrement, decrement])` against the same row).

### 2.5 Data Studio reporting views

Create / verify the Drizzle `pgView`s that Data Studio will read from, in priority order:

1. `v_project_location_plantings` (created in Phase 2.3) — total trees planted per location.
2. `v_partner_impact(<partner_id>)` — per Corporate Partner: total trees planted, total trees-alive-at-latest-audit (using `DISTINCT ON` per CLAUDE.md §2), total mentorship hours, youth engaged. One view per partner per CLAUDE.md §11 partner-isolation pattern.
3. `v_public_impact_aggregate` — unfiltered totals for the public site / aggregate dashboard.

No in-app pages are built for these — Data Studio dashboards consume the views directly and are embedded in `src/app/dashboard/partner/` via iframe + shareable link surfacing (when UI freeze lifts).

### 2.6 Article publishing gate (`content` scope only)

Sweep for article publish actions:

```sh
grep -rn "isPublished\|publishArticle\|publishedAt" src/lib/actions/ src/app/api/
```

Wrap the publish action with `await requireCapability("PUBLISH_ARTICLE")`. Add `PUBLISH_ARTICLE` to `CAPABILITIES` mapping to `["content", "all"]`. Verify Sanity-side workflow respects the same gate (if articles flow through Sanity Studio, restrict the role's Studio basePath to authors-only and require API publish action for the gate to fire).

---

## Phase 3 — Build & verification

1. `npm ci` — clean install; previous `--ignore-scripts` install left several packages unresolvable.
2. `npx tsc --noEmit` — must pass.
3. `next build` — must complete; treat warnings as findings.
4. `vitest run` — Phase 1.2 + 1.7 may surface tests to fix.
5. Manual smoke (`npm run dev`):
   - Guest → public routes render; guest → `/dashboard/*` redirects to `/login?next=…`.
   - Mentee signup → email verify → intake (if `intakeCompleted=false`) → dashboard.
   - CorporatePartner signup → NDA gate → sign → dashboard.
   - Moderator with `mentor_applications` scope → can hit Welfare Officer routes, blocked from MEAL routes.
   - All 5 cron endpoints return 200 with `CRON_SECRET`, 401 without.
   - Kobo webhook accepts `form_type ∈ { 'give_back', 'tree_survival', 'tree_planting' }`.
   - Concurrent purchase of last-stock item → exactly one succeeds.

---

## Phase 4 — Deferred (post-backend, awaiting Bruce's go-ahead)

- Mentor write-time capacity guard (2 active pairs max) at `mentorshipPairs` insert.
- Marketing pages: `(marketing)/articles/[slug]`, `(marketing)/help/manuals`, `(marketing)/impact/social`, `(marketing)/resources/{articles,downloads,video,voices}`.
- Per-role Sanity Studio embeds: `dashboard/{admin,mentee,mentor,moderator,ngo,partner}/studio/`.
- Partner report pages (`dashboard/partner/report/*`, `dashboard/partner/reports/new`) — Data Studio is canonical per CLAUDE.md §1/§10.5/§11. Confirmed DO-NOT-RESTORE.
- Partner-dashboard Data Studio iframe + shareable-link surfacing (CLAUDE.md §11) — backend views (Phase 2.5) can ship now; the iframe wrapper waits for UI freeze to lift.
- UI rectifications: logo → SVG; remove caution/stop-sign background; impact-ticker authentic baseline; Sweat-Equity landing-page messaging; expanded Engine B marketing copy.

---

## Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Restored auth pages reference fields that changed (e.g. ndaSigned/intakeCompleted) | Med | After each batch, `tsc --noEmit` and smoke each form. |
| Better Auth session cookie doesn't carry `ndaSigned`/`intakeCompleted` to middleware | Med-High | Inspect Set-Cookie after login; ensure `auth/config.ts` `additionalFields` includes them and Better Auth serializes into `session_data`. |
| Goal-alignment column choice (A vs B) ships and conflicts with intake schema | Med | Confirm `menteeIntake` table fields before picking; prefer Option A unless intake already normalizes goal categories elsewhere. |
| RBAC scope rename ships with stragglers using old strings | Med-High | After rename, `grep -rn '"welfare"\|"meal"\|"commerce"' src/` must return 0 hits. |
| Three Strikes cron's previous logic doesn't match current `give_back_tracking` columns (now with GPS) | Med | Read cron source post-restore; if it `SELECT *`s and inserts, it'll be fine; if it constructs partial rows, may need updates. |

---

## Suggested execution order

1. Commit `CLAUDE.md`, audit revision, `IMPLEMENTATION_PLAN.md` so the docs themselves are versioned.
2. **Phase 1.1** (auth pages) — unblocks login.
3. **Phase 3 step 1–3** (clean build) — surfaces broken imports early.
4. **Phase 1.2** (crons) — restore + CRON_SECRET guard.
5. **Phase 1.3** (paystack) + **Phase 1.4 / 1.5** (admin + role dashboards).
6. **Phase 2.1** (matching weights to founder lock).
7. **Phase 2.2** (RBAC scope rename) and **Phase 2.3** (`tree_planting_events` + derived view) — independent, can land in either order.
8. **Phase 2.4** (atomic decrement), **Phase 2.5** (Data Studio views), and **Phase 2.6** (article publish gate).
9. **Phase 3 step 5** (manual smoke) — gate before staging deploy.
