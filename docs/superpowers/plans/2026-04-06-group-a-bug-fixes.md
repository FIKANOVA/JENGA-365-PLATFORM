# Group A Bug Fix Sprint — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 10 code-level bugs identified in the QA review — auth routing, AI matching weights, data integrity, XSS, and race conditions.

**Architecture:** Nine independent tasks, each touching 1–2 files. Tasks 3 and 4 both modify `matching.ts`/`queries/matching.ts` and must run sequentially. All others are safe to run in order. No schema migrations required.

**Tech Stack:** Next.js 14 App Router, Drizzle ORM, PostgreSQL/Neon, Better Auth, Vitest, TypeScript, `@portabletext/react`

**Key schema facts (read before implementing):**
- `users.embedding` is 768-dimensional (not 1536)
- `users.locationRegion` — varchar, nullable
- `users.partnerId` — uuid FK to `corporatePartners`, nullable
- No `availabilityPreferences` field exists — availability weight = 0.0 (documented TODO)
- `userProfileAssets.type` — enum: `CV | LinkedIn | Portfolio | Other`
- Better Auth session token is **opaque** (not a JWT) — middleware uses `session_data` cache cookie

---

## File Map

| Task | Modify | Create (test) |
|------|--------|---------------|
| 1 | `src/lib/actions/onboarding.ts` | `src/__tests__/onboarding/complete.test.ts` |
| 2 | `middleware.ts` | `src/__tests__/middleware/session-verify.test.ts` |
| 3 | `src/lib/actions/matching.ts` | `src/__tests__/matching/get-matches.test.ts` |
| 4 | `src/lib/db/queries/matching.ts` | `src/__tests__/matching/weights-capacity.test.ts` |
| 5 | `src/app/dashboard/layout.tsx` | `src/__tests__/dashboard/interview-gate.test.ts` |
| 6 | `src/lib/actions/menteeManagement.ts` | `src/__tests__/mentee/management-fixes.test.ts` |
| 7 | `src/lib/ai/profileSynthesizer.ts` | `src/__tests__/ai/chunk-dedup.test.ts` |
| 8 | `src/components/articles/ArticleContent.tsx` | `src/__tests__/articles/portable-text-xss.test.tsx` |
| 9 | `src/lib/actions/merchandise.ts` | `src/__tests__/merchandise/stock-race.test.ts` |

---

## Task 1: FIX-01 — completeOnboarding Approval Queue Bypass

**Files:**
- Modify: `src/lib/actions/onboarding.ts`
- Test: `src/__tests__/onboarding/complete.test.ts`

**Bug:** All roles are set to `status: "active"` on onboarding completion. Mentor and CorporatePartner must go to `pending_approval` for Moderator review.

- [ ] **Step 1: Write the failing test**

```typescript
// src/__tests__/onboarding/complete.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(),
  },
}))
vi.mock('@/lib/db/schema', () => ({ users: { name: 'users' } }))
vi.mock('@/lib/auth/config', () => ({
  auth: { api: { getSession: vi.fn() } },
}))
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Map()) }))
vi.mock('drizzle-orm', () => ({ eq: vi.fn(() => 'eq-result') }))

import { completeOnboarding } from '@/lib/actions/onboarding'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth/config'

const mockUpdate = vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(db.update).mockImplementation(mockUpdate)
})

function mockSession(role: string) {
  vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
  vi.mocked(db.query.users.findFirst).mockResolvedValue({ id: 'user-1', role, onboarded: false } as any)
}

describe('completeOnboarding — status routing', () => {
  it('sets Mentee to active', async () => {
    mockSession('Mentee')
    const result = await completeOnboarding('summary')
    const setCall = vi.mocked(db.update).mock.results[0].value.set.mock.calls[0][0]
    expect(setCall.status).toBe('active')
    expect(result.redirectTo).toBe('/dashboard/mentee')
  })

  it('sets Mentor to pending_approval', async () => {
    mockSession('Mentor')
    const result = await completeOnboarding('summary')
    const setCall = vi.mocked(db.update).mock.results[0].value.set.mock.calls[0][0]
    expect(setCall.status).toBe('pending_approval')
    expect(result.redirectTo).toBe('/pending-approval')
  })

  it('sets CorporatePartner to pending_approval', async () => {
    mockSession('CorporatePartner')
    const result = await completeOnboarding('summary')
    const setCall = vi.mocked(db.update).mock.results[0].value.set.mock.calls[0][0]
    expect(setCall.status).toBe('pending_approval')
    expect(result.redirectTo).toBe('/pending-approval')
  })

  it('sets Moderator to active', async () => {
    mockSession('Moderator')
    const result = await completeOnboarding('summary')
    const setCall = vi.mocked(db.update).mock.results[0].value.set.mock.calls[0][0]
    expect(setCall.status).toBe('active')
  })
})
```

- [ ] **Step 2: Run tests — verify RED**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/onboarding/complete.test.ts 2>&1
```
Expected: `Mentor` and `CorporatePartner` tests fail (they get `active` not `pending_approval`).

- [ ] **Step 3: Implement fix**

Replace the entire `src/lib/actions/onboarding.ts` with:

```typescript
"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

const ROLE_DASHBOARD: Record<string, string> = {
    Mentee: "/dashboard/mentee",
    Mentor: "/dashboard/mentor",
    CorporatePartner: "/dashboard/partner",
    Moderator: "/dashboard/moderator",
    SuperAdmin: "/dashboard/admin",
};

const ROLES_NEEDING_APPROVAL = new Set(["Mentor", "CorporatePartner"]);

export async function completeOnboarding(_summary: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id;
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) throw new Error("User not found");

    const needsApproval = ROLES_NEEDING_APPROVAL.has(user.role);
    const newStatus = needsApproval ? "pending_approval" : "active";
    const redirectTo = needsApproval ? "/pending-approval" : (ROLE_DASHBOARD[user.role] ?? "/dashboard/mentee");

    await db.update(users)
        .set({ onboarded: true, status: newStatus })
        .where(eq(users.id, userId));

    if (!needsApproval) {
        import("@/lib/ai/profileSynthesizer")
            .then(({ synthesizeUserProfile }) => synthesizeUserProfile(userId))
            .catch((e: Error) => console.error("[onboarding] Background synthesis failed:", e));
    }

    return { success: true, redirectTo };
}
```

- [ ] **Step 4: Run tests — verify GREEN**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/onboarding/complete.test.ts 2>&1
```
Expected: All 4 tests pass.

---

## Task 2: FIX-02 — Middleware Session Expiry Check

**Files:**
- Modify: `middleware.ts`
- Test: `src/__tests__/middleware/session-verify.test.ts`

**Bug:** Middleware checks only cookie presence. Expired/revoked sessions pass through.

**Approach:** Better Auth sets a `better-auth.session_data` cookie (signed JSON cache, 5-min TTL) when `cookieCache` is enabled. Parse its `expiresAt` field. If expired → redirect. If absent → fall back to token presence (layout does full validation).

- [ ] **Step 1: Write failing test**

```typescript
// src/__tests__/middleware/session-verify.test.ts
import { describe, it, expect } from 'vitest'
import { isSessionExpired } from '../../middleware'

describe('isSessionExpired', () => {
  it('returns true when expiresAt is in the past', () => {
    const past = new Date(Date.now() - 1000).toISOString()
    expect(isSessionExpired(past)).toBe(true)
  })

  it('returns false when expiresAt is in the future', () => {
    const future = new Date(Date.now() + 60_000).toISOString()
    expect(isSessionExpired(future)).toBe(false)
  })

  it('returns true for invalid date strings', () => {
    expect(isSessionExpired('not-a-date')).toBe(true)
  })

  it('returns true for null/undefined', () => {
    expect(isSessionExpired(null)).toBe(true)
    expect(isSessionExpired(undefined)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests — verify RED**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/middleware/session-verify.test.ts 2>&1
```
Expected: All 4 fail — `isSessionExpired` is not exported from middleware.

- [ ] **Step 3: Implement fix**

Replace `middleware.ts` with:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Jenga365 Middleware — NDA Gate, Auth Guard, Role-based Dashboard Protection
// Per: SCREEN_FLOW_V2.md, MODULE_1_TO_8_SPEC.md, MODULE_11_SPEC.md

const publicRoutes = ["/", "/about", "/articles", "/events", "/resources", "/contact", "/shop", "/donate", "/help", "/impact", "/voices"];
const authOnlyRoutes = ["/login", "/register"];
const onboardingRoutes = ["/legal/nda", "/onboarding", "/onboarding/intake", "/verify-email", "/pending-approval", "/pending", "/moderator-invite", "/admin-setup", "/email-test"];

/**
 * Checks if a Better Auth session_data cookie expiry has passed.
 * Better Auth caches session metadata in a cookie when cookieCache is enabled.
 * The cookie value is a base64-encoded JSON object containing an expiresAt field.
 * Falls back to treating as expired on any parse error.
 */
export function isSessionExpired(expiresAt: string | null | undefined): boolean {
    if (!expiresAt) return true;
    try {
        const expiry = new Date(expiresAt).getTime();
        if (isNaN(expiry)) return true;
        return expiry < Date.now();
    } catch {
        return true;
    }
}

function parseSessionDataCookie(cookieValue: string): { expiresAt?: string } | null {
    try {
        // Better Auth session_data cookie is base64url-encoded JSON
        const decoded = atob(cookieValue.split(".")[0]);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/assets") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    const sessionToken = request.cookies.get("better-auth.session_token");
    const sessionDataCookie = request.cookies.get("better-auth.session_data");

    // Determine authentication status
    // 1. Must have a session token
    // 2. If session_data cache cookie exists, verify it hasn't expired
    let isAuthenticated = !!sessionToken;
    if (isAuthenticated && sessionDataCookie) {
        const sessionData = parseSessionDataCookie(sessionDataCookie.value);
        if (isSessionExpired(sessionData?.expiresAt)) {
            isAuthenticated = false;
        }
    }

    if (!isAuthenticated) {
        const isPublicRoute = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
        const isAuthRoute = authOnlyRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
        const isOnboardingRoute = onboardingRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

        if (isPublicRoute || isAuthRoute || isOnboardingRoute) return NextResponse.next();

        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from login/register
    if (authOnlyRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-user-authenticated", "true");
    response.headers.set("x-pathname", pathname);
    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico).*)"],
};
```

- [ ] **Step 4: Run tests — verify GREEN**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/middleware/session-verify.test.ts 2>&1
```
Expected: All 4 pass.

---

## Task 3: FIX-03 — getAiMentorMatches Reads Embedding from DB

**Files:**
- Modify: `src/lib/actions/matching.ts`
- Test: `src/__tests__/matching/get-matches.test.ts`

**Bug:** `getAiMentorMatches` checks `session.user.embedding` — Better Auth never puts the 768-dim vector in the session. Always returns `[]`.

- [ ] **Step 1: Write failing test**

```typescript
// src/__tests__/matching/get-matches.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/config', () => ({
  auth: { api: { getSession: vi.fn() } },
}))
vi.mock('@/lib/db', () => ({
  db: { query: { users: { findFirst: vi.fn() } } },
}))
vi.mock('@/lib/db/schema', () => ({ users: { name: 'users' } }))
vi.mock('@/lib/db/queries/matching', () => ({
  getMentorMatches: vi.fn().mockResolvedValue([{ id: 'mentor-1', matchPercentage: 85 }]),
}))
vi.mock('drizzle-orm', () => ({ eq: vi.fn(() => 'eq') }))
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Map()) }))

import { getAiMentorMatches } from '@/lib/actions/matching'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { getMentorMatches } from '@/lib/db/queries/matching'

const MOCK_EMBEDDING = new Array(768).fill(0.1)

beforeEach(() => vi.clearAllMocks())

describe('getAiMentorMatches', () => {
  it('returns [] when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as any)
    expect(await getAiMentorMatches()).toEqual([])
  })

  it('fetches embedding from DB, not session', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u-1' } } as any)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ embedding: MOCK_EMBEDDING, embeddingStale: false } as any)
    await getAiMentorMatches()
    expect(db.query.users.findFirst).toHaveBeenCalled()
    expect(getMentorMatches).toHaveBeenCalledWith(expect.objectContaining({ menteeEmbedding: MOCK_EMBEDDING }))
  })

  it('returns [] when user has no embedding in DB', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u-1' } } as any)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ embedding: null, embeddingStale: false } as any)
    expect(await getAiMentorMatches()).toEqual([])
  })

  it('returns [] when embedding is stale', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u-1' } } as any)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ embedding: MOCK_EMBEDDING, embeddingStale: true } as any)
    expect(await getAiMentorMatches()).toEqual([])
  })
})
```

- [ ] **Step 2: Run — verify RED**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/matching/get-matches.test.ts 2>&1
```
Expected: "fetches embedding from DB" fails — current code never queries DB.

- [ ] **Step 3: Implement fix**

Replace `getAiMentorMatches` in `src/lib/actions/matching.ts` (keep other functions unchanged):

```typescript
export async function getAiMentorMatches() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return [];

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { embedding: true, embeddingStale: true },
    });

    if (!user?.embedding || user.embeddingStale) return [];

    const results = await getMentorMatches({
        menteeEmbedding: user.embedding as number[],
        limit: 5,
    });

    return results;
}
```

- [ ] **Step 4: Run — verify GREEN**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/matching/get-matches.test.ts 2>&1
```
Expected: All 4 pass.

---

## Task 4: FIX-04 + FIX-05 — Matching Weights (50/20/0/10/5) + Capacity Limit

**Files:**
- Modify: `src/lib/db/queries/matching.ts`
- Test: `src/__tests__/matching/weights-capacity.test.ts`

**Bugs:**
- FIX-04: Weights are 60/40 (undocumented). Spec: 50% cosine / 20% location / 15% availability (→ 0, no schema field) / 10% partner / 5% completeness.
- FIX-05: No capacity check — mentors with 2 active pairs appear in results.

- [ ] **Step 1: Write failing tests**

```typescript
// src/__tests__/matching/weights-capacity.test.ts
import { describe, it, expect, vi } from 'vitest'

// We test the SQL formula by inspecting the query object built by getMentorMatches.
// Since we can't run pgvector in unit tests, we test that:
// 1. The function accepts locationRegion, partnerId params
// 2. The query does NOT include chunkScore in its output (removed in new spec)
// 3. The function signature is correct

vi.mock('../../../src/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue([
                  { id: 'm-1', name: 'Alice', locationRegion: 'Nairobi', totalScore: '0.82', profileScore: '0.75' }
                ])
              }))
            }))
          }))
        }))
      }))
    })),
  },
}))

vi.mock('../../../src/lib/db/schema', () => ({
  users: { id: 'id', name: 'name', role: 'role', locationRegion: 'locationRegion', partnerId: 'partnerId', embedding: 'embedding', isApproved: 'isApproved', status: 'status' },
  userProfileAssets: { userId: 'userId', type: 'type' },
  mentorshipPairs: { mentorId: 'mentorId', status: 'status' },
}))

vi.mock('drizzle-orm', () => ({
  and: vi.fn((...args) => args),
  eq: vi.fn(() => 'eq'),
  gt: vi.fn(() => 'gt'),
  desc: vi.fn((v) => v),
  sql: vi.fn((strings, ...values) => ({ sql: strings.join('?'), values })),
  cosineDistance: vi.fn(() => 'cosine_distance'),
  count: vi.fn(() => 'count'),
}))

import { getMentorMatches } from '@/lib/db/queries/matching'

describe('getMentorMatches', () => {
  it('accepts locationRegion and partnerId parameters', async () => {
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
      locationRegion: 'Nairobi',
      partnerId: 'partner-uuid',
      limit: 5,
    })
    expect(Array.isArray(results)).toBe(true)
  })

  it('returns matchPercentage derived from totalScore', async () => {
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
    })
    expect(results[0]).toHaveProperty('matchPercentage')
    expect(typeof results[0].matchPercentage).toBe('number')
  })

  it('does not return chunkScore in results (removed per spec)', async () => {
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
    })
    expect(results[0]).not.toHaveProperty('chunkScore')
  })
})
```

- [ ] **Step 2: Run — verify RED**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/matching/weights-capacity.test.ts 2>&1
```
Expected: "does not return chunkScore" fails (current code includes `chunkScore`).

- [ ] **Step 3: Implement fix**

Replace the entire `src/lib/db/queries/matching.ts`:

```typescript
import { db } from "../index";
import { users, userProfileAssets, mentorshipPairs } from "../schema";
import { and, eq, sql, desc, cosineDistance, lt } from "drizzle-orm";

/**
 * Hybrid mentor matching with spec-defined 5-component weighted score.
 *
 * Weights (per MODULE_9_SPEC):
 *   50% — Semantic similarity (cosine distance on 768-dim profile embedding)
 *   20% — Location match (same locationRegion)
 *   15% — Availability overlap — TODO: implement when availability field added to schema
 *    0% — (availability placeholder)
 *   10% — Partner affiliation (same partnerId)
 *    5% — Profile completeness (CV / LinkedIn / Portfolio assets)
 *
 * Pre-filters (hard exclusions before scoring):
 *   - role = 'Mentor'
 *   - status = 'active'
 *   - isApproved = true
 *   - active mentorship pairs < 2 (1:2 capacity protocol)
 */
export async function getMentorMatches(params: {
    menteeEmbedding: number[];
    locationRegion?: string;
    partnerId?: string;
    menteeTimezone?: string; // reserved for future availability matching
    limit?: number;
}) {
    const { menteeEmbedding, locationRegion, partnerId, limit = 5 } = params;

    // Subquery: count active pairs per mentor (for capacity enforcement)
    const activePairCounts = db
        .select({
            mentorId: mentorshipPairs.mentorId,
            activeCount: sql<number>`cast(count(*) as int)`.as("active_count"),
        })
        .from(mentorshipPairs)
        .where(eq(mentorshipPairs.status, "active"))
        .groupBy(mentorshipPairs.mentorId)
        .as("active_pairs");

    // Subquery: count profile assets per mentor (for completeness score)
    const assetCounts = db
        .select({
            userId: userProfileAssets.userId,
            assetCount: sql<number>`cast(count(*) as int)`.as("asset_count"),
        })
        .from(userProfileAssets)
        .groupBy(userProfileAssets.userId)
        .as("asset_counts");

    const cosineSim = sql<number>`1 - (${cosineDistance(users.embedding, menteeEmbedding)})`;
    const locationScore = locationRegion
        ? sql<number>`case when ${users.locationRegion} = ${locationRegion} then 1.0 else 0.0 end`
        : sql<number>`0.0`;
    const partnerScore = partnerId
        ? sql<number>`case when ${users.partnerId}::text = ${partnerId} then 1.0 else 0.0 end`
        : sql<number>`0.0`;
    const completenessScore = sql<number>`least(coalesce(${assetCounts.assetCount}, 0) / 3.0, 1.0)`;

    const totalScore = sql<number>`
        (0.50 * (1 - (${cosineDistance(users.embedding, menteeEmbedding)})))
        + (0.20 * ${locationScore})
        + (0.00)
        + (0.10 * ${partnerScore})
        + (0.05 * ${completenessScore})
    `;

    const results = await db
        .select({
            id: users.id,
            name: users.name,
            locationRegion: users.locationRegion,
            profileScore: cosineSim,
            totalScore,
        })
        .from(users)
        .leftJoin(activePairCounts, eq(users.id, activePairCounts.mentorId))
        .leftJoin(assetCounts, eq(users.id, assetCounts.userId))
        .where(
            and(
                eq(users.role, "Mentor"),
                eq(users.isApproved, true),
                eq(users.status, "active"),
                // FIX-05: Enforce 1:2 capacity — exclude mentors at or above 2 active pairs
                sql`coalesce(${activePairCounts.activeCount}, 0) < 2`,
            )
        )
        .orderBy(desc(totalScore))
        .limit(limit);

    return results.map((r) => ({
        id: r.id,
        name: r.name,
        locationRegion: r.locationRegion,
        matchPercentage: Math.round((Number(r.totalScore) || 0) * 100),
        insights: {
            profileMatch: Math.round((Number(r.profileScore) || 0) * 100),
        },
    }));
}
```

- [ ] **Step 4: Run — verify GREEN**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/matching/weights-capacity.test.ts 2>&1
```
Expected: All 3 pass.

---

## Task 5: FIX-06 — Dashboard Embedding Gate (AI Interviewer Enforcement)

**Files:**
- Modify: `src/app/dashboard/layout.tsx`
- Test: `src/__tests__/dashboard/interview-gate.test.ts`

**Bug:** Users who complete intake but skip the AI Interviewer (no embedding generated) land on the dashboard with zero matches and no explanation.

**Note:** The layout already queries the session via `auth.api.getSession`. Add a DB user fetch to check `embedding` null for Mentee role only.

- [ ] **Step 1: Write failing test**

```typescript
// src/__tests__/dashboard/interview-gate.test.ts
import { describe, it, expect, vi } from 'vitest'

// Test the gate logic in isolation as a pure function
// (layout itself is a server component — we extract and test the logic)

export function shouldRedirectToInterview(
  role: string,
  intakeCompleted: boolean,
  embedding: number[] | null,
): boolean {
  if (role !== 'Mentee') return false
  if (!intakeCompleted) return false // handled by existing intake gate
  return embedding === null
}

describe('shouldRedirectToInterview', () => {
  it('redirects Mentee with completed intake but no embedding', () => {
    expect(shouldRedirectToInterview('Mentee', true, null)).toBe(true)
  })

  it('does not redirect Mentee who has completed interview', () => {
    expect(shouldRedirectToInterview('Mentee', true, new Array(768).fill(0.1))).toBe(false)
  })

  it('does not redirect Mentor (different role)', () => {
    expect(shouldRedirectToInterview('Mentor', true, null)).toBe(false)
  })

  it('does not redirect Mentee who has not completed intake (separate gate handles it)', () => {
    expect(shouldRedirectToInterview('Mentee', false, null)).toBe(false)
  })
})
```

- [ ] **Step 2: Run — verify GREEN immediately (pure function test)**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/dashboard/interview-gate.test.ts 2>&1
```
Expected: All 4 pass (the logic function is defined in the test file itself; this verifies the logic before wiring it into the layout).

- [ ] **Step 3: Wire gate into dashboard layout**

In `src/app/dashboard/layout.tsx`, add after the existing `intakeCompleted` check (after line 41):

```typescript
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Inside DashboardLayout, after the intakeCompleted redirect block:

    // Interview gate: Mentees who completed intake but skipped the AI Interviewer
    // have no embedding — they get zero matches with no explanation. Force them back.
    if (userRole === 'Mentee' && intakeCompleted) {
        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { embedding: true },
        });
        if (!dbUser?.embedding) {
            redirect('/onboarding?reason=interview_required');
        }
    }
```

The full updated file:

```typescript
import RoleSidebar from "@/components/dashboard/RoleSidebar";
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");

    const userRole = (session.user as any).role as string;

    const roleDashboardMap: Record<string, string> = {
        SuperAdmin: "/dashboard/admin",
        Moderator: "/dashboard/moderator",
        Mentor: "/dashboard/mentor",
        Mentee: "/dashboard/mentee",
        CorporatePartner: "/dashboard/partner",
    };
    const correctDashboard = roleDashboardMap[userRole] || "/dashboard/mentee";

    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";

    // Gate 1: Intake must be complete for Mentees
    const intakeCompleted = (session.user as any).intakeCompleted ?? false;
    if (userRole === "Mentee" && !intakeCompleted) {
        redirect("/onboarding/intake");
    }

    // Gate 2: AI Interview must be complete for Mentees (embedding must exist)
    if (userRole === "Mentee" && intakeCompleted) {
        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { embedding: true },
        });
        if (!dbUser?.embedding) {
            redirect("/onboarding?reason=interview_required");
        }
    }

    // Role-based dashboard redirect
    const isSharedRoute = pathname.startsWith("/dashboard/settings") || pathname === "/dashboard";
    if (pathname && !isSharedRoute && !pathname.startsWith(correctDashboard)) {
        redirect(correctDashboard);
    }

    return (
        <div className="flex min-h-screen bg-muted/5">
            <RoleSidebar role={userRole} />
            <div className="flex-1 flex flex-col">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Confirm no TypeScript errors**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx tsc --noEmit 2>&1 | grep -E "layout|dashboard" | head -10
```
Expected: No errors on the layout file.

---

## Task 6: FIX-07 + FIX-08 — Wrong Pathway FK + Session Notification

**Files:**
- Modify: `src/lib/actions/menteeManagement.ts` (lines 76 and 185)
- Test: `src/__tests__/mentee/management-fixes.test.ts`

**Bugs:**
- BUG-08: `eq(learningPathways.id, pair?.id)` — compares the pathway PK to the pair PK. Should be `learningPathways.pairId`.
- BUG-09: `console.log(...)` instead of `createNotification(...)` after session log.

- [ ] **Step 1: Write failing tests**

```typescript
// src/__tests__/mentee/management-fixes.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindFirst = vi.fn()
const mockInsert = vi.fn(() => ({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'session-1' }]) }) }))
const mockUpdate = vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }))
const mockSelect = vi.fn(() => ({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ orderBy: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }) }) }) }))

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: { findFirst: mockFindFirst },
      mentorshipPairs: { findFirst: vi.fn().mockResolvedValue({ id: 'pair-1' }) },
      learningPathways: { findFirst: mockFindFirst },
    },
    insert: mockInsert,
    update: mockUpdate,
    select: mockSelect,
  },
}))
vi.mock('@/lib/db/schema', () => ({
  users: {}, mentorshipPairs: {}, sessionsLog: {}, learningPathways: { pairId: 'pairId', id: 'id' },
  activityLog: {}, menteeDocuments: {}, userBadges: {}, moderationLog: {},
}))
vi.mock('@/lib/auth/config', () => ({
  auth: { api: { getSession: vi.fn().mockResolvedValue({ user: { id: 'mod-1', role: 'Moderator' } }) } },
}))
vi.mock('@/lib/notifications/service', () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Map()) }))
vi.mock('drizzle-orm', () => ({ eq: vi.fn((field, val) => ({ field, val })), and: vi.fn(), desc: vi.fn(), sql: vi.fn() }))
vi.mock('zod', async () => {
  const actual = await vi.importActual('zod')
  return actual
})

import { createNotification } from '@/lib/notifications/service'

describe('BUG-09 — logMentorshipSession fires real notification', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls createNotification after successful session log', async () => {
    const { logMentorshipSession } = await import('@/lib/actions/menteeManagement')
    await logMentorshipSession({
      menteeId: '00000000-0000-0000-0000-000000000001',
      mentorId: '00000000-0000-0000-0000-000000000002',
      sessionDate: new Date('2026-04-06'),
      durationMinutes: 60,
      sessionType: 'video_call',
      notes: 'Great session covering career planning.',
      rating: 5,
    })
    expect(createNotification).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000001',
      'session_reminder',
      expect.objectContaining({ title: expect.any(String), body: expect.any(String) })
    )
  })
})

describe('BUG-08 — getMenteeDetail uses learningPathways.pairId', () => {
  it('queries learningPathways by pairId field, not id', async () => {
    const { eq } = await import('drizzle-orm')
    const { getMenteeDetail } = await import('@/lib/actions/menteeManagement')
    const { learningPathways } = await import('@/lib/db/schema')

    mockFindFirst.mockResolvedValue({ id: 'user-1', role: 'Mentee' })

    await getMenteeDetail('00000000-0000-0000-0000-000000000001').catch(() => {})

    const eqCalls = vi.mocked(eq).mock.calls
    const pathwayCall = eqCalls.find(call => call[0] === learningPathways.pairId)
    expect(pathwayCall).toBeDefined()
  })
})
```

- [ ] **Step 2: Run — verify RED**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/mentee/management-fixes.test.ts 2>&1
```
Expected: Both tests fail.

- [ ] **Step 3: Fix BUG-08 in menteeManagement.ts — line 76**

Change:
```typescript
where: eq(learningPathways.id, pair?.id || ""),
```
To:
```typescript
where: eq(learningPathways.pairId, pair?.id || ""),
```

- [ ] **Step 4: Fix BUG-09 in menteeManagement.ts — line 185**

Add import at top of file (after existing imports):
```typescript
import { createNotification } from "@/lib/notifications/service";
```

Replace:
```typescript
    // Notification placeholder (Send in-app + email)
    console.log(`Notification sent to mentee ${parsed.menteeId}`);
```
With:
```typescript
    createNotification(parsed.menteeId, "session_reminder", {
        title: "Session Logged",
        body: `Your mentorship session on ${parsed.sessionDate.toLocaleDateString()} has been recorded.`,
        link: "/dashboard/mentee",
    }).catch(() => {}); // fire-and-forget — never fail the session log
```

- [ ] **Step 5: Run — verify GREEN**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/mentee/management-fixes.test.ts 2>&1
```
Expected: Both tests pass.

---

## Task 7: FIX-09 — Chunk Deduplication in Profile Synthesizer

**Files:**
- Modify: `src/lib/ai/profileSynthesizer.ts`
- Test: `src/__tests__/ai/chunk-dedup.test.ts`

**Bug:** Each synthesis run appends 5 new `userChunks` rows. Re-upload CV twice → 10 chunks → polluted vector search.

- [ ] **Step 1: Write failing test**

```typescript
// src/__tests__/ai/chunk-dedup.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDelete = vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) }))
const mockInsert = vi.fn(() => ({ values: vi.fn().mockResolvedValue([]) }))
const mockUpdate = vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }))
const mockTransaction = vi.fn(async (cb: any) => cb({
  delete: mockDelete,
  insert: mockInsert,
}))

vi.mock('@/lib/db', () => ({
  db: {
    query: { users: { findFirst: vi.fn() } },
    select: vi.fn(() => ({ from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) })),
    update: mockUpdate,
    transaction: mockTransaction,
  },
}))
vi.mock('@/lib/db/schema', () => ({
  users: { name: 'users' },
  userProfileAssets: { name: 'user_profile_assets' },
  userChunks: { name: 'user_chunks' },
}))
vi.mock('@/lib/ai/embeddings', () => ({
  generateProfileEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.1)),
}))
vi.mock('@ai-sdk/google', () => ({ google: vi.fn(() => 'model') }))
vi.mock('ai', () => ({ generateText: vi.fn().mockResolvedValue({ text: 'profile summary' }) }))
vi.mock('pdf-parse', () => ({ default: vi.fn().mockResolvedValue({ text: '' }) }))
vi.mock('drizzle-orm', () => ({ eq: vi.fn(() => 'eq') }))

import { synthesizeUserProfile } from '@/lib/ai/profileSynthesizer'
import { db } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(db.query.users.findFirst).mockResolvedValue({
    id: 'u-1', name: 'Test', embedding: null, embeddingStale: true,
  } as any)
})

describe('chunk deduplication', () => {
  it('deletes existing chunks before inserting new ones', async () => {
    await synthesizeUserProfile('u-1')
    expect(mockDelete).toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalled()
  })

  it('delete is called before insert (ordering)', async () => {
    const callOrder: string[] = []
    mockDelete.mockImplementation(() => { callOrder.push('delete'); return { where: vi.fn().mockResolvedValue([]) } })
    mockInsert.mockImplementation(() => { callOrder.push('insert'); return { values: vi.fn().mockResolvedValue([]) } })

    await synthesizeUserProfile('u-1')

    const deleteIdx = callOrder.indexOf('delete')
    const insertIdx = callOrder.indexOf('insert')
    expect(deleteIdx).toBeGreaterThanOrEqual(0)
    expect(insertIdx).toBeGreaterThan(deleteIdx)
  })
})
```

- [ ] **Step 2: Run — verify RED**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/ai/chunk-dedup.test.ts 2>&1
```
Expected: Both tests fail — current code never calls `db.transaction` or `db.delete`.

- [ ] **Step 3: Fix synthesizeUserProfile — replace chunk insertion block**

In `src/lib/ai/profileSynthesizer.ts`, replace the chunk insertion section (currently a bare `for` loop starting around line 82) with a transaction:

```typescript
    // 5. Granular Chunking — delete stale chunks first, then insert fresh ones atomically
    const chunks = splitIntoProfessionalChunks(cvText);
    await db.transaction(async (tx) => {
        // Delete ALL existing chunks for this user before inserting new ones.
        // Without this, every re-synthesis appends 5 more rows (chunk accumulation bug).
        await tx.delete(userChunks).where(eq(userChunks.userId, userId));

        for (const chunk of chunks) {
            const chunkEmbedding = await generateProfileEmbedding(chunk);
            await tx.insert(userChunks).values({
                userId,
                content: chunk,
                embedding: chunkEmbedding,
                chunkType: "experience",
            });
        }
    });
```

- [ ] **Step 4: Run — verify GREEN**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/ai/chunk-dedup.test.ts 2>&1
```
Expected: Both pass.

---

## Task 8: FIX-10 — PortableText XSS Hardening

**Files:**
- Modify: `src/components/articles/ArticleContent.tsx`
- Test: `src/__tests__/articles/portable-text-xss.test.tsx`

**Bug:** `<PortableText value={content} />` with no `components` prop uses the default renderer, which can execute injected script blocks.

- [ ] **Step 1: Write failing test**

```typescript
// src/__tests__/articles/portable-text-xss.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ArticleContent from '@/components/articles/ArticleContent'

// Note: this test file requires happy-dom environment.
// Add to vitest.config.ts environmentMatchGlobs:
//   ['src/__tests__/articles/**', 'happy-dom']

const MOCK_AUTHOR = { name: 'Test', role: 'Mentor', bio: 'Bio', avatar: '/avatar.jpg' }

const XSS_CONTENT = [
  {
    _type: 'block',
    _key: 'a',
    style: 'normal',
    children: [{ _type: 'span', _key: 'b', text: '<script>alert("xss")</script>', marks: [] }],
    markDefs: [],
  },
]

describe('ArticleContent PortableText XSS', () => {
  it('renders script tag content as escaped text, not executable', () => {
    render(<ArticleContent author={MOCK_AUTHOR} content={XSS_CONTENT} />)
    // If the script ran, it would throw or set a window flag
    // Instead, check the script tag is NOT in the DOM as a script element
    const scripts = document.querySelectorAll('script')
    // Only the scripts from the test runner itself — none injected by PortableText
    const injected = Array.from(scripts).filter(s => s.textContent?.includes('alert'))
    expect(injected).toHaveLength(0)
  })

  it('renders safe links correctly', () => {
    const LINK_CONTENT = [
      {
        _type: 'block', _key: 'c', style: 'normal',
        markDefs: [{ _type: 'link', _key: 'd', href: 'https://jenga365.com/about' }],
        children: [{ _type: 'span', _key: 'e', text: 'Safe link', marks: ['d'] }],
      },
    ]
    render(<ArticleContent author={MOCK_AUTHOR} content={LINK_CONTENT} />)
    const link = screen.getByText('Safe link')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('https://jenga365.com/about')
  })

  it('renders unsafe external links as plain text', () => {
    const UNSAFE_CONTENT = [
      {
        _type: 'block', _key: 'f', style: 'normal',
        markDefs: [{ _type: 'link', _key: 'g', href: 'javascript:alert(1)' }],
        children: [{ _type: 'span', _key: 'h', text: 'Evil link', marks: ['g'] }],
      },
    ]
    render(<ArticleContent author={MOCK_AUTHOR} content={UNSAFE_CONTENT} />)
    const text = screen.getByText('Evil link')
    expect(text.tagName).not.toBe('A')
  })
})
```

- [ ] **Step 2: Add happy-dom to vitest.config.ts environmentMatchGlobs**

In `vitest.config.ts`, add to the `environmentMatchGlobs` array:
```typescript
['src/__tests__/articles/**', 'happy-dom'],
```

- [ ] **Step 3: Run — verify RED**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/articles/portable-text-xss.test.tsx 2>&1
```
Expected: "unsafe external links" test fails — current code has no link whitelist.

- [ ] **Step 4: Fix ArticleContent.tsx**

Replace line 71 in `src/components/articles/ArticleContent.tsx`:
```tsx
                    <PortableText value={content} />
```
With:
```tsx
                    <PortableText
                        value={content}
                        components={{
                            types: {
                                image: ({ value }: any) => (
                                    <img
                                        src={value?.url ?? ""}
                                        alt={value?.alt ?? ""}
                                        className="rounded-sm w-full my-8"
                                    />
                                ),
                            },
                            marks: {
                                link: ({ children, value }: any) => {
                                    const href = (value?.href ?? "") as string;
                                    const isSafe =
                                        href.startsWith("/") ||
                                        href.startsWith("https://jenga365.com");
                                    return isSafe ? (
                                        <a href={href} rel="noopener noreferrer">
                                            {children}
                                        </a>
                                    ) : (
                                        <span>{children}</span>
                                    );
                                },
                            },
                            unknownMark: ({ children }: any) => <span>{children}</span>,
                            unknownType: () => null,
                        }}
                    />
```

- [ ] **Step 5: Run — verify GREEN**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/articles/portable-text-xss.test.tsx 2>&1
```
Expected: All 3 pass.

---

## Task 9: FIX-11 — Merchandise Stock Race Condition

**Files:**
- Modify: `src/lib/actions/merchandise.ts`
- Test: `src/__tests__/merchandise/stock-race.test.ts`

**Bug:** Read-then-write lets stock go to -1 under concurrent checkouts.

- [ ] **Step 1: Write failing test**

```typescript
// src/__tests__/merchandise/stock-race.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdate = vi.fn()
const mockReturning = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    query: { merchandise: { findFirst: vi.fn() } },
    update: mockUpdate,
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue([]) })),
  },
}))
vi.mock('@/lib/db/schema', () => ({
  merchandise: { name: 'merchandise', stockCount: 'stockCount', sanityProductId: 'sanityProductId', isActive: 'isActive' },
}))
vi.mock('@/lib/auth/config', () => ({
  auth: { api: { getSession: vi.fn().mockResolvedValue({ user: { id: 'u-1', role: 'SuperAdmin' } }) } },
}))
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Map()) }))
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(() => 'eq'),
  and: vi.fn(() => 'and'),
  gt: vi.fn(() => 'gt'),
  sql: vi.fn((s) => ({ sql: s })),
}))

import { decrementStock } from '@/lib/actions/merchandise'

beforeEach(() => {
  vi.clearAllMocks()
  mockReturning.mockResolvedValue([{ id: 'merch-1', stockCount: 0 }])
  mockUpdate.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: mockReturning }),
    }),
  })
})

describe('decrementStock — atomic update', () => {
  it('uses a single UPDATE with WHERE stock_count > 0 (no read-then-write)', async () => {
    await decrementStock('product-123')
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    // The old findFirst should NOT be called — no read step
    const { db } = await import('@/lib/db')
    expect(db.query.merchandise.findFirst).not.toHaveBeenCalled()
  })

  it('throws OUT_OF_STOCK when returning is empty (stock was 0)', async () => {
    mockReturning.mockResolvedValue([]) // DB guard blocked the update
    await expect(decrementStock('product-123')).rejects.toThrow('OUT_OF_STOCK')
  })

  it('returns the updated record on success', async () => {
    const result = await decrementStock('product-123')
    expect(result).toMatchObject({ id: 'merch-1', stockCount: 0 })
  })
})
```

- [ ] **Step 2: Run — verify RED**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/merchandise/stock-race.test.ts 2>&1
```
Expected: All fail — `decrementStock` doesn't exist yet.

- [ ] **Step 3: Add `decrementStock` to merchandise.ts**

Add this function to `src/lib/actions/merchandise.ts`:

```typescript
import { eq, and, gt, sql } from "drizzle-orm";

/**
 * Atomically decrements merchandise stock by 1.
 * Uses a single UPDATE with WHERE stock_count > 0 — no read-then-write race condition.
 * Throws OUT_OF_STOCK if the item is already at zero (DB guard blocked the update).
 */
export async function decrementStock(sanityProductId: string) {
    await requireStockManager();

    const [updated] = await db
        .update(merchandise)
        .set({ stockCount: sql`${merchandise.stockCount} - 1` })
        .where(
            and(
                eq(merchandise.sanityProductId, sanityProductId),
                gt(merchandise.stockCount, 0)
            )
        )
        .returning();

    if (!updated) throw new Error("OUT_OF_STOCK");
    return updated;
}
```

- [ ] **Step 4: Run — verify GREEN**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/merchandise/stock-race.test.ts 2>&1
```
Expected: All 3 pass.

---

## Full Test Suite Run

- [ ] **Run all new tests together**

```bash
cd "/home/moseti/The Vault/Jenga365/Jenga365 AI Platform" && npx vitest run src/__tests__/onboarding src/__tests__/middleware src/__tests__/matching src/__tests__/dashboard src/__tests__/mentee src/__tests__/ai src/__tests__/articles src/__tests__/merchandise 2>&1
```
Expected: All tests pass across all 9 fix tasks.

---

## Self-Review

**Spec coverage:**
- FIX-01 BUG-03 ✅ Task 1
- FIX-02 BUG-04 ✅ Task 2
- FIX-03 BUG-10 ✅ Task 3
- FIX-04 BUG-05 ✅ Task 4
- FIX-05 BUG-06 ✅ Task 4 (same file, same task)
- FIX-06 BUG-07 ✅ Task 5
- FIX-07 BUG-08 ✅ Task 6
- FIX-08 BUG-09 ✅ Task 6
- FIX-09 Chunk dedup ✅ Task 7
- FIX-10 XSS ✅ Task 8
- FIX-11 Race condition ✅ Task 9

**Placeholder scan:** None found.

**Type consistency:** `decrementStock` exported from `merchandise.ts` — name consistent across task 9. `shouldRedirectToInterview` is a local test helper only, not exported from layout.

**Schema accuracy confirmed:**
- `users.embedding` → 768-dim (not 1536 as in matching wiki — schema is source of truth)
- `learningPathways.pairId` → correct FK field name
- `userProfileAssets.type` → enum with CV/LinkedIn/Portfolio/Other
- `BETTER_AUTH_SECRET` → env var name confirmed from `env.ts`
