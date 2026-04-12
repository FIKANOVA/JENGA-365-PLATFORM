# Jenga365 — User Journeys & Token Efficiency Guide

> **Purpose:** Each journey defines the exact screen sequence, backend calls, and UX expectations for every user type.
> Use this document to validate UI gaps, write tests, and brief new contributors.

---

## Table of Contents
1. [Guest Journey](#1-guest-journey)
2. [Registration Flow](#2-registration-flow)
3. [Mentee Journey](#3-mentee-journey)
4. [Mentor Journey](#4-mentor-journey)
5. [Corporate Partner Journey](#5-corporate-partner-journey)
6. [Moderator Journey](#6-moderator-journey)
7. [Admin Journey](#7-admin-journey)
8. [SuperAdmin Journey](#8-superadmin-journey)
9. [Token Usage Tips](#9-token-usage-tips)

---

## 1. Guest Journey

> **Who:** Anyone visiting Jenga365 without an account.
> **Goal:** Understand the platform and convert to registration.

### Screen Flow

```
Landing (/) → About → Mentors/Mentees pages → Events → Resources/Articles
   ↓ (any CTA)
/register  →  Role Selection
```

### Key Touchpoints
| Screen | Goal | CTA |
|--------|------|-----|
| `/` | Hook & inspire | "Join Nexus" / "Explore Impact" |
| `/about` | Trust building | "Apply as Mentor/Mentee" |
| `/mentors` | Show the value of mentors | "Become a Mentor" |
| `/mentees` | Show the programme | "Apply as Mentee" |
| `/events` | FOMO / community feel | "Register for Event" |
| `/shop` | Revenue / community items | Add to cart → Paystack checkout |
| `/donate` | Impact-driven giving | Paystack donation |
| `/impact` | Proof of work | Social proof metrics |

### Guest Capabilities
- ✅ Browse all public pages
- ✅ Read articles
- ✅ View events (not register)
- ✅ Shop (guest checkout with email)
- ✅ Donate
- ❌ Access dashboard or resources library
- ❌ Contact mentors

### UX Issues to Fix
- [ ] Add "Login" state awareness — authenticated guests clicking Login should redirect to dashboard
- [ ] Shop cart lost on navigation — consider `localStorage` persistence
- [ ] No persistent session indicator on public pages for logged-in users

---

## 2. Registration Flow

> **Applies to:** All new users (Mentee, Mentor, CorporatePartner)
> **Entry:** `/register`

### Step Map

```
/register (role select)
   ├── /register/mentee  →  Step 1: Identity → Step 2: Commitment → Step 3: NDA
   │                             ↓ (NDA signed)
   │                        /onboarding  →  AI Interview  →  /dashboard/mentee
   │
   ├── /register/mentor  →  Step 1: Identity → Step 2: Power Hour → Step 3: NDA
   │                             ↓ (NDA signed)
   │                        /pending-approval?role=Mentor  →  [await admin approval]
   │                             ↓ (approved via email link or admin panel)
   │                        /onboarding  →  AI Interview  →  /dashboard/mentor
   │
   └── /register/corporate  →  Step 1: Org Details → Step 2: Unlock Challenge → Step 3: NDA
                                     ↓ (NDA signed)
                              /pending-approval?role=Corporate Partner  →  [await admin approval]
                                     ↓ (approved)
                              /onboarding  →  AI Interview  →  /dashboard/partner
```

### Backend Sequence (per role)
1. `signUp.email()` → Better Auth creates user in `users` table
2. `signNDA()` → Insert into `nda_signatures`; update `user.ndaSigned = true`
3. `createNotification()` → Notify admin of new signup (Mentor/Corporate)
4. `sendEmail()` → Welcome + NDA confirmation emails
5. `completeOnboarding()` → Set `user.onboarded = true`; fire `synthesizeUserProfile()`

### Critical Guards (Currently Missing — Must Fix)
- `/onboarding` must verify `user.ndaSigned === true` before rendering
- `/pending-approval` must verify `user.status === "pending"` before rendering
- Dashboard layout already guards authentication — do not remove

### Data Captured Per Role
| Field | Mentee | Mentor | Corporate |
|-------|--------|--------|-----------|
| Name | ✅ | ✅ | Contact name + Org name |
| Email | ✅ | ✅ | ✅ |
| Password | ✅ | ✅ | ✅ |
| Role | `Mentee` | `Mentor` | `CorporatePartner` |
| Current level | ✅ | ❌ | ❌ |
| Professional title | ❌ | ✅ | Contact title |
| LinkedIn | ❌ | optional | ❌ |
| Meeting preference | ❌ | ⚠️ collected, not saved | ❌ |
| Org type | ❌ | ❌ | ⚠️ collected, not saved |
| Contribution type | ❌ | ❌ | ⚠️ collected, not saved |

> **Action:** Add `metadata` JSON column to `users` or extend `onboarding_data` table to capture role-specific fields.

---

## 3. Mentee Journey

> **Who:** Young professionals, athletes, students seeking guided growth.
> **Dashboard:** `/dashboard/mentee`

### Lifecycle

```
Register → NDA Sign → AI Interview → Mentee Dashboard
   │
   ├── Browse AI Matches (matching engine runs in background)
   │      └── Request Mentor → [Mentor receives notification]
   │                └── Mentor Accepts → Active pair created
   │                       └── Learning pathway assigned
   │
   ├── Attend Sessions (scheduled by Mentor)
   │      └── Post-session mood journal entry
   │
   ├── Track Learning Pathway
   │      └── Complete milestones → Unlock next phase
   │
   ├── Access Resources library
   │      └── AI Article Recommender (based on profile vector)
   │
   └── Shop / Donate (public access)
```

### Dashboard Tabs
| Tab | Data Source | Status |
|-----|-------------|--------|
| Matches | `mentor_mentee_matches` | ✅ Live |
| Learning Pathway | `mentorship_pairs.learning_pathway` | ✅ Live |
| Sessions | `mentorship_sessions` | ✅ Live |
| Mood Journal | `mood_journal` | ✅ Live |
| AI Chat | Gemini via `useChat` | ✅ Live |
| Resources | Sanity CMS | ✅ Live |

### UX Improvements Needed
- [ ] Onboarding checklist widget (NDA ✓, Interview ✓, First match ✓)
- [ ] Empty state on Matches when no matches exist yet
- [ ] Session scheduler UI (currently sessions exist in DB but no scheduling UI)
- [ ] Notification when mentor accepts request (bell already wired)

---

## 4. Mentor Journey

> **Who:** Experienced professionals giving 1hr/month to guide mentees.
> **Dashboard:** `/dashboard/mentor`
> **Extra step:** Requires admin approval before onboarding.

### Lifecycle

```
Register → NDA Sign → Pending Approval
   │                      ↓ (Admin approves in dashboard)
   │               Email notification sent to Mentor
   │                      ↓
   │               /onboarding → AI Interview → Mentor Dashboard
   │
   ├── View Pending Requests (from Mentees who matched)
   │      └── Accept → Pair goes active; Mentee notified
   │      └── Decline → Mentee notified; pair closed
   │
   ├── View Active Mentees
   │      └── Schedule Session → creates `mentorship_sessions` record
   │      └── Update Learning Pathway milestones
   │
   ├── Write Articles (submitted for Moderator review)
   │      └── Approved → Published; Mentor notified
   │
   └── View upcoming sessions
```

### Dashboard Tabs
| Tab | Data Source | Status |
|-----|-------------|--------|
| Pending Requests | `mentorship_pairs` (pending) | ✅ Live |
| Active Mentees | `mentorship_pairs` (active) | ✅ Live |
| Sessions | `mentorship_sessions` | ✅ Live |
| Articles | `articles` | ✅ Live |

### UX Improvements Needed
- [ ] Session scheduling form (date/time picker + duration)
- [ ] Mentee profile view before Accept/Decline
- [ ] Bulk accept or decline for mentors with many requests
- [ ] Calendar integration (Google/Outlook)

---

## 5. Corporate Partner Journey

> **Who:** Companies and organisations contributing financially, in-kind, or via human capital.
> **Dashboard:** `/dashboard/partner`
> **Extra step:** Requires admin approval before onboarding.

### Lifecycle

```
Register (org details) → NDA Sign → Pending Approval
   │                                    ↓ (Admin approves)
   │                            /onboarding → AI Interview → Partner Dashboard
   │
   ├── View CSR Metrics (sponsored mentees, active mentorships, donations total)
   ├── Browse available Mentors to sponsor
   ├── View upcoming Events (sponsorship opportunities)
   ├── Make Donations → Paystack → webhook fires → updates donation record
   └── Download CSR Reports
```

### Dashboard Data
| Metric | Source | Status |
|--------|--------|--------|
| Mentees Sponsored | `mentorship_pairs` | ✅ Live |
| Active Mentorships | `mentorship_pairs` | ✅ Live |
| Donations Total | `donations` | ✅ Live |
| Projects Funded | `events` (partner-linked) | ✅ Live |

### UX Improvements Needed
- [ ] Sponsorship request flow (Corporate → picks mentees to sponsor)
- [ ] CSR report PDF download (currently no PDF generation)
- [ ] Impact certificate generation
- [ ] Invoice generation for donations

---

## 6. Moderator Journey

> **Who:** Trusted community members who review content and approve new users.
> **Dashboard:** `/dashboard/moderator`
> **Access:** Admin-assigned via invite link (`/moderator-invite/[token]`)

### Lifecycle

```
Receive invite email → /moderator-invite/[token] → Account created
   │
   └── Moderator Dashboard
          ├── Applications Tab
          │      ├── View pending users (Mentors, Corporate awaiting approval)
          │      ├── Approve → user.isApproved=true; user gets onboarding access
          │      └── Reject (with reason) → user notified
          │
          └── Articles Tab
                 ├── View articles in review
                 ├── Approve → article.status="published"
                 └── Reject (with feedback) → author notified
```

### Capabilities
- ✅ Approve/reject pending users
- ✅ Approve/reject articles
- ❌ Cannot access admin settings
- ❌ Cannot modify user roles
- ❌ Cannot delete users

### UX Improvements Needed
- [ ] Article preview before approval decision
- [ ] User profile view before approval decision
- [ ] Bulk approve/reject
- [ ] Audit log of their own moderation actions

---

## 7. Admin Journey

> **Who:** Jenga365 staff managing the platform day-to-day.
> **Dashboard:** `/dashboard/admin`
> **Access:** Manually set in DB by SuperAdmin.

### Capabilities (vs Moderator)
| Capability | Moderator | Admin | SuperAdmin |
|------------|-----------|-------|------------|
| Approve users | ✅ | ✅ | ✅ |
| Approve articles | ✅ | ✅ | ✅ |
| View all users | ❌ | ✅ | ✅ |
| Change user roles | ❌ | ✅ | ✅ |
| Manage events | ❌ | ✅ | ✅ |
| Platform settings | ❌ | ❌ | ✅ |
| Assign moderators | ❌ | ✅ | ✅ |

### Lifecycle
```
Admin Dashboard
   ├── User Management
   │      ├── Filter by role / status / date
   │      ├── View user profile
   │      ├── Change role (e.g., Mentee → Mentor)
   │      ├── Approve/reject pending users
   │      └── Deactivate account
   │
   ├── Content Management
   │      ├── See all articles (all statuses)
   │      └── Publish / reject / delete
   │
   └── Events Management (future)
```

### UX Improvements Needed
- [ ] User detail drawer/modal (click user row to see full profile)
- [ ] Role change action with confirmation dialog
- [ ] Export users as CSV
- [ ] Dashboard analytics (signups over time chart)

---

## 8. SuperAdmin Journey

> **Who:** Platform owners (Moseti/Fikanova team).
> **Access:** Set via `/admin-setup/[token]` (one-time setup link).
> **Dashboard:** `/dashboard/admin` (same view as Admin, elevated permissions)

### Additional Capabilities
- Platform-wide settings
- Assign/revoke admin and moderator roles
- Access to raw AI matching scores
- API key management (Paystack, Sanity, etc.)
- Can impersonate users for debugging (future)

### Current Gaps
- [ ] No separate SuperAdmin settings page beyond shared `/dashboard/settings`
- [ ] No role promotion UI (must be done via DB currently)
- [ ] No audit log for SuperAdmin actions

---

## 9. Token Usage Tips

> Applies to all AI features: AI Interviewer, Profile Synthesizer, Article Recommender, Mentor Chat.
> These tips reduce cost and latency without sacrificing quality.

### General Principles

**1. System Prompt Caching**
The AI Interviewer sends a long system prompt on every message. Cache it at the session level:
```typescript
// Pass systemPrompt only on the first message; keep conversation history stateless
const systemPrompt = messages.length === 0 ? INTERVIEW_SYSTEM_PROMPT : undefined;
```
Saves ~800 tokens per follow-up message.

**2. Trim Conversation History**
The `useChat` hook sends the full message history to the API on every turn. Cap it:
```typescript
// In your API route, slice to last N turns before sending to Gemini
const trimmedMessages = messages.slice(-12); // last 6 exchanges
```
After 6 exchanges the interview is typically complete. This alone cuts costs by 60%+ on long chats.

**3. Profile Synthesis — Run Once, Cache Result**
`synthesizeUserProfile()` generates a 768-dim embedding. Never call it more than once per onboarding session. The result is stored in `users.profileEmbedding`. On re-runs, check the embedding is null before synthesizing:
```typescript
if (user.profileEmbedding) return; // already synthesized
```

**4. Matching — Pre-filter Before Vector Search**
Before computing cosine similarity:
- Filter by role (only compare Mentee ↔ Mentor vectors)
- Filter by `isApproved = true` and `status = 'active'`
- Limit the candidate pool to `TOP_N = 50` before pgvector distance calculation
This reduces vector computation from O(all_users) to O(50).

**5. Embeddings — Batch When Possible**
`text-embedding-004` accepts up to 2048 tokens. When synthesizing a profile, batch the interview summary + questionnaire answers in ONE call rather than separate calls per section.

**6. Article Recommender — Embed Once Per Article**
Article embeddings must be generated at publish time (not at read time). Add a webhook or cron job that embeds new articles when they are published. Query stored embeddings at read time.

**7. Prompt Length Budget**
| Feature | Target Prompt Size | Max Context |
|---------|-------------------|-------------|
| AI Interviewer (per turn) | < 2,000 tokens | 32k |
| Profile Synthesis | < 3,000 tokens | 32k |
| Article Recommender query | < 500 tokens | 32k |
| Mentor Chat (per turn) | < 1,500 tokens | 32k |

**8. Use `maxTokens` Limits**
Always set output limits to avoid runaway responses:
```typescript
const result = await streamText({
    model: google("gemini-2.0-flash"),
    messages,
    maxTokens: 512,  // interview turns don't need long answers
    temperature: 0.7,
});
```

**9. Error Fallbacks Don't Need AI**
When the AI fails (rate limit, timeout), return a graceful static fallback — don't retry immediately. Retries in a tight loop burn tokens. Use exponential backoff:
```typescript
// Max 2 retries, 2s / 4s delays
await retryWithBackoff(() => streamText(...), { retries: 2, baseDelay: 2000 });
```

**10. Only Synthesize Onboarded Users**
The matching engine should only embed users who have `onboarded = true`. Partial profiles produce noisy vectors that degrade match quality AND waste embedding tokens.

---

## Current Bugs to Fix (Prioritised)

| # | Bug | File | Severity |
|---|-----|------|----------|
| 1 | No NDA guard on `/onboarding` | `app/(auth)/onboarding/page.tsx` | 🔴 Critical |
| 2 | Email verification disabled | `lib/auth/config.ts` | 🔴 Critical |
| 3 | Mentor data loss (meeting pref) | `register/mentor/page.tsx` | 🟡 High |
| 4 | Corporate data loss (contribution type, org) | `register/corporate/page.tsx` | 🟡 High |
| 5 | Hardcoded 45% completeness | `pending-approval/page.tsx` | 🟡 High |
| 6 | Verify-email resend button broken | `verify-email/[token]/page.tsx` | 🟡 High |
| 7 | Onboarding summary ignored | `lib/actions/onboarding.ts` | 🟢 Low |
| 8 | No session scheduling UI | Mentor dashboard | 🟢 Low |
