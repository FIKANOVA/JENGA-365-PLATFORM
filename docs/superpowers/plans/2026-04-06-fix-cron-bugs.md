# Fix Cron Route: Auth + SQL (BUG-01 & BUG-02) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure the `/api/cron/impact-report` route behind a Vercel Cron secret and fix the Cartesian-product SQL that causes all MEAL metrics to be zero.

**Architecture:** The cron route is a Next.js App Router GET handler. BUG-01 adds a bearer-token guard that reads `CRON_SECRET` from env. BUG-02 replaces the single broken `db.select().from(donations)` query (which never joined `sessionsLog`) with two separate, correct aggregation queries — one for donations, one for sessions.

**Tech Stack:** Next.js 14 App Router, Drizzle ORM, PostgreSQL (Neon), Vitest, TypeScript

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/app/api/cron/impact-report/route.ts` | Add auth guard + fix SQL |
| Create | `src/__tests__/cron/impact-report.test.ts` | Unit tests for auth check + correct aggregation |

---

## Task 1: Write failing tests for BUG-01 (auth guard) and BUG-02 (SQL)

**Files:**
- Create: `src/__tests__/cron/impact-report.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// src/__tests__/cron/impact-report.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}))

vi.mock('@/lib/db/schema', () => ({
  donations: { name: 'donations' },
  sessionsLog: { name: 'sessions_log' },
  impactReports: { name: 'impact_reports' },
}))

vi.mock('drizzle-orm', () => ({
  sum: vi.fn((col) => `sum(${String(col)})`),
  count: vi.fn((col) => `count(${String(col)})`),
}))

// ── Helpers ────────────────────────────────────────────────────────────────

function makeMockRequest(authHeader: string | null): Request {
  const headers = new Headers()
  if (authHeader !== null) headers.set('authorization', authHeader)
  return new Request('http://localhost/api/cron/impact-report', { headers })
}

function setupDbMocks(donationAmount: string, sessionHours: number, sessionCount: number) {
  const { db } = require('@/lib/db')
  let callCount = 0
  vi.mocked(db.select).mockImplementation(() => ({
    from: vi.fn().mockReturnValue({
      // First call → donations query
      // Second call → sessions query
      then: vi.fn(),
    }),
  }))

  // Simpler: mock the resolved values in sequence
  vi.mocked(db.select)
    .mockReturnValueOnce({
      from: vi.fn().mockResolvedValue([{ totalAmount: donationAmount }]),
    } as any)
    .mockReturnValueOnce({
      from: vi.fn().mockResolvedValue([{ totalHours: sessionHours, youthCount: sessionCount }]),
    } as any)

  vi.mocked(db.insert).mockReturnValue({
    values: vi.fn().mockResolvedValue([]),
  } as any)
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/cron/impact-report', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...OLD_ENV, CRON_SECRET: 'test-secret-abc' }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  // BUG-01: Auth guard
  describe('BUG-01 — auth guard', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const { GET } = await import('@/app/api/cron/impact-report/route')
      const req = makeMockRequest(null)
      const res = await GET(req)
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBe('Unauthorized')
    })

    it('returns 401 when Authorization header has wrong secret', async () => {
      const { GET } = await import('@/app/api/cron/impact-report/route')
      const req = makeMockRequest('Bearer wrong-secret')
      const res = await GET(req)
      expect(res.status).toBe(401)
    })

    it('returns 200 when Authorization header has correct secret', async () => {
      setupDbMocks('5000.00', 120, 10)
      const { GET } = await import('@/app/api/cron/impact-report/route')
      const req = makeMockRequest('Bearer test-secret-abc')
      const res = await GET(req)
      expect(res.status).toBe(200)
    })
  })

  // BUG-02: SQL correctness — sessions data must not be zero
  describe('BUG-02 — SQL aggregation', () => {
    it('queries sessionsLog separately from donations', async () => {
      setupDbMocks('5000.00', 360, 12)
      const { db } = await import('@/lib/db')
      const { GET } = await import('@/app/api/cron/impact-report/route')
      const req = makeMockRequest('Bearer test-secret-abc')
      await GET(req)
      // db.select must be called twice: once for donations, once for sessions
      expect(vi.mocked(db.select)).toHaveBeenCalledTimes(2)
    })

    it('inserts report with non-zero totalMentorshipHours when sessions exist', async () => {
      setupDbMocks('5000.00', 360, 12)
      const { db } = await import('@/lib/db')
      const { GET } = await import('@/app/api/cron/impact-report/route')
      const req = makeMockRequest('Bearer test-secret-abc')
      await GET(req)

      const insertCall = vi.mocked(db.insert).mock.calls[0]
      expect(insertCall).toBeDefined()
      const valuesCall = vi.mocked(db.insert).mock.results[0].value.values.mock.calls[0][0]
      expect(valuesCall.totalMentorshipHours).toBe(360)
      expect(valuesCall.youthEngaged).toBe(12)
    })

    it('inserts report with zero hours gracefully when no sessions exist', async () => {
      setupDbMocks('0', 0, 0)
      const { db } = await import('@/lib/db')
      const { GET } = await import('@/app/api/cron/impact-report/route')
      const req = makeMockRequest('Bearer test-secret-abc')
      await GET(req)

      const valuesCall = vi.mocked(db.insert).mock.results[0].value.values.mock.calls[0][0]
      expect(valuesCall.totalMentorshipHours).toBe(0)
      expect(valuesCall.youthEngaged).toBe(0)
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they FAIL (RED)**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx vitest run src/__tests__/cron/impact-report.test.ts
```

Expected: Tests fail. Auth tests fail because the guard is commented out. SQL tests fail because `db.select` is only called once (donations only), not twice.

---

## Task 2: Fix BUG-01 — Uncomment and enforce the Vercel Cron secret guard

**Files:**
- Modify: `src/app/api/cron/impact-report/route.ts`

- [ ] **Step 3: Replace the entire route file with the fixed version**

```typescript
// src/app/api/cron/impact-report/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { impactReports, donations, sessionsLog } from "@/lib/db/schema";
import { sum, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    // BUG-01 FIX: Enforce Vercel Cron secret — prevents public triggering
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // BUG-02 FIX: Two separate queries — donations and sessions are unrelated tables
        const [donationStats] = await db
            .select({ totalAmount: sum(donations.amount) })
            .from(donations);

        const [sessionStats] = await db
            .select({
                totalHours: sum(sessionsLog.durationMinutes),
                youthCount: count(sessionsLog.id),
            })
            .from(sessionsLog);

        await db.insert(impactReports).values({
            reportPeriod: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
            totalDonations: donationStats.totalAmount || "0",
            totalMentorshipHours: Number(sessionStats.totalHours) || 0,
            youthEngaged: Number(sessionStats.youthCount) || 0,
            treesPlanted: 0,
            clinicsHeld: 0,
        });

        return NextResponse.json({ success: true, message: "Nightly impact report generated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
```

- [ ] **Step 4: Run tests to verify they PASS (GREEN)**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform"
npx vitest run src/__tests__/cron/impact-report.test.ts
```

Expected: All 6 tests pass.

- [ ] **Step 5: Verify CRON_SECRET is in your env example file**

Open `.env.example` (or `.env.local.example`) and confirm this line exists. If not, add it:

```
CRON_SECRET=your-random-secret-here
```

Also confirm `CRON_SECRET` is set in your Vercel project environment variables (Dashboard → Settings → Environment Variables).

---

## Self-Review

**Spec coverage:**
- BUG-01 (unauthenticated cron): ✅ — auth guard enforced in Task 2, tested in Task 1
- BUG-02 (Cartesian product SQL): ✅ — two separate queries in Task 2, tested with `toHaveBeenCalledTimes(2)` + value assertions in Task 1

**Placeholder scan:** None found. All steps include exact code.

**Type consistency:** `totalMentorshipHours`, `youthEngaged`, `totalDonations` match the `impactReports` schema fields referenced in the original file.

**Edge case:** Zero-session case tested (Task 1, final test) — ensures `|| 0` fallback works correctly.
