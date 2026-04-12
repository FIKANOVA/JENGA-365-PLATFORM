# Sprint B — Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the Sprint B MEAL automation backend to a working UI and live infrastructure so the platform can accept KoboToolbox field audits, run automated cron jobs, expose ESG data to Looker Studio, and let mentees/mentors/NGOs interact with the new features from their dashboards.

**Architecture:** All server-side logic (actions, crons, webhook) is complete and tested (165 tests green). This plan covers: (1) applying the DB schema migration to Neon, (2) building the three missing UI surfaces — Give Back logging, NGO MOU signing, Power Hour session entry — as Next.js server-action forms, (3) wiring mentee goal categories into the matching pipeline, (4) configuring Vercel env vars + deploying, and (5) connecting KoboToolbox and Looker Studio to the live endpoints.

**Tech Stack:** Next.js 16 (App Router), Drizzle ORM 0.45, Neon Postgres, Vitest, react-hook-form, Zod, Vercel (crons via vercel.json), KoboToolbox REST API, Looker Studio.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/db/schema.ts` | Already modified | Sprint B tables + Looker views |
| `drizzle/migrations/` | Generate + run | Neon schema migration |
| `src/lib/actions/giveBack.ts` | **Create** | `logGiveBackActivity`, `getGiveBackStatus` |
| `src/app/dashboard/give-back/page.tsx` | **Create** | Mentee give-back activity form |
| `src/app/dashboard/partner/mou/page.tsx` | **Create** | NGO MOU signing form |
| `src/app/dashboard/mentor/power-hour/page.tsx` | **Create** | Mentor Power Hour session logger |
| `src/lib/actions/matching.ts` | **Modify** | Pass `menteeGoalCategories` from intake |
| `src/__tests__/actions/giveBack.test.ts` | **Create** | TDD for giveBack action |
| `.env.local` (local) / Vercel dashboard | Config | `KOBO_WEBHOOK_SECRET`, `CRON_SECRET` |
| `vercel.json` | Already created | Cron schedule |

---

## Task 1 — Generate and Apply DB Migration

**Files:**
- Run: `drizzle-kit generate:pg`
- Inspect: `drizzle/migrations/<timestamp>_sprint_b.sql`
- Run against Neon: `drizzle-kit push:pg`

- [ ] **Step 1: Generate the migration SQL**

```bash
cd "Jenga365 AI Platform"
npx drizzle-kit generate:pg --schema src/lib/db/schema.ts
```

Expected: a new file in `drizzle/migrations/` ending in `_sprint_b.sql` (name auto-generated). Inspect it — confirm you see `CREATE TABLE tree_survival_checks`, `give_back_tracking`, `corporate_unlock_milestones`, `corporate_resources`, `ngo_mou_agreements`, `resource_exchange_log`, `power_hour_sessions`, `mentor_commitment_tracker`, and the three `CREATE VIEW` statements.

- [ ] **Step 2: Review the migration for correctness**

Open the generated `.sql` file. Verify:
- `tree_survival_checks.kobo_submission_id` has `UNIQUE` constraint
- `mentor_commitment_tracker` has `UNIQUE (mentor_id, month)`
- All three views (`v_corporate_partner_scorecard`, `v_unlocked_resources`, `v_tree_survival_time_series`) are present
- `mentor_specialisations` column added to `users`
- `goal_categories` column added to `mentee_intake`

If anything is missing, do not proceed — re-check `src/lib/db/schema.ts`.

- [ ] **Step 3: Apply migration to Neon (push)**

```bash
npx drizzle-kit push:pg
```

When prompted "Are you sure?", type `yes`. Expected output: `All changes applied`.

Alternatively, if `push:pg` is not available on your drizzle-kit version, copy the SQL and run it directly in the Neon SQL editor at `console.neon.tech`.

- [ ] **Step 4: Verify via Drizzle Studio**

```bash
npx drizzle-kit studio
```

Open `http://localhost:4983`. Confirm all 8 new tables and 3 views are visible in the left sidebar. Close Drizzle Studio (Ctrl+C) when done.

- [ ] **Step 5: Commit the generated migration**

```bash
git add drizzle/migrations/
git commit -m "feat(db): apply Sprint B schema migration — MEAL tables + Looker views"
```

---

## Task 2 — `giveBack.ts` Server Action

**Files:**
- Create: `src/lib/actions/giveBack.ts`
- Create: `src/__tests__/actions/giveBack.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/actions/giveBack.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/schema', () => ({
  giveBackTracking: {
    id: 'id', userId: 'user_id', quarter: 'quarter',
    activityCompleted: 'activity_completed',
  },
  activityLog: { id: 'id', userId: 'user_id', actionType: 'action_type' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_c, v) => ({ eq: v })),
  and: vi.fn((...a) => a),
}))

vi.mock('@/lib/db', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: { getSession: vi.fn().mockResolvedValue({ user: { id: 'u-1' } }) },
  },
}))

import { logGiveBackActivity, getGiveBackStatus } from '@/lib/actions/giveBack'
import { db } from '@/lib/db'

function setupInsert() {
  const returning = vi.fn().mockResolvedValue([{ id: 'gb-1' }])
  const values = vi.fn().mockReturnValue({ returning })
  vi.mocked(db.insert).mockReturnValue({ values } as any)
  return { values, returning }
}

describe('logGiveBackActivity', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('throws UNAUTHORIZED when session is null', async () => {
    const { auth } = await import('@/lib/auth/config')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)
    await expect(logGiveBackActivity({ quarter: '2026-Q2', activityType: 'tree_planting', description: 'planted 10 trees' }))
      .rejects.toThrow('UNAUTHORIZED')
  })

  it('inserts a give_back_tracking row with activityCompleted=true', async () => {
    const { values } = setupInsert()
    await logGiveBackActivity({ quarter: '2026-Q2', activityType: 'tree_planting', description: 'planted 10 trees' })
    expect(db.insert).toHaveBeenCalledOnce()
    expect(values.mock.calls[0][0].activityCompleted).toBe(true)
  })

  it('includes the correct quarter in the insert', async () => {
    const { values } = setupInsert()
    await logGiveBackActivity({ quarter: '2026-Q2', activityType: 'book_drive', description: 'donated books' })
    expect(values.mock.calls[0][0].quarter).toBe('2026-Q2')
  })
})

describe('getGiveBackStatus', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns the give_back_tracking row for the given quarter', async () => {
    const mockRow = { id: 'gb-1', userId: 'u-1', quarter: '2026-Q2', activityCompleted: true }
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([mockRow]) }),
      }),
    } as any)
    const result = await getGiveBackStatus('2026-Q2')
    expect(result).toEqual(mockRow)
  })

  it('returns null when no record found', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
      }),
    } as any)
    const result = await getGiveBackStatus('2026-Q1')
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to confirm RED**

```bash
npx vitest run src/__tests__/actions/giveBack.test.ts
```

Expected: `ERR_MODULE_NOT_FOUND` — `giveBack.ts` does not exist yet.

- [ ] **Step 3: Create `src/lib/actions/giveBack.ts`**

```ts
"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { giveBackTracking } from "@/lib/db/schema";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

export async function logGiveBackActivity(params: {
  quarter: string;        // e.g. '2026-Q2'
  activityType: string;   // 'tree_planting' | 'book_drive' | 'mentoring' | etc.
  description: string;
}): Promise<{ id: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("UNAUTHORIZED");

  const [row] = await db
    .insert(giveBackTracking)
    .values({
      userId: session.user.id,
      quarter: params.quarter,
      activityType: params.activityType,
      activityDescription: params.description,
      activityCompleted: true,
    })
    .returning({ id: giveBackTracking.id });

  return { id: row.id };
}

export async function getGiveBackStatus(
  quarter: string
): Promise<typeof giveBackTracking.$inferSelect | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("UNAUTHORIZED");

  const [row] = await db
    .select()
    .from(giveBackTracking)
    .where(
      and(
        eq(giveBackTracking.userId, session.user.id),
        eq(giveBackTracking.quarter, quarter)
      )
    )
    .limit(1);

  return row ?? null;
}
```

- [ ] **Step 4: Run test to confirm GREEN**

```bash
npx vitest run src/__tests__/actions/giveBack.test.ts
```

Expected: `4 passed`.

- [ ] **Step 5: Run full suite to check no regressions**

```bash
npx vitest run
```

Expected: all tests pass (no new failures).

- [ ] **Step 6: Commit**

```bash
git add src/lib/actions/giveBack.ts src/__tests__/actions/giveBack.test.ts
git commit -m "feat(actions): add giveBack server action — logGiveBackActivity + getGiveBackStatus"
```

---

## Task 3 — Give Back Activity UI (Mentee Dashboard)

**Files:**
- Create: `src/app/dashboard/give-back/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/dashboard/give-back/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { logGiveBackActivity, getGiveBackStatus } from "@/lib/actions/giveBack"

const ACTIVITY_TYPES = [
  { value: "tree_planting", label: "Tree Planting" },
  { value: "book_drive", label: "Book Drive" },
  { value: "mentoring", label: "Peer Mentoring" },
  { value: "community_clean", label: "Community Clean-Up" },
  { value: "other", label: "Other" },
]

function getCurrentQuarter(): string {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `${now.getFullYear()}-Q${q}`
}

export default function GiveBackPage() {
  const [activityType, setActivityType] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState("")

  const quarter = getCurrentQuarter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activityType || !description.trim()) {
      setError("Please select an activity type and describe what you did.")
      return
    }
    setStatus("submitting")
    setError("")
    try {
      await logGiveBackActivity({ quarter, activityType, description })
      setStatus("success")
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-2">Activity Logged!</h2>
        <p className="text-gray-600">Your Give Back activity for {quarter} has been recorded. Thank you for contributing to the community.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-1">Log Give Back Activity</h1>
      <p className="text-gray-500 mb-6 text-sm">Quarter: {quarter}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Activity Type</label>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          >
            <option value="">Select an activity…</option>
            {ACTIVITY_TYPES.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Briefly describe what you did, where, and its impact…"
            className="w-full border rounded-md px-3 py-2 resize-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1">{description.length}/500</p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-green-700 text-white py-2 rounded-md font-medium hover:bg-green-800 disabled:opacity-50"
        >
          {status === "submitting" ? "Saving…" : "Log Activity"}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and manually verify the form**

```bash
npm run dev
```

Navigate to `http://localhost:3000/dashboard/give-back`. Verify:
- Dropdown shows all 5 activity types
- Submitting without selecting type shows validation
- Happy path submits and shows success screen
- Check Neon dashboard or Drizzle Studio — confirm a `give_back_tracking` row was inserted with `activity_completed = true`

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/give-back/page.tsx
git commit -m "feat(ui): add Give Back activity logging page for mentees"
```

---

## Task 4 — NGO MOU Signing Form

**Files:**
- Create: `src/app/dashboard/partner/mou/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/dashboard/partner/mou/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { createMouAgreement } from "@/lib/actions/ngoWorkflow"

export default function MouSigningPage() {
  const [mouUrl, setMouUrl] = useState("")
  const [resources, setResources] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState("")

  // partnerCorporateId comes from the user's session/profile — pass via a hidden
  // field or server component wrapper. For now, read from a data attribute.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const partnerCorporateId = formData.get("partnerCorporateId") as string
    const userId = formData.get("userId") as string

    setStatus("submitting")
    setError("")
    try {
      await createMouAgreement({
        userId,
        partnerCorporateId,
        mouDocumentUrl: mouUrl || undefined,
        resourceTypes: resources ? resources.split(",").map((r) => r.trim()) : undefined,
      })
      setStatus("success")
    } catch (err: any) {
      setError(err.message === "NGO_ONLY" ? "This action is only available to NGO partners." : "Submission failed. Please try again.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">MOU Signed</h2>
        <p className="text-gray-600">Your MOU agreement has been recorded. The Jenga365 team will review it shortly.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Sign MOU Agreement</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* These hidden fields must be populated by a server component wrapper */}
        <input type="hidden" name="userId" value="" />
        <input type="hidden" name="partnerCorporateId" value="" />

        <div>
          <label className="block text-sm font-medium mb-1">MOU Document URL</label>
          <input
            type="url"
            value={mouUrl}
            onChange={(e) => setMouUrl(e.target.value)}
            placeholder="https://docs.example.com/mou.pdf"
            className="w-full border rounded-md px-3 py-2"
          />
          <p className="text-xs text-gray-400 mt-1">Upload the document to your storage provider first, then paste the URL here.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Resource Types (comma-separated)</label>
          <input
            type="text"
            value={resources}
            onChange={(e) => setResources(e.target.value)}
            placeholder="funding, equipment, mentorship_slots"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-blue-700 text-white py-2 rounded-md font-medium hover:bg-blue-800 disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : "Sign & Submit MOU"}
        </button>
      </form>
    </div>
  )
}
```

**Note:** The hidden `userId` and `partnerCorporateId` inputs must be populated from the server. Wrap this client component in a server component that fetches `session.user.id` and `session.user.partnerId` and passes them as props, or use a server action that reads the session internally (preferred — remove the hidden inputs and let `createMouAgreement` read the session via `auth.api.getSession`).

**Recommended refactor** (do this before committing): move `userId` out of the form entirely and let `createMouAgreement` read the session server-side. Update `ngoWorkflow.ts` to call `auth.api.getSession` internally, then remove `userId` from its public parameter list.

- [ ] **Step 2: Manually verify the form in the browser**

Navigate to `http://localhost:3000/dashboard/partner/mou`. Test:
- With a non-NGO account → should show the NGO_ONLY error message
- With an NGO account → submit with a test URL → success screen shown
- Confirm `ngo_mou_agreements` row in DB via Drizzle Studio

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/partner/mou/page.tsx
git commit -m "feat(ui): add NGO MOU signing form"
```

---

## Task 5 — Power Hour Session Logging UI

**Files:**
- Create: `src/app/dashboard/mentor/power-hour/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/dashboard/mentor/power-hour/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { logPowerHourSession } from "@/lib/actions/powerHour"

export default function PowerHourPage() {
  const [menteeId, setMenteeId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [minutes, setMinutes] = useState(60)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ month: string } | null>(null)

  // mentorId must come from session — inject via server component wrapper
  const mentorId = "" // TODO: populate from session in server wrapper

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (minutes < 1) { setError("Duration must be at least 1 minute."); return }
    setStatus("submitting"); setError("")
    try {
      const res = await logPowerHourSession({
        mentorId,
        menteeId: menteeId || undefined,
        sessionDate: new Date(date),
        durationMinutes: minutes,
        notes: notes || undefined,
      })
      setResult(res)
      setStatus("success")
    } catch (err: any) {
      setError(err.message || "Failed to log session.")
      setStatus("error")
    }
  }

  if (status === "success" && result) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-2">Session Logged!</h2>
        <p className="text-gray-600">{minutes} minutes recorded for {result.month}. Keep up the great work!</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Log Power Hour Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Session Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input type="number" min={1} max={480} value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mentee ID (optional)</label>
          <input type="text" value={menteeId} onChange={(e) => setMenteeId(e.target.value)}
            placeholder="Leave blank for group sessions"
            className="w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full border rounded-md px-3 py-2 resize-none" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={status === "submitting"}
          className="w-full bg-green-700 text-white py-2 rounded-md font-medium hover:bg-green-800 disabled:opacity-50">
          {status === "submitting" ? "Saving…" : "Log Session"}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/dashboard/mentor/power-hour`. Submit a 60-minute session. Verify `power_hour_sessions` row and `mentor_commitment_tracker` upsert in Drizzle Studio (`status = 'met'` for 60+ minutes).

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/mentor/power-hour/page.tsx
git commit -m "feat(ui): add Power Hour session logging page for mentors"
```

---

## Task 6 — Wire Goal Categories into Matching

**Files:**
- Modify: `src/lib/actions/matching.ts` lines 79–111

- [ ] **Step 1: Read the existing `getAiMentorMatches` action**

Open `src/lib/actions/matching.ts`. The `getAiMentorMatches` function currently calls `getMentorMatches({ menteeEmbedding, limit: 5 })`. It does not pass `menteeGoalCategories`.

- [ ] **Step 2: Update `getAiMentorMatches` to fetch and pass goal categories**

Replace the relevant block in `src/lib/actions/matching.ts`:

```ts
// Add to imports at top:
import { menteeIntake } from "@/lib/db/schema";

// In getAiMentorMatches, after fetching the user embedding, add:
const intake = await db.query.menteeIntake.findFirst({
    where: eq(menteeIntake.userId, session.user.id),
    columns: { goalCategories: true },
});

// Then update the getMentorMatches call:
return getMentorMatches({
    menteeEmbedding: user.embedding as number[],
    menteeGoalCategories: intake?.goalCategories ?? undefined,
    limit: 5,
});
```

Apply the same change to `getAiMentorMatchesForUser`:

```ts
// After fetching mentee:
const intake = await db.query.menteeIntake.findFirst({
    where: eq(menteeIntake.userId, menteeId),
    columns: { goalCategories: true },
});

// Update the getMentorMatches call:
const results = await getMentorMatches({
    menteeEmbedding: mentee.embedding as number[],
    menteeGoalCategories: intake?.goalCategories ?? undefined,
    limit: 5,
});
```

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass. The matching tests already cover goalAlignment behaviour.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/matching.ts
git commit -m "feat(matching): wire mentee goalCategories from intake into getMentorMatches"
```

---

## Task 7 — Environment Variables + Vercel Deployment

- [ ] **Step 1: Set required env vars in Vercel dashboard**

Go to `https://vercel.com/dashboard` → your Jenga365 project → Settings → Environment Variables. Add:

| Variable | Value | Environments |
|---|---|---|
| `KOBO_WEBHOOK_SECRET` | A random 32-char secret (generate with `openssl rand -hex 16`) | Production, Preview |
| `CRON_SECRET` | A random 32-char secret | Production only |

Confirm `DATABASE_URL` (Neon connection string) is already set.

- [ ] **Step 2: Verify `vercel.json` is committed**

```bash
cat "Jenga365 AI Platform/vercel.json"
```

Expected output:
```json
{
  "crons": [
    { "path": "/api/cron/three-strikes",    "schedule": "0 0 1 1,4,7,10 *" },
    { "path": "/api/cron/power-hour-check", "schedule": "0 0 1 * *" },
    { "path": "/api/cron/corporate-unlock", "schedule": "0 2 * * *" },
    { "path": "/api/cron/impact-report",    "schedule": "0 1 * * *" }
  ]
}
```

If not committed: `git add vercel.json && git commit -m "chore: add Vercel cron schedule"`

- [ ] **Step 3: Deploy**

```bash
vercel --prod
```

Or push to the `main` branch — Vercel CI will deploy automatically.

- [ ] **Step 4: Smoke test crons**

After deploy, test that auth guard works (cron secret not leaked):

```bash
curl -i https://your-domain.vercel.app/api/cron/corporate-unlock
# Expected: 401 Unauthorized

curl -i -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/cron/corporate-unlock
# Expected: 200 { success: true, message: "Milestone check complete." }
```

- [ ] **Step 5: Smoke test KoboToolbox webhook auth**

```bash
curl -i -X POST https://your-domain.vercel.app/api/webhooks/kobo \
  -H "Content-Type: application/json" \
  -H "x-kobo-token: wrong-secret" \
  -d '{}'
# Expected: 401 Unauthorized

curl -i -X POST https://your-domain.vercel.app/api/webhooks/kobo \
  -H "Content-Type: application/json" \
  -H "x-kobo-token: $KOBO_WEBHOOK_SECRET" \
  -d '{"_id":"test-001","_submission_time":"2026-04-12T00:00:00Z","trees_planted":10,"trees_alive":9,"check_interval_months":6,"survey_date":"2026-04-10"}'
# Expected: 200 { received: true }
```

---

## Task 8 — KoboToolbox Webhook Configuration

- [ ] **Step 1: Log in to KoboToolbox**

Go to `https://kf.kobotoolbox.org` and open your tree survival survey form.

- [ ] **Step 2: Navigate to REST Services**

Form → Settings → REST Services → Add Service.

- [ ] **Step 3: Configure the webhook**

| Field | Value |
|---|---|
| Service Name | `Jenga365 Tree Survival` |
| Endpoint URL | `https://your-domain.vercel.app/api/webhooks/kobo` |
| Security Level | `No Encoding` |
| Custom HTTP Header name | `x-kobo-token` |
| Custom HTTP Header value | (paste the value of `KOBO_WEBHOOK_SECRET`) |

- [ ] **Step 4: Test with a dummy submission**

Submit a test entry through the KoboToolbox Enketo form. Go back to Neon and run:

```sql
SELECT * FROM tree_survival_checks ORDER BY created_at DESC LIMIT 1;
```

Confirm the row exists with the submitted values.

---

## Task 9 — Looker Studio Data Source Setup

- [ ] **Step 1: Open Looker Studio**

Go to `https://lookerstudio.google.com` → Create → Data Source → PostgreSQL.

- [ ] **Step 2: Connect to Neon**

Use the Neon connection details from your `.env` `DATABASE_URL`:
- Host: `your-project.neon.tech`
- Port: `5432`
- Database: `neondb` (or your DB name)
- Username: your Neon user
- Password: your Neon password
- Enable SSL: Yes

- [ ] **Step 3: Add the three ESG views as data sources**

Add each view as a separate data source:

| Data Source Name | Table/View to select |
|---|---|
| `Jenga365 — Corporate Partner Scorecard` | `v_corporate_partner_scorecard` |
| `Jenga365 — Unlocked Resources` | `v_unlocked_resources` |
| `Jenga365 — Tree Survival Time Series` | `v_tree_survival_time_series` |

- [ ] **Step 4: Build The Green Game dashboard**

Create a new Looker Studio report. Add:
1. **Scorecard chart** — source: `v_corporate_partner_scorecard`, dimension: `milestone_type`, metric: `current_value` vs `threshold_value`
2. **Table** — source: `v_unlocked_resources`, columns: partner, resource type, amount, unlocked date
3. **Time series chart** — source: `v_tree_survival_time_series`, date dimension: `survey_date`, metric: `survival_rate`, breakdown: `check_interval_months`

---

## Verification Checklist (all tasks complete)

- [ ] All 165+ unit tests pass: `npx vitest run`
- [ ] Neon shows all 8 new tables + 3 views in Drizzle Studio
- [ ] KoboToolbox test submission creates a row in `tree_survival_checks`
- [ ] `/api/cron/corporate-unlock` returns 200 with correct secret
- [ ] `/api/cron/three-strikes` returns 200 with correct secret
- [ ] `/api/cron/power-hour-check` returns 200 with correct secret
- [ ] Give Back form at `/dashboard/give-back` submits and creates DB row
- [ ] NGO MOU form rejects non-NGO users with clear error
- [ ] Power Hour form upserts `mentor_commitment_tracker` correctly
- [ ] Looker Studio shows live data from all three views
- [ ] `vercel.json` cron schedule visible in Vercel dashboard under Cron Jobs tab
