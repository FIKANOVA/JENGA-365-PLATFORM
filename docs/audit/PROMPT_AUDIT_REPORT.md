## 🔍 JENGA365 MEGA-PROMPT AUDIT REPORT v1.0

---

### AUDIT METHODOLOGY

Each module is evaluated across five dimensions:

| Dimension | What It Checks |
|---|---|
| **Completeness** | Are all features fully specified with no gaps? |
| **Consistency** | Do cross-module references align without contradiction? |
| **Use Case Coverage** | Are all user types and their journeys fully addressed? |
| **Edge Case Handling** | Are failure states, errors, and unusual paths defined? |
| **Implementation Readiness** | Is the spec detailed enough to generate production code without guesswork? |

Rating scale: ✅ Complete · ⚠️ Partial · ❌ Missing

---

## SECTION 1 — MODULE-BY-MODULE AUDIT

---

### MODULE 1 — RBAC & Operational Brain

| Check | Status | Finding |
|---|---|---|
| All 5 roles defined | ✅ | SuperAdmin, Moderator, CorporatePartner, Mentor, Mentee all specified |
| Role hierarchy order defined | ⚠️ | Hierarchy implied but not explicitly ranked (e.g., can Moderator override CorporatePartner?) |
| Permission matrix documented | ❌ | **MISSING** — No explicit table of which role can access which route/action |
| NDA gate covers all roles | ⚠️ | Gate defined for dashboard access but unclear if CorporatePartner registration also triggers NDA |
| NDA re-sign on version change | ✅ | Covered in Module 9.6 |
| Corporate CSR engine logic | ✅ | ROI metrics, employee tracking, PDF export all specified |
| Role assignment flow | ❌ | **MISSING** — How does a user get assigned a role? At registration? After moderator approval? Who assigns CorporatePartner role? |

**Fixes Required:**
```
ADD: Explicit RBAC permission matrix table
ADD: Role assignment flow — who assigns each role and when
CLARIFY: Does NDA gate apply to CorporatePartner registration flow?
CLARIFY: Can a user hold multiple roles (e.g., a Mentor who is also a CorporatePartner employee)?
```

---

### MODULE 2 — Intelligent Frontend

| Check | Status | Finding |
|---|---|---|
| Landing page sections ordered | ✅ | Hero → Ticker → Events → Articles → Partners → Footer |
| Mega-menu all routes defined | ✅ | All 14+ routes listed |
| Login-state menu adaptation | ✅ | Authenticated vs guest states defined |
| Mobile navigation specified | ❌ | **MISSING** — Mega-menu mobile behaviour (hamburger? drawer? bottom nav?) not defined |
| DashboardSwitch component | ✅ | Role-based render logic specified |
| AI Onboarding flow | ✅ | 5-phase interview, ambiguity handling, error loops all covered |
| Guest/unauthenticated dashboard access | ✅ | Middleware blocks, redirects to NDA/login |
| Empty states for dashboards | ❌ | **MISSING** — What does a brand new Mentor see before any mentees? What does a Mentee see before being matched? |
| Loading states | ❌ | **MISSING** — Skeleton loaders, suspense boundaries not specified |
| Mentor dashboard — no mentees yet state | ❌ | **MISSING** |
| Mentee dashboard — no match yet state | ❌ | **MISSING** |
| 404 / error pages | ❌ | **MISSING** — Custom error boundaries and 404 page not specified |

**Fixes Required:**
```
ADD: Mobile navigation pattern (recommend: hamburger → slide-in drawer for <768px)
ADD: Empty state designs for all 5 dashboards
ADD: Loading skeleton specifications for data-heavy components
ADD: Custom 404 page and global error.tsx boundary spec
ADD: Suspense boundary placement map
```

---

### MODULE 3 — Commercial & Support

| Check | Status | Finding |
|---|---|---|
| Donation one-time flow | ✅ | Stripe Checkout, amount presets, webhook handling |
| Recurring donation flow | ✅ | Stripe Subscriptions covered |
| Donation cancellation/management | ❌ | **MISSING** — How does a recurring donor cancel or change their plan? No donor portal defined |
| Merchandise checkout | ✅ | Stripe Checkout, order table, stock decrement |
| Merchandise returns/refunds | ❌ | **MISSING** — No refund policy flow or Stripe refund webhook handler specified |
| Resource Library search | ✅ | Sanity GROQ full-text search specified |
| Resource access gating | ⚠️ | "Gated by role if needed" — vague. Which resources require which role? |
| PDF download tracking | ✅ | Covered in activity_log spec (Module 9.4) |
| Video view tracking | ✅ | Covered in activity_log spec |
| Supporter badge on purchase | ✅ | user_badges table, webhook trigger defined |
| Guest checkout (non-authenticated purchase) | ❌ | **MISSING** — Can someone buy merchandise or donate without an account? |
| Stripe webhook idempotency | ❌ | **MISSING** — No idempotency key handling specified for duplicate webhook events |
| Order confirmation email | ⚠️ | Mentioned for donations but not explicitly for merchandise orders |

**Fixes Required:**
```
ADD: Recurring donor self-service cancellation flow (Stripe Customer Portal link)
ADD: Refund/return policy flow + Stripe refund webhook handler
CLARIFY: Resource access control matrix (which content is public vs role-gated)
ADD: Guest checkout decision (recommend: allow guest donations/purchases, prompt account creation post-checkout)
ADD: Stripe webhook idempotency handling using stripe_event_id deduplication
ADD: Order confirmation email trigger in merchandise webhook handler
```

---

### MODULE 4 — AI Intelligence Layer

| Check | Status | Finding |
|---|---|---|
| Matching engine algorithm | ✅ | pgvector hybrid search, weights, thresholds all defined |
| Embedding generation | ✅ | Profile Intent Document pattern, model specified |
| Embedding staleness handling | ✅ | embedding_stale flag + cron job defined |
| Match rejection by mentee | ✅ | rejectMatch() server action listed |
| Match rejection by mentor | ⚠️ | Mentor can "Decline" from request panel but full flow after decline not specified (notify mentee? re-queue them?) |
| Maximum match attempts | ❌ | **MISSING** — What happens if a Mentee has rejected all 5 recommended mentors? Do they get a new batch? Is there a cooldown? |
| AI Interviewer hallucination guard | ❌ | **MISSING** — No validation on AI-synthesised profile output before it's saved to DB |
| Embedding for CorporatePartner | ✅ | Mentioned in Module 9.3 |
| Background Impact Worker schedule | ✅ | Nightly Vercel Cron specified |
| Worker failure handling | ❌ | **MISSING** — What happens if the nightly cron job fails? No retry or alerting logic defined |
| AI content moderation | ❌ | **MISSING** — The AI Interviewer and Article Drafting assistant have no content moderation filter specified (toxic content, off-topic inputs) |
| Rate limiting on AI endpoints | ❌ | **MISSING** — No rate limiting on /api/ai/interview to prevent abuse |

**Fixes Required:**
```
ADD: Post-decline mentee re-queuing flow (new batch after all 5 rejected, 7-day cooldown recommended)
ADD: Mentor decline notification to mentee + re-queue trigger
ADD: Zod schema validation on AI-synthesised profile output before DB write
ADD: AI content moderation layer (OpenAI moderation endpoint or Anthropic equivalent) on all AI input/output
ADD: Cron job failure alerting (email SuperAdmin on failure, retry logic with exponential backoff)
ADD: Rate limiting on /api/ai/interview (recommend: 10 req/min per IP using Upstash Ratelimit)
```

---

### MODULE 5 — Drizzle Schema

| Check | Status | Finding |
|---|---|---|
| All core tables defined | ✅ | 15 tables fully listed with column types |
| Foreign key relationships | ✅ | All FKs listed |
| Cascade delete rules | ❌ | **MISSING** — What happens to mentorship_pairs when a user is deleted? Cascade? Soft delete? |
| Soft delete pattern | ❌ | **MISSING** — No `deleted_at` column specified for any table (critical for compliance/audit) |
| Indexes specified | ❌ | **MISSING** — No database indexes defined (pgvector index, email unique index, user_id indexes on join tables) |
| Row Level Security (RLS) | ❌ | **MISSING** — Neon supports Postgres RLS. No RLS policies specified for sensitive tables |
| activity_log table | ✅ | Fully defined in Module 9.4 |
| nda_documents table | ✅ | Defined in Module 9.6 |
| stock_notifications table | ✅ | Defined in Module 9.8 |
| Data archiving strategy | ❌ | **MISSING** — No archiving policy for old session logs, activity logs (these will grow unboundedly) |
| GDPR/POPIA data fields | ❌ | **MISSING** — No `consent_given_at`, `data_deletion_requested_at`, or `marketing_opt_in` fields specified |

**Fixes Required:**
```
ADD: Soft delete pattern — deleted_at: timestamp | null on users, mentorship_pairs, articles
ADD: Cascade rules — define ON DELETE behaviour for every FK relationship
ADD: Database index specification:
     - users: CREATE INDEX ON users USING ivfflat (embedding vector_cosine_ops)
     - users: CREATE UNIQUE INDEX ON users (email)
     - activity_log: CREATE INDEX ON activity_log (user_id, created_at DESC)
     - mentorship_pairs: CREATE INDEX ON mentorship_pairs (mentor_id, mentee_id)
ADD: GDPR/POPIA compliance fields on users table
ADD: Data retention policy for activity_log (recommend: archive records >2 years to cold storage)
ADD: Postgres RLS policies for sensitive tables (nda_signatures, session_log, donations)
```

---

### MODULE 6 — Frontend Directory Structure

| Check | Status | Finding |
|---|---|---|
| App Router structure | ✅ | Route groups correctly using (marketing), (auth), (dashboard) |
| All page routes mapped | ✅ | 20+ routes defined |
| API routes mapped | ✅ | Full /api directory specified in Module 9.9 |
| Server Actions directory | ✅ | /lib/actions fully mapped |
| Shared component library | ✅ | /components/shared defined |
| About page components | ✅ | Full component map in Module 10.3 |
| Missing: middleware.ts location | ✅ | Root level specified |
| Missing: types directory | ❌ | **MISSING** — No /types or /lib/types directory for shared TypeScript interfaces |
| Missing: constants directory | ❌ | **MISSING** — No /lib/constants for role enums, impact weights, score thresholds |
| Missing: hooks directory | ❌ | **MISSING** — useInView, useDebounce, useMatchScore etc. not mapped |
| Missing: providers directory | ❌ | **MISSING** — Auth provider, toast provider, query client wrapper not specified |
| Email templates | ❌ | **MISSING** — No /emails directory for React Email templates (thank-you, approval, rejection) |

**Fixes Required:**
```
ADD to directory structure:
  /types
    /index.ts          ← All shared TypeScript interfaces (User, Match, Order etc.)
    /database.ts       ← Drizzle inferred types
  /lib/constants
    /roles.ts          ← Role enum and permission matrix
    /impact.ts         ← Action taxonomy weights from Module 9.4
    /matching.ts       ← Score weights and thresholds from Module 9.3
  /hooks
    /useInView.ts
    /useMatchScore.ts
    /useImpactTicker.ts
  /providers
    /AuthProvider.tsx
    /ToastProvider.tsx
    /QueryProvider.tsx
  /emails
    /WelcomeEmail.tsx
    /ApprovalEmail.tsx
    /RejectionEmail.tsx
    /DonationThankYou.tsx
    /OrderConfirmation.tsx
    /RestockNotification.tsx
    /NDAResignRequired.tsx
```

---

### MODULE 7 — Operational Workflow

| Check | Status | Finding |
|---|---|---|
| Mentor registration sequence | ✅ | Full flow from register → match |
| Mentee registration sequence | ❌ | **MISSING** — Only Mentor flow diagrammed. Mentee flow is different (no approval queue) |
| CorporatePartner onboarding | ❌ | **MISSING** — No sequence diagram for partner registration and portal activation |
| Donation flow sequence | ❌ | **MISSING** — Stripe Checkout → webhook → badge → email sequence not diagrammed |
| Merchandise order sequence | ❌ | **MISSING** — Order → fulfillment → stock update → impact attribution not diagrammed |
| Moderator approval workflow | ⚠️ | Described in Module 9.1 but no formal sequence diagram |
| NDA re-sign trigger sequence | ⚠️ | Logic described in Module 9.6 but no diagram |
| Match acceptance sequence | ❌ | **MISSING** — What happens step-by-step after a Mentee accepts a match? |

**Fixes Required:**
```
ADD Mermaid sequence diagrams for:
  1. Mentee registration → onboarding → matching → first session
  2. CorporatePartner → portal activation → employee mentor management
  3. Donation → Stripe webhook → badge award → email
  4. Merchandise order → fulfillment → impact fund attribution
  5. Match acceptance → pair creation → learning pathway init → first session log
  6. NDA version update → user re-intercept → re-sign → access restored
```

---

### MODULE 8 — Cost & Scale Strategy

| Check | Status | Finding |
|---|---|---|
| Base cost table | ✅ | All services with free tier limits listed |
| Scale strategy narrative | ✅ | ISR, edge caching, connection pooling mentioned |
| OpenAI embedding cost calculation | ⚠️ | "$0.02/1k calls" stated but not calculated against expected usage (1,000 users onboarding = 1,000 embedding calls at launch) |
| Stripe fee calculation | ⚠️ | "2.9% + 30c" listed but no example monthly revenue scenario shown |
| Cost at 10,000 users | ❌ | **MISSING** — Only 1,000 user scenario covered |
| Neon storage growth projection | ❌ | **MISSING** — activity_log will grow rapidly; no storage projection |
| R2 bandwidth cost projection | ❌ | **MISSING** — Merchandise images, PDF reports, profile photos all on R2 |
| Vercel function execution cost | ❌ | **MISSING** — AI interview streaming functions are long-running; Vercel charges for execution time |

**Fixes Required:**
```
ADD: Cost projection table at three scales: 100 users / 1,000 users / 10,000 users
ADD: Neon storage growth estimate (activity_log row size × daily actions × users)
ADD: Vercel function execution budget (AI streaming endpoints are expensive — recommend max_duration cap)
ADD: R2 egress cost estimate for merchandise imagery
ADD: Monthly embedding cost realistic scenario (assume 50 new users/month × re-embed on update)
```

---

### MODULE 9 — Detailed Specifications Addendum

| Check | Status | Finding |
|---|---|---|
| All 5 dashboard KPIs defined | ✅ | Mentor, Mentee, Moderator, Admin, Partner all fully specced |
| AI Interviewer personality | ✅ | Tone, phases, error loops all defined |
| Ambiguity handling | ✅ | 6 scenarios covered |
| Embedding strategy | ✅ | Profile Intent Document pattern, model, thresholds |
| Activity log taxonomy | ✅ | 17 action types with impact weights |
| Sanity schemas | ✅ | Events, Articles, Person, SuccessStory, RugbyClinic, Voices |
| NDA versioning | ✅ | Format, workflow, re-sign trigger |
| Shadow View spec | ✅ | Access levels, UI, audit logging |
| Inventory management | ✅ | Low stock alerts, variants, Stripe sync |
| API architecture | ✅ | Route Handlers vs Server Actions decision matrix |
| Notification system | ⚠️ | Email notifications referenced but no in-app notification system specified |
| Real-time features | ❌ | **MISSING** — Impact Ticker fetches via polling but no WebSocket/SSE spec for truly real-time data |
| Accessibility (a11y) | ❌ | **MISSING** — No WCAG compliance requirements specified anywhere in the prompt |
| Internationalisation | ❌ | **MISSING** — Platform is Kenya-based; no i18n strategy (Swahili support?) defined |

**Fixes Required:**
```
ADD: In-app notification system spec (bell icon, unread count, notification types, mark-as-read)
CLARIFY: Impact Ticker real-time strategy — polling interval (recommend 30s) vs SSE
ADD: Accessibility requirements (recommend WCAG 2.1 AA as minimum standard)
ADD: i18n decision — English only for MVP, or Swahili support planned? 
     If planned: add next-intl to stack and /messages/en.json + /messages/sw.json
```

---

### MODULE 10 — About Page

| Check | Status | Finding |
|---|---|---|
| All 8 sections defined | ✅ | Hero through CTA Strip all specced |
| Tripartite Model component | ✅ | Cards, colours, hover animation, mobile accordion |
| Timeline component | ✅ | 4 nodes, exact copy, animation spec |
| Team grid | ✅ | Data array, fallback avatar, conditional social icons |
| Partner carousel | ✅ | CSS keyframes, greyscale hover |
| Testimonials | ✅ | Two cards, hover glow |
| SEO metadata | ✅ | title, description, OpenGraph |
| Animation spec | ✅ | All 8 element animations defined |
| Component file locations | ✅ | Full path map |
| AI generation instruction | ✅ | Explicit file-by-file generation order |
| Responsive breakpoints | ⚠️ | Mobile/tablet mentioned but no explicit breakpoint values defined |
| Dark/light mode | ❌ | **MISSING** — No theme toggle specified; dark assumed but not locked |
| Image optimisation | ⚠️ | CDN URLs referenced but Next.js Image component (`next/image`) not explicitly required |

**Fixes Required:**
```
ADD: Explicit breakpoint definitions (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
CLARIFY: Dark mode only, or system-preference toggle? (recommend: dark-only for MVP)
ADD: All <img> tags replaced with next/image with width, height, and priority on hero images
```

---

## SECTION 2 — USER JOURNEY COVERAGE MATRIX

This maps every user type against every critical journey to confirm full coverage:

| Journey | Guest | Mentee | Mentor | Moderator | SuperAdmin | CorporatePartner |
|---|---|---|---|---|---|---|
| Land on homepage | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View About page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Register account | ✅ | ✅ | ✅ | ❌ | ❌ | ⚠️ |
| Complete AI onboarding | — | ✅ | ✅ | — | — | ⚠️ |
| Sign NDA | — | ✅ | ✅ | — | — | ✅ |
| Access dashboard | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Get matched | — | ✅ | — | — | — | — |
| Accept/reject a match | — | ✅ | ✅ | — | — | — |
| Log a session | — | — | ✅ | — | — | — |
| Submit session feedback | — | ✅ | — | — | — | — |
| Draft & submit article | — | — | ✅ | — | — | — |
| Approve/reject mentor | — | — | — | ✅ | ✅ | — |
| Moderate article | — | — | — | ✅ | ✅ | — |
| Shadow a pair | — | — | — | — | ✅ | — |
| Make a donation | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Buy merchandise | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Access resource library | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Register for event | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View CSR dashboard | — | — | — | — | — | ✅ |
| Download ESG report | — | — | — | — | ✅ | ✅ |
| Manage user roles | — | — | — | — | ✅ | — |
| Publish NDA version | — | — | — | — | ✅ | — |
| Re-sign updated NDA | — | ✅ | ✅ | — | — | ✅ |
| Cancel recurring donation | — | ⚠️ | ⚠️ | — | — | ⚠️ |
| Request account deletion | — | ❌ | ❌ | — | — | — |

**Legend:** ✅ Fully covered · ⚠️ Partially covered · ❌ Gap identified · — Not applicable

**Critical Gaps from Matrix:**

```
❌ Moderator & Admin registration — how are these accounts created?
   RECOMMENDATION: SuperAdmin creates Moderator accounts directly from Admin Dashboard
   (no public registration for privileged roles)

❌ CorporatePartner registration flow — is this self-serve or invite-only?
   RECOMMENDATION: Invite-only. SuperAdmin sends an invite link (signed JWT, 48hr expiry)
   that pre-seeds the role and links to the partner's org record

❌ Account deletion / GDPR right-to-erasure request
   ADD: Self-service account deletion flow in user profile settings
   Trigger: soft delete (deleted_at timestamp), anonymise PII, cancel Stripe subscriptions,
   retain aggregate impact data (anonymised)

⚠️ Guest donation & merchandise purchase — define whether account is required
   RECOMMENDATION: Allow guest checkout for both. Post-purchase: prompt
   "Create an account to track your impact and earn your Supporter badge"

⚠️ CorporatePartner AI onboarding — the interviewer is defined for Mentor/Mentee only
   ADD: Phase 2 branch for CorporatePartner in the AI Interviewer
   (org name, sector, team size, CSR focus areas, sponsorship tier interest)

⚠️ Recurring donation cancellation — no self-service portal defined
   ADD: Stripe Customer Portal link in Mentee/Mentor/Partner profile settings
   for subscription management (cancel, upgrade, update payment method)
```

---

## SECTION 3 — EDGE CASE COVERAGE AUDIT

| Edge Case | Covered | Resolution |
|---|---|---|
| User submits NDA then clears browser cookies | ✅ | Server-side check on `nda_signatures` table, not session |
| Mentor is approved then account suspended | ⚠️ | Suspension defined but active pair notification not specified |
| Mentee's matched mentor becomes inactive | ❌ | No re-matching trigger on mentor deactivation |
| Two moderators approve same mentor simultaneously | ❌ | No optimistic lock or duplicate approval guard |
| Stripe webhook delivered twice (duplicate event) | ❌ | No idempotency handling |
| User uploads inappropriate profile photo | ❌ | No image moderation on R2 uploads |
| pgvector index not yet built (cold start) | ❌ | No fallback matching strategy |
| Sanity CMS is down (events/articles fail to load) | ❌ | No graceful degradation / stale-while-revalidate for Sanity fetches |
| NDA document hash mismatch on re-verify | ❌ | No handling if stored hash doesn't match current document |
| AI Interviewer produces empty embedding | ❌ | No fallback if embedding generation fails |
| Merchandise stock goes negative (race condition) | ❌ | No database-level stock lock on concurrent purchases |
| Partner's Stripe subscription lapses | ❌ | No partner portal access revocation on payment failure |
| User registers with an email already in system | ✅ | Unique email index catches this |
| Admin accidentally deletes active mentor | ⚠️ | Soft delete defined but mentee notification not specified |

**Critical Edge Case Fixes:**
```
ADD: Re-matching trigger — when a Mentor is deactivated/suspended, 
     all active mentees get notified and re-entered into matching queue

ADD: Optimistic locking on moderator approval — 
     use a status enum (pending → reviewing → approved/rejected) 
     with a reviewed_by FK to prevent double-approval

ADD: Stripe webhook idempotency — 
     store processed stripe_event_ids in a webhook_events table; 
     check before processing

ADD: Image moderation on R2 upload — 
     run uploaded profile photos through a moderation API 
     (recommend: AWS Rekognition or OpenAI Vision) before storing

ADD: Sanity fallback — 
     use next: { revalidate: 3600 } on all Sanity fetches; 
     if fetch fails, serve last cached version with a 
     "Content may be temporarily unavailable" banner

ADD: Stock race condition guard — 
     use Postgres SELECT ... FOR UPDATE on merchandise.stock_count 
     within the order transaction to prevent overselling

ADD: Partner access revocation — 
     Stripe invoice.payment_failed webhook sets 
     corporate_partners.is_active = false and locks portal access

ADD: Embedding failure fallback — 
     if embedding generation fails, save profile with 
     embedding_status: 'pending' and retry via cron; 
     exclude from matching until embedding exists
```

---

## SECTION 4 — SECURITY AUDIT

| Security Concern | Covered | Severity |
|---|---|---|
| Auth on all dashboard routes | ✅ | — |
| NDA cryptographic verification | ✅ | — |
| Role guard on Server Actions | ✅ | — |
| Stripe webhook signature verification | ⚠️ | 🔴 High — mentioned but `constructEvent` raw body requirement not explicitly flagged |
| SQL injection via Drizzle | ✅ | Drizzle parameterises by default |
| XSS via Sanity Portable Text | ❌ | 🔴 High — Sanity's PortableText must use a sanitised renderer |
| CSRF protection | ⚠️ | 🟡 Medium — Next.js Server Actions have built-in CSRF but Route Handlers do not |
| Rate limiting on auth endpoints | ❌ | 🔴 High — No rate limiting on /api/auth/* routes |
| Sensitive data in client components | ❌ | 🟡 Medium — No instruction to keep embeddings, NDA hashes server-side only |
| R2 signed URLs for private files | ❌ | 🟡 Medium — Role-gated downloads need signed R2 URLs, not public URLs |
| pgvector data leakage via API | ❌ | 🟡 Medium — Embeddings should never be returned to the client |
| Admin Shadow View access log | ✅ | moderation_log covers this |

**Security Fixes:**
```
ADD: Explicit Stripe raw body parsing instruction — 
     Route Handler must use req.text() not req.json() for webhook verification

ADD: Sanity PortableText sanitisation — 
     use @portabletext/react with a custom components map; 
     never use dangerouslySetInnerHTML with Sanity content

ADD: Rate limiting on auth endpoints — 
     add Upstash Ratelimit to /api/auth/* (recommend: 5 attempts/15min per IP)

ADD: R2 signed URL generation for gated resources — 
     role-gated PDFs/downloads served via pre-signed R2 URLs (1hr expiry), 
     never public bucket URLs

ADD: Strip embeddings from API responses — 
     all user query responses must explicitly exclude the embedding column: 
     db.select({ id: users.id, name: users.name ... }).from(users) 
     (never SELECT *)
```

---

## SECTION 5 — CONSOLIDATED FIXES SUMMARY

### 🔴 Critical (Blocker — must fix before generating code)

1. **RBAC permission matrix** — explicit role-to-route-to-action table required
2. **Role assignment flow** — how each role is assigned at registration or by admin
3. **Stripe webhook idempotency** — duplicate event handling
4. **Stripe raw body parsing** — webhook signature verification requirement
5. **Sanity PortableText XSS** — sanitised renderer required
6. **Stock race condition guard** — `SELECT FOR UPDATE` on merchandise checkout
7. **Re-matching on mentor deactivation** — orphaned mentees must be handled
8. **Empty/loading states for all dashboards** — undefined UX states block frontend build

### 🟡 Important (Should fix before launch)

9. **Guest checkout decision** — donation and merchandise without account
10. **CorporatePartner registration flow** — invite-only vs self-serve
11. **Account deletion / GDPR erasure** — legal requirement (POPIA applies in Kenya/SA)
12. **Moderator double-approval lock** — optimistic locking on approval queue
13. **Embedding failure fallback** — graceful degradation for matching
14. **R2 signed URLs for gated content** — security for role-gated downloads
15. **Mobile navigation pattern** — hamburger/drawer spec for mega-menu
16. **In-app notification system** — bell icon, unread count, notification types
17. **Recurring donation cancellation** — Stripe Customer Portal link

### 🟢 Nice to Have (Post-MVP)

18. **i18n strategy** — Swahili support decision
19. **Accessibility (WCAG 2.1 AA)** — formal a11y requirements
20. **Dark mode toggle** — vs dark-only for MVP
21. **Cost projection at 10k users** — scale planning
22. **Data archiving policy** — activity_log retention
23. **pgvector cold start fallback** — keyword matching as backup
24. **Partner Stripe subscription lapse** — access revocation
25. **AI content moderation filter** — on interviewer inputs/outputs
