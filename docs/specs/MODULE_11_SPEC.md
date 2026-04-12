# MODULE 11 — COMPLETE USER FLOW ARCHITECTURE & ROLE ASSIGNMENT SPECIFICATION

---

### 11.1 — The Four Entry Points (How Users Enter the System)

There are exactly **four registration pathways** into Jenga365. Each pathway assigns a role at the point of sign-up, not after. The role is never ambiguous from the moment an account is created.

```
jenga365.com/register
        │
        ├──► "I want to find a mentor"           → Mentee registration flow
        ├──► "I want to mentor someone"           → Mentor registration flow  
        ├──► "We are an organisation / partner"   → CorporatePartner registration flow
        └──► (No public path)                     → Moderator (SuperAdmin-created only)
                                                  → SuperAdmin (seeded at deploy time only)
```

The `/register` page renders **three large role-selection cards** before any form fields appear. The user must explicitly choose their path. There is no default role. Selecting a card locks the role into the session and routes to the appropriate onboarding flow.

---

### 11.2 — JOURNEY 0: The General / Unregistered User (Guest)

This is the most important journey to get right — it is the first impression for every future user.

#### Who They Are
Anyone visiting jenga365.com without an account: curious youth, parents, potential donors, journalists, rugby coaches, corporate CSR managers browsing before committing.

#### What They Can Access (Full Public Surface)

| Page / Feature | Access | Notes |
|---|---|---|
| `/` — Homepage | ✅ Full | Hero, Impact Ticker, Events grid, Articles, Partner carousel |
| `/about` — About page | ✅ Full | Full Module 10 content, team, timeline |
| `/resources/articles` | ✅ Full | All published articles visible and readable |
| `/resources/videos` | ✅ Full | Embeds visible |
| `/resources/downloads` | ⚠️ Preview only | File title, description visible; download requires account |
| `/events` — Events listing | ✅ Full | Can browse all events |
| `/events/[id]` — Event detail | ✅ Full | Can view details; registration requires account |
| `/impact` — Impact page | ✅ Full | Public metrics, success stories |
| `/voices` — X Spaces/Threads | ✅ Full | Read-only embed |
| `/donate` | ✅ Full | Can donate as guest via Stripe (no account required) |
| `/shop` | ✅ Full | Can browse and purchase as guest via Stripe |
| `/contact` | ✅ Full | Contact form (no auth required) |
| `/mentors` — Mentor directory | ⚠️ Preview only | See mentor cards with name + expertise; full profile requires account |
| `/dashboard/*` | ❌ Blocked | Middleware redirects to `/register` |
| `/legal/nda` | ❌ Blocked | Only accessible to authenticated users |

#### Guest → Conversion Touchpoints

Every page must present at least one conversion prompt. These are the exact moments and CTAs:

```
Homepage Hero:         "Join Now" (primary) + "Donate" (secondary)
Mentor Directory:      "Sign up to connect with a mentor" (gate on profile click)
Article bottom:        "Join Jenga365 to access exclusive resources and mentorship"
Event registration:    "Create a free account to register for this event"
Resource download:     "Sign up to download this resource"
Shop post-purchase:    "Create an account to track your impact and earn your Supporter badge"
Donation post-payment: "Create an account to see the impact of your donation"
```

#### Guest Paystack Checkout Flow (Donation & Merchandise)

```
Guest clicks "Donate Now"
  → Paystack Checkout opens (no auth required)
    → Payment completed
      → Stripe webhook fires
        → donations table: user_id = NULL, guest_email stored
          → Thank-you page: "Your generosity matters."
            → Prompt: "Create an account to track your impact"
              → If user registers with same email post-purchase:
                → Backfill user_id on existing donation record
                → Award Supporter badge retroactively
```

---

### 11.3 — JOURNEY 1: Sign Up as a Mentee

#### Entry Point
`/register` → Select "I want to find a mentor" card → role pre-set to `Mentee`

#### Full Registration Sequence

```
Step 1: Role Selection
  /register
  User clicks "I want to find a mentor"
  → Session stores: intended_role = 'Mentee'
  → Redirect to /register/mentee

Step 2: Account Creation (Basic Credentials)
  Fields: First name, Last name, Email, Password, Confirm password
  Validation: Email uniqueness check (real-time), password strength meter
  Server Action: createAccount({ email, password, role: 'Mentee' })
  → User record created with:
      role: 'Mentee'
      is_approved: TRUE  ← Mentees are auto-approved (no queue)
      onboarding_complete: FALSE
      email_verified: FALSE
  → Verification email sent (click-to-verify link, 24hr expiry)

Step 3: Email Verification
  User clicks link in email
  → email_verified: TRUE
  → Redirect to /onboarding/mentee

Step 4: AI Interviewer Onboarding (Mentee Phase)
  The AI Interviewer runs the Mentee branch of the 5-phase flow:
    Phase 1: Confirm role (already known — skip or confirm)
    Phase 2: Current situation (student / employed / between opportunities)
             Age range, location (city, province/county)
    Phase 3: Primary challenge + 6-month goals
             Areas of interest (rugby / career / education / mental wellness)
             Skills they want to develop
    Phase 4: Availability (hours/month, preferred days)
             Communication preference (video / messaging / in-person)
             Preferred mentor traits (industry, seniority, gender preference optional)
    Phase 5: Profile summary confirmation
  → On confirm: profile saved, pgvector embedding generated
  → Redirect to /legal/nda

Step 5: NDA Signing
  /legal/nda — full-screen, non-bypassable
  User reads NDA, clicks "I agree and sign"
  → nda_signatures record created (hash, IP, timestamp, version)
  → Redirect to /dashboard/mentee

Step 6: Mentee Dashboard (First Visit — Empty State)
  Banner: "Welcome to Jenga365! Your mentor matches are being prepared."
  CTA: "Update your goals" (improves match quality)
  Status: Matching engine runs within 5 minutes of onboarding completion
  → Top 5 mentor recommendations appear in Matching Interface
```

#### Mentee Approval Logic
Mentees are **auto-approved**. No moderator queue. Rationale: mentees are the platform's primary beneficiaries and require the lowest friction path to access. The AI Interviewer + NDA gate provides sufficient qualification.

#### Mentee Status States
```
pending_verification  → email not yet verified
onboarding           → email verified, interview not complete
nda_pending          → interview complete, NDA not signed
active               → fully onboarded, in matching pool
matched              → has at least one active mentorship pair
suspended            → admin action
deleted              → soft deleted
```

---

### 11.4 — JOURNEY 2: Sign Up as a Mentor

#### Entry Point
`/register` → Select "I want to mentor someone" card → role pre-set to `Mentor`

#### Full Registration Sequence

```
Step 1: Role Selection
  /register
  User clicks "I want to mentor someone"
  → Session stores: intended_role = 'Mentor'
  → Redirect to /register/mentor

Step 2: Account Creation (Basic Credentials)
  Fields: First name, Last name, Email, Password, Confirm password,
          Professional title (e.g., "Rugby Coach" / "Financial Analyst")
  Server Action: createAccount({ email, password, role: 'Mentor' })
  → User record created with:
      role: 'Mentor'
      is_approved: FALSE  ← Mentors require moderator approval before activation
      onboarding_complete: FALSE
      email_verified: FALSE
  → Verification email sent

Step 3: Email Verification
  → email_verified: TRUE
  → Redirect to /onboarding/mentor

Step 4: AI Interviewer Onboarding (Mentor Branch)
    Phase 1: Confirm role
    Phase 2: Professional background
             Domain expertise (rugby / business / education / tech / law / finance / other)
             Current employer (optional), years of experience
             LinkedIn URL (optional but encouraged)
    Phase 3: Mentoring goals + motivation
             "What does success look like for a mentee you've worked with?"
             Areas they can help with (career guidance / athletic training / 
             financial literacy / mental resilience / other)
    Phase 4: Availability
             Hours available per month (min: 2, max: 20)
             Preferred days, time zones, communication style
             Mentee preferences (age range, background — optional)
    Phase 5: Profile summary confirmation + professional statement (AI-drafted, user edits)
  → On confirm: profile saved, pgvector embedding generated
  → Redirect to /legal/nda

Step 5: NDA Signing
  → nda_signatures record created
  → Redirect to /pending-approval (NOT dashboard yet)

Step 6: Pending Approval Screen
  /pending-approval — a dedicated holding page, not the dashboard
  Message: "Your application is under review."
  Sub-text: "Our team will review your profile within 48 hours. 
             You'll receive an email once you're approved."
  Shows: Their submitted profile summary (read-only preview)
  CTA: "Edit your profile" (can still update details while pending)
  Status: Moderator notified of new pending mentor in their queue

Step 7: Moderator Review (see Journey 5)

Step 8: Approval Email Sent
  Email: "You're approved! Welcome to Jenga365 as a Mentor."
  → user.is_approved: TRUE
  → user added to matching pool
  → Redirect link in email → /dashboard/mentor

Step 9: Mentor Dashboard (First Visit — Empty State)
  Banner: "You're live! Mentees with matching profiles will request you soon."
  CTA: "Complete your profile" if completeness < 80%
  Shows: Profile completeness meter, availability settings, article drafting tool
```

#### Mentor Status States
```
pending_verification  → email not yet verified
onboarding           → email verified, interview not complete
nda_pending          → interview complete, NDA not signed
pending_approval     → NDA signed, awaiting moderator review
approved             → active in matching pool
matched              → has at least one active mentorship pair
suspended            → admin/moderator action
rejected             → moderator rejected application (with reason)
deleted              → soft deleted
```

#### Rejection Flow
```
Moderator clicks "Reject" on pending mentor application
  → Modal: "Reason for rejection" (dropdown + optional free text)
    Reasons: Incomplete profile / Unverifiable credentials / 
             Policy violation / Duplicate account / Other
  → user.mentor_status: 'rejected'
  → Rejection email sent with reason + "You may re-apply in 30 days"
  → moderation_log entry created
```

---

### 11.5 — JOURNEY 3: Sign Up as a Corporate Partner

#### Entry Point
`/register` → Select "We are an organisation" card → role pre-set to `CorporatePartner`

#### Key Distinction
Corporate Partner registration is **invite-preferred but self-serve allowed**. Self-serve applications go through a moderator approval queue identical to Mentor applications. Invited partners skip the approval queue (invite link pre-approves them).

#### Full Registration Sequence — Self-Serve Path

```
Step 1: Role Selection
  /register
  User clicks "We are an organisation / corporate partner"
  → Redirect to /register/corporate

Step 2: Organisation Account Creation
  Fields:
    Organisation name
    Organisation type (NGO / Corporate / Sports Club / Government / Education)
    Primary contact: First name, Last name, Job title
    Work email (must match org domain — enforced by DNS check or manual review)
    Password, Confirm password
    Website URL (required)
    Brief description of CSR focus (textarea, max 300 chars)
  Server Action: createCorporateAccount({ ...fields, role: 'CorporatePartner' })
  → corporate_partners record created (name, contact, website, type, status: 'pending')
  → users record created (role: 'CorporatePartner', is_approved: FALSE)
  → Verification email sent to work email

Step 3: Email Verification
  → email_verified: TRUE
  → Redirect to /onboarding/corporate

Step 4: AI Interviewer Onboarding (Corporate Branch)
    Phase 1: Confirm organisation type and primary CSR focus areas
    Phase 2: Organisation size (employee count), operating regions (Kenya / East Africa / Global)
             Industry sector, annual CSR budget range (optional)
    Phase 3: Partnership goals
             "What would a successful partnership with Jenga365 look like in 12 months?"
             Interested pillars: Mentorship sponsorship / Clinic sponsorship / 
             Tree planting / Employee volunteering / All of the above
    Phase 4: Employee engagement
             How many employees would participate as mentors? (estimate)
             Preferred reporting cadence (monthly / quarterly ESG reports)
    Phase 5: Summary confirmation + partnership statement
  → Profile + embedding generated
  → Redirect to /legal/nda (organisations sign NDA on behalf of the entity)

Step 5: NDA Signing
  NDA signing page for corporate includes:
    Signatory name + job title (must confirm they are authorised to sign)
    Organisation name (pre-filled)
  → nda_signatures record: entity_type: 'organisation'
  → Redirect to /pending-approval/corporate

Step 6: Pending Approval Screen
  Message: "Your partnership application is under review."
  Sub-text: "A member of our team will be in touch within 3 business days."
  Shows: Submitted org profile (read-only)

Step 7: Moderator / SuperAdmin Review
  Corporate applications appear in Moderator queue with a "Corporate" badge
  Moderator can view org details, website, CSR description
  Moderator approves OR escalates to SuperAdmin for final sign-off
  (SuperAdmin has final authority on corporate partnerships)

Step 8: Approval
  → corporate_partners.status: 'active'
  → users.is_approved: TRUE
  → Welcome email: "Welcome to Jenga365 as a Corporate Partner."
    Includes: Partner portal link, onboarding checklist, dedicated contact
  → Redirect → /dashboard/partner

Step 9: Corporate Partner Dashboard (First Visit)
  Onboarding checklist widget:
    ☐ Add your company logo
    ☐ Set your sponsorship tier
    ☐ Invite employee mentors (send email invites)
    ☐ Set your CSR focus areas
    ☐ Download your welcome ESG report template
```

#### Invite-Only Path (Fast Track)

```
SuperAdmin sends invite from Admin Dashboard:
  Input: contact email, organisation name, pre-assigned tier
  → Signed JWT invite link generated (48hr expiry)
  → Email: "Jenga365 has reserved a partnership for [Org Name]. 
            Click to activate your portal."

Invited org clicks link:
  → Pre-validated: role = 'CorporatePartner', is_approved = TRUE (skips queue)
  → Completes Step 2 (credentials only — org details pre-filled from invite)
  → Completes Step 4 (AI onboarding — still required)
  → Completes Step 5 (NDA — still required)
  → Goes directly to /dashboard/partner (no pending approval screen)
```

#### Corporate Partner Status States
```
pending_verification  → email not yet verified
onboarding           → interview not complete
nda_pending          → NDA not signed
pending_approval     → awaiting moderator/admin review
active               → full portal access
suspended            → payment lapsed or policy violation
rejected             → application declined
deleted              → soft deleted
```

---

### 11.6 — JOURNEY 4: SuperAdmin Creates a Moderator

#### Key Rule
**There is no public registration path for Moderators.** Moderator accounts are created exclusively by a SuperAdmin from within the Admin Dashboard. This prevents privilege escalation and ensures all moderators are explicitly trusted.

#### Full Moderator Creation Flow

```
SuperAdmin navigates to: /dashboard/admin/users/create-moderator

Form fields:
  First name, Last name
  Work email (will become their login email)
  Phone number (optional, for 2FA setup)
  Assigned moderation scope:
    ☐ Mentor applications
    ☐ Mentee applications  
    ☐ Corporate applications
    ☐ Content / Articles
    ☐ All of the above

Server Action: createModeratorAccount({ ...fields, role: 'Moderator', created_by: superadmin.id })
→ users record created:
    role: 'Moderator'
    is_approved: TRUE (pre-approved by virtue of admin creation)
    onboarding_complete: TRUE (no AI interview required)
    account_created_by: superadmin.id
→ moderation_log entry: action_type: 'moderator_account_created'
→ Invite email sent to moderator:
    "You've been added as a Moderator on Jenga365."
    Temporary password (force-reset on first login)
    Link to /dashboard/moderator

Moderator first login:
  → Forced password reset screen
  → Optional: 2FA setup (TOTP via authenticator app — recommended)
  → Redirect to /dashboard/moderator
  → No AI interview, no NDA required
    (Moderators are internal team; separate employment agreement covers legal obligations)
```

#### Moderator Scope Enforcement

The `moderation_scope` field stored in the `users` table (as a string array) controls what the Moderator sees in their queue:

```typescript
// users table addition:
moderation_scope: text[].default([])
// e.g., ['mentor_applications', 'content'] or ['all']

// Moderator queue query:
WHERE action_type = ANY(moderator.moderation_scope)
   OR 'all' = ANY(moderator.moderation_scope)
```

#### Moderator Management (SuperAdmin Powers)

SuperAdmin can from `/dashboard/admin/users`:
- View all moderators + their scope + last active date
- Edit a moderator's scope (add/remove approval categories)
- Suspend a moderator (immediately locks dashboard access)
- Delete a moderator account (soft delete, preserves moderation_log history)
- View a moderator's full action history (all approvals, rejections, flags)

---

### 11.7 — JOURNEY 5: Moderator Approval Flows

Moderators can approve, reject, or flag three entity types: **Mentors**, **Mentees** (edge cases only), and **Corporate Partners**. Each has a slightly different approval checklist.

#### 5A — Approving / Rejecting a Mentor

```
Moderator navigates to: /dashboard/moderator/queue/mentors

Queue item displays:
  ┌─────────────────────────────────────────────────────┐
  │ 🟡 PENDING MENTOR — Applied 2 days ago              │
  │ Name: Bruce Odhiambo                                │
  │ Title: Sports Development Officer                   │
  │ Expertise: Rugby, Career Readiness, Financial Lit.  │
  │                                                     │
  │ AI Confidence Score: 87% ████████░░                 │
  │ Profile Completeness: 92% █████████░                │
  │                                                     │
  │ AI Summary: "Bruce is a sports development          │
  │ professional with 8 years in rugby coaching and     │
  │ career transition support. High alignment with      │
  │ Jenga365 mentorship pillars. Availability: 6hrs/mo" │
  │                                                     │
  │ NDA: ✅ Signed v2025.06.1 on 2 Jan 2026 (IP logged) │
  │                                                     │
  │ [View Full Profile]  [View NDA Record]              │
  │                                                     │
  │ [✅ APPROVE]  [⚠️ FLAG TO ADMIN]  [❌ REJECT]        │
  └─────────────────────────────────────────────────────┘

Approve flow:
  → Confirm modal: "Approve Bruce Odhiambo as a Mentor?"
  → Moderator adds optional note (e.g., "Strong profile, verified LinkedIn")
  → Server Action: approveMentor({ userId, moderatorId, note })
  → user.is_approved: TRUE, mentor_status: 'approved'
  → User added to matching pool (embedding now active in pgvector search)
  → Approval email sent to mentor
  → moderation_log entry created
  → Queue item removed

Reject flow:
  → Reject modal with required reason dropdown:
      [ ] Incomplete profile (missing key information)
      [ ] Unverifiable credentials
      [ ] Availability too low (< 2hrs/month)
      [ ] Policy violation
      [ ] Duplicate account detected
      [ ] Other (free text required)
  → Optional: "Include personal message to applicant" toggle
  → Server Action: rejectMentor({ userId, moderatorId, reason, message })
  → mentor_status: 'rejected'
  → Rejection email sent with reason + re-apply timeline
  → moderation_log entry created

Flag to Admin flow:
  → Flag modal: "Escalate this application to SuperAdmin"
  → Reason: free text (e.g., "Claims to be a professional coach — unable to verify")
  → moderation_log entry: action_type: 'escalated_to_admin'
  → SuperAdmin receives in-app notification + email
  → Application moved to Admin queue, locked from moderator queue
```

#### 5B — Approving / Rejecting a Mentee (Edge Cases)

Mentees are auto-approved at registration. However, moderators have the power to **manually review and suspend** a mentee in specific circumstances:

```
Triggers for manual Mentee review:
  1. AI Confidence Score < 40% (severely incomplete interview)
  2. Flagged by a Mentor (report button on mentee profile)
  3. Suspicious activity detected (multiple accounts same IP/email pattern)
  4. Content policy violation in messages or journal entries

Moderator action on flagged Mentee:
  [✅ CLEAR FLAG — Restore full access]
  [⏸️ SUSPEND — Temporarily lock account pending investigation]  
  [❌ PERMANENTLY SUSPEND — Requires SuperAdmin co-sign]

Note: Moderators CANNOT permanently ban a Mentee alone.
      Permanent suspension requires SuperAdmin confirmation (two-party authorisation).
```

#### 5C — Approving / Rejecting a Corporate Partner

```
Moderator navigates to: /dashboard/moderator/queue/corporate

Queue item displays:
  ┌─────────────────────────────────────────────────────┐
  │ 🟡 PENDING CORPORATE PARTNER — Applied 1 day ago    │
  │ Organisation: ETCO Kenya                            │
  │ Type: NGO                                           │
  │ Contact: Sarah Kimani, CSR Director                 │
  │ Website: etco-kenya.org ✅ (verified reachable)     │
  │ CSR Focus: Environmental stewardship, Youth rugby   │
  │ Est. Employee Mentors: 5                            │
  │                                                     │
  │ AI Summary: "Environmental NGO with strong youth    │
  │ programme alignment. CSR goals match Jenga365's     │
  │ Green Game and Human Capital pillars."              │
  │                                                     │
  │ NDA: ✅ Signed by Sarah Kimani, CSR Director         │
  │      (Confirmed authority to sign)                  │
  │                                                     │
  │ [View Full Application]  [Visit Website]            │
  │                                                     │
  │ [✅ APPROVE]  [⬆️ ESCALATE TO SUPERADMIN]  [❌ REJECT]│
  └─────────────────────────────────────────────────────┘

Approve flow:
  → corporate_partners.status: 'active'
  → users.is_approved: TRUE
  → Assign default sponsorship tier: 'Bronze' (upgradeable from partner portal)
  → Welcome email + portal activation link sent
  → moderation_log entry

Escalate to SuperAdmin:
  → All corporate partners above a certain sponsorship tier threshold
    (e.g., estimated contribution > $5,000/year) MUST be escalated to SuperAdmin
  → Moderator flags with recommendation: "Approve" / "Reject" / "Needs more info"
  → SuperAdmin makes final decision

Reject flow:
  → Reason dropdown:
      [ ] Organisation cannot be verified
      [ ] Website / domain does not match stated organisation
      [ ] CSR goals misaligned with Jenga365 mission
      [ ] Incomplete application
      [ ] Other
  → Rejection email with reason
  → corporate_partners.status: 'rejected'
```

---

### 11.8 — Complete Role Assignment Summary Table

| Role | How Assigned | Who Creates | Approval Required | NDA Required | AI Interview |
|---|---|---|---|---|---|
| `Mentee` | Self-registration at `/register` | Self | ❌ Auto-approved | ✅ Yes | ✅ Yes |
| `Mentor` | Self-registration at `/register` | Self | ✅ Moderator approval | ✅ Yes | ✅ Yes |
| `CorporatePartner` | Self-registration OR invite link | Self or SuperAdmin | ✅ Moderator + SuperAdmin | ✅ Yes (entity NDA) | ✅ Yes |
| `Moderator` | Admin Dashboard only | SuperAdmin | ✅ Implicit (created by SuperAdmin) | ❌ No (employment agreement) | ❌ No |
| `SuperAdmin` | Database seed at deploy time | Engineering team | N/A | ❌ No | ❌ No |

---

### 11.9 — Schema Additions for Module 11

```typescript
// Additions to users table:
users: {
  // ... existing fields ...
  mentor_status: enum(['pending_verification','onboarding','nda_pending',
                       'pending_approval','approved','matched',
                       'suspended','rejected','deleted']).default('pending_verification'),
  account_created_by: uuid | null,   // FK → users (for moderator accounts)
  moderation_scope:   text[],        // ['mentor_applications','content','all'] — moderators only
  rejection_reason:   text | null,
  rejection_date:     timestamp | null,
  reapply_eligible_at: timestamp | null,  // 30 days after rejection
  invite_token:       text | null,        // for corporate invite-only path
  invite_token_expires_at: timestamp | null,
  guest_email:        text | null,        // for guest Stripe purchases pre-registration
}

// New table: moderator_actions (extends moderation_log with richer data)
moderator_actions: {
  id:             uuid,
  moderator_id:   uuid FK → users,
  action_type:    enum(['approved','rejected','suspended','escalated',
                        'flag_cleared','scope_updated','account_created']),
  target_user_id: uuid FK → users,
  target_type:    enum(['mentor','mentee','corporate','moderator']),
  reason:         text | null,
  note:           text | null,
  requires_cosign: boolean.default(false),  // for permanent bans
  cosigned_by:    uuid | null FK → users,   // SuperAdmin co-sign
  cosigned_at:    timestamp | null,
  created_at:     timestamp
}

// New table: invite_links (for corporate fast-track)
invite_links: {
  id:             uuid,
  token:          text UNIQUE,
  created_by:     uuid FK → users,  // SuperAdmin
  org_name:       text,
  contact_email:  text,
  tier:           text,             // pre-assigned sponsorship tier
  used:           boolean.default(false),
  used_by:        uuid | null FK → users,
  used_at:        timestamp | null,
  expires_at:     timestamp,
  created_at:     timestamp
}
```

---

### 11.11 — Instruction to AI Model (Module 11)

> **"Using the flows defined in Module 11, generate the following:**
>
> 1. `/app/(auth)/register/page.tsx` — The three-card role selection page. No form fields on this page — only three large, visually distinct cards (Mentee / Mentor / CorporatePartner) with role descriptions. On card click, set role in session/cookie and redirect to the appropriate registration sub-route.
>
> 2. `/app/(auth)/register/mentee/page.tsx` — Mentee credential form (name, email, password). On submit, calls `createAccount` Server Action with `role: 'Mentee'`.
>
> 3. `/app/(auth)/register/mentor/page.tsx` — Mentor credential form (name, email, professional title, password). On submit, calls `createAccount` with `role: 'Mentor'`, `is_approved: false`.
>
> 4. `/app/(auth)/register/corporate/page.tsx` — Corporate registration form with all org fields. On submit, calls `createCorporateAccount` Server Action.
>
> 5. `/app/(auth)/pending-approval/page.tsx` — Holding page for Mentor and Corporate applicants. Shows profile summary preview, status badge, and estimated review time.
>
> 6. `/lib/actions/auth.ts` — `createAccount()`, `createCorporateAccount()`, `createModeratorAccount()` Server Actions with full Zod validation, role assignment, and side-effect triggers (verification email, moderation queue notification).
>
> 7. `/components/dashboard/moderator/ApprovalQueue.tsx` — Tabbed queue (Mentors | Mentees | Corporate). Each item renders the AI summary card with confidence score, NDA status badge, and Approve / Reject / Escalate action buttons with confirmation modals.
>
> 8. `/app/(dashboard)/admin/users/create-moderator/page.tsx` — SuperAdmin-only form for moderator creation with scope checkboxes. Protected by `RoleGuard` HOC requiring `SuperAdmin` role.
>
> All components TypeScript, Tailwind, Shadcn/UI. All Server Actions follow the universal pattern defined in Module 9.9."**
