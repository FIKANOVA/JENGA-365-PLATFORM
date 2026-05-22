# Jenga365 — Design System

> Locked 2026-05-22. Source-of-truth for all UI work. Inspired by Linear, Vercel, Arc, Anthropic.
> Where `CLAUDE.md §12` summarizes, this file is canonical.

---

## 1. Design principles

1. **Clarity over decoration.** Every pixel earns its place. Whitespace is a feature.
2. **Neutral palette, accent sparingly.** Brand color appears in CTAs, key headings, status indicators — never as a full background.
3. **Type-led.** Inter at considered weights does most of the visual work. No display fonts.
4. **Soft, not sharp.** Radii 6–12px. Shadows are atmospheric, not dramatic.
5. **Predictable motion.** Ease-out 150–250ms. No springs on landing or dashboard surfaces.
6. **Premium developer-tool feel.** If a screen wouldn't fit alongside Linear's, Vercel's, or Anthropic's products, it needs work.

---

## 2. Typography

**One family:** Inter, loaded via `next/font/google` with `display: "swap"`.

```ts
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
```

**Fallback stack:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.

**Scale:**

| Token | Size | Line height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `text-display-xl` | 72 / 4.5rem | 1.05 | 700 | -0.025em | Hero H1 (desktop) |
| `text-display-lg` | 56 / 3.5rem | 1.08 | 700 | -0.022em | Hero H1 (tablet) |
| `text-display-md` | 44 / 2.75rem | 1.1 | 700 | -0.02em | Section H2 |
| `text-display-sm` | 32 / 2rem | 1.15 | 700 | -0.018em | Subsection H3 |
| `text-headline` | 24 / 1.5rem | 1.2 | 600 | -0.015em | Card title |
| `text-title` | 18 / 1.125rem | 1.3 | 600 | -0.01em | Smaller headings |
| `text-body-lg` | 18 / 1.125rem | 1.6 | 400 | 0 | Lead paragraphs |
| `text-body` | 16 / 1rem | 1.6 | 400 | 0 | Body |
| `text-body-sm` | 14 / 0.875rem | 1.55 | 400 | 0 | Secondary copy |
| `text-label` | 13 / 0.8125rem | 1.4 | 500 | 0 | UI labels |
| `text-eyebrow` | 12 / 0.75rem | 1.4 | 600 | 0.06em uppercase | Section eyebrows |
| `text-mono` | 13 / 0.8125rem | 1.5 | 400 | 0 | Code, IDs |

**Headings never use mono.** The old "Modern Premium" rule that styled every `h1..h6` in DM Mono is removed.

---

## 3. Color tokens

### Neutrals (light mode)

| Token | Value | Notes |
|---|---|---|
| `background` | `#FFFFFF` | Page base |
| `surface-1` | `#FAFAFA` | Subtle section bg |
| `surface-2` | `#F4F4F5` | Card hover, inputs |
| `surface-3` | `#E4E4E7` | Borders, dividers |
| `foreground` | `#09090B` | Primary text |
| `foreground-muted` | `#52525B` | Secondary text |
| `foreground-subtle` | `#71717A` | Helper text |
| `border` | `#E4E4E7` | Default borders |
| `border-strong` | `#D4D4D8` | Hover borders, inputs |
| `ring` | `#0F7B3A` | Focus ring (brand green) |

### Brand accents

| Token | Value | Use |
|---|---|---|
| `brand-green` | `#0F7B3A` | Primary brand, CTA |
| `brand-green-fg` | `#FFFFFF` | Text on brand-green |
| `brand-green-soft` | `#E8F3EC` | Tinted surfaces |
| `brand-red` | `#B91C1C` | Secondary brand, alerts |
| `brand-red-fg` | `#FFFFFF` | Text on brand-red |
| `brand-red-soft` | `#FEE7E7` | Tinted surfaces |

### Semantic

| Token | Value | Use |
|---|---|---|
| `success` | `#0F7B3A` | Same as brand-green |
| `warning` | `#B45309` | Caution |
| `error` | `#B91C1C` | Destructive, errors |
| `info` | `#1D4ED8` | Informational |

### Dark mode

Mirror with deepening: `background = #0A0A0A`, `surface-1 = #111113`, `foreground = #FAFAFA`, etc. Brand tokens keep hue but lighten slightly (`brand-green = #34A05B`).

---

## 4. Spacing

Base Tailwind 4px scale. Most commonly used:

| Token | px | Use |
|---|---|---|
| `space-2` | 8 | Tight gaps |
| `space-3` | 12 | Form rows |
| `space-4` | 16 | Card padding |
| `space-6` | 24 | Component padding |
| `space-8` | 32 | Section padding (small) |
| `space-12` | 48 | Stack between blocks |
| `space-16` | 64 | Hero padding (mobile) |
| `space-24` | 96 | Section vertical padding (desktop) |
| `space-32` | 128 | Hero padding (desktop) |

---

## 5. Radii & elevation

| Token | px | Use |
|---|---|---|
| `radius-sm` | 4 | Tag, badge |
| `radius` | 6 | Buttons, inputs |
| `radius-md` | 8 | Cards |
| `radius-lg` | 12 | Large containers, modals |
| `radius-full` | 9999 | Pills, avatars |

| Token | Value |
|---|---|
| `shadow-sm` | `0 1px 2px rgba(9, 9, 11, 0.04)` |
| `shadow` | `0 6px 16px rgba(9, 9, 11, 0.06), 0 1px 2px rgba(9, 9, 11, 0.04)` |
| `shadow-lg` | `0 24px 48px -12px rgba(9, 9, 11, 0.10), 0 4px 6px rgba(9, 9, 11, 0.04)` |
| `shadow-ring` | `0 0 0 4px rgba(15, 123, 58, 0.12)` (focus halo) |

---

## 6. Components — variants & sizes

### Button

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| `primary` | `brand-green` | `white` | none | Main CTA |
| `secondary` | `surface-2` | `foreground` | `border` | Secondary action |
| `outline` | transparent | `foreground` | `border` | Tertiary |
| `ghost` | transparent | `foreground` | none | In-card, in-table |
| `destructive` | `brand-red` | `white` | none | Delete, suspend |
| `link` | transparent | `brand-green` | none, underline on hover | Inline |

Sizes: `sm` (h-8, px-3, text-13), `md` (h-10, px-4, text-14), `lg` (h-12, px-6, text-15).

### Card

Default: `bg-background`, `border border-border`, `rounded-md` (8px), `shadow-sm`, padding 24px desktop / 16px mobile. Hover: `shadow` + `border-strong`.

### Input

`h-10`, `rounded` (6px), `bg-background`, `border border-border`, `px-3`, `text-14`. Focus: `border-brand-green` + `shadow-ring`.

### Badge

`rounded-full`, `text-12`, `font-medium`, `px-2.5 py-0.5`. Variants: `neutral` (surface-2/foreground-muted), `success` (green-soft/brand-green), `warning` (amber-soft/amber), `info` (blue-soft/blue).

---

## 7. Motion

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion-fast` | 100ms | `ease-out` | Hover, focus |
| `motion-base` | 180ms | `ease-out` | Most transitions |
| `motion-slow` | 300ms | `ease-out` | Modal open, page entrance |

No springs in landing/dashboard surfaces. Reserve springs for purposeful interactions like adding-to-cart confirmations.

---

## 8. Layout

- **Max content width:** 1280px on desktop. 1440px max for full-bleed marketing.
- **Container:** `max-w-7xl mx-auto px-6 lg:px-8`.
- **Grid:** 12-column. Most marketing uses 1-col on mobile, 2 or 3 on desktop.

---

## 9. Iconography

- Library: **Lucide** (`lucide-react`). Stroke 1.5–2px.
- Sizes: `h-4 w-4` (inline with text), `h-5 w-5` (default), `h-6 w-6` (prominent).
- Color: inherits text color. Avoid filling icons with brand tints.
- Do not use Material Symbols or emojis in UI surfaces.

---

## 10. Logo

- **Text wordmark only** for v1. Component at `src/components/shared/Logo.tsx`.
- Format: `Jenga` (neutral foreground) + `365` (brand-green). Single weight (700). Tracking `-0.02em`.
- Variants:
  - `default` — black `Jenga`, brand-green `365`.
  - `mono-light` — white text, brand-green stays.
  - `mono-dark` — `#0A0A0A` text, brand-green stays.
- Do **not** reference any image at `/public/assets/logos/*` until custom SVG ships.

---

## 11. Backgrounds

- Solid neutral surfaces dominate.
- Acceptable accents: very faint topographic SVG pattern at 4–6% opacity (nods to spatial-data tracking) on hero or section transitions.
- **Forbidden:** stop signs, caution imagery, busy stock photos, any AI-generated illustration.
- Subtle radial gradients allowed for hero (e.g. `radial-gradient(at top, rgba(15,123,58,0.06), transparent 60%)`).

---

## 12. Voice & copy direction

- Direct, confident, never sales-y. Match Linear/Vercel tone.
- Always lead with the **Total Athlete + Dual-Engine** narrative on marketing.
- Sweat Equity must be communicated before any "Join Free" CTA on marketing.
- Engine B copy emphasizes "Green Technology and measurable climate action" — corporate-ESG framing.
- AI-driven matching language is on the menu and elevates the platform.
- Replace vanity ticker numbers (e.g. "750K+ Lives") with authentic verified DB stats; show "—" if unverified.

---

## 13. Migration rules (rolling out across the app)

1. New components import only from the tokens above (Tailwind utilities backed by `globals.css`).
2. Avoid old class hooks: `.jenga-card`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.jenga-card-mentorship`, `font-serif`, `font-mono` for headings.
3. Image-based logos forbidden until custom SVG arrives — always use `<Logo />`.
4. When migrating a page: keep the route, swap section components for new ones, run `next build` to verify, commit.
5. If a token isn't here yet, add it to `DESIGN.md` first, then to `globals.css`, then use it.

---

## 14. References

- Linear — https://linear.app
- Vercel — https://vercel.com
- Arc — https://arc.net
- Anthropic — https://anthropic.com

These set the bar. If a screen feels worse than the bar, it isn't shipped.
