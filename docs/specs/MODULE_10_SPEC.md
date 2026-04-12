# MODULE 10 — ABOUT PAGE: DEFINITIVE CONTENT & COMPONENT SPECIFICATION

### 10.1 — Page Purpose & Narrative Direction

The `/about` page serves as the **definitive brand narrative** for Jenga365. It must move away from fragmented content blocks toward a **cohesive, chronological story** that bridges the 2024 origins with the AI-native, tripartite model of 2026. The page should feel like a **founding document** — authoritative, warm, and mission-driven — not a marketing brochure.

**Tone:** Confident, community-rooted, forward-looking. Rugby values of teamwork, discipline, and respect should be felt in the writing cadence, not just stated.

**Primary CTA goal:** Convert visitors into either Mentors, Mentees, or Donors before they leave the page.

---

### 10.2 — Page Section Structure (Ordered)

The page must render the following sections **in this exact sequence**:

#### Section 1 — Hero Banner
- **Headline:** "Building Growth. Connecting Futures."
- **Sub-headline:** "Ensuring no young person, athlete, or professional navigates their journey alone."
- **Vision statement (pull quote style):** "We believe in building the 'Total Athlete' — addressing the Mind, Body, Pocket, and Planet."
- **CTA buttons:** "Donate Now" (primary, Stripe link) + "Join the Movement" (secondary, `/register`)

#### Section 2 — The Tripartite Model (2026 Operational Strategy)

Render as a **visually distinct comparison component** — not a plain HTML table. Use a three-column card layout (desktop) / stacked accordion (mobile):

| Pillar | Focus | Goal |
|---|---|---|
| **1. Mentorship** (Human Capital) | Psycho-social support & identity building | Connecting ambitious youth with seasoned veterans to build mental resilience |
| **2. Networking** (Social Capital) | Career readiness & professional access | Bridging the skills gap through financial literacy and direct access to industry leaders |
| **3. Impact** (Sustainability) | The Green Game & Community Stewardship | Operationalizing "Rugby for Change" through tree planting and climate action within the rugby calendar |

**Component requirements:**
- Each pillar card has a unique accent colour (Mentorship: brand green `#C8F04A`, Networking: teal `#4AF0C8`, Impact: coral `#F04A8C`)
- Pillar number displayed as a large typographic element (behind the card title as a watermark digit)
- Icon per pillar: a person silhouette for Mentorship, a network node for Networking, a leaf for Impact
- Hover state reveals the full "Goal" text with a smooth slide-up animation
- Section label above: "The Tripartite Model · 2026 Operational Strategy"

#### Section 3 — Our Journey: History Timeline

Render as a **vertical interactive timeline** with four nodes. Each node has:
- A coloured dot (unique per era) with a glowing pulse animation on the active/hovered node
- A date stamp in monospace font
- An era title in display serif font
- A body paragraph
- A subtle dividing line connecting all nodes

**Timeline content (exact copy):**

**Node 1 — "The Genesis" · October 2024** *(accent: `#C8F04A`)*
> Jenga365 began with a burning observation: the disconnect between raw talent and professional opportunity. Our initial mandate was simple — bridge that gap. We launched as a platform dedicated to helping young rugby players find their footing through professional networks.

**Node 2 — "The Strategic Pivot" · 2025** *(accent: `#4AF0C8`)*
> True development requires more than just advice; it requires an ecosystem. In 2025, we paused to analyze. Using rigorous Monitoring and Evaluation (M&E), we scrutinized our impact. The data spoke clearly — our community needed tangible, holistic support.
> - We went **digital**: Launching a centralized, AI-assisted platform.
> - We went **holistic**: Revamping our model to include mental well-being and environmental stewardship.
> - We went **impact-first**: Moving from conversations to sports clinics and school drives.

**Node 3 — "The Acceleration" · 21 June 2025 → Present** *(accent: `#F04A8C`)*
> Today, the foundation is set. Jenga365 represents a new era of aggressive growth and data-driven impact. We are no longer testing the waters; we are operating with set quarterly goals and an "AI-Native" architecture that ensures every mentorship match is precise and every social impact pulse is tracked.
>
> *"Jenga" means "to build." We are building the future, 365 days a year.*

**Node 4 — "NGO Registration" · 21 September 2025** *(accent: `#F0C84A`)*
> Registration as an NGO is ongoing. Full operations continue and updates are shared on the website and socials.

#### Section 4 — Why Jenga365? (Four Reasons Block)

Render as a **2×2 grid of reason cards** on desktop, single column on mobile. Each card has an icon, a bold heading, and a single sentence of supporting copy:

| Icon | Heading | Copy |
|---|---|---|
| 🧠 | Holistic Growth | We don't just build players; we build people — covering career, education, and mental well-being. |
| 🏉 | Community Rooted | Born from the rugby values of teamwork, discipline, and respect. |
| 🛡️ | Safe & Structured | A verified, AI-monitored platform ensuring safe, productive connections for youth and professionals. |
| 🌱 | Environmentally Committed | We integrate sustainability into rugby culture through "The Green Game" initiatives. |

#### Section 5 — Leadership Team Grid

Render as a **4-column photo grid** (desktop) / 2-column (tablet) / 1-column (mobile):

Each team member card must include:
- Square or portrait photo (loaded from existing CDN URLs, with graceful fallback avatar if image fails)
- Name in display serif font
- Role in monospace uppercase with accent colour
- Optional 1-sentence bio (for Bruce Odhiambo and Nyaenya Moseti — bios already written)
- Social icons row: render only the icons for which links exist (Twitter/X, LinkedIn, Instagram)

**Team data (exact, for the schema/props):**
```typescript
const team = [
  { name: "Peter Lugano",    role: "Chairperson",   twitter: "https://x.com/peterlugano",           linkedin: "https://www.linkedin.com/in/peter-lugano-srmp-c-774424b3/" },
  { name: "Barnabas Owuor",  role: "Secretary",      instagram: "https://www.instagram.com/barno_owuor", linkedin: "https://www.linkedin.com/in/barnabas-owuor/" },
  { name: "Roldie Tende",    role: "Treasurer",      instagram: "https://www.instagram.com/i_rock_roldie" },
  { name: "Mark Dunford",    role: "Director",       instagram: "https://www.instagram.com/dunfordmark",  linkedin: "https://www.linkedin.com/in/markdunford/" },
  { name: "Bruce Odhiambo",  role: "Projects Lead",  bio: "Drives the overall vision and direction of J365. Oversees strategy, partnerships, and community growth while ensuring the mission stays rooted in mentorship and opportunity.",
                              twitter: "https://x.com/bruce_odhiambo_",   linkedin: "https://www.linkedin.com/in/bruce-odhiambo-8614b5175/" },
  { name: "Sheila Chajira",  role: "Ambassador",     linkedin: "https://www.linkedin.com/in/sheila-chajira-607906295/" },
  { name: "Nyaenya Moseti",  role: "Tech Lead",      bio: "Manages J365's digital infrastructure. Ensures smooth user experience and builds platforms that connect rugby players to the support they need.",
                              twitter: "https://x.com/moseti_15",          linkedin: "http://www.linkedin.com/in/moseti" },
];
```

#### Section 6 — Partners Carousel

Auto-scrolling, infinitely looping partner logo strip. Logos rendered in greyscale by default, full colour on hover:

```typescript
const partners = [
  { name: "MindStrong",       url: "https://www.instagram.com/project.mindstrong/",  img: "[CDN_URL]/21cf0c0b-4d85-4354-9f42-c000f2b5e827.jpeg" },
  { name: "Pinetote",         url: "https://pinetote.com/",                           img: "[CDN_URL]/pinetote.png" },
  { name: "ETCO Kenya",       url: "https://www.etco-kenya.org/",                     img: "[CDN_URL]/ETCO-logo.png" },
  { name: "Try Again Project", url: "#",                                              img: "[CDN_URL]/TAP-2.png" },
  { name: "AISA",             url: "#",                                               img: "[CDN_URL]/AISA.png" },
];
// Replace [CDN_URL] with: https://jenga365.com/wp-content/uploads/2025/08 or /2025/12
```

#### Section 7 — Community Testimonials

Two testimonial cards in a side-by-side layout. Each card:
- Large decorative opening quotation mark in brand green
- Quote text in italic serif font
- Author name + role badge (Mentor / Mentee)
- Subtle card border that glows on hover

```typescript
const testimonials = [
  { quote: "Mentoring through Jenga365 has been one of the most rewarding experiences of my career.", name: "John Doe", role: "Mentor" },
  { quote: "Jenga365 connected me with a mentor who helped me transition from rugby to a thriving career in sports management.", name: "Jane Doe", role: "Mentee" },
];
```

#### Section 8 — Final CTA Strip

Full-width dark section with:
- Pull quote: *"Transform Lives with Your Support. Donate to Jenga365 and ignite the dreams of aspiring athletes and professionals — building brighter futures through mentorship."*
- Three buttons in a row: **"Donate Now"** (primary) · **"Sign Up as Mentor"** · **"Sign Up as Mentee"**
- WhatsApp Community link: `https://whatsapp.com/channel/0029Vb5h9486GcGM89FC2d2s`

---

### 10.3 — Component File Locations

```
/app/(marketing)/about/page.tsx          ← Server Component, metadata, layout wrapper
/components/marketing/about
  /AboutHero.tsx                         ← Section 1
  /TripartiteModel.tsx                   ← Section 2 — three pillar cards
  /HistoryTimeline.tsx                   ← Section 3 — vertical interactive timeline
  /WhyJenga.tsx                          ← Section 4 — 2×2 reasons grid
  /LeadershipGrid.tsx                    ← Section 5 — team photo grid
  /PartnerCarousel.tsx                   ← Section 6 — infinite scroll logos
  /Testimonials.tsx                      ← Section 7 — quote cards
  /AboutCTAStrip.tsx                     ← Section 8 — final conversion strip
```

---

### 10.4 — SEO & Metadata

```typescript
// /app/(marketing)/about/page.tsx
export const metadata = {
  title: "About Jenga365 | Building Growth. Connecting Futures.",
  description: "Jenga365 is a dual-engine mentorship and rugby impact platform. Learn about our tripartite model, our journey from 2024 to today, and the team building the Total Athlete.",
  openGraph: {
    title: "About Jenga365",
    description: "Mentorship. Networking. Impact. Building the Total Athlete — 365 days a year.",
    images: [{ url: "https://jenga365.com/wp-content/uploads/2025/07/Fanaka-Studios-SportPesa-Cheza-Dimba-Northrift-66-of-429-scaled.jpg" }],
  },
};
```

---

### 10.5 — Animation & Interaction Spec

| Element | Animation | Trigger |
|---|---|---|
| Hero headline words | Staggered slide-up fade-in (80ms delay per word) | Page load |
| Pillar cards | Slide up + slight de-rotate from `rotate(-1deg)` | Scroll into view (IntersectionObserver) |
| Timeline nodes | Sequential slide-in from left | Scroll into view, 150ms stagger |
| Team cards | Scale up from `0.9` + fade | Scroll into view, 80ms stagger |
| Partner logos | Continuous CSS `@keyframes` horizontal scroll | Auto-play, pause on hover |
| Timeline active node | Pulsing glow ring (`box-shadow` keyframe) | Hover |
| Pillar card hover | Reveal "Goal" text via `max-height` slide-up | Hover |
| Testimonial card hover | Border glow transition | Hover |

All scroll-triggered animations use a single shared `useInView` hook (IntersectionObserver, `threshold: 0.15`, fires once). No animation library dependency — CSS transitions only for the About page to keep bundle size minimal.

---

### 10.6 — Instruction to the AI Model (About Page)

> **"Using the content defined in Module 10, generate the following files:**
>
> 1. `/app/(marketing)/about/page.tsx` — Server Component with full metadata export, importing and composing all sub-components in the correct section order.
> 2. `/components/marketing/about/TripartiteModel.tsx` — Three pillar cards with accent colours, watermark digit, icon, hover reveal animation, and mobile accordion fallback. Use Shadcn/UI `Card` as base.
> 3. `/components/marketing/about/HistoryTimeline.tsx` — Vertical timeline with four nodes, pulsing active dot, monospace date stamps, and support for bullet-point sub-items in Node 2 (The Strategic Pivot).
> 4. `/components/marketing/about/LeadershipGrid.tsx` — Responsive photo grid consuming the `team` data array. Graceful image fallback to initials avatar. Conditional social icon rendering.
> 5. `/components/marketing/about/PartnerCarousel.tsx` — CSS `@keyframes` infinite horizontal scroll, greyscale-to-colour on hover, duplicated logo set for seamless loop.
>
> All components must use **TypeScript**, **Tailwind CSS utility classes**, **Shadcn/UI** where applicable, and follow **Next.js 15 App Router** conventions (Server Components where no interactivity is needed, Client Components only where `useState`/`useEffect`/`IntersectionObserver` are required). The `HistoryTimeline` and `LeadershipGrid` must be Client Components. `TripartiteModel` hover state requires Client Component. `PartnerCarousel` CSS-only animation can remain a Server Component with a `<style>` block.
>
> Match the visual language of the existing Jenga365 brand: dark background (`#0A0A08`), warm off-white text (`#F5F0E8`), brand green accent (`#C8F04A`), Playfair Display for headings, DM Mono for labels and metadata."**
