# Sanity CMS — Current State

Snapshot of what's editable through Sanity Studio, where each surface renders,
and where the in-code fallbacks live. Last updated 2026-05-24.

## Studio access

| Role | URL | What they see |
|---|---|---|
| SuperAdmin | `/studio` | All 15 schemas, both article lists, Vision plugin |
| Moderator | `/studio` | 13 schemas (no `coach`/`partner`), both article lists, Vision plugin |
| CorporatePartner | `/studio` | `partner` + `voices` only |
| NGO | `/studio` | `partner` only |
| Mentor / Mentee | redirected to `/dashboard/articles` (no Studio) |

Open in a new tab — Studio takes the full viewport.

## What's editable per schema

### `siteSettings` (singleton, grouped)

| Group | Field | Renders on |
|---|---|---|
| Media & images | `landingHeroImage` | `/` hero background (low-opacity) |
| Media & images | `aboutHeroImage` | `/about` hero |
| Media & images | `openGraphImage` | OG fallback (all pages) |
| Media & images | `aboutOpenGraphImage` | `/about` OG override |
| Homepage | `landingHero.eyebrow / heading / description / primaryCta / secondaryCta` | `/` HeroSection — empty fields fall back to in-code defaults |
| Homepage | `featuredVideo` (ref → `video`) | `/` FeaturedVideoSection — section only renders when set |
| Homepage | `featuredVideoHeading` | Featured-video section heading override |
| Impact page | `impactTestimonials[]` (quote / name / role) | `/impact` "Voices of growth" band |
| Impact page | `environmentalStats[]` (value / label / description) | `/impact` "Environmental stewardship" cards |
| About page | `historyTimeline[]` (title / date / content) | `/about` HistoryTimeline |
| FAQ | `faqItems[]` (question / answer) | `/help` FAQSection |

#### `environmentalStats[].value` placeholders

To pin a card to a live metric, set `value` to one of:

- `{{treesAlive}}` → `dbStats.treesAliveLatestAudit`
- `{{treesPlanted}}` → `dbStats.treesPlantedTotal`
- `{{corporatePartners}}` → `dbStats.activeCorporatePartners`
- `{{ngoPartners}}` → `dbStats.activeNgoPartners`
- `{{activeMentors}}` → `dbStats.activeMentors`
- `{{youthEngaged}}` → `dbStats.youthEngagedActive`
- `{{mentorshipHours}}` → `dbStats.mentorshipHoursTotal`
- `{{survivalRate}}` → `dbStats.survivalRatePct%`

Anything else is treated as literal text (e.g. `"100%"`).

### `article` (multi-doc)

Authored two ways:
- **In-app** (Mentor/Mentee) via `/dashboard/articles/new` → Neon canonical, mirrored to Sanity on moderator approval. Deterministic ID `article-jenga-<uuid>`.
- **In Studio** (Moderator/SuperAdmin) directly. Lands as a regular Sanity doc.

Fields: `title`, `slug`, `excerpt`, `body` (block + image), `category`, `tags`, `author` (ref), `coAuthors[]` (ref array), `mainImage`, `isFeatured`, `status`, `publishedAt`.

Public render: `/articles/[slug]` reads from Sanity. Body supports bold / italic / inline code / links / headings (h2-h4) / blockquote / bullet lists / inline images. Tags + category render in the sidebar; co-authors stacked under the primary author.

### `author`

Author docs are auto-managed:
- `ensureAuthorDoc` creates `author-jenga-<userId>` on Studio open (Moderator/SuperAdmin) and on first article publish.
- Mentor/Mentee can edit their own bio + role through `/dashboard/settings/author-profile` — saves to `users.metadata` and patches the Sanity author doc.

Fields: `name`, `slug`, `role`, `image`, `bio`, `userId` (back-ref to Neon).

### Other schemas (all editable via Studio for Moderator/SuperAdmin)

- `product` — store catalog. Public `/shop` reads from Sanity; stock is mirrored to Neon `merchandise` via `getMerchandiseMap`. Inventory edits happen at `/dashboard/moderator/inventory`.
- `event` + `eventComment` + `speaker` — `/events` page.
- `resource` — `/resources` learning materials.
- `helpTopic` + `userManual` — `/help` center (audience-filtered via Better Auth).
- `voices` — community success stories.
- `video` — schema exists; only surface is `siteSettings.featuredVideo` (homepage) for now.
- `partner` — corporate partner profiles for `/about` carousel via `fetchPartners`.
- `coach` — mentor public profiles.
- `teamOfficial` — `/about` leadership grid.

## What still has in-code defaults

Components accept overrides from `siteSettings`; if the Sanity field is empty, the in-code default renders unchanged.

| Component | Default lives in | Override field |
|---|---|---|
| `HeroSection` | `DEFAULT_COPY` | `siteSettings.landingHero` |
| `ImpactPage` testimonials | `DEFAULT_IMPACT_STORIES` (3 entries) | `siteSettings.impactTestimonials` |
| `ImpactPage` environmental stats | `DEFAULT_ENVIRONMENTAL_STATS` (4 cards) | `siteSettings.environmentalStats` |
| `FAQSection` | `DEFAULT_FAQ_ITEMS` (5 Q&A pairs) | `siteSettings.faqItems` |
| `HistoryTimeline` | `DEFAULT_NODES` (4 milestones) | `siteSettings.historyTimeline` |
| `FeaturedVideoSection` | (section hidden when empty) | `siteSettings.featuredVideo` |

## Marketing surfaces not yet in Sanity

These render hardcoded copy that isn't editable through Studio yet:

- `WhatWeDoSection.tsx` — "What we do" / mission band on homepage
- `ChoosePathSection.tsx` — role pickers (Mentee/Mentor/Corporate/NGO)
- `SweatEquityBand.tsx` — "Sweat Equity" protocol explainer
- `StakeholdersDeepDive.tsx` — 4 stakeholder cards on `/about` (mentee/mentor/corporate/ngo with rules)
- `OurPhilosophy.tsx` — `/about` philosophy band
- `WhyJenga.tsx` — `/about` differentiators
- `Testimonials.tsx` — `/about` testimonial carousel (separate from impact testimonials)
- `FinalCTAStrip.tsx` — bottom-of-page CTA
- `Footer.tsx` — footer columns + copy
- `PageHero.tsx` — generic hero copy on `/contact`, `/donate`, `/voices`, `/resources`, etc.

If you want any of those editable, the pattern is identical to what we just did:
add the fields to `siteSettings` (or a new singleton), expand `siteSettingsQuery`,
make the component accept a prop with sensible defaults, pass `settings.X` from
the page.

## NGO partner count is NOT hardcoded

The "NGO Partners" stat card on `/impact` reads from `v_public_impact_aggregate.active_ngo_partners`. That pgView counts `corporate_partners` rows where `is_active = true` and the linked user has `users.metadata->>'orgType' = 'ngo'`. If you see "15", that's the live DB count. To verify:

```sql
SELECT count(DISTINCT cp.id)
FROM corporate_partners cp
WHERE cp.is_active = true
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.partner_id = cp.id AND u.metadata->>'orgType' = 'ngo'
  );
```

## Workflow for content updates

1. Sanity Manage Console: ensure `http://localhost:3000` + production URL + `*.vercel.app` are in CORS origins.
2. Login to dashboard → "Sanity Studio" in sidebar (or `/studio`).
3. Open the `siteSettings` document in Studio.
4. Edit fields under the appropriate group (Homepage / Impact page / About page / FAQ).
5. Publish. Public pages are `force-dynamic` so changes appear on next request — no rebuild needed.

For articles: in-app authors go through `/dashboard/articles`, moderator approves from `/dashboard/moderator`, article appears at `/articles/<slug>`.
