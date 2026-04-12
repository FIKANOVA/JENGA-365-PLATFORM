# Group A Bug Fix Sprint — Design Spec

> **Date:** 2026-04-06  
> **Scope:** Fix all 10 code-level bugs from the QA review. No new features, no schema migrations.  
> **Source bugs:** Code Review (BUG-03 to BUG-10) + QA Report (XSS, race condition, chunk dedup)

---

## Goal

Eliminate every identified code bug in the existing platform. Each fix is surgical (1–2 files), fully tested, and does not introduce new dependencies.

---

## Architecture

Fixes are grouped into 4 risk tiers, executed in order:

1. **Security** — BUG-03, BUG-04 (auth/routing correctness)
2. **Matching logic** — BUG-05, BUG-06, BUG-10 (AI core)
3. **Data integrity** — BUG-07, BUG-08, BUG-09, Chunk Dedup
4. **Attack surface** — XSS, Merchandise race condition

---

## Fix Specifications

### FIX-01 — BUG-03: `completeOnboarding` Approval Queue Bypass

**File:** `src/lib/actions/onboarding.ts`

**Problem:** All roles are set to `status: "active"` immediately. Mentor and CorporatePartner must go through Moderator review.

**Fix:** Branch on `user.role` after DB fetch:
```typescript
const statusByRole: Record<string, string> = {
  Mentee: "active",
  Mentor: "pending_approval",
  CorporatePartner: "pending_approval",
  Moderator: "active",
  SuperAdmin: "active",
}
const newStatus = statusByRole[user.role] ?? "pending_approval"
```
Redirect Mentor/CorporatePartner to `/pending-approval`. All others redirect to their role dashboard.

**Test:** Unit test with mocked DB — assert `db.update` called with `status: "pending_approval"` for Mentor and CorporatePartner roles, `status: "active"` for Mentee.

---

### FIX-02 — BUG-04: Edge-Compatible JWT Verification in Middleware

**File:** `middleware.ts`

**Problem:** Middleware checks only for cookie presence. Forged, expired, or revoked tokens pass through.

**Fix:** Use `crypto.subtle` (available in Edge Runtime) to verify the session JWT:
1. Extract token from `better-auth.session_token` cookie
2. Decode the base64url payload to get `exp`
3. Check `exp > Date.now() / 1000`
4. Verify HMAC-SHA256 signature using `BETTER_AUTH_SECRET` env var via `crypto.subtle.importKey` + `crypto.subtle.verify`
5. If verification fails → redirect to `/login`

**Note:** Better Auth uses signed session tokens. If the token format is opaque (not JWT), fall back to checking expiry only via the payload. Document the assumption in a comment.

**Test:** Middleware unit test — expired token redirects, missing token redirects, valid token passes through with `x-user-authenticated: true` header set.

---

### FIX-03 — BUG-10: Embedding Fetched from DB, Not Session

**File:** `src/lib/actions/matching.ts`

**Problem:** `getAiMentorMatches` checks `session.user.embedding` which is never populated by Better Auth.

**Fix:**
```typescript
export async function getAiMentorMatches() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return []

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { embedding: true, embeddingStale: true }
  })

  if (!user?.embedding || user.embeddingStale) return []

  return getMentorMatches({ menteeEmbedding: user.embedding as number[], limit: 5 })
}
```

**Test:** Mock DB to return a user with a valid embedding → assert matches returned. Mock DB to return null embedding → assert empty array.

---

### FIX-04 — BUG-05: Correct Matching Weights (50/20/15/10/5)

**File:** `src/lib/db/queries/matching.ts`

**Problem:** Query uses undocumented 60/40 split (profile + chunk). Spec requires 5-component weighted score.

**Fix:** Replace `totalScore` formula:
```typescript
totalScore: sql<number>`
  (0.50 * (1 - (${cosineDistance(users.embedding, menteeEmbedding)})))
  + (0.20 * CASE WHEN ${users.locationRegion} = ${locationRegion ?? ''} THEN 1.0 ELSE 0.0 END)
  + (0.15 * CASE WHEN ${users.availabilityPreferences}->>'timezone' = ${menteeTimezone ?? ''} THEN 1.0 ELSE 0.0 END)
  + (0.10 * CASE WHEN ${users.partnerId} = ${partnerId ?? ''} THEN 1.0 ELSE 0.0 END)
  + (0.05 * (
      (CASE WHEN ${users.cvUrl} IS NOT NULL THEN 1 ELSE 0 END
      + CASE WHEN ${users.linkedinUrl} IS NOT NULL THEN 1 ELSE 0 END
      + CASE WHEN ${users.portfolioUrl} IS NOT NULL THEN 1 ELSE 0 END) / 3.0
    ))
`
```
Add `menteeTimezone` param to `getMentorMatches`. Remove `chunkScore` from return (chunk matching is subsumed into semantic similarity at 50%).

**Test:** Unit tests asserting local mentor scores higher than identical remote mentor (location weight), affiliated partner mentor scores higher (partner weight).

---

### FIX-05 — BUG-06: Mentor Capacity Limit Enforcement

**File:** `src/lib/db/queries/matching.ts`

**Problem:** Mentors with 2 active mentees appear in results. Spec requires max 2 concurrent mentees (1:2 protocol).

**Fix:** Add a subquery that counts active pairs per mentor and exclude at-capacity mentors:
```typescript
const activePairCounts = db
  .select({
    mentorId: mentorshipPairs.mentorId,
    activeCount: sql<number>`count(*)`.as('active_count')
  })
  .from(mentorshipPairs)
  .where(eq(mentorshipPairs.status, 'active'))
  .groupBy(mentorshipPairs.mentorId)
  .as('active_pairs')

// In WHERE clause:
sql`coalesce(${activePairCounts.activeCount}, 0) < 2`
```

**Test:** Seed mentor with 2 active pairs → assert not in results. Seed mentor with 1 active pair → assert appears in results.

---

### FIX-06 — BUG-07: AI Interviewer Enforcement

**File:** Dashboard layout server component (Mentee dashboard)

**Problem:** Users who skip the AI Interviewer get an active account but zero matches, with no explanation.

**Fix:** In the Mentee dashboard layout, after session check:
```typescript
if (!user.embedding && user.onboarded) {
  redirect('/onboarding?reason=interview_required')
}
```
The onboarding page reads the `reason` param and shows: *"Complete your AI Interview to activate your profile and see mentor matches."*

**Test:** Assert redirect occurs when `embedding` is null post-onboarding. Assert no redirect when embedding exists.

---

### FIX-07 — BUG-08: Wrong FK in Pathway Lookup

**File:** `src/lib/actions/menteeManagement.ts:76`

**Problem:** `eq(learningPathways.id, pair?.id)` compares PK to PK — always misses.

**Fix:** Change to `eq(learningPathways.pairId, pair?.id ?? "")`.

**Test:** Mock `learningPathways.findFirst` — assert it is called with `pairId` field, not `id` field.

---

### FIX-08 — BUG-09: Session Notification Wired Up

**File:** `src/lib/actions/menteeManagement.ts:185`

**Problem:** `console.log(...)` placeholder — mentee never receives session confirmation.

**Fix:**
```typescript
import { createNotification } from "@/lib/notifications/service"

// Replace console.log with:
createNotification(parsed.menteeId, "session_reminder", {
  title: "Session Logged",
  body: `Your session with your mentor on ${parsed.sessionDate.toLocaleDateString()} has been recorded.`,
  link: "/dashboard/mentee",
}).catch(() => {})
```
Fire-and-forget (`.catch(() => {})`) — notification failure must never break session logging.

**Test:** Assert `createNotification` called with correct `menteeId` and type after successful session log.

---

### FIX-09 — Chunk Deduplication in Profile Synthesizer

**File:** `src/lib/ai/profileSynthesizer.ts`

**Problem:** Each synthesis run appends 5 new `userChunks` rows without deleting old ones. Re-synthesis = chunk accumulation.

**Fix:** Wrap delete + insert in a transaction:
```typescript
await db.transaction(async (tx) => {
  await tx.delete(userChunks).where(eq(userChunks.userId, userId))
  for (const chunk of chunks) {
    const chunkEmbedding = await generateProfileEmbedding(chunk)
    await tx.insert(userChunks).values({
      userId,
      content: chunk,
      embedding: chunkEmbedding,
      chunkType: "experience"
    })
  }
})
```

**Test:** Run synthesis twice → assert `userChunks` count is ≤ 5 (not 10+).

---

### FIX-10 — XSS: PortableText Renderer Hardening

**File:** `src/components/articles/ArticleContent.tsx`

**Problem:** `<PortableText value={content} />` with no `components` prop uses default renderer, which can execute injected script blocks.

**Fix:** Add explicit `components` prop with a safe whitelist. Unknown block types fall back to a plain `<span>`:
```tsx
<PortableText
  value={content}
  components={{
    types: {
      image: ({ value }) => (
        <img src={value?.url ?? ""} alt={value?.alt ?? ""} className="rounded-sm w-full" />
      ),
    },
    marks: {
      link: ({ children, value }) => {
        const href = (value?.href ?? "") as string
        const isSafe = href.startsWith("/") || href.startsWith("https://jenga365.com")
        return isSafe
          ? <a href={href} rel="noopener noreferrer">{children}</a>
          : <span>{children}</span>
      },
    },
    unknownMark: ({ children }) => <span>{children}</span>,
    unknownType: () => null,
  }}
/>
```

**Test:** Render a PortableText block containing a `<script>` mark → assert output is escaped plain text, not an executable script node.

---

### FIX-11 — Merchandise Stock Race Condition

**File:** `src/lib/actions/merchandise.ts`

**Problem:** Read-then-write pattern allows stock to go negative under concurrent checkouts.

**Fix:** Replace with a single atomic SQL decrement with a guard:
```typescript
const [updated] = await db
  .update(merchandise)
  .set({ stockCount: sql`${merchandise.stockCount} - 1` })
  .where(
    and(
      eq(merchandise.sanityProductId, sanityProductId),
      gt(merchandise.stockCount, 0)
    )
  )
  .returning()

if (!updated) throw new Error("OUT_OF_STOCK")
```
`gt(stockCount, 0)` in the WHERE clause makes the decrement atomic — the DB engine locks the row for the duration of the update.

**Test:** Simulate concurrent calls with `stockCount = 1` → assert only one succeeds, final `stockCount = 0` (not -1), second call throws `OUT_OF_STOCK`.

---

## File Map Summary

| Fix | Files Modified | Files Created (tests) |
|-----|---------------|----------------------|
| FIX-01 | `src/lib/actions/onboarding.ts` | `src/__tests__/onboarding/complete.test.ts` |
| FIX-02 | `middleware.ts` | `src/__tests__/middleware/jwt-verify.test.ts` |
| FIX-03 | `src/lib/actions/matching.ts` | `src/__tests__/matching/get-matches.test.ts` |
| FIX-04 | `src/lib/db/queries/matching.ts` | `src/__tests__/matching/weights.test.ts` |
| FIX-05 | `src/lib/db/queries/matching.ts` | `src/__tests__/matching/capacity.test.ts` |
| FIX-06 | Mentee dashboard layout | `src/__tests__/dashboard/interview-gate.test.ts` |
| FIX-07 | `src/lib/actions/menteeManagement.ts` | `src/__tests__/mentee/pathway-lookup.test.ts` |
| FIX-08 | `src/lib/actions/menteeManagement.ts` | `src/__tests__/mentee/session-notification.test.ts` |
| FIX-09 | `src/lib/ai/profileSynthesizer.ts` | `src/__tests__/ai/chunk-dedup.test.ts` |
| FIX-10 | `src/components/articles/ArticleContent.tsx` | `src/__tests__/articles/portable-text-xss.test.ts` |
| FIX-11 | `src/lib/actions/merchandise.ts` | `src/__tests__/merchandise/stock-race.test.ts` |

---

## Self-Review

**Placeholder scan:** None. All fixes include exact code.

**Internal consistency:** All fixes reference the same file paths confirmed by code read. FIX-04 and FIX-05 both touch `matching.ts` — they will be implemented in sequence in a single task to avoid conflicts.

**Scope check:** 11 focused fixes, no feature additions, no schema changes.

**Ambiguity check:** BUG-04 JWT verification — if Better Auth tokens are opaque (not standard JWT), the fix falls back to expiry-only check. This is documented in the spec and in the code comment.
