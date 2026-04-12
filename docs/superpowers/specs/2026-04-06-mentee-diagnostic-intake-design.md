# Mentee Diagnostic Intake — Design Spec
**Date:** 2026-04-06  
**Status:** Approved  
**Feature:** `/onboarding/intake` — post-verification blocking gate

---

## Overview

The Diagnostic Intake is a mandatory 3-step form that every mentee must complete after verifying their email, before accessing the dashboard. It captures the foundational data layer that powers Precision Matching and MEAL Resilience Delta tracking.

This replaces the AI Interviewer (Amani) as a registration gate. Amani moves to the dashboard as an ongoing profile enrichment tool available to Mentees, Mentors, and Corporate Partners.

---

## Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Form type | Structured form, no AI dependency | Deterministic, reliable, no embedding required to start |
| Placement | Post-verification onboarding gate | Keeps registration lean, reduces drop-off, enforced by middleware |
| Career aspirations | Tags (max 3) + optional free text (max 280 chars) | Tags power matching filters; free text seeds Amani later |
| Embedding generation | Synchronous on submit | Mentee lands on dashboard with matches already populated |
| Resilience input | Question-based hidden score | Reduces self-reporting bias vs. direct 1–10 slider |
| Support types | Multi-select, capped at 2 | Preserves signal strength for matching |
| Mentorship style field | `preferred_mentorship_style` (Strict/Supportive/Mixed) | Feeds Precision Matching algorithm directly |
| Architecture | Split intake + resilience_assessments tables | Resilience score is a time-series — must be immutable rows for Delta calculation |
| Amani relocation | Dashboard (Mentee, Mentor, Corporate) | Ongoing profile enrichment, improves embedding quality over time |

---

## Database Schema

### 1. Alter `users` table
```sql
ALTER TABLE users
  ADD COLUMN intake_completed BOOLEAN NOT NULL DEFAULT false;
```

### 2. New table: `mentee_intake`
Immutable baseline record. Created once on form submit, never updated.

```sql
CREATE TABLE mentee_intake (
  id                         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  academic_standing          TEXT        NOT NULL
                               CHECK (academic_standing IN ('Good', 'Probation', 'Honors')),
  career_tags                TEXT[]      NOT NULL
                               CHECK (cardinality(career_tags) BETWEEN 1 AND 3),
  career_free_text           TEXT        CHECK (char_length(career_free_text) <= 280),
  support_types              TEXT[]      NOT NULL
                               CHECK (cardinality(support_types) BETWEEN 1 AND 2),
  preferred_mentorship_style TEXT        NOT NULL
                               CHECK (preferred_mentorship_style IN ('Strict', 'Supportive', 'Mixed')),
  created_at                 TIMESTAMP   NOT NULL DEFAULT now(),

  CONSTRAINT mentee_intake_user_id_unique UNIQUE (user_id)
);
```

### 3. New table: `resilience_assessments`
Time-series. One immutable row per assessment (baseline + every 6-month re-assessment).

```sql
CREATE TABLE resilience_assessments (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score                 INTEGER     NOT NULL CHECK (score BETWEEN 1 AND 10),
  q1_response           TEXT        NOT NULL,
  q2_response           TEXT        NOT NULL,
  identity_response     TEXT,
  is_baseline           BOOLEAN     NOT NULL DEFAULT true,
  reassessment_due_date TIMESTAMP,
  assessed_at           TIMESTAMP   NOT NULL DEFAULT now(),

  CONSTRAINT identity_required_on_reassessment
    CHECK (is_baseline = true OR identity_response IS NOT NULL)
);
```

**Scoring logic (hidden from mentee):**

| Question | Options | Points |
|---|---|---|
| Q1: Control over situation | Never / Rarely / Sometimes / Often / Always | 1 / 3 / 5 / 8 / 10 |
| Q2: Managing pressure | Barely coping / Struggling / Managing / Thriving | 1 / 4 / 7 / 10 |

`score = round((q1_points + q2_points) / 2)`

**`identity_response`** — designated column for Identity Articulation tracking. NULL on baseline. Required on every re-assessment. Tracks the shift from singular ("I am a rugby player") to dual identity ("I am a project manager who plays rugby") as a MEAL welfare indicator.

**`reassessment_due_date`** — set to `assessed_at + 6 months` on baseline row only. NULL on re-assessment rows.

---

## UI Form — 3-Step Wizard

**Route:** `/onboarding/intake`  
**Layout:** Centered card, progress indicator (1 / 2 / 3), Kenya flag brand colors

### Step 1 — "How are you doing?"
- Q1: "How often do you feel in control of your situation?" → 5-option pill select (Never / Rarely / Sometimes / Often / Always)
- Q2: "How well are you managing pressure and stress right now?" → 4-option pill select (Barely coping / Struggling / Managing / Thriving)
- Score computed client-side, stored server-side only. Mentee never sees the number.

### Step 2 — "Where are you headed?"
- Academic standing → 3-option radio card (Good / Probation / Honors)
- Career direction → multi-select tag chips, max 3. Options: Software Engineering, Finance, Healthcare, Design/Creative, Law, Social Impact/NGO, Product Management, Agri-tech, Education, Other
- "In your own words" → optional textarea, max 280 chars, character counter shown

### Step 3 — "How do you want to be mentored?"
- Support types → multi-select pill chips, max 2. Options: Career Guidance, Psycho-Social Support, Technical Skills, Networking
- Preferred mentorship style → 3-option descriptive radio card:
  - **Strict** — Structured sessions, homework, clear accountability
  - **Supportive** — Open-ended, mentee-led, flexible pace
  - **Mixed** — Blend of both depending on the week
- Submit button: "Complete Profile →"

### Submit → Loading Screen (~2–3s)
```
✓ Saving intake record
✓ Recording resilience baseline
⟳ Preparing your mentor recommendations…
→ Redirecting to dashboard
```

---

## Server Action: `submitDiagnosticIntake()`

Runs synchronously on form submit. All steps are atomic — if any fails, nothing is committed.

```typescript
// Pseudocode — implementation in src/lib/actions/intake.ts
async function submitDiagnosticIntake(formData: IntakeFormData) {
  const session = await auth()

  await db.transaction(async (tx) => {
    // 1. Save intake record
    await tx.insert(menteeIntake).values({ ...formData, userId: session.user.id })

    // 2. Save resilience baseline
    const score = computeResilienceScore(formData.q1, formData.q2)
    await tx.insert(resilienceAssessments).values({
      userId: session.user.id,
      score,
      q1Response: formData.q1,
      q2Response: formData.q2,
      identityResponse: null,           // baseline — not yet asked
      isBaseline: true,
      reassessmentDueDate: addMonths(new Date(), 6),
    })

    // 3. Generate embedding from intake data
    // buildEmbeddingText concatenates all structured fields into a single prose string:
    // "[career_tags joined]. [career_free_text]. Seeking support in: [support_types joined].
    //  Preferred mentorship style: [preferred_mentorship_style]. Academic standing: [academic_standing]."
    const embeddingText = buildEmbeddingText(formData)
    const embedding = await generateEmbedding(embeddingText)

    // 4. Flip intake_completed, store embedding
    await tx.update(users)
      .set({ intakeCompleted: true, embedding, embeddingStale: false })
      .where(eq(users.id, session.user.id))
  })

  redirect('/dashboard')
}
```

---

## Middleware Gate

Added to existing `middleware.ts` gate chain. Order: NDA → intake.

```typescript
// After existing NDA check:
if (isProtectedRoute && session?.user) {
  const intakeCompleted = session.user.intakeCompleted

  if (!intakeCompleted && !pathname.startsWith('/onboarding/intake')) {
    return NextResponse.redirect(new URL('/onboarding/intake', req.url))
  }
}
```

**Dependency:** Better Auth must be configured to expose `intakeCompleted` on the session user object. Add to `src/lib/auth/config.ts`:
```typescript
session: {
  additionalFields: {
    intakeCompleted: { type: 'boolean', defaultValue: false }
  }
}
```
Without this, `session.user.intakeCompleted` is always `undefined` and the gate never fires.

---

## Data Flow Summary

```
Email verified
  → /onboarding/intake (blocked by middleware if intake_completed = false)
  → 3-step form
  → submitDiagnosticIntake() [atomic transaction]
      ├─ INSERT mentee_intake
      ├─ INSERT resilience_assessments (is_baseline=true)
      ├─ generateEmbedding() → UPDATE users.embedding
      └─ UPDATE users.intake_completed = true
  → /dashboard (matches populated on arrival)
  → [6 months later] cron triggers reassessment notification
      └─ INSERT resilience_assessments (is_baseline=false, identity_response required)
      └─ Resilience Delta = new_score − baseline_score
```

---

## How Intake Feeds Matching

`preferred_mentorship_style` and `support_types` become hard pre-filters in `getMentorMatches()` before the pgvector similarity search runs:

```sql
WHERE mentor.mentorship_style = mentee.preferred_mentorship_style
  AND mentor.expertise && mentee.support_types   -- array overlap
  AND mentor.isApproved = true
  AND mentor.status = 'active'
  AND mentor.active_mentees < 2
```

This ensures semantic similarity scoring only runs against mentors who are actually compatible — improving match quality and reducing wasted vector compute.

**Dependency:** `mentor.mentorship_style` and `mentor.expertise` are not currently captured in the mentor registration flow. The `preferred_mentorship_style` pre-filter cannot be applied until mentor intake is extended to collect these fields. For this sprint, matching falls back to vector similarity only — the pre-filter is wired but short-circuits gracefully when mentor fields are null.

---

## Amani — Relocated to Dashboard

Amani is removed from the registration/onboarding flow entirely. It reappears as a dashboard feature:

- **Mentee dashboard** — "Improve your matches" section. Running Amani generates a richer embedding seeded from `career_free_text`.
- **Mentor dashboard** — "Update your profile" section. Amani refines mentor expertise embedding.
- **Corporate Partner dashboard** — "Company profile" section. Amani captures CSR focus areas and volunteer preferences.

On Amani completion: `UPDATE users SET embedding = newEmbedding, embeddingStale = false`.

---

## Planning Notes (Deferred — Not This Sprint)

**Embedding API failure behaviour** — `generateEmbedding()` runs inside the DB transaction, so a transient OpenAI timeout rolls back the entire intake record and forces the mentee to redo the form. This is the simplest behaviour but has UX risk. The `writing-plans` task list must include an explicit test for embedding API failure so the rollback behaviour is a conscious decision, not an accident. Future option: commit DB writes first, then generate embedding with a retry queue using `embeddingStale = true` as the fallback.

**Re-assessment scheduling continuity** — `reassessment_due_date` is set on the baseline row only and NULL on all re-assessment rows. After the first 6-month re-assessment fires, no row exists to schedule the second one. Resolve before the MEAL cron sprint: either set `reassessment_due_date = assessed_at + 6 months` on every re-assessment row, or have the cron write the next due date back to a dedicated scheduling table on completion.

---

## Out of Scope (This Sprint)

- 6-month re-assessment UI (MEAL cron + notification triggers are a separate feature)
- Guardian Protocol notifications
- MEAL reporting dashboard
- Amani dashboard integration (separate feature per role)
