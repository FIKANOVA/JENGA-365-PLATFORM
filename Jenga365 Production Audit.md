# Jenga365 Production Audit & Gap Analysis
**Date:** 2026-05-22 (revised)
**Authority:** Founder Bruce Nondies, relayed 2026-05-20 / 2026-05-21
**Source rules:** see [`CLAUDE.md`](./CLAUDE.md) and [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)
**Objective:** Audit implemented features against the "Total Athlete" / Dual-Engine vision and track sprint execution. Status markers reflect work committed on `main`.

---

## 1. Core Business Logic (Approved & Locked)

* **Corporate "Unlock Challenge":** ⚠ PARTIAL
  * Logic: Corporate ESG funds remain LOCKED until GPS-verified environmental milestones are met. Crown-jewel feature for ESG pitch.
  * **Implemented:** `corporate_unlock_milestones`, `corporate_unlock_triggers`, `/api/admin/esg-unlock/[milestoneId]` (manual override), `/api/cron/corporate-unlock` (auto-evaluation).
  * **Gap:** Confirm SQL evaluation uses `DISTINCT ON (project_location_id) ORDER BY survey_date DESC` per CLAUDE.md §2.

* **MEAL Tracking Rigor:** ⚠ PARTIAL
  * Logic: Tracks actual tree-survival rates via audits (not vanity "planted" counts) and computes the "Resilience Delta".
  * **Implemented:** `v_resilience_delta` view, `tree_survival_audits`, `tree_survival_checks`, `/api/cron/resilience-check`, Kobo webhook with `form_type` discriminator.
  * **Gap:** No dedicated `tree_planting_events` table yet — sprint priority 2 creates one.

* **Role Constraints & Sweat Equity:** ⚠ PARTIAL
  * **NDA gate (corporate):** ✅ Middleware enforces; `legal/nda` page must be restored to be user-visible.
  * **Three Strikes (mentees):** ⚠ Cron route deleted from working tree; restorable. Will re-ship under sprint priority 4 (crons).
  * **Mentor capacity 1:2:** ✅ Enforced in matching pre-filter (`coalesce(active_pair_count, 0) < 2`). Write-time guard on `mentorship_pairs` insert still needed.
  * **Frontend Sweat-Equity messaging (landing page, pre-NDA):** ❌ DEFERRED to post-backend sprint.

---

## 2. Administrative Architecture & RBAC (Approved)

Generic "Admin" deprecated. Use strictly scoped RBAC with these **exact** `moderationScope` values:

| Level | Role | Scope value |
|---|---|---|
| 1 | **System Architect (SuperAdmin)** | `all` |
| 2A | **Welfare & Compliance Officer** | `mentor_applications` |
| 2B | **MEAL Director / Impact Auditor** | `corporate` |
| 2C | **Commerce & Editorial Manager** | `content` |

> **Legacy migration note:** Migration `0002_admin_hierarchy.sql` set scopes to `welfare | meal | commerce | all`. A follow-up migration must rename DB values and update `src/lib/auth/roles.ts` (`ModeratorScope` type + `CAPABILITIES` map).

### Responsibilities (unchanged from prior audit)

- **SuperAdmin** (`all`): provisions Moderators; Shadow View (read-only); co-signs mentee suspensions (✅ `/api/admin/suspensions/[id]/cosign`); dispatches corporate JWT invites (✅ `/api/admin/corporate-invite`); manual ESG unlock (✅); full fallback authority.
- **Welfare & Compliance Officer** (`mentor_applications`): approves/rejects Mentor applications (Mentee is auto-approved); initiates Three Strikes; approves rugby clinics (✅ `/api/clinics/[id]/approve`); manages webinar logistics.
- **MEAL Director** (`corporate`): vets Corporate Partner applications; manages spatial tracking data (✅ `/api/meal/spatial`); verifies quarterly tree-survival audits.
- **Commerce & Editorial Manager** (`content`): reviews/approves Jenga Journal articles; syncs merchandise from Sanity (`upsertMerchandiseStock`) using atomic-decrement (CLAUDE.md §8).

---

## 3. AI Matching Algorithm (Locked by Founder 2026-05-20)

* **Status:** ✅ Algorithm shape correct; ❌ weights and goal-alignment do **not** match Bruce's lock — code currently 50/20/0/10/5 with goal removed.

* **Required weights (sum = 100%):**

  | Weight | Component | Code today |
  |---:|---|---|
  | **40%** | Semantic similarity | 50% (too high) |
  | **20%** | Location | 20% ✅ |
  | **15%** | Availability *(score 0.0 until schema lands)* | 0% weight (should be 15% with 0.0 score) |
  | **10%** | **Goal alignment** | **missing entirely** |
  | **10%** | Partner affiliation | 10% ✅ |
  | **5%** | Profile completeness | 5% ✅ |

* **Founder rationale (Bruce, 2026-05-20):** "we need to heavily favor actionable goals over just semantic similarity … matching a mentee who wants to build a specific business with a mentor who has that exact entrepreneurial experience."

* **Mentor capacity:** ✅ Pre-filter excludes mentors with ≥2 active pairs.

---

## 4. Sprint Priorities (Locked 2026-05-21 — BACKEND ONLY)

Bruce: "freeze the UI cleaning and background noise for now and focus strictly on these core backend functions."

1. **Auth & Roles Routing**
   - Diagnostic Intake routing for athletes; NDA gate routing for corporate professionals.
   - **Status:** Middleware ✅. Auth registration pages deleted on disk; restoration required.

2. **Engine B Backend (ESG Data)**
   - Audit data ingestion + Corporate Unlock status updates.
   - New: `tree_planting_events`. Existing tables retained.
   - **Status:** Most tables shipped; `tree_planting_events` pending.

3. **Commerce & Content Permissions**
   - Merchandise upload backend with atomic decrement.
   - Article publish gate restricted to `content` scope.
   - **Status:** `upsertMerchandiseStock` exists; atomic-decrement pattern needs verification across all purchase paths. Publishing gate not yet enforced at API layer.

**Implicit prerequisite — automated accountability crons:** Restore Three Strikes, Power Hour, Impact Report routes. Required for §1 (Sweat Equity enforcement) and §1 (MEAL aggregation) to function.

**Deferred (not this sprint):** RBAC scope rename, mentor write-time capacity guard, all UI/marketing/Studio restoration.

---

## 5. Status Summary (commits on `main` as of 2026-05-22)

| Area | Status | Reference |
|---|---|---|
| Migrations 0002–0005 | ✅ shipped | `f8f6f9c` |
| Better Auth handler | ✅ restored | this session |
| Middleware (was `proxy.ts`) | ✅ active | `9dd1b4e` |
| RBAC capability guard | ✅ shipped (legacy scope names) | `6ef094b` |
| Admin / clinic / MEAL endpoints | ✅ shipped | `f3d6edd` |
| Postgres rate limiter | ✅ shipped | `e62278d` |
| Kobo webhook (discriminator + GPS) | ✅ shipped | `e62278d` |
| Resilience-check cron | ✅ shipped | `e62278d` |
| Matching weights & Header rewrite | ⚠ shipped but weights mismatch founder lock | `e741a0e` |
| Drop @upstash/* | ✅ shipped | `3a900e3` |
| Auth pages (legal/nda, register/*, verify-email, admin-setup, moderator-invite) | ❌ deleted on disk | Plan Phase 1.1 |
| Three Strikes / Power Hour / Impact Report crons | ❌ deleted on disk | Plan Phase 1.2 |
| Paystack webhook | ❌ deleted on disk | Plan Phase 1.3 |
| Admin / moderator dashboard pages (Shadow View, NDA Manager, Inventory) | ❌ deleted on disk | Plan Phase 1.4 |
| Role dashboards (mentor/power-hour, partner reports, NGO MOU) | ❌ deleted on disk | Plan Phase 1.5 |
| Marketing + Sanity Studio embeds | ❌ deleted on disk — DEFERRED | n/a this sprint |
| Matching weights → 40/20/15/10/10/5 with goal-alignment | ❌ pending | Plan Phase 2.1 |
| Scope rename to `mentor_applications` / `corporate` / `content` | ❌ pending | Plan Phase 2.2 |
| `tree_planting_events` table | ❌ pending | Plan Phase 2.3 |
| Atomic merchandise decrement (verify all paths) | ❌ pending | Plan Phase 2.4 |
| Article publish gate at API layer | ❌ pending | Plan Phase 2.5 |
| Mentor write-time capacity guard | ❌ pending (DEFERRED) | n/a this sprint |
