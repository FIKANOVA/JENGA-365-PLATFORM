# 🏁 STRATEGIC CONTEXT: THE DUAL-ENGINE MODEL
Jenga365 (2026-2027) operates under the **"Dual-Engine"** development initiative, shifting from ad-hoc activities to a **Results-Based Management (RBM)** system.

### Core Philosophy: The "Total Athlete"
We bridge the gap between potential and performance by focusing on:
- **Engine A: Human & Social Capital** — Mental resilience, financial literacy, and professional networks.
- **Engine B: Environmental & Social Stewardship** — Tangible impact through "The Green Game" and community welfare.

---

# 👥 MODULE 1 — ADVANCED RBAC & OPERATIONAL BRAIN

### 1A. Role Hierarchy
Define and implement a robust, database-backed RBAC system for the following five roles. Every protected route and UI element must resolve against this hierarchy:

- **SuperAdmin** — Full platform access, financial reports, user deletion, global config
- **Moderator** — Content moderation, mentor approval queue, article review
- **CorporatePartner** — ESG impact dashboard, employee mentor management, CSR reporting
- **Mentor** — Mentee request inbox, article authoring, meeting scheduler
- **Mentee** — AI Matching interface, learning pathway tracker, webinar access

### 1B. The Legal Intercept (NDA Gate)
Design a Next.js Middleware (middleware.ts) that:
- Intercepts ALL requests to `/dashboard/*` routes
- Checks the `nda_signatures` table for a valid, verified signature linked to the authenticated user
- If unsigned, redirects to `/legal/nda` — a full-screen, non-bypassable NDA signing page
- On signature submission, stores the following in `nda_signatures`: cryptographic SHA-256 hash of the document, user IP address, precise UTC timestamp, user agent string, and document version number
- Only after a verified record exists does the middleware allow dashboard access

### 1C. Corporate CSR Engine (The "Unlock Challenge")
Build a dedicated logic layer for CorporatePartner users that:
- **Gamified Resource Release**: Implements the "Unlock Challenge" — pledged resources (e.g., school packs, seedlings) are released only when specific community milestones are hit (e.g., 500 trees planted).
- **ESG/ROI Analysis**: Calculates Sponsorship ROI based on outcome metrics: survival rate of trees, job placement success, and mentee "Social Networth" expansion.
- **Employee Stewardship**: Tracks employee volunteer hours via the "Power Hour" protocol (max 1 focused hour/month) and squad rotation status.
- **Impact Reporting**: Renders a live CSR Impact Dashboard with exportable PDF ESG Reports integrating Sanity success stories and verified Neon activity logs.

---

# 🎨 MODULE 2 — THE INTELLIGENT FRONTEND (UI/UX 2026 STANDARD)

### 2A. Universal Landing Page (Marketing Site)
Build the full home/landing page with the following sections in order:

**Navigation Bar:**
- Logo (left)
- Mega-menu (center): About | Mentors | Mentees | Resources ▾ (Articles, Downloads, Videos) | Voices (X-Spaces/Threads) | Events ▾ (Webinars, Clinics) | Impact ▾ (Social, Environmental) | Contact
- The mega-menu must adapt to login state: authenticated users see dashboard links; guests see Sign Up / Login
- Top-right: prominent "Donate" CTA button (Stripe link, high-contrast colour)

**Hero Section:**
- Full-width, high-conversion layout
- Primary CTA: "Sign Up" button
- Secondary CTA: "Donate Now" (Paystack Checkout link)
- Dynamic sub-headline pulling live stats (e.g., "482 mentors. 1,200 youth impacted.")

**Impact Pulse Ticker:**
- Real-time horizontally scrolling data stream
- Fetches live aggregates: total mentorship hours logged, clinic attendance count, trees planted, active partnerships

**Upcoming Events Grid:**
- Fetches from Sanity CMS (events schema)
- Displays Webinars and Rugby Clinics in a responsive card grid
- Each card: event title, date, location/online badge, "Register" CTA

**Top Articles Section:**
- Fetches top 3–4 articles from Sanity (sorted by views or publish date)
- Card layout with author avatar, title, excerpt, read time

**Partner Logo Carousel:**
- Auto-scrolling, infinitely looping carousel of corporate partner logos
- Logos fetched from `corporate_partners` table (with fallback to Sanity)

**Footer:**
- Links: About, Privacy Policy, Terms of Service, NDA info, Contact
- Social icons for X (Twitter), Instagram, LinkedIn, WhatsApp

### 2B. Agentic Onboarding (Chat-Based Profile Builder)
Replace all standard registration forms with an AI Interviewer built on the Vercel AI SDK:
- A conversational chat UI (`/onboarding`) that greets the user and asks structured questions
- The AI synthesises responses to:
  - Determine the user's intended role (Mentor vs. Mentee)
  - Extract goals, skills, location, availability, and areas of interest
  - Auto-generate a structured profile object
  - Generate a `pgvector` embedding from the profile summary and store it in the `users` table
- The entire onboarding flow replaces both the Mentor and Mentee intake forms

### 2C. Role-Specific Dashboards
Build a `DashboardSwitch` component that reads the authenticated user's role from session and renders the correct portal:

**Mentor Dashboard:**
- Mentee request management panel (Accept / Decline / Defer)
- AI-assisted article drafting (pre-filled outline based on mentor's expertise tags)
- Meeting scheduler (integrated calendar invite generation)
- Personal impact stats (hours logged, mentees active, rating average)

**Mentee Dashboard:**
- AI Matching interface (shows top 5 recommended mentors with match % scores)
- Learning Pathway progress tracker (milestone checklist linked to mentor assignments)
- Webinar access hub (upcoming + recorded, gated by attendance log)
- Goal-setting widget linked to mentor's session notes

**Moderator Dashboard:**
- Approval Queue: List of "Pending Mentor" applications with AI-generated profile summaries. One-click Approve/Reject with optional moderator notes
- Content Moderation: Article review queue — view draft, approve for publish, or flag with inline comment
- Audit Log: Timestamped record of all moderation actions

**Admin (SuperAdmin) Dashboard:**
- Global Impact Dashboard: Charts for education metrics, trees planted, match success rates, clinic attendance (use Recharts or Chart.js)
- "Shadow View": Admins can view any mentor/mentee partnership's Learning Pathway for quality assurance
- User Management: Full CRUD on all users, role reassignment, account suspension
- Financial Overview: Donation totals, merchandise revenue, partner contribution sums

**Corporate Partner Dashboard:**
- CSR impact metrics (as defined in Module 1C)
- Employee mentor roster with status and performance
- Sponsorship tier display and renewal CTA
- Downloadable ESG/Impact Report (PDF)

---

# 🛒 MODULE 3 — COMMERCIAL & SUPPORT MODULES

### 3A. Donation Page (`/donate`)
Stripe-integrated page supporting:
- One-time donations (custom amount input)
- Recurring donations (monthly subscription via Stripe Subscriptions)
- Donation amounts pre-set as quick-select buttons (e.g., R50 / R100 / R250 / Custom)
- On successful payment webhook from Stripe:
  - Insert record into `donations` table (amount, currency, stripe_payment_intent_id, user_id, timestamp)
  - Tag the user with a "Supporter" badge in the `user_badges` table
  - Trigger a thank-you email (via Resend or SendGrid)

### 3B. Merchandise Store (`/shop`)
- Product gallery built with Next.js + Stripe Product/Price API
- Products: Jenga365 jerseys, hats, training gear, and branded items
- Each product card: image (Cloudflare R2), name, price, size selector, "Add to Cart" CTA
- Checkout via Paystack Checkout (hosted or embedded)
- On successful order webhook:
  - Insert into `orders` table (stripe_session_id, product_id, user_id, quantity, status, amount)
  - Tag the purchasing user as "Supporter" in `user_badges`
  - Update `merchandise.stock_count` (decrement)
  - Attribute net profit to "Impact Fund" record in the database

### 3C. Resource Library (`/resources`)
- Searchable, filterable database of:
  - Articles (authored in Sanity, filterable by topic/author)
  - Downloads (PDF documents, stored on Cloudflare R2, gated by role if needed)
  - Videos (embedded or linked, with view tracking)
- Full-text search powered by Sanity's built-in GROQ search
- Filters: content type, topic tag, date range, author

---

# 🤖 MODULE 4 — THE AI INTELLIGENCE LAYER

### 4A. The Matching Engine
Build a Drizzle/SQL function using pgvector that performs a Hybrid Search:
```sql
-- Pseudo-logic (generate real Drizzle query)
SELECT mentors.*,
  1 - (mentors.embedding <=> mentee.embedding) AS semantic_score
FROM users AS mentors
WHERE mentors.role = 'Mentor'
  AND mentors.is_approved = true
  AND mentors.location_region = mentee.location_region  -- Hard filter
  AND mentors.partner_id = mentee.preferred_partner_id  -- Optional hard filter
  AND (SELECT COUNT(*) FROM mentorship_pairs WHERE mentor_id = mentors.id AND status = 'active') < 2 -- 1:2 Capacity Protocol
ORDER BY semantic_score DESC
LIMIT 5;
```
The matching function must combine:
- **Semantic Similarity** (cosine distance between `pgvector` embeddings of user goals/profiles)
- **Hard Filters**: location/region, role, partner affiliation, availability status
- Return top 5 matches with a calculated `match_percentage` score displayed in the Mentee UI

### 4B. AI Interviewer (Agentic Onboarding)

As detailed in Module 2B — the Vercel AI SDK chat flow that:
- Streams responses in real time to the user
- Maintains a structured `interviewState` object server-side
- On completion, calls an API route (`/api/onboarding/complete`) that:
  1. Generates a text embedding from the profile summary via OpenAI `text-embedding-3-small`
  2. Saves the full profile + embedding to the `users` table
  3. Triggers the NDA signing redirect if not yet signed
  4. Redirects to the role-appropriate dashboard

### 4C. Background Impact Worker

A Vercel Cron Job (or Edge Function scheduled task) that runs nightly:
- Queries Sanity for new "Success Stories"
- Queries Neon for all new "Activity Logs" (mentorship sessions, clinic check-ins, donations)
- Aggregates data into a structured `impact_reports` table entry
- Optionally generates a downloadable PDF Social Impact Report on demand

---

# 🗄️ MODULE 5 — COMPLETE DRIZZLE SCHEMA (`schema.ts`)

Generate the **complete, production-ready** Drizzle ORM schema covering every table below. All tables must use UUIDs as primary keys, include `created_at` and `updated_at` timestamps, and be fully type-safe.

**Required Tables:**
```
users                  — id, name, email, role (enum), is_approved, location_region,
                         embedding (vector 1536), badge_ids[], partner_id (FK), created_at

nda_signatures         — id, user_id (FK), document_version, sha256_hash, ip_address,
                         user_agent, signed_at

corporate_partners     — id, org_name, logo_url, contact_email, sponsorship_tier,
                         employee_count, impact_trees_planted, impact_hours_contributed,
                         paystack_customer_id, created_at

mentorship_pairs       — id, mentor_id (FK→users), mentee_id (FK→users), status (enum:
                         pending/active/completed), matched_at, match_score, partner_id (FK)

learning_pathways      — id, pair_id (FK→mentorship_pairs), milestones (jsonb), progress_%,
                         last_updated

sessions_log           — id, pair_id (FK→mentorship_pairs), duration_minutes, notes,
                         session_date, logged_by

donations              — id, user_id (FK), amount, currency, stripe_payment_intent_id,
                         is_recurring, fund_allocation, donated_at

merchandise            — id, stripe_product_id, name, description, price, stock_count,
                         image_url (R2), category, is_active

orders                 — id, user_id (FK), stripe_session_id, status (enum), total_amount,
                         items (jsonb), impact_fund_contribution, ordered_at

user_badges            — id, user_id (FK), badge_type (enum: Supporter/Verified/TopMentor),
                         awarded_at, awarded_by

events                 — id, title, type (enum: Webinar/Clinic), description, date,
                         location, is_online, capacity, attendee_ids[], sanity_doc_id

event_attendees        — id, event_id (FK), user_id (FK), registered_at, attended (bool)

articles               — id, author_id (FK→users), sanity_doc_id, title, status (enum:
                         draft/review/published), views, published_at

moderation_log         — id, moderator_id (FK→users), action_type, target_id,
                         target_type, notes, actioned_at

impact_reports         — id, report_period, total_mentorship_hours, total_donations,
                         trees_planted, clinics_held, youth_engaged, generated_at
```

---

# 🗂️ MODULE 6 — FRONTEND COMPONENT DIRECTORY STRUCTURE

Generate the complete file/folder map for the project:
```
/app
  /(marketing)
    /page.tsx                        ← Landing page (home)
    /about/page.tsx
    /donate/page.tsx
    /shop/page.tsx
    /resources/page.tsx
    /events/page.tsx
    /impact/page.tsx
    /contact/page.tsx
    /voices/page.tsx
    /legal/nda/page.tsx

  /(auth)
    /login/page.tsx
    /register/page.tsx
    /onboarding/page.tsx             ← AI Interviewer chat

  /(dashboard)
    /layout.tsx                      ← Middleware-protected layout + DashboardSwitch
    /mentor/page.tsx
    /mentee/page.tsx
    /admin/page.tsx
    /moderator/page.tsx
    /partner/page.tsx

/components
  /marketing
    /HeroSection.tsx
    /ImpactTicker.tsx
    /EventsGrid.tsx
    /ArticlesSection.tsx
    /PartnerCarousel.tsx
    /MegaMenu.tsx
    /DonateButton.tsx
    /Footer.tsx

  /dashboard
    /DashboardSwitch.tsx
    /RoleSidebar.tsx
    /admin
      /GlobalImpactChart.tsx
      /UserManagementTable.tsx
      /ShadowView.tsx
      /FinancialOverview.tsx
    /moderator
      /ApprovalQueue.tsx
      /ContentModerationPanel.tsx
      /AuditLog.tsx
    /mentor
      /MenteeRequestPanel.tsx
      /ArticleDraftAssistant.tsx
      /MeetingScheduler.tsx
    /mentee
      /MatchingInterface.tsx
      /LearningPathwayTracker.tsx
      /WebinarHub.tsx
    /partner
      /CSRDashboard.tsx
      /EmployeeMentorRoster.tsx
      /ImpactReportDownload.tsx

  /onboarding
    /AIInterviewerChat.tsx
    /ProfileSummaryPreview.tsx

  /shop
    /ProductGrid.tsx
    /ProductCard.tsx
    /CartDrawer.tsx

  /legal
    /NDADocument.tsx
    /SignatureCapture.tsx

  /shared
    /BadgeDisplay.tsx
    /ImpactStatCard.tsx
    /UserAvatar.tsx
    /RoleGuard.tsx                   ← HOC for role-gated UI

/lib
  /db
    /schema.ts
    /index.ts
    /queries
      /matching.ts                   ← pgvector hybrid search
      /impact.ts
      /users.ts
  /ai
    /interviewer.ts                  ← Vercel AI SDK agent
    /embeddings.ts
  /stripe
    /checkout.ts
    /webhooks.ts
  /auth
    /config.ts                       ← Better Auth config
  /sanity
    /client.ts
    /queries.ts

/middleware.ts                       ← NDA intercept + Auth guard
```

---

# 📊 MODULE 7 — OPERATIONAL WORKFLOW (Mentor Registration Sequence)

Generate a detailed **sequence diagram** (as Mermaid code) and written explanation of the following flow:
```
User visits /register
  → AI Interviewer chat begins (/onboarding)
    → Profile + embedding generated
      → Redirect to /legal/nda
        → NDA signed → hash + IP + timestamp stored in nda_signatures
          → User status set to "Pending Approval"
            → Moderator sees user in Approval Queue
              → Moderator reviews AI-generated profile summary
                → Moderator clicks "Approve"
                  → user.is_approved = true
                    → User receives email notification
                      → User can now log into Mentor Dashboard
                        → Mentees with matching vectors begin seeing them in Matching Interface
```

---

# 💰 MODULE 8 — COST & SCALE STRATEGY
Provide a detailed monthly and annual cost breakdown for this full stack, specifically targeting sub-$10/month for the first 1,000 users while remaining production-ready and scalable to 10,000+ users.

| Service | Free Tier Limit | Paid Trigger | Est. Cost @1k users |
|---|---|---|---|
| Vercel (Pro) | 100GB bandwidth | >100GB | ~$0 (Hobby) |
| Neon (Postgres) | 0.5 GB storage | >0.5GB | ~$0–$19 |
| Sanity.io | 10GB assets, 3 users | >3 editors | ~$0 |
| Cloudflare R2 | 10GB storage/mo | >10GB | ~$0 |
| Better Auth | Self-hosted | — | ~$0 |
| Stripe | % per transaction | Per sale | ~2.9% + 30c |
| OpenAI Embeddings | Pay-per-use | Per call | ~$0.02/1k calls |
| **Total** | | | **~$0–$5/mo** |

Include a strategy note on how to defer costs using ISR, edge caching, and Neon's connection pooling.
