# MODULE 12 — ARTICLE AUTHORING SYSTEM: ROLE-BASED PUBLISHING WITH SANITY CMS & MODERATOR APPROVAL WORKFLOW

---

### 12.1 — System Overview & Philosophy

Every authenticated user on Jenga365 — Mentor, Mentee, CorporatePartner, and Moderator — has the ability to **author articles**. This transforms the platform from a passive content destination into a **living knowledge base** co-created by the community it serves.

The publishing pipeline enforces a strict **Draft → Review → Published** flow. No user except a Moderator (or SuperAdmin) can push content directly to the public-facing articles page. This protects content quality, brand safety, and protects youth users from unmoderated content.

```
Author writes article (any role)
  → Saves as Draft (visible only to author)
    → Submits for Review
      → Moderator receives notification
        → Moderator reviews, edits metadata, approves or rejects
          → If approved: article publishes to /articles (public or role-gated)
          → If rejected: author notified with feedback, article returns to Draft
```

---

### 12.2 — Who Can Do What: Article Permission Matrix

| Action | Mentee | Mentor | Corporate | Moderator | SuperAdmin |
|---|---|---|---|---|---|
| Create new article | ✅ | ✅ | ✅ | ✅ | ✅ |
| Save as draft | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit own draft | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete own draft | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit for review | ✅ | ✅ | ✅ | ✅ | ✅ |
| Recall submission (back to draft) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve & publish | ❌ | ❌ | ❌ | ✅ | ✅ |
| Reject with feedback | ❌ | ❌ | ❌ | ✅ | ✅ |
| Edit any article (pre-publish) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Unpublish a live article | ❌ | ❌ | ❌ | ✅ | ✅ |
| Feature an article (homepage) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete any article | ❌ | ❌ | ❌ | ❌ | ✅ |
| View own drafts | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all drafts (moderation) | ❌ | ❌ | ❌ | ✅ | ✅ |

---

### 12.3 — Article Status State Machine

Every article moves through exactly these states. No other states exist:

```
                    ┌─────────────────────────────────────┐
                    │                                     │
    CREATE          ▼         SUBMIT           APPROVE    │
    ───────► [DRAFT] ────────► [IN_REVIEW] ────────► [PUBLISHED]
                    ▲               │                     │
                    │    REJECT     │         UNPUBLISH   │
                    └───────────────┘◄────────────────────┘
                    
    RECALL: IN_REVIEW → DRAFT (author action, before moderator acts)
    DELETE: DRAFT only (authors); any state (SuperAdmin only)
```

```typescript
// Drizzle enum addition
articleStatus: pgEnum('article_status', [
  'draft',        // saved, not submitted — visible only to author
  'in_review',    // submitted for moderation — visible to moderator queue
  'published',    // approved — visible on /articles page
  'rejected',     // rejected by moderator — returned to author with feedback
  'unpublished',  // was published, pulled by moderator — invisible to public
])
```

---

### 12.4 — The "Write Article" Button: Placement Specification

The entry point to the article editor must appear in **three locations** for every authenticated user. It must never appear for unauthenticated guests.

#### Location 1 — Dashboard Profile Card

Every role's dashboard has a profile summary card in the sidebar or top section. Beneath the user's name, role badge, and avatar:

```
┌────────────────────────────────┐
│  [Avatar]  Bruce Odhiambo      │
│            Projects Lead       │
│            ● Active            │
│                                │
│  [✏️ Write an Article]         │  ← PRIMARY CTA button, full width
│  [📋 My Articles (3)]          │  ← Secondary link to their article list
└────────────────────────────────┘
```

- "Write an Article" button: routes to `/dashboard/articles/new`
- "My Articles (N)" link: routes to `/dashboard/articles` filtered to `author_id = current_user`
- The count `(N)` shows total articles across all statuses (draft + in_review + published)

#### Location 2 — Dashboard Articles Tab

Each dashboard has a dedicated **"My Articles"** tab/section. At the top of this section:

```
┌─────────────────────────────────────────────────────────┐
│  My Articles                          [+ New Article]   │
│                                                         │
│  [All] [Drafts (2)] [In Review (1)] [Published (3)]     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ "The Mental Game: How Rugby Shaped My Career"   │   │
│  │ Status: 🟡 In Review · Submitted 2 days ago     │   │
│  │ [Edit] [Recall]                                 │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ "Financial Literacy for Young Athletes"         │   │
│  │ Status: ✅ Published · 1,203 views              │   │
│  │ [View] [Edit] [Unpublish — moderator only]      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

#### Location 3 — Public Articles Page (Authenticated View Only)

On `/articles`, when a logged-in user visits the public articles listing page, a **floating action button (FAB)** appears in the bottom-right corner:

```
                                    ┌──────────────────────┐
                                    │  ✏️  Write Article    │
                                    └──────────────────────┘
                                              ↑
                              Fixed position, bottom-right
                              Only visible when authenticated
                              Hidden for guests / unauthenticated
```

Clicking this FAB routes to `/dashboard/articles/new` (same destination as the dashboard button).

---

### 12.5 — The Article Editor: Full Specification

#### Route & Access
```
/dashboard/articles/new          ← Create new article
/dashboard/articles/[id]/edit    ← Edit existing draft or rejected article
/dashboard/articles/[id]/view    ← Read-only preview (published articles)
```

All three routes are protected by the auth middleware. An author can only access their own article's edit route. Moderators and SuperAdmins can access any article's edit route.

#### Editor Layout (Two-Column)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to My Articles                            [Save Draft]  │
│                                                   [Submit for   │
│                                                    Review]      │
├──────────────────────────────────┬──────────────────────────────┤
│                                  │  ARTICLE SETTINGS            │
│  TITLE                           │  ─────────────────────────── │
│  ┌──────────────────────────────┐│  Category                    │
│  │ Enter article title...       ││  [ Rugby ▾ ]                 │
│  └──────────────────────────────┘│                              │
│                                  │  Tags                        │
│  COVER IMAGE                     │  [ + Add tag ]               │
│  ┌──────────────────────────────┐│                              │
│  │  [Upload Image / Drag & Drop]││  Excerpt (max 300 chars)     │
│  └──────────────────────────────┘│  ┌────────────────────────┐ │
│                                  │  │                        │ │
│  BODY (Rich Text Editor)         │  └────────────────────────┘ │
│  ┌──────────────────────────────┐│                              │
│  │ B I U | H1 H2 H3 | " ── |   ││  Est. Read Time: 4 min      │
│  │ • ≡ | 🔗 📷 📹 |             ││  (auto-calculated)           │
│  │                              ││                              │
│  │                              ││  Author                      │
│  │  Write your article here...  ││  Bruce Odhiambo (you)        │
│  │                              ││                              │
│  │                              ││  Co-authors (optional)       │
│  │                              ││  [ + Add co-author ]         │
│  └──────────────────────────────┘│                              │
│                                  │  Downloadable PDF (optional) │
│  AI ASSIST (collapsed by default)│  [ Upload PDF companion ]    │
│  ┌──────────────────────────────┐│                              │
│  │ ✨ Improve my writing...     ││  ─────────────────────────── │
│  │ [Generate outline]           ││  SUBMISSION CHECKLIST        │
│  │ [Fix grammar]                ││  ☑ Title added               │
│  │ [Suggest tags]               ││  ☑ Body (min 300 words)      │
│  └──────────────────────────────┘│  ☐ Cover image               │
│                                  │  ☑ Category selected         │
│                                  │  ☐ Excerpt written           │
│                                  │                              │
│                                  │  [Submit for Review →]       │
│                                  │  (disabled until checklist   │
│                                  │   minimum items complete)    │
└──────────────────────────────────┴──────────────────────────────┘
```

#### Editor Technical Implementation

```typescript
// /app/(dashboard)/articles/new/page.tsx — Client Component
// Rich text editor: use @portabletext/editor or BlockNote (recommended for ease)
// Autosave: every 30 seconds via Server Action saveDraftDebounced()
// Cover image: upload to Cloudflare R2 via presigned URL, 
//              store URL in article.cover_image_url
// Word count: calculated client-side in real time
// Read time: Math.ceil(wordCount / 200) minutes
```

#### AI Assist Panel (Mentor + Corporate only, hidden for Mentee by default — configurable)

Built on Vercel AI SDK, the AI Assist panel offers:

```typescript
// Four AI assist actions available from the editor sidebar:

1. "Generate outline"
   → Takes the article title as input
   → Returns a structured H2/H3 outline the author can insert as a starting scaffold
   → Prompt: "Generate a structured article outline for a Jenga365 community 
              article titled: [title]. The audience is young rugby players and 
              professionals in East Africa. Return as H2 and H3 headings only."

2. "Fix grammar & clarity"
   → Takes selected text or full body
   → Returns cleaned version with tracked changes highlighted
   → Author accepts or rejects each suggestion

3. "Suggest tags"
   → Analyses the body text
   → Returns 3–5 recommended tags from the platform's tag taxonomy
   → One-click to apply

4. "Write intro paragraph"
   → Takes title + outline (if exists)
   → Generates a 2–3 sentence opening paragraph
   → Inserted at cursor position, editable
```

---

### 12.6 — Sanity CMS Integration for Articles

Articles are authored in the **Next.js editor** (for a seamless dashboard experience) but **synced to Sanity** on publish. Sanity serves as the content delivery layer for the public `/articles` page.

#### The Sync Architecture

```
Author writes in Next.js editor
  → Draft saved to Neon (articles table) — fast, local, private
    → On Moderator approval:
      → Article data pushed to Sanity via Sanity HTTP API
        → Sanity document created/updated with status: 'published'
          → /articles page fetches from Sanity (ISR, revalidate: 300)
            → Article appears publicly
```

This two-layer approach means:
- **Neon** = source of truth for draft state, authorship, moderation history
- **Sanity** = public-facing delivery layer (fast CDN, GROQ queries, ISR)

#### Sanity Document Creation on Approval

```typescript
// /lib/actions/moderation.ts
async function approveArticle({ articleId, moderatorId }: ApproveArticleInput) {
  // 1. Fetch article from Neon
  const article = await db.select().from(articles).where(eq(articles.id, articleId));

  // 2. Push to Sanity
  const sanityDoc = await sanityClient.create({
    _type: 'article',
    title: article.title,
    slug: { current: article.slug },
    body: article.body_portable_text,   // stored as Portable Text JSON in Neon
    author: { _ref: article.author_sanity_person_id },
    publishedAt: new Date().toISOString(),
    excerpt: article.excerpt,
    tags: article.tags,
    category: article.category,
    coverImage: { asset: { _ref: article.cover_image_r2_url } },
    readTime: article.read_time_minutes,
    isFeatured: false,
  });

  // 3. Update Neon record
  await db.update(articles)
    .set({
      status: 'published',
      sanity_doc_id: sanityDoc._id,
      published_at: new Date(),
      approved_by: moderatorId,
    })
    .where(eq(articles.id, articleId));

  // 4. Log activity
  await logActivity({ userId: article.author_id, action: 'article_published', entityId: articleId });

  // 5. Notify author
  await sendEmail({ template: 'ArticleApproved', to: article.author_email, data: { title: article.title } });
  
  // 6. Trigger ISR revalidation
  await fetch(`/api/revalidate?path=/articles&secret=${process.env.REVALIDATE_SECRET}`);
}
```

#### Sanity Article Schema (Full — extends Module 9.5)

```javascript
// sanity/schemas/article.js — complete schema
{
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    { name: 'title',          type: 'string',   validation: Rule => Rule.required() },
    { name: 'slug',           type: 'slug',     options: { source: 'title' }, validation: Rule => Rule.required() },
    { name: 'author',         type: 'reference', to: [{ type: 'person' }] },
    { name: 'coAuthors',      type: 'array',    of: [{ type: 'reference', to: [{ type: 'person' }] }] },
    { name: 'authorRole',     type: 'string',   options: { list: ['Mentor','Mentee','CorporatePartner','Moderator','Team'] } },
    { name: 'publishedAt',    type: 'datetime' },
    { name: 'excerpt',        type: 'text',     validation: Rule => Rule.max(300) },
    { name: 'readTime',       type: 'number' },
    { name: 'coverImage',     type: 'image',    fields: [{ name: 'alt', type: 'string' }] },
    { name: 'body',           type: 'array',    of: [{ type: 'block' }, { type: 'image' }, { type: 'code' }] },
    { name: 'tags',           type: 'array',    of: [{ type: 'string' }],
      options: { list: ['Rugby','Mentorship','Career','Education','Finance',
                        'Mental Wellness','Sustainability','Green Game',
                        'Networking','Leadership','Youth Development'] } },
    { name: 'category',       type: 'string',
      options: { list: ['Rugby','Mentorship','Education','Business','Impact','Community','Wellness'] } },
    { name: 'isFeatured',     type: 'boolean',  initialValue: false },
    { name: 'viewCount',      type: 'number',   initialValue: 0 },
    { name: 'relatedArticles',type: 'array',    of: [{ type: 'reference', to: [{ type: 'article' }] }] },
    { name: 'downloadablePdf',type: 'file' },
    { name: 'neonArticleId',  type: 'string' },   // cross-reference back to Neon articles table
    { name: 'approvedBy',     type: 'string' },   // moderator name (denormalised for Sanity display)
  ],
  preview: {
    select: { title: 'title', subtitle: 'authorRole', media: 'coverImage' }
  }
}
```

---

### 12.7 — The Moderator Article Review Interface

When an author submits an article for review, it appears in the Moderator's **Content Queue** — a separate tab from the User Approval Queue.

#### Moderator Content Queue UI

```
/dashboard/moderator/queue/content

┌─────────────────────────────────────────────────────────────────┐
│  Content Moderation Queue                    Filter: [All ▾]    │
│  3 articles pending review                                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ "Why Financial Literacy is Rugby's Greatest Off-Field Win" │  │
│  │ By: Bruce Odhiambo (Mentor) · Submitted 1 hour ago        │  │
│  │ Category: Finance · Tags: rugby, career, finance           │  │
│  │ Read time: 6 min · Words: 1,204 · Has cover image: ✅      │  │
│  │                                                           │  │
│  │ Submission checklist: ✅ Title ✅ Body ✅ Cover ✅ Excerpt  │  │
│  │                                                           │  │
│  │ [👁 Preview Article]  [✏️ Edit Metadata]                   │  │
│  │                                                           │  │
│  │ Moderator note (optional): ________________________       │  │
│  │                                                           │  │
│  │ [✅ APPROVE & PUBLISH]  [↩️ RETURN TO AUTHOR]  [🗑 DELETE] │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

#### Moderator Actions

**Approve & Publish:**
```
→ Confirm modal: "Publish this article to /articles?"
→ Optional: Toggle "Feature on homepage" (SuperAdmin only sees this toggle)
→ Server Action: approveArticle({ articleId, moderatorId, featured: false })
→ Article synced to Sanity (see 12.6)
→ Status: published
→ Author notified via email + in-app notification:
  "🎉 Your article '[title]' has been published!"
→ Article appears on /articles immediately (ISR revalidation triggered)
→ moderation_log entry created
```

**Return to Author (Reject with Feedback):**
```
→ Modal: "Return this article to the author"
→ Required: Feedback field (what needs to change)
  Suggested feedback prompts (clickable):
  • "Please add a cover image before resubmitting"
  • "The title needs to be more specific"
  • "Please shorten the article — aim for under 800 words"
  • "Content appears to be off-topic for Jenga365's community"
  • Custom feedback...
→ Server Action: returnArticle({ articleId, moderatorId, feedback })
→ Status: rejected (returns to draft state with feedback visible)
→ Author notified: "Your article has been returned with feedback. 
                    Log in to view comments and resubmit."
→ In the author's editor: feedback displayed as a yellow banner at the top
→ Author edits and can re-submit for review (no limit on resubmissions)
```

**Edit Metadata (Moderator pre-publish edit):**
```
Moderators can edit ONLY:
  - Title (light copyediting)
  - Excerpt
  - Tags
  - Category
  - Featured toggle (SuperAdmin only)
  - Cover image (replace if poor quality)

Moderators CANNOT edit article body text.
If body needs changes, article must be returned to author.
This protects author voice and attribution integrity.
```

---

### 12.8 — The Public Articles Page (Authenticated Enhancements)

The `/articles` page is public but renders **additional elements for authenticated users**:

#### Guest View
```
/articles

┌─────────────────────────────────────────────────────┐
│  ARTICLES                          [Search articles] │
│  Insights from the Jenga365 community               │
│                                                     │
│  Filter: [All] [Rugby] [Mentorship] [Career] [More] │
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │ Article │  │ Article │  │ Article │             │
│  │  Card   │  │  Card   │  │  Card   │             │
│  └─────────┘  └─────────┘  └─────────┘             │
│                                                     │
│  [Load more]                                        │
└─────────────────────────────────────────────────────┘
```

#### Authenticated User Additions
```
Same page, authenticated user sees additionally:

1. FAB button (bottom-right): [✏️ Write Article]

2. Article cards show extra metadata:
   - "Written by a Mentor" / "Written by a Mentee" role badge 
     on the card corner (colour-coded: Mentor=green, Mentee=blue, 
     Corporate=gold, Team=purple)

3. Personal "My Drafts" pill in the filter bar:
   [All] [Rugby] [Career] [...] [📝 My Drafts (2)]
   → Clicking "My Drafts" shows the user's own unpublished articles
     (only visible to the author — not public)

4. Article card actions (on hover, for own articles only):
   ┌──────────────────┐
   │  [Your article]  │
   │  Status: Draft   │
   │  [Edit] [Delete] │
   └──────────────────┘
```

#### Article Detail Page (`/articles/[slug]`)

```
/articles/[slug]

For authenticated users, article footer includes:
┌─────────────────────────────────────────────────────┐
│  Did this article help you?                         │
│  [👍 Helpful]  [🔖 Save]  [Share ▾]                 │
│                                                     │
│  Written by a Jenga365 Mentor                       │
│  ──────────────────────────────                     │
│  Inspired to share your own knowledge?              │
│  [✏️ Write your own article →]                      │
└─────────────────────────────────────────────────────┘

For guests, article footer instead shows:
┌─────────────────────────────────────────────────────┐
│  Join Jenga365 to contribute articles, access       │
│  exclusive resources, and connect with mentors.     │
│  [Create Free Account →]                            │
└─────────────────────────────────────────────────────┘
```

---

### 12.9 — Neon Schema Additions for Module 12

```typescript
// Full articles table (replaces the abbreviated version in Module 5)
articles: {
  id:                    uuid PRIMARY KEY,
  author_id:             uuid FK → users NOT NULL,
  co_author_ids:         uuid[],                    // array of user FKs
  title:                 text NOT NULL,
  slug:                  text UNIQUE NOT NULL,       // auto-generated from title
  excerpt:               text,                       // max 300 chars
  body_portable_text:    jsonb,                      // Portable Text JSON (BlockNote output)
  cover_image_url:       text,                       // R2 URL
  cover_image_alt:       text,
  category:              article_category_enum,
  tags:                  text[],
  read_time_minutes:     integer,                    // computed from word count
  word_count:            integer,
  status:                article_status_enum,        // draft|in_review|published|rejected|unpublished
  moderator_id:          uuid FK → users | null,     // who reviewed it
  moderator_note:        text | null,                // internal note
  rejection_feedback:    text | null,                // shown to author on rejection
  approved_by:           uuid FK → users | null,
  sanity_doc_id:         text | null,                // Sanity document _id after publish
  is_featured:           boolean DEFAULT false,
  view_count:            integer DEFAULT 0,
  submitted_for_review_at: timestamp | null,
  published_at:          timestamp | null,
  last_edited_at:        timestamp,
  created_at:            timestamp DEFAULT now(),
  deleted_at:            timestamp | null,           // soft delete
}

// article_saves (bookmarks)
article_saves: {
  id:         uuid,
  user_id:    uuid FK → users,
  article_id: uuid FK → articles,
  saved_at:   timestamp DEFAULT now(),
  UNIQUE(user_id, article_id)
}

// article_helpful_votes
article_helpful_votes: {
  id:         uuid,
  user_id:    uuid FK → users,
  article_id: uuid FK → articles,
  voted_at:   timestamp DEFAULT now(),
  UNIQUE(user_id, article_id)
}
```

---

### 12.10 — Notification Triggers for Article Events

Every article state change fires a notification. All notifications go to **both** in-app (bell icon) and email:

| Event | Recipient | In-App Message | Email Template |
|---|---|---|---|
| Article submitted for review | Moderator(s) with content scope | "New article pending review: '[title]'" | `ArticleSubmittedModerator` |
| Article approved & published | Author | "🎉 Your article '[title]' is now live!" | `ArticleApprovedAuthor` |
| Article returned with feedback | Author | "Your article '[title]' was returned with feedback" | `ArticleReturnedAuthor` |
| Article unpublished | Author | "Your article '[title]' has been unpublished by a moderator" | `ArticleUnpublishedAuthor` |
| Article receives 100 views | Author | "🎯 Your article '[title]' just hit 100 views!" | `ArticleMilestoneViews` |
| Co-author added | Co-author | "[Name] has added you as a co-author on '[title]'" | `ArticleCoAuthorAdded` |

---

### 12.11 — Component & Route Map for Module 12

```
/app/(dashboard)
  /articles
    /page.tsx                        ← Author's article list (My Articles tab)
    /new/page.tsx                    ← New article editor (Client Component)
    /[id]/edit/page.tsx              ← Edit draft/rejected article
    /[id]/view/page.tsx              ← Read-only preview

/app/(marketing)
  /articles
    /page.tsx                        ← Public articles listing (ISR, Sanity)
    /[slug]/page.tsx                 ← Article detail page (ISR, Sanity)

/components
  /articles
    /ArticleEditor.tsx               ← Full two-column editor (Client Component)
    /AIAssistPanel.tsx               ← AI writing assistant sidebar
    /ArticleStatusBadge.tsx          ← Coloured status pill (draft/in_review/etc.)
    /ArticleCard.tsx                 ← Public listing card (Sanity data)
    /ArticleCardAuthor.tsx           ← Dashboard card (Neon data, shows status)
    /AuthorRoleBadge.tsx             ← Mentor/Mentee/Corporate colour badge
    /SubmissionChecklist.tsx         ← Right sidebar checklist in editor
    /WriteArticleFAB.tsx             ← Floating action button (auth-gated)
    /WriteArticleButton.tsx          ← Dashboard profile card button
    /MyDraftsFilter.tsx              ← "My Drafts" pill in public articles filter
    /ArticleHelpfulVote.tsx          ← 👍 Helpful button
    /ArticleSave.tsx                 ← 🔖 Save/bookmark button
  /dashboard
    /moderator
      /ContentModerationQueue.tsx    ← Article review queue
      /ArticleReviewCard.tsx         ← Individual article review item
      /FeedbackModal.tsx             ← Return to author with feedback modal
      /MetadataEditModal.tsx         ← Moderator metadata editing

/lib/actions
  /articles.ts                       ← All article Server Actions:
    createArticle()
    saveDraft()
    submitForReview()
    recallSubmission()
    approveArticle()                  ← Moderator/SuperAdmin only
    returnArticle()                   ← Moderator/SuperAdmin only
    unpublishArticle()                ← Moderator/SuperAdmin only
    deleteArticle()
    incrementViewCount()
    saveArticle()                     ← bookmark
    voteHelpful()
    editArticleMetadata()             ← Moderator only

/lib/sanity
  /articleSync.ts                    ← pushArticleToSanity(), unpublishFromSanity()
```

---

### 12.12 — Instruction to AI Model (Module 12)

> **"Using the specifications in Module 12, generate the following in order:**
>
> 1. **`/app/(dashboard)/articles/new/page.tsx`** — The full two-column article editor. Left column: title input, cover image uploader (R2 presigned URL), BlockNote or equivalent rich text editor body. Right column: category dropdown, tags multi-select, excerpt textarea, read time display (auto-calculated), submission checklist component, and "Submit for Review" button (disabled until checklist passes). Include autosave every 30 seconds via debounced Server Action.
>
> 2. **`/components/articles/ArticleEditor.tsx`** — Extract the editor as a reusable Client Component usable for both `/new` and `/[id]/edit` routes. Accept `initialData?: Partial<Article>` prop for edit mode pre-population.
>
> 3. **`/components/articles/WriteArticleButton.tsx`** — A simple, styled CTA button component. Accepts a `variant` prop: `'dashboard-card'` (full-width, in profile card) or `'fab'` (fixed bottom-right floating button). The FAB variant must only render when `session?.user` exists — return null for unauthenticated users.
>
> 4. **`/components/dashboard/moderator/ContentModerationQueue.tsx`** — Tabbed queue showing articles `in_review` status. Each item shows: title, author name + role badge, submission time, word count, cover image status, tags, and three action buttons: Approve & Publish, Return to Author (opens FeedbackModal), Delete. Approve triggers `approveArticle()` Server Action which syncs to Sanity.
>
> 5. **`/lib/actions/articles.ts`** — All article Server Actions as defined in 12.11. Each action must: (a) verify session, (b) verify role permission against the matrix in 12.2, (c) validate input with Zod, (d) execute DB mutation, (e) trigger side effects (notifications, Sanity sync, activity log, ISR revalidation).
>
> 6. **`/lib/sanity/articleSync.ts`** — `pushArticleToSanity()` and `unpublishFromSanity()` functions. `pushArticleToSanity` takes a Neon article record and creates/updates the Sanity document via `@sanity/client`. `unpublishFromSanity` patches the Sanity document status or deletes it based on the unpublish reason.
>
> 7. **`/app/(marketing)/articles/page.tsx`** — Public articles listing page. Server Component. Fetches published articles from Sanity via GROQ. Renders `ArticleCard` grid with category filters. Conditionally renders `WriteArticleFAB` (Client Component, auth-aware) and `MyDraftsFilter` pill for authenticated users.
>
> All TypeScript. All Tailwind + Shadcn/UI. Server Actions follow Module 9.9 universal pattern. Sanity sync fires only after DB transaction commits successfully — use try/catch with rollback on Sanity failure (mark article `sanity_sync_failed: true` for retry cron)."**
