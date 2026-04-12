# MODULE 9 — DETAILED SPECIFICATIONS ADDENDUM
# Jenga365 AI Platform

> **Status:** Reference specification — append after Module 8 in the mega-prompt.  
> **Last updated:** 2025-06 (NDA version `2025.06.1`)

---

## 9.1 — Role-Specific Dashboard KPIs & UI Elements

### Mentor Dashboard

#### Critical KPIs (stat cards at top)
| KPI | Description |
|---|---|
| Active mentees / capacity | e.g., 2/2 (Fixed 1:2 Ratio) |
| Cycle Progress (6-mo) | Progress toward graduation |
| Cumulative mentorship hours | All-time + this month |
| Average mentee satisfaction | Rolling 90-day, 1–5 stars |
| Articles published + total views | Across all authored content |
| Identity Expansion Progress | From athlete to professional identity |
| Next scheduled session | Countdown widget |

#### Additional UI Elements
- **Feedback Summary Panel** — Radar/spider chart across 5 dimensions: Communication, Domain Knowledge, Availability, Encouragement, Actionability. Sourced from structured post-session mentee ratings.
- **AI Resource Recommendations** — Sidebar widget: detects active mentees' Learning Pathway gaps → surfaces relevant Library resources with one-click "Share with Mentee."
- **Session Streak Tracker** — GitHub-style contribution heatmap (12 months). Gamification for consistency.
- **Mentee Progress Snapshot** — Inline mini-cards per active mentee: current milestone, last session date, mood indicator (😊/😐/😟 submitted by mentee at session end).
- **Draft Article Queue** — AI-assisted drafts list: word count, last-edited timestamp, submission status.

---

### Mentee Dashboard

#### Critical KPIs
| KPI | Description |
|---|---|
| Learning Pathway completion % | Progress ring |
| Sessions attended vs. scheduled | Attendance rate |
| Monthly Impact Activity | Status: [Completed / Pending] |
| Days since last mentor interaction | Alert if >14 days |
| Articles read, videos watched, PDFs downloaded |
| Resilience Delta Score | Pre vs. Post assessment tracking |
| Goals set vs. completed | Goal tracker |
| Impact Activity Credits | Verified participation in environmental/social drives |

#### Additional UI Elements
- **Match Confidence Breakdown** — Shows match % + breakdown: "92% — Skills: 95%, Location: 100%, Availability: 85%, Partner: 88%"
- **Goal-Setting Widget** — SMART-format goal input (AI-guided), linked to Learning Pathway milestones.
- **Mood/Progress Journal** — Weekly 3-question check-in (<2 min). Feeds Mentor feedback view + Admin wellbeing layer.
- **Webinar Certificate Tracker** — Auto-generates downloadable PDF certificate (edge function) on webinar completion. Certificate badge wall.
- **"Ask My Mentor" Quick Message** — Pre-templated structured message form (not freeform chat) to reduce friction for shy mentees.

---

### Moderator Dashboard

#### Critical KPIs
| KPI | Description |
|---|---|
| Pending mentor approvals | Count + avg. days waiting |
| Articles in review queue | Count |
| Actions taken this week | Approvals, rejections, flags |
| Avg. time-to-decision | SLA metric, target: <48hrs |

#### Additional UI Elements
- **AI Profile Summary Card** — Per pending mentor: 3-sentence AI summary, highlighted skills, Confidence Score (flags low-completeness profiles).
- **Side-by-Side NDA Verification** — Shows NDA signature metadata (IP, timestamp, hash) next to applicant profile.
- **Flag & Escalate** — Dropdown reason codes: Suspicious profile, Incomplete info, Policy concern, Other. Sends to SuperAdmin.
- **Bulk Actions** — Multi-select approve/reject for articles or applications.
- **SLA Timer** — Visual countdown per pending item to 48-hr target. Colour-coded: green → yellow → red.

---

### SuperAdmin Dashboard

#### Critical KPIs
| KPI | Description |
|---|---|
| Active users | DAU / MAU ratio |
| Total revenue | Donations + merchandise, MTD + YTD |
| Total mentorship hours | Platform lifetime |
| Partner count | Active vs. lapsed |
| System health | API error rate, DB pool usage, Vercel invocations |

#### Additional UI Elements
- **Global Impact Map** — Mapbox or Leaflet.js: mentor/mentee locations + clinic sites, colour-coded by impact tier.
- **Revenue Attribution Chart** — Stacked bar chart (Recharts): one-time donation / recurring / merchandise per month.
- **Cohort Retention Analysis** — Table: % of month-X signups still active at X+3, X+6.
- **Role Distribution Pie Chart** — Live user count by role.
- **Shadow View Panel** — See §9.7. Searchable active mentor/mentee pairs → read-only overlay of Learning Pathway, session logs, mood journal, match history. Read-only enforced at query level.

---

### Corporate Partner Dashboard

#### Critical KPIs
| KPI | Description |
|---|---|
| Total sponsorship YTD | Currency amount |
| ESG ROI metrics | Trees planted, youth reached, clinics funded per R1,000 |
| Active employee-mentors | Count + % of staff enrolled |
| Avg. employee-mentor satisfaction | From mentee ratings |
| Upcoming renewal date | Days remaining to tier renewal |

#### Additional UI Elements
- **Impact Attribution Timeline** — Chronological feed: "R5,000 contributed 12 Jan → funded 2 clinics 18 Jan → 47 youth attended."
- **Employee Leaderboard** — Ranked by hours contributed, mentee satisfaction, milestones unlocked. Internally shareable for staff recognition.
- **Downloadable ESG Report** — One-click branded PDF (logo, period, metrics, success story quotes from Sanity). Generated by background worker on demand.
- **Tier Progress Bar** — Visual indicator: distance to next sponsorship tier + benefits comparison.

---

## 9.2 — AI Interviewer Personality & Conversational Design

### Tone & Personality — "Warm Professional"
- **Not sycophantic:** Use "Got it" / "That's helpful, thanks" — never "Great answer!" / "Awesome!"
- **Encouraging for hesitant users:** Gently reframes on short/uncertain answers.
- **Rugby/Impact context-aware:** Light Jenga365 mission references woven in naturally.
- **Culturally grounded:** South African / African context — avoid Western corporate language; use warm, accessible phrasing.

### Conversational Flow (5 Phases)

```
Phase 1 — Welcome & Role Identification (2 exchanges)
  Q: "Welcome! Are you here to mentor someone, to find a mentor, or representing
      an organisation as a corporate partner?"
  → Branch: Mentor flow / Mentee flow / Partner flow

Phase 2 — Background & Context (3–4 exchanges)
  Mentor:  profession, years experience, domain expertise, employer (optional)
  Mentee:  age range, current situation, primary challenge
  Partner: org name, sector, team size, CSR focus areas

Phase 3 — Goals & Motivations (3 exchanges)
  "What does success look like for you in 6 months?"
  Follow-up if vague: "Could you give me a specific example — even a small one?"

Phase 4 — Availability & Preferences (2 exchanges)
  Province/city, hours/month, preferred comm style (video / messaging / in-person)

Phase 5 — Confirmation & Handoff (1 exchange)
  AI presents structured summary → user confirms → profile written to DB
  → embedding generated → NDA redirect
```

### Ambiguity & Error Handling

| Scenario | AI Strategy |
|---|---|
| One-word answer to open question | Targeted follow-up × 2 max; then accept + flag `low_confidence_score` |
| Off-topic response | Gentle redirect back to last question |
| Frustration / skip request | Immediately skip; mark field `null`; continue |
| Contradictory answers | Highlight at Phase 5 summary for user to resolve |
| >60 seconds silence | Client-side timer: "Still there? Take your time — I'm here." |
| Wrong role selected | "Based on what you've described, you might be a better fit as a Mentor — switch?" |

> Profiles with >2 `low_confidence` fields are auto-flagged in the Moderator Queue with a yellow **"Review Needed"** badge.

---

## 9.3 — pgvector Embedding Strategy

### Profile Intent Document Format

```typescript
// lib/ai/embeddings.ts
function buildProfileDocument(profile: UserProfile): string {
  if (profile.role === 'Mentor') {
    return `
      Role: Mentor
      Domain expertise: ${profile.expertiseDomains.join(', ')}
      Industry: ${profile.industry}
      Years of experience: ${profile.yearsExperience}
      Key skills: ${profile.skills.join(', ')}
      Mentoring goals: ${profile.mentoringGoals}
      Availability: ${profile.hoursPerMonth} hours/month, ${profile.preferredDays}
      Location: ${profile.city}, ${profile.province}
      Communication preference: ${profile.commStyle}
      Personal mission statement: ${profile.missionStatement}
    `.trim();
  }
  if (profile.role === 'Mentee') {
    return `
      Role: Mentee
      Current situation: ${profile.situation}
      Primary challenge: ${profile.primaryChallenge}
      Goals (6-month horizon): ${profile.goals}
      Areas of interest: ${profile.interests.join(', ')}
      Skills they want to develop: ${profile.desiredSkills.join(', ')}
      Location: ${profile.city}, ${profile.province}
      Availability: ${profile.hoursPerMonth} hours/month
      Preferred mentor traits: ${profile.mentorPreferences}
    `.trim();
  }
}
```

### Embedding Model & Storage
- Model: **OpenAI `text-embedding-3-small`** (1,536 dimensions)
- Column: `vector(1536)` on `users` table (Drizzle + pgvector)
- Re-embed on update: set `embedding_stale = true` flag; cron job processes queue
- Corporate Partners also get embeddings (CSR focus, sector, employee mentoring prefs) for cohort matching

### Similarity Search Thresholds

```typescript
const MINIMUM_MATCH_THRESHOLD = 0.65;  // reject below this cosine similarity

const SCORE_WEIGHTS = {
  semanticSimilarity: 0.50,  // pgvector cosine
  locationMatch:       0.20,  // exact province=1.0, national=0.5, mismatch=0.0
  availabilityOverlap: 0.15,  // hours/month overlap ratio
  partnerAffiliation:  0.10,  // shared corporate partner bonus
  completenessBonus:   0.05,  // penalise low_confidence profiles
};
```

---

## 9.4 — Impact Data Engine: Activity Log Specification

### `activity_log` Table

```typescript
activity_log: {
  id:           uuid,
  user_id:      FK → users,
  action_type:  enum,
  entity_type:  string,   // 'article' | 'event' | 'resource' | 'session' etc.
  entity_id:    uuid,
  metadata:     jsonb,    // flexible per action type
  impact_points: integer,
  created_at:   timestamp
}
```

### Action Taxonomy

| Action Type | Entity | Example Metadata | Points | Aggregation |
|---|---|---|---|---|
| `article_view` | article | `{article_id, read_duration_seconds}` | 1 | Education |
| `article_published` | article | `{article_id, word_count}` | 15 | Content |
| `resource_download` | resource | `{resource_id, file_type}` | 3 | Education |
| `video_watched` | resource | `{resource_id, watch_pct}` | 5 | Education |
| `event_registered` | event | `{event_id, event_type}` | 5 | Community |
| `event_attended` | event | `{event_id, duration_minutes}` | 20 | Community |
| `clinic_attended` | event | `{clinic_id, location}` | 30 | Rugby/Sport |
| `webinar_completed` | event | `{webinar_id, certificate_issued}` | 25 | Education |
| `session_completed` | session | `{pair_id, duration_minutes, mood}` | 40 | Mentorship |
| `mentee_goal_completed` | pathway | `{milestone_id, pair_id}` | 50 | Outcomes |
| `donation_made` | donation | `{amount, currency, is_recurring}` | 100 | Financial |
| `merchandise_purchased` | order | `{product_id, amount, fund_portion}` | 30 | Financial |
| `nda_signed` | legal | `{document_version}` | 0 | Compliance |
| `profile_completed` | user | `{completeness_score}` | 10 | Engagement |
| `match_accepted` | mentorship | `{match_score, mentor_id}` | 20 | Matching |
| `feedback_submitted` | session | `{rating, dimensions}` | 10 | Quality |
| `tree_surveyed` | impact | `{tree_id, status: 'alive'\|'dead', age_months}` | 5 | Environment |
| `unlock_milestone_hit` | corporate | `{milestone_type, partner_id}` | 100 | ROI |
| `voices_post_engaged` | voices | `{thread_id, action}` | 2 | Community |

### Nightly Aggregation Worker → `impact_reports`

```typescript
{
  total_mentorship_hours:   SUM(session_log.duration_minutes) / 60,
  total_education_points:   SUM(activity_log.impact_points WHERE entity IN education_types),
  total_donations_amount:   SUM(donations.amount),
  youth_engaged:            COUNT(DISTINCT users WHERE role='Mentee' AND has_active_pair),
  clinics_held:             COUNT(events WHERE type='Clinic' AND date <= today),
  trees_planted:            SUM(corporate_partners.impact_trees_planted),
  articles_published:       COUNT(articles WHERE status='published'),
  certificates_issued:      COUNT(activity_log WHERE action='webinar_completed' AND metadata->>'certificate_issued'='true'),
  match_success_rate:       COUNT(pairs WHERE status='completed') / COUNT(pairs) * 100
}
```

---

## 9.5 — Sanity.io Schema Requirements

### `event` Schema

```javascript
// sanity/schemas/event.js
{
  name: 'event',
  fields: [
    { name: 'title',           type: 'string',   required: true },
    { name: 'slug',            type: 'slug',      required: true },
    { name: 'eventType',       type: 'string',    options: { list: ['Webinar','Rugby Clinic','Workshop','Community Meet'] } },
    { name: 'date',            type: 'datetime',  required: true },
    { name: 'endDate',         type: 'datetime' },
    { name: 'location',        type: 'string' },
    { name: 'isOnline',        type: 'boolean' },
    { name: 'meetingLink',     type: 'url' },
    { name: 'capacity',        type: 'number' },
    { name: 'registrationUrl', type: 'url' },
    { name: 'coverImage',      type: 'image' },
    { name: 'excerpt',         type: 'text',      maxLength: 200 },
    { name: 'description',     type: 'array',     of: [{ type: 'block' }] },
    { name: 'speakers',        type: 'array',     of: [{ type: 'reference', to: [{ type: 'person' }] }] },
    { name: 'tags',            type: 'array',     of: [{ type: 'string' }] },
    { name: 'partnerSponsors', type: 'array',     of: [{ type: 'string' }] },
    { name: 'isFeatured',      type: 'boolean',   default: false },
    { name: 'recordingUrl',    type: 'url' },
  ]
}
```

### `article` Schema

```javascript
// sanity/schemas/article.js
{
  name: 'article',
  fields: [
    { name: 'title',           type: 'string',   required: true },
    { name: 'slug',            type: 'slug',     required: true },
    { name: 'author',          type: 'reference', to: [{ type: 'person' }] },
    { name: 'publishedAt',     type: 'datetime' },
    { name: 'excerpt',         type: 'text',     maxLength: 300 },
    { name: 'readTime',        type: 'number' },
    { name: 'coverImage',      type: 'image' },
    { name: 'body',            type: 'array',    of: [{ type: 'block' }, { type: 'image' }] },
    { name: 'tags',            type: 'array',    of: [{ type: 'string' }] },
    { name: 'category',        type: 'string',   options: { list: ['Rugby','Mentorship','Education','Business','Impact','Community'] } },
    { name: 'isFeatured',      type: 'boolean',  default: false },
    { name: 'viewCount',       type: 'number',   default: 0 },
    { name: 'relatedArticles', type: 'array',    of: [{ type: 'reference', to: [{ type: 'article' }] }] },
    { name: 'downloadablePdf', type: 'file' },
  ]
}
```

### Additional Schemas Required
- **`person`** — name, bio, avatar, role (Mentor/Speaker/Team), social links, linked `users.id`
- **`successStory`** — title, mentee quote, mentor name, outcome, image, partner attributed, date
- **`rugbyClinic`** — clinic name, date, location, coach names, youth count, photos, partner sponsor → feeds `impact_reports.clinics_held`
- **`voices`** — thread title, X Space link/embed, description, date, speakers[] → populates `/voices` page

---

## 9.6 — NDA Document Versioning

### Version Format
`YYYY.MM.revision` — e.g., `2025.06.1`, `2025.06.2`, `2025.09.1`

### `nda_documents` Table

```typescript
nda_documents: {
  id:            uuid,
  version:       string,      // e.g. "2025.06.1"
  document_text: text,        // full legal text (not CMS)
  sha256_hash:   string,      // hash of document_text
  is_current:    boolean,     // only ONE record true at a time
  supersedes_id: uuid | null, // FK to previous version
  published_at:  timestamp,
  published_by:  uuid         // FK to admin user
}
```

### Version Change Workflow
1. SuperAdmin drafts new NDA in Admin Dashboard (plain text + preview)
2. On publish: set all existing `is_current = false`, insert new with `is_current = true`, compute `sha256_hash`
3. Middleware NDA check validates `nda_signatures.document_version = nda_documents.current_version`
4. Users who signed an older version are **re-intercepted** on next login — must re-sign
5. All historical signatures preserved — re-signing appends new record (no overwrites)

---

## 9.7 — Shadow View: Full Specification

**Access:** SuperAdmin only. Read-only, zero-mutation.

### Visibility Matrix

| Data Layer | Visible | Notes |
|---|---|---|
| Match score & rationale | ✅ Full | Including embedding similarity breakdown |
| Learning Pathway milestones | ✅ Full | All milestones, completion dates, mentor notes |
| Session logs | ✅ Full | Date, duration, mentor notes |
| Mentee mood journal | ✅ Full | Weekly check-in answers |
| Mentee feedback (per dimension) | ✅ Full | Radar chart data |
| Private messages | ❌ Never | Encrypted, privacy boundary |
| NDA metadata | ✅ Full | Version, timestamp, IP, hash |
| Activity log (pair) | ✅ Full | All impact events for this pair |
| Financial data | ❌ Never | Available only in Financial Overview |

### UI Implementation
- Triggered by clicking a pair row in Admin's "Active Pairs" table
- Opens as full-screen modal overlay (not a new page)
- **Persistent amber banner:** "⚠ READ-ONLY SHADOW VIEW — No changes can be made here"
- All interactive elements: `pointer-events: none` + `opacity: 0.4` + tooltip "Shadow view is read-only"
- **Export as PDF** button → Impact Worker PDF generator (safeguarding/HR escalation)
- All access events written to `moderation_log` with `action_type: 'shadow_view_accessed'`

---

## 9.8 — Merchandise Inventory Management

### Low Stock Alert

```typescript
const LOW_STOCK_THRESHOLD = 5;

// On order webhook:
if (updatedProduct.stock_count <= LOW_STOCK_THRESHOLD) {
  await sendAdminAlert({
    type: 'low_stock',
    product: updatedProduct.name,
    remaining: updatedProduct.stock_count,
    // Email SuperAdmin + in-app notification in Admin Dashboard
  });
}
```

### Out-of-Stock Handling
- `stock_count === 0` → "Out of Stock" badge (grey overlay), "Add to Cart" → **"Notify Me"** button
- "Notify Me" inserts to `stock_notifications` (`user_id`, `product_id`, `created_at`)
- On manual restock → webhook emails all subscribers → records deleted

### Variant Management

```typescript
merchandise: {
  // ... existing fields ...
  has_variants: boolean,
  variants: jsonb  // [{ size: 'M', color: 'Green', stock: 12 }, ...]
  // stock_count = SUM(variant.stock) computed on read
}
```

### Admin Shop Management Panel
- Product list + real-time stock levels
- Manual restock input per product/variant
- Bulk "Set Active/Inactive" toggle
- Revenue per product chart (Recharts bar)
- "Top Sellers" leaderboard

### Stripe Sync
- `merchandise` table kept in sync with Paystack Product/Price objects via webhooks (`product.updated`, `price.updated`)

---

## 9.9 — API Route Architecture

### Decision Framework: Server Actions vs. Route Handlers

| Use Case | Approach | Reason |
|---|---|---|
| Form submissions (profile update, NDA sign) | **Server Action** | Co-located, progressive enhancement |
| Stripe webhooks | **Route Handler** `/api/webhooks/stripe` | Raw POST, Stripe servers, raw body |
| AI streaming (interviewer) | **Route Handler** `/api/ai/interview` | Vercel AI SDK `streamText` |
| Embedding generation | **Server Action** | Post-chat trigger, no external caller |
| Report/PDF generation | **Route Handler** `/api/reports/impact` | File stream, callable by Partner dashboard |
| Sanity GROQ reads | **Server Component direct fetch** | No route needed — RSC via `sanity/client.ts` |
| Impact ticker | **Route Handler** `/api/impact/ticker` + SWR polling | Client-side interval polling |
| Article view count | **Server Action** | Lightweight mutation, co-located |
| Admin Shadow View | **Server Action + RBAC guard** | Sensitive, SuperAdmin role validated server-side |

### Full API Route Directory

```
/app/api
  /webhooks
    /stripe/route.ts          ← payment_intent.succeeded, checkout.session.completed,
                                 invoice.paid (recurring), product.updated
  /ai
    /interview/route.ts       ← Vercel AI SDK streamText (AI Interviewer)
    /embed/route.ts           ← Profile embedding generation (post-onboarding)
  /reports
    /impact/route.ts          ← On-demand PDF impact report (file stream)
    /esg/route.ts             ← Partner ESG report generation
  /impact
    /ticker/route.ts          ← Live aggregate stats for Impact Pulse Ticker
  /notifications
    /restock/route.ts         ← Admin restock trigger → emails stock_notifications users
```

### Server Actions Directory

```
/lib/actions
  /auth.ts          ← login, register, logout
  /onboarding.ts    ← completeOnboarding(), saveInterviewState()
  /nda.ts           ← signNDA(), checkNDAStatus()
  /matching.ts      ← requestMatch(), acceptMatch(), rejectMatch()
  /sessions.ts      ← logSession(), submitFeedback()
  /articles.ts      ← saveDraft(), submitForReview(), incrementViewCount()
  /moderation.ts    ← approveMentor(), rejectMentor(), flagUser(), approveArticle()
  /merchandise.ts   ← updateStock(), toggleProductActive(), notifyRestock()
  /impact.ts        ← logActivity(), generateImpactReport()
  /admin.ts         ← updateUserRole(), suspendUser(), publishNDAVersion()
```

### Universal Action Pattern

```typescript
export async function exampleAction(input: InputType): Promise<ActionResult> {
  // 1. Auth check — always first
  const session = await auth.getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  // 2. Role guard
  if (!hasRole(session.user, ['SuperAdmin', 'Moderator'])) {
    return { success: false, error: 'Forbidden' };
  }

  // 3. Zod input validation
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  // 4. DB mutation via Drizzle
  try {
    const result = await db.insert(table).values(parsed.data).returning();
    // 5. Side effects
    await logActivity({ userId: session.user.id, action: 'example_action' });
    return { success: true, data: result[0] };
  } catch (err) {
    console.error('[exampleAction]', err);
    return { success: false, error: 'Internal server error' };
  }
}
```

All Route Handlers use the same auth/role pattern adapted for `NextRequest`.  
Stripe webhook routes use `stripe.webhooks.constructEvent` raw body verification before any processing.

---

*End of Module 9 — Detailed Specifications Addendum*


---

## MODULE 10 — ABOUT PAGE: DEFINITIVE CONTENT & COMPONENT SPECIFICATION

> **Status:** Implemented — 2026-03-04
> **Components generated and verified:** `AboutHero`, `TripartiteModel`, `HistoryTimeline`, `WhyJenga`, `LeadershipGrid`, `PartnerCarousel`, `Testimonials`, `AboutCTAStrip`, `/app/(marketing)/about/page.tsx`

