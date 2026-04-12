# Jenga365 AI Platform — Final Implementation Plan

**Last Updated:** 2026-04-03  
**Overall Status:** ~90% Complete — Production Readiness Pending  
**Production Target:** TBD

---

## Completion Summary

| Phase | Area | Status |
|-------|------|--------|
| 1 | Project Cleanup & Standardization | ✅ Complete |
| 2 | High-Fidelity Marketing UI | ✅ Complete |
| 3 | Sanity CMS & Neon DB Connectivity | ✅ Complete |
| 4 | Payment Workflows & Commerce | ✅ Complete |
| 5 | Notifications, CSR, 2FA, Settings | ✅ Complete |
| 6 | AI Onboarding & Matching Engine | ✅ Complete |
| 7 | Role-Specific Dashboard Finalization | ✅ Complete |
| 8 | Testing, QA & Deployment | 🔴 Not Started |

---

## What Is Built (Confirmed Complete)

### Infrastructure
- **Database**: 47-table Drizzle ORM schema on Neon PostgreSQL with pgvector (768-dim)
- **Auth**: Better Auth v1.4 — email/password, 2FA plugin configured, 5 roles + moderator scopes
- **Middleware**: NDA gate, auth protection, role-based routing at `/middleware.ts`
- **Email**: Resend service with template definitions
- **Payments**: Paystack inline checkout + HMAC-verified webhook handler
- **CMS**: Sanity v5 with 10 schema types, per-role Studio routes
- **Rate Limiting**: Upstash Redis configured
- **Storage**: AWS S3 / Cloudflare R2 integration

### Pages & Routes
- All public marketing pages (Home, About, Articles, Events, Resources, Contact, Donate, Shop, Help, Impact)
- Complete registration flows for all 3 user types (Mentee, Mentor, Corporate)
- Email verification, pending approval, moderator invite, admin setup pages
- NDA signing page at `(auth)/legal/nda`
- Dashboard route structure for all 5 roles with sidebar + layout
- Article detail pages + public filtering grid

### Components
- Header state machine (Public / Minimal / Authenticated — all states correct)
- All marketing sections aligned to Stitch specs
- About page (8 sections complete)
- Article editor + author list
- Shop cart client with Paystack checkout
- Partner sub-report pages (Financial, Metrics, Donate, Stories)
- Moderator dashboard (most complete at 13KB)
- Dashboard shared components (RoleSidebar, DashboardHeader, etc.)

---

## Phase 5 — Missing Features
**Status: ✅ Complete**

### 5.1 Profile Settings & Account Security
- [x] `/dashboard/settings` page — display name, location, GDPR export (`src/components/dashboard/SettingsPage.tsx`)
- [x] 2FA setup UI — full TOTP enable/verify/disable flow using `authClient.twoFactor.*`; QR code, backup codes, manual key entry
- [x] `src/lib/actions/settings.ts` — `updateProfile()` and `requestDataExport()` server actions

### 5.2 Notification Engine
- [x] `notifications` table in schema
- [x] `src/lib/notifications/service.ts` — `createNotification()`, `getUnreadNotifications()`, `markAsRead()`, `markAllAsRead()`
- [x] `NotificationBell.tsx` — unread badge + dropdown, polls every 30s
- [x] Hooked into: `nda.ts`, `mentorship.ts`, `moderation.ts`, Paystack webhook

### 5.3 CSR Engine
- [x] `src/lib/actions/csr.ts` — `getCsrStats()` aggregates mentees sponsored, donations, active mentorships, projects
- [x] Wired to Partner dashboard page

### 5.4 Real-Time Features
- [x] SWR 30s polling on notification bell
- [x] AI chat streaming via Vercel AI SDK `useChat` → `/api/chat/route.ts`

---

## Phase 6 — AI Onboarding & Matching Engine
**Status: ✅ Complete**

### 6.1 AI Interviewer
- [x] 5-phase interview system prompt in `src/lib/ai/interviewer.ts` (Amani AI, outputs `COMPLETED_INTERVIEW` signal)
- [x] `AIInterviewerChat.tsx` — `useChat` hook → `/api/chat`, detects completion signal
- [x] `/api/chat/route.ts` — Gemini 2.0 Flash, trims to last 12 messages, `maxTokens: 512`
- [x] Dashboard entry point: `/dashboard/profile` (optional, non-blocking for all 3 roles)
- [x] `AIProfileClient.tsx` — handles interview → synthesis pipeline in dashboard

### 6.2 Embedding Generation Pipeline
- [x] `src/lib/ai/profileSynthesizer.ts` — fetches user + assets, calls Gemini 1.5 Pro, generates 768-dim embedding, stores in `users.embedding`; guards against re-embedding
- [x] Triggered from `completeOnboarding()` (fire-and-forget) and `triggerAiProfileSynthesis()` action
- [x] Document chunking pipeline in `src/lib/ai/documentProcessor.ts`

### 6.3 AI Matchmaking
- [x] `getAiMentorMatches()` in `src/lib/actions/matching.ts` — pgvector cosine similarity, pre-filtered by role + approval
- [x] Wired to Mentee dashboard via `src/app/dashboard/mentee/page.tsx`
- [x] `requestMentor()`, `acceptMentorRequest()`, `declineMentorRequest()` actions in `mentorship.ts`

---

## Phase 7 — Dashboard Finalization
**Status: ✅ Complete**

### 7.1 Mentee Dashboard
- [x] AI matches via `getAiMentorMatches()` → `AiMentorMatches.tsx`
- [x] Learning pathway via `getMenteeLearningPathway()` → `LearningPathwayTracker.tsx`
- [x] Mood journal via `getMenteeMoodJournal()` → journal entries rendered
- [x] Dedicated pages: `/dashboard/pathway`, `/dashboard/journal`

### 7.2 Mentor Dashboard
- [x] Pending request queue via `getMentorPendingRequests()` → `MentorshipQueue.tsx`
- [x] Active mentee count via `getMentorActiveMentees()`
- [x] Upcoming sessions via `getMentorUpcomingSessions()` (date filter fixed) → `UpcomingSessions.tsx`

### 7.3 Corporate Partner Dashboard
- [x] CSR stats via `getCsrStats()` → impact metrics panel
- [x] Sponsored mentors list from `users` where `partnerId` matches
- [x] Upcoming events from `events` table

### 7.4 Moderator Dashboard
- [x] Approval queue via `getPendingUsers()` → approve/reject/suspend actions
- [x] Article moderation via `getArticlesInReview()` → approve/reject actions

### 7.5 Admin Dashboard
- [x] Full user list via `getAllUsers()` with live stats (total, pending, active mentors/mentees)
- [x] User action menu (approve, reject, suspend) via `moderation.ts` actions

---

## Phase 8 — Testing, QA & Deployment
**Status: 🔴 Not Started**  
**Priority: FINAL**

### 8.1 Pre-Launch Checklist

**Environment:**
- [ ] Rotate Paystack keys from `pk_test_dummy` to real test keys in `.env`
- [ ] Confirm `BETTER_AUTH_URL` matches staging domain
- [ ] Enable `requireEmailVerification: true` in `src/lib/auth/config.ts`
- [ ] Verify Resend domain is authenticated (DNS records set)

**Security:**
- [ ] Audit all server actions — confirm every action calls `auth.api.getSession()` before mutating
- [ ] Confirm `middleware.ts` correctly gates all `/dashboard/*` routes
- [ ] Verify RBAC: no Mentee can access `/dashboard/admin` or `/dashboard/moderator`
- [ ] Check Paystack webhook: HMAC signature verification cannot be bypassed
- [ ] Confirm `.env` is in `.gitignore` (already done, verify before deploy)

**Manual Test Journeys** (run in order):

1. **Guest** — All public pages load, Paystack donate, shop checkout
2. **Mentee** — Register → email verify → NDA → AI interview → dashboard → see matches
3. **Mentor** — Register → pending approval → Moderator approves → dashboard → accept mentee
4. **Corporate Partner** — Register → pending → Admin approves → CSR dashboard
5. **Moderator** — Receive invite → setup → dashboard → approve users, moderate articles
6. **SuperAdmin** — `/admin-setup/[token]` → 2FA → shadow view, NDA versioning

### 8.2 Optimization
- [ ] Replace all `src/data/mockData.ts` and `src/data/mockDashboards.ts` references with live DB queries (search for `mockData` imports across dashboard components)
- [ ] Audit for unused `client` components that could be server components
- [ ] Add `loading.tsx` files for all dashboard routes
- [ ] Add `metadata` exports to all public marketing pages for SEO
- [ ] Run `next build` and fix any TypeScript/build errors

### 8.3 Production Deploy
- [ ] Switch Sanity dataset from `development` to `production`
- [ ] Switch Neon DB from dev branch to main branch
- [ ] Set all env vars in Vercel project settings
- [ ] Deploy to Vercel, confirm domain, test live payments

---

## Critical Fixes Required Before Any Testing

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | Paystack keys are placeholder (`pk_test_dummy`) | `.env` | Set real Paystack test keys |
| 2 | `requireEmailVerification` is `false` | `src/lib/auth/config.ts:~L40` | Set to `true` for staging |
| 3 | `onboarding.ts` always redirects to `/dashboard/mentee` regardless of role | `src/lib/actions/onboarding.ts:L29` | Read user role and redirect accordingly |
| 4 | No `notifications` table in schema | `src/lib/db/schema.ts` | Add table, run migration |
| 5 | Mock data used in dashboard components | `src/data/mockData.ts` | Replace with DB queries |

---

## File Structure Reference (Clean State)

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/          # Better Auth handler
│   │   ├── chat/                   # AI chat endpoint
│   │   ├── cron/impact-report/     # Scheduled worker
│   │   ├── email/preview/          # Email preview (dev)
│   │   ├── onboarding/complete/    # Onboarding completion
│   │   └── webhooks/paystack/      # Payment webhooks
│   ├── (auth)/                     # Login, register, NDA, verify, pending
│   ├── (marketing)/                # All public pages
│   ├── dashboard/                  # All role dashboards
│   └── 403/, error.tsx, not-found.tsx
├── components/
│   ├── ui/                         # shadcn/ui base components
│   ├── shared/                     # Header, Logo, UserAvatar, RoleGuard
│   ├── auth/                       # Registration steps, AI chat
│   ├── dashboard/{Admin,Mentee,Mentor,Moderator,Partner}/
│   ├── marketing/ + marketing/about/
│   ├── articles/, reports/, resources/, onboarding/
│   └── sanity/
├── lib/
│   ├── actions/                    # Server actions (mutations)
│   ├── ai/                         # Embeddings, interviewer, synthesizer
│   ├── auth/                       # Better Auth config + helpers
│   ├── db/                         # Drizzle schema + queries
│   ├── email/                      # Resend service + templates
│   ├── notifications/              # (TO CREATE — Phase 5.2)
│   ├── paystack/                   # Checkout + webhook verification
│   └── sanity/                     # CMS client + queries
├── scripts/                        # Migration & seed scripts only
│   ├── combined-migrate.ts
│   ├── force-migrate.ts
│   ├── force-reset-superadmin.ts
│   ├── migrate-neon.ts
│   ├── migrate-onboarded.ts
│   └── seed-superadmin-only.ts
└── sanity/schemaTypes/             # CMS document type definitions
```

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 App Router | |
| Auth | Better Auth v1.4 | 2FA plugin installed, needs UI |
| Database | Neon Postgres + Drizzle ORM | 47 tables, pgvector enabled |
| CMS | Sanity v5 | 10 schema types |
| AI | Vercel AI SDK + Google Gemini | text-embedding-004 for vectors |
| Payments | Paystack | Keys must be rotated from dummy |
| Styling | Tailwind CSS v4 + shadcn/ui | DM Mono + Montserrat typography |
| Animations | Framer Motion | |
| Email | Resend | Domain must be verified |
| Storage | Cloudflare R2 | For avatar uploads |
| Vectors | pgvector 768-dim | Cosine similarity for matching |
| Rate Limiting | Upstash Redis | Configured |
