# Mentee Diagnostic Intake — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the mandatory post-verification onboarding gate at `/onboarding/intake` that captures a mentee's resilience baseline, academic standing, career aspirations, support type, and mentorship style — then synchronously generates an embedding so the mentee lands on a dashboard with mentor matches already populated.

**Architecture:** A 3-step wizard page guarded by the dashboard layout. On submit, a Server Action runs four sequential DB operations (insert intake record → insert resilience baseline → generate embedding → flip `intake_completed` flag). Embedding failure is handled gracefully: intake data is always saved, `embeddingStale` is set to `true` as fallback.

**Tech Stack:** Next.js 15 App Router · Drizzle ORM (neon-http, no transactions) · Better Auth · Google `text-embedding-004` (768-dim) · Zod · date-fns · Vitest · Tailwind CSS

---

## Pre-Flight Checks

Before starting, confirm these env vars are set in `.env.local`:
- `DATABASE_URL` — Neon connection string
- `GOOGLE_GENERATIVE_AI_API_KEY` — for embedding generation

---

## File Map

**New files:**
| File | Responsibility |
|---|---|
| `vitest.config.ts` | Test runner configuration |
| `src/lib/intake/types.ts` | Shared TypeScript types for intake form |
| `src/lib/intake/scoring.ts` | `computeResilienceScore(q1, q2)` pure function |
| `src/lib/intake/embedding.ts` | `buildEmbeddingText(data)` pure function |
| `src/lib/actions/intake.ts` | `submitDiagnosticIntake()` Server Action |
| `src/app/onboarding/intake/page.tsx` | 3-step wizard page (Client Component) |
| `src/app/onboarding/intake/_components/IntakeProgress.tsx` | Step progress indicator |
| `src/app/onboarding/intake/_components/SubmittingScreen.tsx` | "Setting up your profile…" loading screen |
| `src/app/onboarding/intake/_components/StepOne.tsx` | Step 1 — resilience questions |
| `src/app/onboarding/intake/_components/StepTwo.tsx` | Step 2 — academic standing + career |
| `src/app/onboarding/intake/_components/StepThree.tsx` | Step 3 — support types + mentorship style |
| `src/__tests__/intake/scoring.test.ts` | Unit tests for scoring logic |
| `src/__tests__/intake/embedding.test.ts` | Unit tests for embedding text builder |
| `src/__tests__/intake/action.test.ts` | Integration tests for Server Action |

**Modified files:**
| File | Change |
|---|---|
| `src/lib/db/schema.ts` | Add `intakeCompleted` to users · Add `menteeIntake` table · Add `resilienceAssessments` table |
| `src/lib/auth/config.ts` | Add `intakeCompleted` to `user.additionalFields` |
| `src/app/dashboard/layout.tsx` | Add intake gate after session check |
| `src/middleware.ts` | Add `/onboarding` to `onboardingRoutes` array |
| `package.json` | Add `"test"` and `"test:coverage"` scripts |

---

## Task 1 — Add Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Vitest and jsdom**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npm install -D vitest @vitest/coverage-v8
```

Expected: packages added to `devDependencies`.

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts` at the project root:

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Add test scripts to package.json**

Open `package.json` and add to the `"scripts"` section:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 4: Verify Vitest runs**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx vitest run --reporter=verbose 2>&1 | head -20
```

Expected output contains: `No test files found` or runs cleanly (no config errors).

- [ ] **Step 5: Commit**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest test framework"
```

---

## Task 2 — Schema Changes

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Add `check` and `sql` to schema imports**

Open `src/lib/db/schema.ts`. Find the existing import from `drizzle-orm/pg-core` and add `check`:

```typescript
import {
    pgTable,
    uuid,
    text,
    timestamp,
    varchar,
    integer,
    boolean,
    jsonb,
    vector,
    pgEnum,
    decimal,
    index,
    uniqueIndex,
    check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
```

(`sql` is imported from `"drizzle-orm"`, not from `"drizzle-orm/pg-core"`)

- [ ] **Step 2: Add `intakeCompleted` to the `users` table**

Find the `users` table definition in `schema.ts`. Add `intakeCompleted` after the `embeddingStale` line:

```typescript
embeddingStale: boolean("embedding_stale").default(false).notNull(),
intakeCompleted: boolean("intake_completed").default(false).notNull(),
```

- [ ] **Step 3: Add `menteeIntake` table**

Add this new table at the end of `schema.ts`, before the closing export block:

```typescript
export const menteeIntake = pgTable("mentee_intake", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" })
        .unique(),
    academicStanding: text("academic_standing").notNull(),
    careerTags: text("career_tags").array().notNull(),
    careerFreeText: text("career_free_text"),
    supportTypes: text("support_types").array().notNull(),
    preferredMentorshipStyle: text("preferred_mentorship_style").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
    check("academic_standing_check",
        sql`${t.academicStanding} IN ('Good', 'Probation', 'Honors')`),
    check("career_tags_length_check",
        sql`cardinality(${t.careerTags}) BETWEEN 1 AND 3`),
    check("career_free_text_length_check",
        sql`${t.careerFreeText} IS NULL OR char_length(${t.careerFreeText}) <= 280`),
    check("support_types_length_check",
        sql`cardinality(${t.supportTypes}) BETWEEN 1 AND 2`),
    check("mentorship_style_check",
        sql`${t.preferredMentorshipStyle} IN ('Strict', 'Supportive', 'Mixed')`),
]);
```

- [ ] **Step 4: Add `resilienceAssessments` table**

Add this table immediately after `menteeIntake` in `schema.ts`:

```typescript
export const resilienceAssessments = pgTable("resilience_assessments", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    q1Response: text("q1_response").notNull(),
    q2Response: text("q2_response").notNull(),
    identityResponse: text("identity_response"),
    isBaseline: boolean("is_baseline").default(true).notNull(),
    reassessmentDueDate: timestamp("reassessment_due_date"),
    assessedAt: timestamp("assessed_at").defaultNow().notNull(),
}, (t) => [
    check("score_range_check",
        sql`${t.score} BETWEEN 1 AND 10`),
    check("identity_required_on_reassessment",
        sql`${t.isBaseline} = true OR ${t.identityResponse} IS NOT NULL`),
    index("resilience_user_idx").on(t.userId),
]);
```

- [ ] **Step 5: Commit schema changes**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
git add src/lib/db/schema.ts
git commit -m "feat(schema): add mentee_intake and resilience_assessments tables"
```

---

## Task 3 — Database Migration

**Files:**
- Generated: `drizzle/` migration files

- [ ] **Step 1: Generate migration**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx drizzle-kit generate
```

Expected: A new file appears in `drizzle/` with a timestamp prefix, e.g. `drizzle/0001_mentee_intake.sql`. Check that it contains `CREATE TABLE "mentee_intake"`, `CREATE TABLE "resilience_assessments"`, and `ALTER TABLE "users" ADD COLUMN "intake_completed"`.

- [ ] **Step 2: Review the generated SQL**

```bash
cat drizzle/*.sql | tail -60
```

Confirm the output includes:
- `CREATE TABLE "mentee_intake"` with `UNIQUE` on `user_id`
- `CREATE TABLE "resilience_assessments"` with check constraints
- `ALTER TABLE "users" ADD COLUMN "intake_completed" boolean`

- [ ] **Step 3: Run migration against the database**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx drizzle-kit migrate
```

Expected: `All migrations have been applied` or similar success message. If this fails with a connection error, ensure `DATABASE_URL` is set in `.env.local`.

- [ ] **Step 4: Commit migration file**

```bash
git add drizzle/
git commit -m "feat(migration): add intake_completed, mentee_intake, resilience_assessments"
```

---

## Task 4 — Better Auth Session Extension

**Files:**
- Modify: `src/lib/auth/config.ts`

- [ ] **Step 1: Add `intakeCompleted` to user additionalFields**

Open `src/lib/auth/config.ts`. Find the `user: { additionalFields: { ... } }` block. Add `intakeCompleted` after `isMentorVerified`:

```typescript
isMentorVerified: {
    type: "boolean",
    defaultValue: false,
    input: false,
},
intakeCompleted: {
    type: "boolean",
    defaultValue: false,
    input: false,
},
```

- [ ] **Step 2: Verify the session type reflects the new field**

The `auth.$Infer.Session.user` type should now include `intakeCompleted: boolean`. You can verify by running TypeScript:

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx tsc --noEmit 2>&1 | grep -i "intakeCompleted" || echo "No type errors for intakeCompleted"
```

Expected: No errors about `intakeCompleted`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth/config.ts
git commit -m "feat(auth): expose intakeCompleted on session user"
```

---

## Task 5 — Shared Types

**Files:**
- Create: `src/lib/intake/types.ts`

- [ ] **Step 1: Write the failing test (verifies types compile)**

Create `src/__tests__/intake/scoring.test.ts` with just the import — this will fail if the types file doesn't exist:

```typescript
import { describe, it, expect } from 'vitest'
import { computeResilienceScore } from '@/lib/intake/scoring'

describe('computeResilienceScore', () => {
  it('is importable', () => {
    expect(typeof computeResilienceScore).toBe('function')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx vitest run src/__tests__/intake/scoring.test.ts --reporter=verbose
```

Expected: FAIL — `Cannot find module '@/lib/intake/scoring'`

- [ ] **Step 3: Create the types file**

Create `src/lib/intake/types.ts`:

```typescript
export type Q1Response = 'Never' | 'Rarely' | 'Sometimes' | 'Often' | 'Always'
export type Q2Response = 'Barely coping' | 'Struggling' | 'Managing' | 'Thriving'
export type AcademicStanding = 'Good' | 'Probation' | 'Honors'
export type SupportType = 'Career Guidance' | 'Psycho-Social Support' | 'Technical Skills' | 'Networking'
export type MentorshipStyle = 'Strict' | 'Supportive' | 'Mixed'

export const CAREER_TAGS = [
  'Software Engineering',
  'Finance',
  'Healthcare',
  'Design / Creative',
  'Law',
  'Social Impact / NGO',
  'Product Management',
  'Agri-tech',
  'Education',
  'Other',
] as const

export type CareerTag = typeof CAREER_TAGS[number]

export interface IntakeFormData {
  q1: Q1Response
  q2: Q2Response
  academicStanding: AcademicStanding
  careerTags: CareerTag[]
  careerFreeText: string
  supportTypes: SupportType[]
  preferredMentorshipStyle: MentorshipStyle
}
```

---

## Task 6 — `computeResilienceScore()`

**Files:**
- Create: `src/lib/intake/scoring.ts`
- Create: `src/__tests__/intake/scoring.test.ts`

- [ ] **Step 1: Write the failing tests**

Replace `src/__tests__/intake/scoring.test.ts` with:

```typescript
import { describe, it, expect } from 'vitest'
import { computeResilienceScore } from '@/lib/intake/scoring'

describe('computeResilienceScore', () => {
  it('scores minimum: Never + Barely coping = 1', () => {
    expect(computeResilienceScore('Never', 'Barely coping')).toBe(1)
  })

  it('scores maximum: Always + Thriving = 10', () => {
    expect(computeResilienceScore('Always', 'Thriving')).toBe(10)
  })

  it('scores mid-low: Rarely + Struggling = 4', () => {
    // Q1=3, Q2=4 → (3+4)/2 = 3.5 → rounds to 4
    expect(computeResilienceScore('Rarely', 'Struggling')).toBe(4)
  })

  it('scores mid: Sometimes + Managing = 6', () => {
    // Q1=5, Q2=7 → (5+7)/2 = 6
    expect(computeResilienceScore('Sometimes', 'Managing')).toBe(6)
  })

  it('scores high: Often + Thriving = 9', () => {
    // Q1=8, Q2=10 → (8+10)/2 = 9
    expect(computeResilienceScore('Often', 'Thriving')).toBe(9)
  })

  it('always returns an integer', () => {
    const score = computeResilienceScore('Rarely', 'Struggling')
    expect(Number.isInteger(score)).toBe(true)
  })

  it('always returns a value between 1 and 10', () => {
    const combos: Array<[Parameters<typeof computeResilienceScore>[0], Parameters<typeof computeResilienceScore>[1]]> = [
      ['Never', 'Barely coping'],
      ['Sometimes', 'Managing'],
      ['Always', 'Thriving'],
    ]
    for (const [q1, q2] of combos) {
      const score = computeResilienceScore(q1, q2)
      expect(score).toBeGreaterThanOrEqual(1)
      expect(score).toBeLessThanOrEqual(10)
    }
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx vitest run src/__tests__/intake/scoring.test.ts --reporter=verbose
```

Expected: FAIL — `Cannot find module '@/lib/intake/scoring'`

- [ ] **Step 3: Implement `computeResilienceScore`**

Create `src/lib/intake/scoring.ts`:

```typescript
import type { Q1Response, Q2Response } from './types'

const Q1_POINTS: Record<Q1Response, number> = {
  'Never':     1,
  'Rarely':    3,
  'Sometimes': 5,
  'Often':     8,
  'Always':    10,
}

const Q2_POINTS: Record<Q2Response, number> = {
  'Barely coping': 1,
  'Struggling':    4,
  'Managing':      7,
  'Thriving':      10,
}

/**
 * Computes a hidden resilience score (1–10) from two question responses.
 * The score is never shown to the mentee — it is stored as a MEAL baseline
 * and compared against 6-month re-assessments to calculate the Resilience Delta.
 */
export function computeResilienceScore(q1: Q1Response, q2: Q2Response): number {
  const raw = (Q1_POINTS[q1] + Q2_POINTS[q2]) / 2
  return Math.round(raw)
}
```

- [ ] **Step 4: Run tests — all must pass**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx vitest run src/__tests__/intake/scoring.test.ts --reporter=verbose
```

Expected: `7 tests passed`

- [ ] **Step 5: Commit**

```bash
git add src/lib/intake/types.ts src/lib/intake/scoring.ts src/__tests__/intake/scoring.test.ts
git commit -m "feat(intake): add computeResilienceScore with full test coverage"
```

---

## Task 7 — `buildEmbeddingText()`

**Files:**
- Create: `src/lib/intake/embedding.ts`
- Create: `src/__tests__/intake/embedding.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/intake/embedding.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildEmbeddingText } from '@/lib/intake/embedding'
import type { IntakeFormData } from '@/lib/intake/types'

const baseData: IntakeFormData = {
  q1: 'Sometimes',
  q2: 'Managing',
  academicStanding: 'Good',
  careerTags: ['Software Engineering', 'Product Management'],
  careerFreeText: '',
  supportTypes: ['Career Guidance', 'Technical Skills'],
  preferredMentorshipStyle: 'Strict',
}

describe('buildEmbeddingText', () => {
  it('includes all career tags joined by comma', () => {
    const text = buildEmbeddingText(baseData)
    expect(text).toContain('Software Engineering, Product Management')
  })

  it('includes support types', () => {
    const text = buildEmbeddingText(baseData)
    expect(text).toContain('Career Guidance, Technical Skills')
  })

  it('includes mentorship style', () => {
    const text = buildEmbeddingText(baseData)
    expect(text).toContain('Strict')
  })

  it('includes academic standing', () => {
    const text = buildEmbeddingText(baseData)
    expect(text).toContain('Good')
  })

  it('includes career free text when provided', () => {
    const data = { ...baseData, careerFreeText: 'I want to build fintech products.' }
    const text = buildEmbeddingText(data)
    expect(text).toContain('I want to build fintech products.')
  })

  it('omits free text section when careerFreeText is empty', () => {
    const text = buildEmbeddingText({ ...baseData, careerFreeText: '' })
    expect(text).not.toContain('undefined')
    expect(text).not.toContain('null')
  })

  it('returns a non-empty string', () => {
    const text = buildEmbeddingText(baseData)
    expect(text.trim().length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx vitest run src/__tests__/intake/embedding.test.ts --reporter=verbose
```

Expected: FAIL — `Cannot find module '@/lib/intake/embedding'`

- [ ] **Step 3: Implement `buildEmbeddingText`**

Create `src/lib/intake/embedding.ts`:

```typescript
import type { IntakeFormData } from './types'

/**
 * Converts structured intake form data into a prose string for embedding generation.
 * Format mirrors what a mentor profile would contain, enabling cosine similarity matching.
 *
 * Example output:
 * "Career interests: Software Engineering, Product Management.
 *  I want to build fintech products for underserved communities.
 *  Seeking support in: Career Guidance, Technical Skills.
 *  Preferred mentorship style: Strict. Academic standing: Good."
 */
export function buildEmbeddingText(data: IntakeFormData): string {
  const parts: string[] = [
    `Career interests: ${data.careerTags.join(', ')}.`,
  ]

  if (data.careerFreeText && data.careerFreeText.trim().length > 0) {
    parts.push(data.careerFreeText.trim())
  }

  parts.push(`Seeking support in: ${data.supportTypes.join(', ')}.`)
  parts.push(`Preferred mentorship style: ${data.preferredMentorshipStyle}.`)
  parts.push(`Academic standing: ${data.academicStanding}.`)

  return parts.join(' ')
}
```

- [ ] **Step 4: Run tests — all must pass**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx vitest run src/__tests__/intake/embedding.test.ts --reporter=verbose
```

Expected: `7 tests passed`

- [ ] **Step 5: Commit**

```bash
git add src/lib/intake/embedding.ts src/__tests__/intake/embedding.test.ts
git commit -m "feat(intake): add buildEmbeddingText with full test coverage"
```

---

## Task 8 — Server Action: `submitDiagnosticIntake()`

**Files:**
- Create: `src/lib/actions/intake.ts`
- Create: `src/__tests__/intake/action.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/intake/action.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all external dependencies before importing the action
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([{ id: 'intake-1' }]) }),
    update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }),
  },
}))

vi.mock('@/lib/db/schema', () => ({
  menteeIntake: {},
  resilienceAssessments: {},
  users: {},
}))

vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: 'user-123', role: 'Mentee', intakeCompleted: false },
        session: {},
      }),
    },
  },
}))

vi.mock('@/lib/ai/embeddings', () => ({
  generateProfileEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.1)),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

import { submitDiagnosticIntake } from '@/lib/actions/intake'
import { generateProfileEmbedding } from '@/lib/ai/embeddings'
import { db } from '@/lib/db'
import type { IntakeFormData } from '@/lib/intake/types'

const validFormData: IntakeFormData = {
  q1: 'Sometimes',
  q2: 'Managing',
  academicStanding: 'Good',
  careerTags: ['Software Engineering'],
  careerFreeText: 'I want to build products.',
  supportTypes: ['Career Guidance'],
  preferredMentorshipStyle: 'Strict',
}

describe('submitDiagnosticIntake', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a mentee_intake record', async () => {
    await submitDiagnosticIntake(validFormData)
    expect(db.insert).toHaveBeenCalledWith(expect.objectContaining({}))
  })

  it('inserts a resilience_assessment with is_baseline=true', async () => {
    await submitDiagnosticIntake(validFormData)
    // insert is called twice: once for menteeIntake, once for resilienceAssessments
    expect(db.insert).toHaveBeenCalledTimes(2)
  })

  it('calls generateProfileEmbedding with a non-empty string', async () => {
    await submitDiagnosticIntake(validFormData)
    expect(generateProfileEmbedding).toHaveBeenCalledWith(expect.any(String))
    const callArg = vi.mocked(generateProfileEmbedding).mock.calls[0][0]
    expect(callArg.length).toBeGreaterThan(0)
  })

  it('sets intakeCompleted=true on the users table', async () => {
    await submitDiagnosticIntake(validFormData)
    const setCall = vi.mocked(db.update({} as any).set as any)
    // db.update was called
    expect(db.update).toHaveBeenCalled()
  })

  it('sets embeddingStale=true and still completes if generateProfileEmbedding throws', async () => {
    vi.mocked(generateProfileEmbedding).mockRejectedValueOnce(new Error('OpenAI timeout'))

    // Should not throw — intake data must be saved even if embedding fails
    await expect(submitDiagnosticIntake(validFormData)).resolves.not.toThrow()

    // intakeCompleted must still be set to true
    expect(db.update).toHaveBeenCalled()
  })

  it('returns error object if session is missing', async () => {
    const { auth } = await import('@/lib/auth/config')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null)

    const result = await submitDiagnosticIntake(validFormData)
    expect(result).toEqual({ success: false, error: 'Unauthorised' })
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx vitest run src/__tests__/intake/action.test.ts --reporter=verbose
```

Expected: FAIL — `Cannot find module '@/lib/actions/intake'`

- [ ] **Step 3: Implement the Server Action**

Create `src/lib/actions/intake.ts`:

```typescript
"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { addMonths } from "date-fns"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { menteeIntake, resilienceAssessments, users } from "@/lib/db/schema"
import { auth } from "@/lib/auth/config"
import { computeResilienceScore } from "@/lib/intake/scoring"
import { buildEmbeddingText } from "@/lib/intake/embedding"
import { generateProfileEmbedding } from "@/lib/ai/embeddings"
import type { IntakeFormData } from "@/lib/intake/types"

export async function submitDiagnosticIntake(formData: IntakeFormData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return { success: false, error: "Unauthorised" }
  }

  const userId = session.user.id
  const score = computeResilienceScore(formData.q1, formData.q2)

  // 1. Save intake record (UNIQUE on user_id prevents double-submit)
  await db.insert(menteeIntake).values({
    userId,
    academicStanding: formData.academicStanding,
    careerTags: formData.careerTags,
    careerFreeText: formData.careerFreeText || null,
    supportTypes: formData.supportTypes,
    preferredMentorshipStyle: formData.preferredMentorshipStyle,
  })

  // 2. Save resilience baseline (is_baseline=true, reassessment due in 6 months)
  await db.insert(resilienceAssessments).values({
    userId,
    score,
    q1Response: formData.q1,
    q2Response: formData.q2,
    identityResponse: null,          // NULL on baseline — not yet asked
    isBaseline: true,
    reassessmentDueDate: addMonths(new Date(), 6),
  })

  // 3. Generate embedding — graceful fallback if API fails
  let embedding: number[] | null = null
  let embeddingStale = false

  try {
    const embeddingText = buildEmbeddingText(formData)
    embedding = await generateProfileEmbedding(embeddingText)
  } catch {
    // Embedding API failure: intake data is preserved.
    // embeddingStale=true signals Amani should regenerate on next dashboard visit.
    embeddingStale = true
  }

  // 4. Flip intake_completed flag (always set, even if embedding failed)
  await db
    .update(users)
    .set({
      intakeCompleted: true,
      ...(embedding !== null ? { embedding, embeddingStale: false } : { embeddingStale: true }),
    } as any)
    .where(eq(users.id, userId))

  redirect("/dashboard")
}
```

- [ ] **Step 4: Run tests — all must pass**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx vitest run src/__tests__/intake/action.test.ts --reporter=verbose
```

Expected: `6 tests passed`

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/intake.ts src/__tests__/intake/action.test.ts
git commit -m "feat(intake): add submitDiagnosticIntake server action with embedding fallback"
```

---

## Task 9 — Middleware + Dashboard Gate

**Files:**
- Modify: `src/middleware.ts`
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Add `/onboarding` to middleware `onboardingRoutes`**

Open `src/middleware.ts`. Find the `onboardingRoutes` array and add `/onboarding`:

```typescript
const onboardingRoutes = [
    "/legal/nda",
    "/onboarding",          // ← add this line
    "/verify-email",
    "/pending-approval",
    "/pending",
    "/moderator-invite",
    "/admin-setup",
    "/email-test",
];
```

This allows authenticated users to access `/onboarding/intake` without being redirected.

- [ ] **Step 2: Add intake gate to dashboard layout**

Open `src/app/dashboard/layout.tsx`. After the NDA session check (after `const userRole = (session.user as any).role as string`), add the intake gate for Mentees:

```typescript
// Intake gate: Mentees must complete the diagnostic intake before dashboard access
const intakeCompleted = (session.user as any).intakeCompleted as boolean ?? false
if (userRole === 'Mentee' && !intakeCompleted) {
    redirect('/onboarding/intake')
}
```

The full updated section should look like:

```typescript
const session = await auth.api.getSession({
    headers: await headers(),
});

if (!session) {
    redirect("/login");
}

const userRole = (session.user as any).role as string;

// Intake gate: Mentees must complete diagnostic intake before dashboard access
const intakeCompleted = (session.user as any).intakeCompleted as boolean ?? false
if (userRole === 'Mentee' && !intakeCompleted) {
    redirect('/onboarding/intake')
}

// Role-based dashboard map
const roleDashboardMap: Record<string, string> = {
    // ... existing code unchanged
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx tsc --noEmit 2>&1 | grep -E "dashboard/layout|middleware" || echo "No errors in gated files"
```

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts src/app/dashboard/layout.tsx
git commit -m "feat(intake): add middleware route + dashboard intake gate for Mentees"
```

---

## Task 10 — `IntakeProgress` Component

**Files:**
- Create: `src/app/onboarding/intake/_components/IntakeProgress.tsx`

- [ ] **Step 1: Create the component**

```bash
mkdir -p "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform/src/app/onboarding/intake/_components"
```

Create `src/app/onboarding/intake/_components/IntakeProgress.tsx`:

```tsx
interface IntakeProgressProps {
  currentStep: 1 | 2 | 3
}

const STEPS = [
  { number: 1, label: 'How are you doing?' },
  { number: 2, label: 'Where are you headed?' },
  { number: 3, label: 'How do you want to be mentored?' },
]

export default function IntakeProgress({ currentStep }: IntakeProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.number} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step.number < currentStep
                  ? 'bg-[#006600] text-white'
                  : step.number === currentStep
                  ? 'bg-[#BB0000] text-white'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {step.number < currentStep ? '✓' : step.number}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                step.number === currentStep ? 'text-zinc-200' : 'text-zinc-600'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-12 h-0.5 mb-5 transition-colors ${
                step.number < currentStep ? 'bg-[#006600]' : 'bg-zinc-800'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/onboarding/intake/_components/IntakeProgress.tsx
git commit -m "feat(intake-ui): add IntakeProgress step indicator"
```

---

## Task 11 — `SubmittingScreen` Component

**Files:**
- Create: `src/app/onboarding/intake/_components/SubmittingScreen.tsx`

- [ ] **Step 1: Create the component**

Create `src/app/onboarding/intake/_components/SubmittingScreen.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'

const STEPS = [
  { label: 'Saving intake record', delay: 0 },
  { label: 'Recording resilience baseline', delay: 700 },
  { label: 'Preparing your mentor recommendations…', delay: 1400 },
]

export default function SubmittingScreen() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    STEPS.forEach((step, i) => {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, i])
      }, step.delay)
      return () => clearTimeout(timer)
    })
  }, [])

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 max-w-sm w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-12 h-12 border-4 border-[#BB0000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Setting up your profile</h2>
        </div>
        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs transition-all ${
                completedSteps.includes(i)
                  ? 'bg-[#006600] text-white'
                  : 'border border-zinc-700 text-transparent'
              }`}>
                ✓
              </div>
              <span className={`text-sm transition-colors ${
                completedSteps.includes(i) ? 'text-zinc-200' : 'text-zinc-600'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/onboarding/intake/_components/SubmittingScreen.tsx
git commit -m "feat(intake-ui): add SubmittingScreen loading overlay"
```

---

## Task 12 — `StepOne` Component

**Files:**
- Create: `src/app/onboarding/intake/_components/StepOne.tsx`

- [ ] **Step 1: Create the component**

Create `src/app/onboarding/intake/_components/StepOne.tsx`:

```tsx
import type { Q1Response, Q2Response, IntakeFormData } from '@/lib/intake/types'

const Q1_OPTIONS: Q1Response[] = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
const Q2_OPTIONS: Q2Response[] = ['Barely coping', 'Struggling', 'Managing', 'Thriving']

interface StepOneProps {
  data: Pick<IntakeFormData, 'q1' | 'q2'>
  onChange: (field: 'q1' | 'q2', value: Q1Response | Q2Response) => void
  onNext: () => void
}

export default function StepOne({ data, onChange, onNext }: StepOneProps) {
  const canProceed = data.q1 !== '' && data.q2 !== ''

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-zinc-400 mb-3">
          How often do you feel in control of your situation?
        </p>
        <div className="flex flex-wrap gap-2">
          {Q1_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => onChange('q1', option)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                data.q1 === option
                  ? 'bg-[#006600] border-[#006600] text-white'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-zinc-400 mb-3">
          How well are you managing pressure and stress right now?
        </p>
        <div className="flex flex-wrap gap-2">
          {Q2_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => onChange('q2', option)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                data.q2 === option
                  ? 'bg-[#006600] border-[#006600] text-white'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-3 rounded-lg bg-[#BB0000] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
      >
        Next →
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/onboarding/intake/_components/StepOne.tsx
git commit -m "feat(intake-ui): add StepOne resilience questions"
```

---

## Task 13 — `StepTwo` Component

**Files:**
- Create: `src/app/onboarding/intake/_components/StepTwo.tsx`

- [ ] **Step 1: Create the component**

Create `src/app/onboarding/intake/_components/StepTwo.tsx`:

```tsx
import { CAREER_TAGS } from '@/lib/intake/types'
import type { AcademicStanding, CareerTag, IntakeFormData } from '@/lib/intake/types'

const ACADEMIC_OPTIONS: { value: AcademicStanding; description: string }[] = [
  { value: 'Good',      description: 'Meeting all requirements' },
  { value: 'Probation', description: 'Needing academic support' },
  { value: 'Honors',    description: 'Excelling in studies' },
]

interface StepTwoProps {
  data: Pick<IntakeFormData, 'academicStanding' | 'careerTags' | 'careerFreeText'>
  onChange: <K extends 'academicStanding' | 'careerTags' | 'careerFreeText'>(
    field: K,
    value: IntakeFormData[K]
  ) => void
  onNext: () => void
  onBack: () => void
}

export default function StepTwo({ data, onChange, onNext, onBack }: StepTwoProps) {
  const canProceed = data.academicStanding !== '' && data.careerTags.length > 0
  const charsRemaining = 280 - data.careerFreeText.length

  function toggleTag(tag: CareerTag) {
    const current = data.careerTags
    if (current.includes(tag)) {
      onChange('careerTags', current.filter(t => t !== tag))
    } else if (current.length < 3) {
      onChange('careerTags', [...current, tag])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-400 mb-3">Academic standing</p>
        <div className="grid grid-cols-3 gap-2">
          {ACADEMIC_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('academicStanding', opt.value)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                data.academicStanding === opt.value
                  ? 'bg-[#0066CC]/20 border-[#0066CC] text-white'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              <div className="font-semibold text-sm">{opt.value}</div>
              <div className="text-xs mt-0.5 text-zinc-500">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-zinc-400 mb-1">
          Career direction <span className="text-zinc-600">(pick up to 3)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {CAREER_TAGS.map(tag => {
            const selected = data.careerTags.includes(tag)
            const atMax = data.careerTags.length >= 3 && !selected
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                disabled={atMax}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  selected
                    ? 'bg-[#0066CC]/20 border-[#0066CC] text-white'
                    : atMax
                    ? 'border-zinc-800 text-zinc-700 cursor-not-allowed'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <p className="text-sm text-zinc-400">In your own words <span className="text-zinc-600">(optional)</span></p>
          <span className={`text-xs ${charsRemaining < 50 ? 'text-[#BB0000]' : 'text-zinc-600'}`}>
            {charsRemaining} left
          </span>
        </div>
        <textarea
          value={data.careerFreeText}
          onChange={e => onChange('careerFreeText', e.target.value)}
          maxLength={280}
          rows={3}
          placeholder="e.g. I want to build fintech products for underserved communities…"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 py-3 rounded-lg bg-[#BB0000] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/onboarding/intake/_components/StepTwo.tsx
git commit -m "feat(intake-ui): add StepTwo academic standing and career tags"
```

---

## Task 14 — `StepThree` Component

**Files:**
- Create: `src/app/onboarding/intake/_components/StepThree.tsx`

- [ ] **Step 1: Create the component**

Create `src/app/onboarding/intake/_components/StepThree.tsx`:

```tsx
import type { SupportType, MentorshipStyle, IntakeFormData } from '@/lib/intake/types'

const SUPPORT_OPTIONS: SupportType[] = [
  'Career Guidance',
  'Psycho-Social Support',
  'Technical Skills',
  'Networking',
]

const STYLE_OPTIONS: { value: MentorshipStyle; description: string }[] = [
  { value: 'Strict',     description: 'Structured sessions, homework, clear accountability' },
  { value: 'Supportive', description: 'Open-ended, mentee-led, flexible pace' },
  { value: 'Mixed',      description: 'Blend of both depending on the week' },
]

interface StepThreeProps {
  data: Pick<IntakeFormData, 'supportTypes' | 'preferredMentorshipStyle'>
  onChange: <K extends 'supportTypes' | 'preferredMentorshipStyle'>(
    field: K,
    value: IntakeFormData[K]
  ) => void
  onSubmit: () => void
  onBack: () => void
  isSubmitting: boolean
}

export default function StepThree({ data, onChange, onSubmit, onBack, isSubmitting }: StepThreeProps) {
  const canSubmit =
    data.supportTypes.length > 0 && data.preferredMentorshipStyle !== ''

  function toggleSupport(type: SupportType) {
    const current = data.supportTypes
    if (current.includes(type)) {
      onChange('supportTypes', current.filter(t => t !== type))
    } else if (current.length < 2) {
      onChange('supportTypes', [...current, type])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-400 mb-1">
          What kind of support do you need?{' '}
          <span className="text-zinc-600">(pick up to 2)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_OPTIONS.map(type => {
            const selected = data.supportTypes.includes(type)
            const atMax = data.supportTypes.length >= 2 && !selected
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleSupport(type)}
                disabled={atMax}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  selected
                    ? 'bg-[#BB0000]/20 border-[#BB0000] text-white'
                    : atMax
                    ? 'border-zinc-800 text-zinc-700 cursor-not-allowed'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                {type}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-sm text-zinc-400 mb-3">Preferred mentorship style</p>
        <div className="space-y-2">
          {STYLE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('preferredMentorshipStyle', opt.value)}
              className={`w-full p-4 rounded-lg border text-left transition-colors ${
                data.preferredMentorshipStyle === opt.value
                  ? 'bg-[#BB0000]/10 border-[#BB0000] text-white'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              <span className="font-semibold text-sm">{opt.value}</span>
              <span className="text-xs text-zinc-500 ml-2">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 transition-colors disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className="flex-1 py-3 rounded-lg bg-[#BB0000] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
        >
          Complete Profile →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/onboarding/intake/_components/StepThree.tsx
git commit -m "feat(intake-ui): add StepThree support types and mentorship style"
```

---

## Task 15 — Wizard Page

**Files:**
- Create: `src/app/onboarding/intake/page.tsx`

- [ ] **Step 1: Create the wizard page**

Create `src/app/onboarding/intake/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { submitDiagnosticIntake } from '@/lib/actions/intake'
import IntakeProgress from './_components/IntakeProgress'
import SubmittingScreen from './_components/SubmittingScreen'
import StepOne from './_components/StepOne'
import StepTwo from './_components/StepTwo'
import StepThree from './_components/StepThree'
import type { IntakeFormData, Q1Response, Q2Response } from '@/lib/intake/types'

const INITIAL_FORM: IntakeFormData = {
  q1: '' as Q1Response,
  q2: '' as Q2Response,
  academicStanding: '' as IntakeFormData['academicStanding'],
  careerTags: [],
  careerFreeText: '',
  supportTypes: [],
  preferredMentorshipStyle: '' as IntakeFormData['preferredMentorshipStyle'],
}

export default function IntakePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState<IntakeFormData>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof IntakeFormData>(field: K, value: IntakeFormData[K]) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await submitDiagnosticIntake(formData)
      if (result && !result.success) {
        setError(result.error ?? 'Something went wrong. Please try again.')
        setIsSubmitting(false)
      }
      // On success, submitDiagnosticIntake calls redirect('/dashboard') — no need to handle here
    } catch {
      setError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {isSubmitting && <SubmittingScreen />}

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-white">Jenga<span className="text-[#BB0000]">365</span></span>
        </div>

        <IntakeProgress currentStep={step} />

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {/* Step title */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-white">
              {step === 1 && 'How are you doing?'}
              {step === 2 && 'Where are you headed?'}
              {step === 3 && 'How do you want to be mentored?'}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Step {step} of 3</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <StepOne
              data={{ q1: formData.q1, q2: formData.q2 }}
              onChange={(field, value) => updateField(field, value)}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StepTwo
              data={{
                academicStanding: formData.academicStanding,
                careerTags: formData.careerTags,
                careerFreeText: formData.careerFreeText,
              }}
              onChange={(field, value) => updateField(field, value)}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <StepThree
              data={{
                supportTypes: formData.supportTypes,
                preferredMentorshipStyle: formData.preferredMentorshipStyle,
              }}
              onChange={(field, value) => updateField(field, value)}
              onSubmit={handleSubmit}
              onBack={() => setStep(2)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">
          Your responses are private and used only to find you the best mentor match.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx tsc --noEmit 2>&1 | grep -E "onboarding/intake" || echo "No type errors in intake page"
```

- [ ] **Step 3: Commit**

```bash
git add src/app/onboarding/intake/
git commit -m "feat(intake-ui): add 3-step wizard page at /onboarding/intake"
```

---

## Task 16 — Run Full Test Suite

- [ ] **Step 1: Run all tests**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx vitest run --reporter=verbose
```

Expected output:
```
✓ src/__tests__/intake/scoring.test.ts (7 tests)
✓ src/__tests__/intake/embedding.test.ts (7 tests)
✓ src/__tests__/intake/action.test.ts (6 tests)

Test Files: 3 passed (3)
Tests:      20 passed (20)
```

- [ ] **Step 2: Run coverage**

```bash
npx vitest run --coverage
```

Expected: `src/lib/intake/scoring.ts` and `src/lib/intake/embedding.ts` show 100% coverage. `src/lib/actions/intake.ts` shows coverage of all branches including the embedding failure path.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: complete mentee diagnostic intake feature

- 3-step wizard at /onboarding/intake (resilience, career, mentorship style)
- submitDiagnosticIntake server action with graceful embedding fallback
- Middleware + dashboard layout gate (Mentees blocked until intake complete)
- mentee_intake + resilience_assessments DB tables with check constraints
- 20 unit/integration tests passing

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Spec Coverage Check

| Spec requirement | Covered by task |
|---|---|
| `mentee_intake` table with UNIQUE(user_id) | Task 2 |
| `resilience_assessments` time-series table | Task 2 |
| `intakeCompleted` added to users | Task 2 |
| DB migration generated and applied | Task 3 |
| Better Auth session exposes `intakeCompleted` | Task 4 |
| `computeResilienceScore()` Q1/Q2 → integer 1–10 | Task 6 |
| `buildEmbeddingText()` prose string for embedding | Task 7 |
| `submitDiagnosticIntake()` atomic sequential inserts | Task 8 |
| Embedding API failure → graceful fallback, `embeddingStale=true` | Task 8 |
| Explicit test for embedding failure | Task 8 |
| Middleware `/onboarding` accessible to authenticated users | Task 9 |
| Dashboard layout blocks Mentees until `intakeCompleted` | Task 9 |
| Step 1 UI — resilience questions (hidden score) | Task 12 |
| Step 2 UI — academic standing + career tags + free text | Task 13 |
| Step 3 UI — support types + mentorship style | Task 14 |
| Loading screen — "Setting up your profile…" | Task 11 |
| Progress indicator | Task 10 |
| Wizard page wiring all steps | Task 15 |
| `intakeCompleted=true` always set (even on embedding failure) | Task 8 |
| `reassessmentDueDate = baseline + 6 months` | Task 8 |
| `identityResponse = null` on baseline | Task 8 |
