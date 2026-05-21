# Jenga365 — Global Architectural Rules & Agent Guidelines

> Authoritative source-of-truth for any AI agent (Claude Code, Cursor, Windsurf, etc.) working on this repository. Last updated 2026-05-22.
> Where this document conflicts with an earlier note, this document wins. Where founder Bruce Nondies's directives (relayed by the user) conflict with this document, Bruce wins — update this file in lockstep.

---

## 1. Core Tech Stack & Infrastructure

- **Databases — strict two-database architecture:**
  - **Neon Serverless PostgreSQL** — relational data, Better Auth sessions, `pgvector` AI embeddings.
  - **Sanity Headless CMS** — unstructured editorial content (articles, resources, merchandise content).
- **Field data ingestion:** **EU KoBoToolbox Server** (GDPR-compliant) is the external staging ground for mobile field data, photos, and GPS coordinates.
- **Reporting:** All ESG reporting is offloaded to **Looker Studio** (the free product — **not** the enterprise "Looker" platform) querying Drizzle `pgView` live SQL views in Neon via Looker Studio's native Postgres connector. Do **not** build custom in-app reporting UI. See §10 for the partner-isolation + embedding rules.
- **Deprecated tooling:** Do **not** introduce Upstash or Redis for caching/sessions/rate-limiting. Rate limiting is Postgres-backed via `rate_limit_buckets`.

## 2. Database Schema Rules

### Give Back Tracking — GPS is mandatory

- `give_back_tracking.geoLat` and `give_back_tracking.geoLng` must use:
  ```ts
  geoLat: numeric('geo_lat', { precision: 10, scale: 7 })
  geoLng: numeric('geo_lng', { precision: 10, scale: 7 })
  ```
- The same precision applies anywhere GPS is stored (tree survival checks, project locations). Use `numeric(10, 7)` everywhere — never `float` or wider precision.
- Update all related Zod schemas, TypeScript interfaces, and API routes when adding/changing GPS fields.

### Tree Survival Counting — DISTINCT ON the latest audit

- Never use a naive `SUM(trees_alive)` across all rows of `tree_survival_checks`.
- For Corporate Unlock evaluations, use a CTE or `DISTINCT ON (project_location_id) ORDER BY survey_date DESC` so each location is counted once at its most recent audit.

### KoBo Webhook — Single Responsibility Principle

`/api/webhooks/kobo/route.ts`:
1. Authenticate via the `x-kobo-token` header.
2. Idempotent insert: `ON CONFLICT (kobo_submission_id) DO NOTHING`.
3. Return `200 OK` immediately.
4. Asynchronously trigger milestone checks.
5. **Never** generate reports or send emails inside this handler. (Slow work belongs in a queue/cron.)

## 3. Role-Based Access Control (RBAC)

The generic "Admin" role is **deprecated**. Implement strictly scoped roles using these **exact** string values:

| Role | `users.moderationScope` value |
|---|---|
| SuperAdmin (System Architect) | `all` |
| Welfare & Compliance Officer | `mentor_applications` |
| MEAL Director / Impact Auditor | `corporate` |
| Commerce & Editorial Manager | `content` |

> Migration 0002 shipped legacy names (`welfare | meal | commerce | all`). A follow-up migration must rename DB values and the `ModeratorScope` type / `CAPABILITIES` map in `src/lib/auth/roles.ts` in lockstep.

### Approval flow per role

- **Mentee registration:** fully auto-approved on signup.
- **Mentor registration:** requires Welfare & Compliance Officer approval (`mentor_applications` scope).
- **Corporate Partner registration:** requires MEAL Director approval (`corporate` scope) **or** a SuperAdmin-issued JWT invite that fast-tracks (`/api/admin/corporate-invite`).

## 4. AI Matching Algorithm

- Algorithm: `pgvector` cosine similarity + weighted scoring.
- **Weights (locked by founder 2026-05-20; sum = 100%):**

  | Weight | Component |
  |---:|---|
  | **40%** | Semantic similarity (profile + intake embedding) |
  | **20%** | Location |
  | **15%** | Availability *(score 0.0 until `users.availability` schema field ships)* |
  | **10%** | **Goal alignment** *(actionable goal-category match — separate from semantic similarity on profile text)* |
  | **10%** | Partner affiliation |
  | **5%** | Profile completeness |

- Goal alignment must match a mentee's stated entrepreneurial/career goal to a mentor's tagged experience areas. Not implicit in profile embedding.
- When availability column lands, drop the `0.0` hardcode and read from it — no weight retune needed.

## 5. Mentor Capacity (1:2 protocol)

- A mentor may have **at most 2 active mentees** at any time.
- Enforce in matching query pre-filter:
  ```sql
  coalesce(active_pair_count, 0) < 2
  ```
- Also enforce at write time: refuse to insert a `mentorship_pairs` row when the mentor already has 2 active pairs.

## 6. Frontend Header Rules

- Header state is determined **exclusively by authentication status**, never by route.
- Authenticated users must **never** see "Sign Up" or "Log In" buttons.
- Global CTAs (**"Donate Now"** and **"Store"**) are visible across all header variants — guest and authenticated.

## 7. Cron Jobs

- All cron routes (Three Strikes, Power Hour Check, Impact Report, Resilience Re-Assessment, Corporate Unlock cleanup) **must**:
  - Be served from `/api/cron/...` so the middleware matcher excludes them.
  - Require an `Authorization: Bearer ${CRON_SECRET}` header and return `401` otherwise.
  - Be registered in `vercel.json` with the appropriate schedule.
- Pattern (already used by `corporate-unlock` and `resilience-check`):
  ```ts
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
  }
  ```

## 8. Race-Safe Inventory Updates

Merchandise purchases and any inventory decrement **must** use a single atomic update:

```sql
UPDATE merchandise
SET stock_count = stock_count - 1
WHERE id = $1 AND stock_count > 0
RETURNING *;
```

If `RETURNING` is empty, the item is out of stock — fail the purchase. **Never** read-then-write; that allows overselling under concurrent load.

## 9. Current Sprint Priorities (BACKEND ONLY — locked 2026-05-21)

Founder Bruce: "freeze the UI cleaning and background noise for now and focus strictly on these core backend functions."

1. **Auth & Roles routing**
   - Diagnostic Intake routing for athletes (Mentee → `/onboarding/intake`).
   - NDA gate routing for corporate professionals (CorporatePartner → `/legal/nda`).
   - *Middleware already enforces; auth registration pages need restoration.*

2. **Engine B backend**
   - DB tables capable of receiving Audit data and updating Corporate Unlock status.
   - New: `tree_planting_events` table.
   - Existing (keep): `tree_survival_checks`, `tree_survival_audits`, `corporate_unlock_milestones`, `corporate_unlock_triggers`.

3. **Commerce & Content backend**
   - Merchandise upload endpoints with **atomic decrement** (§8).
   - Article publishing permission gates — only `content` scope can publish.

**Out of scope until Bruce reopens UI work:**
- Logo PNG → SVG.
- Caution/stop-sign background → brand white/light-green with faint topographic pattern.
- Impact-ticker dummy data ("750K+ Lives", "12,000 Mentors") → authentic baseline.
- Sweat-Equity / Three-Strikes messaging on landing page before NDA gate.
- Expanded Engine B marketing copy ("Green Technology", "Trees for Tries").
- Restoration of `(marketing)/*` pages and per-role `dashboard/*/studio/` embeds.

## 10. Phase 2 Implementation Directives (locked 2026-05-22)

1. **AI Matching Algorithm (Founder Lock):** Update the matching algorithm weights to strictly follow Bruce's 40/20/15/10/10/5 model: 40% Semantic, 20% Location, 15% Availability, 10% Goal Alignment, 10% Partner, 5% Profile Completeness.

2. **Goal Alignment Schema:** Implement Goal Alignment using a normalized `user_goal_tags` table. Do **NOT** use a `text[]` array on the users table. Reason: SQL joins on a normalized table give reliable overlap math under the weighted scoring, and standardized categories can be added/modified without parsing text arrays.

3. **Cron Security Guardrails:** Any restored cron jobs must include the `CRON_SECRET` `Authorization: Bearer …` guard **before committing**. They must bypass standard middleware authentication (the `/api/*` matcher exclusion already handles this).

4. **Tree Planting Data Structure:** In Phase 2.3, create the `tree_planting_events` table. The legacy `treesPlanted` integer tracking becomes a **derived value calculated via a Drizzle `pgView`** — not a denormalized static integer. The same `pgView` is the canonical source for Looker Studio dashboards, so denormalization would risk drift.

5. **Partner Reporting:** Do **NOT** restore or build any in-app partner reporting pages. Looker Studio (see §11) remains the canonical, sole source for Corporate Partner ESG reporting.

## 11. Looker Studio — connection, partner isolation, embedding

- **Connector:** Looker Studio's native PostgreSQL connector → Neon. Point it at clean **Drizzle `pgView`s**, never raw tables. The `v_resilience_delta` view already exists; `v_tree_survival_time_series` exists; add views for new metrics as needed.
- **Per-partner isolation (free-tier compatible — no row-level security):** two acceptable patterns. Pick per dashboard:
  - **Hardcoded data-source filter** — apply `corporate_partner_id = X` directly on the dashboard's data source.
  - **Per-partner SQL view** — create a distinct `pgView` per partner (e.g. `v_partner_<id>_impact`) and point only that dashboard at it.
- **In-app embedding:** drop the Looker Studio iframe embed code into the corporate-partner dashboard page (under `src/app/dashboard/partner/`) so sponsors view their data without leaving Jenga365.
- **Shareable links:** every embedded dashboard also has a Looker Studio shareable link (login-free). Surface this link in the partner dashboard alongside the iframe so sponsors can forward ESG reports to their board / sustainability team.
- **Public site:** same iframe approach for `(marketing)/impact/social` or `/about` — point a single broad, unfiltered Looker Studio dashboard at aggregate `pgView`s for total trees-planted / youth-served. *(Restoration of these public marketing pages is still gated by Bruce's UI freeze.)*
