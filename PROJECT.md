# PROJECT.md — Permanent Context Block

## What We're Building
**Jenga365 AI Platform**: A dual-engine development initiative at the intersection of high-performance sport and sustainable community development.
- **Engine A**: Human & Social Capital Development (Mental resilience, financial literacy for athletes).
- **Engine B**: Environmental & Social Stewardship (Mobilizing athletes for environmental restoration).

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js 16 (App Router) | |
| **Language** | TypeScript / React 19 | |
| **Auth** | Better Auth v1.4 | 2FA plugin installed; UI not yet built |
| **Database** | Neon Postgres (Serverless) + Drizzle ORM | 47 tables; pgvector enabled (768-dim) |
| **CMS** | Sanity v5 | 10 schema types; per-role Studio access |
| **AI Layer** | Vercel AI SDK + Google Gemini | `gemini-2.0-flash` for chat; `text-embedding-004` for 768-dim vectors |
| **Payments** | Paystack (Inline JS) | Keys are currently placeholder — must rotate |
| **Styling** | Tailwind CSS v4 + shadcn/ui | DM Mono (headings/labels) + Montserrat (body) |
| **Animations** | Framer Motion | |
| **Email** | Resend | Domain must be verified before staging |
| **Storage** | Cloudflare R2 | Avatar uploads |
| **Vectors** | pgvector (768-dim cosine similarity) | Used for AI mentor matching |
| **Rate Limiting** | Upstash Redis | Configured |

---

## Architecture

- **Routing**: App Router with Route Groups (`(marketing)`, `(auth)`) and consolidated dashboards at top-level `/dashboard/*`.
- **RBAC & Security**: 6 Roles — Mentee, Mentor, CorporatePartner, Moderator, Admin, SuperAdmin. NDA Gate enforced for all roles before dashboard access.
- **Middleware**: `middleware.ts` at root — handles auth protection, NDA redirects, and role-based routing. Do not bypass.
- **Logic**: Server Actions in `src/lib/actions/` for all database mutations. Shared utils for rate limiting and ENV validation.
- **CMS Integration**: All dynamic content (articles, events, products, resources) flows through Sanity Studio.
- **AI Matching**: Cosine distance (`<=>`) via pgvector. Pre-filter by role + `isApproved = true` before vector search. Top N = 50 candidate pool max.
- **Notifications**: Currently planned, not implemented. Target: `src/lib/notifications/service.ts` + `NotificationBell.tsx`.
- **Mock Data**: Dashboard components still import from `src/data/mockData.ts` — must be replaced with live DB queries before production.

---

## Coding Rules

- **Modern Standards**: Use React 19 hooks and Next.js 16 patterns.
- **Styling**: Stick to Tailwind v4 and shadcn/ui. Maintain the premium dark-mode/glassmorphism aesthetic.
- **Data Flow**: Server Actions for mutations. Use `@tanstack/react-query` or SWR for complex client-side state (e.g., matching engine, notification polling).
- **AI Token Efficiency**: Cache system prompts per session. Trim chat history to last 12 messages. Set `maxTokens` on all `streamText` calls. Only embed users where `onboarded = true`.
- **Documentation Sync**: Keep this file updated as features land or decisions change.
- **Architecture Integrity**: Do not bypass middleware for route protection. Every server action must call `auth.api.getSession()` before mutating.

---

## Directory Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/          # Better Auth handler
│   │   ├── chat/                   # AI chat (Gemini streaming)
│   │   ├── cron/impact-report/     # Scheduled CSR worker
│   │   ├── onboarding/complete/    # Onboarding completion endpoint
│   │   └── webhooks/paystack/      # HMAC-verified payment webhook
│   ├── (auth)/                     # Login, register, NDA, verify, pending, moderator-invite
│   ├── (marketing)/                # All public pages
│   ├── dashboard/                  # All role dashboards (mentee, mentor, partner, moderator, admin)
│   └── 403/, error.tsx, not-found.tsx
├── components/
│   ├── ui/                         # shadcn/ui base components
│   ├── shared/                     # Header, Logo, UserAvatar, NotificationBell (planned)
│   ├── auth/                       # Registration steps, AI interview chat shell
│   ├── dashboard/{Admin,Mentee,Mentor,Moderator,Partner}/
│   ├── marketing/, onboarding/, articles/, reports/, resources/
│   └── sanity/
├── lib/
│   ├── actions/                    # Server actions (auth, onboarding, matching, settings)
│   ├── ai/                         # embeddings.ts, interviewer.ts, profileSynthesizer.ts (planned)
│   ├── auth/                       # Better Auth config + session helpers
│   ├── db/                         # Drizzle schema (47 tables) + query files
│   ├── email/                      # Resend templates
│   ├── notifications/              # (TO CREATE — Phase 5)
│   ├── paystack/                   # Inline checkout + webhook HMAC
│   └── sanity/                     # CMS client + query functions
├── data/
│   └── mockData.ts                 # ⚠️ Replace all references before production
└── docs/                           # Specs, strategy, legal templates, user journeys
```

---

## Feature Status

### Completed (Phases 1–4)
- [x] Project cleanup, route group standardization, typography
- [x] High-fidelity marketing UI (Home, About, Articles, Events, Resources, Shop, Donate, Impact, Contact, Help)
- [x] Registration & auth flows for Mentee, Mentor, Corporate Partner
- [x] Email verification, pending approval, moderator invite, admin setup pages
- [x] NDA signing page + middleware NDA gate
- [x] Dashboard layout shells for all 5 roles (sidebar + layout, routing correct)
- [x] Sanity CMS wiring — events, partners, resources, articles (with fallback data)
- [x] Neon DB schema (47 tables, Drizzle ORM, pgvector)
- [x] Paystack donation + shop checkout (inline JS)
- [x] Paystack webhook — HMAC-verified, handles `charge.success`, inserts donations/orders
- [x] Article editor + author list + public article grid
- [x] Better Auth v1.4 — email/password, 5 roles, moderator scopes
- [x] Header state machine — public / minimal / authenticated states

### Completed (Phases 5–7)
- [x] Account settings page — profile update, location, GDPR data export (`src/components/dashboard/SettingsPage.tsx`)
- [x] 2FA setup UI — full TOTP enable/verify/disable flow wired to Better Auth `twoFactor` plugin
- [x] Notification engine — `notifications` table, `src/lib/notifications/service.ts`, server actions, `NotificationBell` component with 30s polling
- [x] CSR engine — `getCsrStats()` action wired to Partner dashboard
- [x] Real-time polling — 30s SWR polling on notification bell; mentor queue queries via live DB
- [x] AI Interviewer — fully wired in dashboard at `/dashboard/profile` (optional, non-blocking); `AIProfileClient.tsx` handles completion + triggers profile synthesis
- [x] Embedding pipeline — `profileSynthesizer.ts` complete; triggered on AI interview completion
- [x] AI Matchmaking — `getAiMentorMatches()` uses pgvector cosine similarity; wired to Mentee dashboard
- [x] All 5 role dashboards — live DB queries; mock data replaced
- [x] `getMentorUpcomingSessions` — date filter fixed (`gte(sessionDate, now)`)
- [x] AI Interview in sidebar — `BrainCircuit` nav link for Mentee, Mentor, CorporatePartner roles

### Remaining (Phase 8 — Production Readiness)
- [ ] Rotate Paystack keys from placeholder to real test keys in `.env`
- [ ] Set `requireEmailVerification: true` in `src/lib/auth/config.ts` once Resend domain is verified
- [ ] End-to-end manual testing for all 6 user journeys (see `docs/TESTING_GUIDE.md`)
- [ ] Replace Sanity dataset from `development` → `production`
- [ ] Set all env vars in Vercel project settings and deploy

---

## User Journey Summary

| Role | Entry | Approval Required | Key Dashboard Features |
|------|-------|-------------------|------------------------|
| Mentee | Register → NDA → Dashboard | No | Matches, Learning Pathway, Mood Journal, Sessions, AI Chat, AI Interview (optional) |
| Mentor | Register → NDA → Pending → Dashboard | Yes (Admin/Moderator) | Request Queue, Active Mentees, Sessions, Article Drafts, AI Interview (optional) |
| Corporate Partner | Register → NDA → Pending → Dashboard | Yes (Admin) | CSR Metrics, Donation History, Impact Reports, AI Interview (optional) |
| Moderator | Invite email → `/moderator-invite/[token]` | Admin-assigned | Approve Users, Moderate Articles |
| Admin | DB-assigned | SuperAdmin | User Management, Content, Events, Moderator Invites |
| SuperAdmin | `/admin-setup/[token]` (one-time) | Self-seeded | Platform Settings, Role Promotion, Audit Log |

> **AI Interview**: Available to Mentee, Mentor, and Corporate Partner roles. Lives inside the dashboard — it is optional and non-blocking. Completing it generates a profile embedding that improves AI match quality, but users have full platform access regardless.

---

## Critical Fixes Before Any Testing

| # | Issue | Location | Fix Required |
|---|-------|----------|--------------|
| 1 | Paystack keys are placeholder (`pk_test_dummy`) | `.env` | Rotate to real Paystack test keys |
| 2 | `requireEmailVerification` is `false` | `src/lib/auth/config.ts` | Set to `true` for staging |
| 3 | `onboarding.ts` always redirects to `/dashboard/mentee` | `src/lib/actions/onboarding.ts:L29` | Read `user.role` and redirect accordingly |
| 4 | No `notifications` table in schema | `src/lib/db/schema.ts` | Add table, run `drizzle-kit push` |
| 5 | `/onboarding` has no NDA guard | `src/app/(auth)/onboarding/page.tsx` | Verify `user.ndaSigned === true` before rendering |
| 6 | Mentor meeting pref not saved | `src/app/(auth)/register/mentor/page.tsx` | Persist to `metadata` or extended `onboarding_data` table |
| 7 | Corporate org type/contribution type not saved | `src/app/(auth)/register/corporate/page.tsx` | Same as above |
| 8 | Hardcoded 45% completeness on pending page | `src/app/(auth)/pending-approval/page.tsx` | Compute dynamically from user record |

---

## Architectural Decisions

- **Paystack** selected as primary payment gateway (East Africa / Kenya focus).
- **Dashboard Consolidation**: All dashboards moved from `(dashboard)` route group to top-level `/dashboard/` to resolve Next.js routing conflicts.
- **Middleware at Root**: Single `middleware.ts` for all global route logic — auth, NDA, role gating.
- **Sanity for Content**: All dynamic project content (stories, events, resources) must flow through Sanity CMS.
- **Polling over WebSockets**: Use SWR `refreshInterval` (30s) for real-time-like notifications — avoids infrastructure complexity.
- **AI Model**: `gemini-2.0-flash` for conversational AI; `text-embedding-004` (768-dim) for vector embeddings.
- **Embedding Strategy**: Embed once at onboarding completion. Guard with `if (user.embedding) return` to avoid re-embedding.
- **Mock Data**: All `src/data/mockData.ts` imports must be replaced with live Drizzle queries before launch. Track via `grep -r "mockData"` across components.

---

## Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| User Journeys | `docs/USER_JOURNEYS.md` | Full screen flows, bug list, token efficiency tips |
| Implementation Plan | `plans/IMPLEMENTATION_PLAN.md` | Phase-by-phase task breakdown |
| Design System | `docs/specs/DESIGN_SYSTEM_SPEC.md` | Typography, colour, component specs |
| Screen Flow | `docs/specs/SCREEN_FLOW_V2.md` | Full routing map |
| Module Specs | `docs/specs/MODULE_*.md` | Feature-level specifications |
| Audit Report | `FINAL_TEST_RESULT_AUDIT.md` | Phase 1–4 completion audit |
