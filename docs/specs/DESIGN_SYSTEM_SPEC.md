# JENGA365 — COMPLETE DESIGN SYSTEM SPECIFICATION
## Kenya Flag Color Palette Edition

---

## 1. DESIGN TOKENS ARCHITECTURE

### Token Structure

```
jenga365/
├── tokens/
│   ├── primitives/
│   │   ├── colors.json
│   │   ├── typography.json
│   │   ├── spacing.json
│   │   ├── shadows.json
│   │   ├── borders.json
│   │   ├── animation.json
│   │   └── breakpoints.json
│   ├── semantic/
│   │   ├── colors.json
│   │   ├── typography.json
│   │   └── spacing.json
│   └── component/
│       ├── button.json
│       ├── card.json
│       ├── form.json
│       ├── header.json
│       └── navigation.json
└── themes/
    ├── light.json
    └── dark.json (future)
```

---

## 2. PRIMITIVE TOKENS

### 2.1 Colors (Kenya Flag Based)

#### Flag Colors (Core Primitives)

| Token Name | HEX | RGB | HSL | Pantone | Usage |
|------------|-----|-----|-----|---------|-------|
| `color.black` | `#000000` | 0, 0, 0 | 0°, 0%, 0% | Black 6 C | Text, borders, shadows |
| `color.red` | `#BB0000` | 187, 0, 0 | 0°, 100%, 37% | 180 C | Primary actions, alerts |
| `color.green` | `#006600` | 0, 102, 0 | 120°, 100%, 20% | 347 C | Success, growth, secondary |
| `color.white` | `#FFFFFF` | 255, 255, 255 | 0°, 0%, 100% | 7436 C | Backgrounds, cards |

#### Extended Black Scale

| Token | HEX | Usage |
|-------|-----|-------|
| `color.black.50` | `#F5F5F5` | Page backgrounds |
| `color.black.100` | `#E8E8E8` | Borders, dividers |
| `color.black.200` | `#D0D0D0` | Disabled borders |
| `color.black.300` | `#A8A8A8` | Placeholder text |
| `color.black.400` | `#8A8A8A` | Muted text |
| `color.black.500` | `#6B6B6B` | Secondary text |
| `color.black.600` | `#4A4A4A` | Body text |
| `color.black.700` | `#2D2D2D` | Headings |
| `color.black.800` | `#1A1A1A` | Primary text |
| `color.black.900` | `#000000` | Maximum contrast |

#### Extended Red Scale

| Token | HEX | Usage |
|-------|-----|-------|
| `color.red.50` | `#FFF5F5` | Alert backgrounds |
| `color.red.100` | `#FDF0F0` | Error states |
| `color.red.200` | `#FAD0D0` | Light errors |
| `color.red.300` | `#F5A0A0` | Hover states |
| `color.red.400` | `#F04040` | Notifications |
| `color.red.500` | `#E52020` | Light accents |
| `color.red.600` | `#D00000` | Hover primary |
| `color.red.700` | `#BB0000` | **Primary brand** |
| `color.red.800` | `#A00000` | Active states |
| `color.red.900` | `#8B0000` | Pressed states |

#### Extended Green Scale

| Token | HEX | Usage |
|-------|-----|-------|
| `color.green.50` | `#F0FFF0` | Success backgrounds |
| `color.green.100` | `#E0F8E0` | Completion states |
| `color.green.200` | `#B0EEB0` | Light success |
| `color.green.300` | `#80DD80` | Progress indicators |
| `color.green.400` | `#00CC00` | Live indicators |
| `color.green.500` | `#00AA00` | Active success |
| `color.green.600` | `#008800` | Hover secondary |
| `color.green.700` | `#006600` | **Secondary brand** |
| `color.green.800` | `#005500` | Dark success |
| `color.green.900` | `#004400` | Maximum green |

#### Semantic Colors (Non-Flag)

| Token | HEX | Usage |
|-------|-----|-------|
| `color.amber` | `#FFAA00` | Warnings, pending |
| `color.blue` | `#0066CC` | Mentor role badge |
| `color.purple` | `#660099` | Partner role badge |
| `color.orange` | `#CC6600` | Moderator role badge |

---

### 2.2 Typography

#### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `font.family.display` | `'Playfair Display', Georgia, serif` | Headlines, display text |
| `font.family.body` | `'Lato', 'Helvetica Neue', Arial, sans-serif` | Body text, UI elements |
| `font.family.mono` | `'DM Mono', 'Courier New', monospace` | Data, timestamps, code |

#### Font Sizes (Type Scale)

| Token | Size | Line Height | Letter Spacing | Usage |
|-------|------|-------------|----------------|-------|
| `font.size.hero` | 72px (4.5rem) | 1.1 | -0.02em | Homepage hero |
| `font.size.h1` | 48px (3rem) | 1.2 | -0.01em | Page titles |
| `font.size.h2` | 36px (2.25rem) | 1.3 | 0 | Section headings |
| `font.size.h3` | 28px (1.75rem) | 1.4 | 0 | Card titles |
| `font.size.h4` | 24px (1.5rem) | 1.4 | 0 | Subsection headings |
| `font.size.h5` | 20px (1.25rem) | 1.5 | 0 | Widget titles |
| `font.size.h6` | 16px (1rem) | 1.5 | 0.05em | Labels, uppercase |
| `font.size.body.lg` | 18px (1.125rem) | 1.6 | 0 | Featured paragraphs |
| `font.size.body` | 16px (1rem) | 1.6 | 0 | Standard text |
| `font.size.body.sm` | 14px (0.875rem) | 1.5 | 0 | Secondary text |
| `font.size.caption` | 12px (0.75rem) | 1.4 | 0.02em | Metadata, captions |
| `font.size.mono` | 14px (0.875rem) | 1.4 | 0 | Data, timestamps |

#### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `font.weight.light` | 300 | Body text, subtle |
| `font.weight.regular` | 400 | Standard text |
| `font.weight.bold` | 700 | Headings, emphasis |
| `font.weight.black` | 900 | Display headlines |

---

### 2.3 Spacing

#### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `space.1` | 4px (0.25rem) | Tight gaps, icon padding |
| `space.2` | 8px (0.5rem) | Small gaps, inline spacing |
| `space.3` | 12px (0.75rem) | Compact padding |
| `space.4` | 16px (1rem) | Standard padding, gaps |
| `space.5` | 24px (1.5rem) | Card padding, section gaps |
| `space.6` | 32px (2rem) | Large gaps, section padding |
| `space.7` | 48px (3rem) | Major sections |
| `space.8` | 64px (4rem) | Page sections |
| `space.9` | 96px (6rem) | Hero spacing |

#### Layout Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `space.page` | 24px | Page horizontal padding (mobile) |
| `space.page.lg` | 48px | Page horizontal padding (desktop) |
| `space.section` | 64px | Vertical section spacing |
| `space.section.lg` | 96px | Major section spacing |

---

### 2.4 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow.none` | none | Flat elements |
| `shadow.sm` | `0 2px 4px rgba(0,0,0,0.04)` | Subtle elevation |
| `shadow.md` | `0 4px 12px rgba(0,0,0,0.08)` | Cards, dropdowns |
| `shadow.lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, popovers |
| `shadow.xl` | `0 16px 48px rgba(0,0,0,0.16)` | Full-screen overlays |
| `shadow.inner` | `inset 0 2px 4px rgba(0,0,0,0.04)` | Inset shadows |

---

### 2.5 Borders

| Token | Value | Usage |
|-------|-------|-------|
| `border.width.none` | 0 | No border |
| `border.width.thin` | 1px | Standard borders |
| `border.width.thick` | 2px | Focus states, emphasis |
| `border.width.heavy` | 4px | Status indicators |
| `border.radius.none` | 0 | Sharp corners |
| `border.radius.sm` | 2px | Subtle rounding |
| `border.radius.md` | 4px | Standard rounding |
| `border.radius.lg` | 8px | Large rounding |
| `border.radius.full` | 9999px | Pills, circles |

---

### 2.6 Animation

#### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `duration.instant` | 0ms | Immediate |
| `duration.fast` | 150ms | Micro-interactions |
| `duration.normal` | 200ms | Standard transitions |
| `duration.slow` | 300ms | Complex animations |
| `duration.slower` | 500ms | Page transitions |

#### Easing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `ease.linear` | `linear` | Continuous animations |
| `ease.in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `ease.out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `ease.in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard transitions |
| `ease.spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful bounces |

---

### 2.7 Breakpoints

| Token | Value | Usage |
|-------|-------|-------|
| `breakpoint.sm` | 640px | Mobile landscape |
| `breakpoint.md` | 768px | Tablet |
| `breakpoint.lg` | 1024px | Small desktop |
| `breakpoint.xl` | 1280px | Large desktop |
| `breakpoint.2xl` | 1536px | Extra large screens |

---

## 3. SEMANTIC TOKENS

### 3.1 Semantic Colors

#### Background Colors

| Token | Light Value | Dark Value (Future) | Usage |
|-------|-------------|---------------------|-------|
| `semantic.bg.page` | `color.black.50` | `color.black.900` | Page background |
| `semantic.bg.card` | `color.white` | `color.black.800` | Card backgrounds |
| `semantic.bg.elevated` | `color.white` | `color.black.700` | Modals, popovers |
| `semantic.bg.overlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.8)` | Backdrops |
| `semantic.bg.success` | `color.green.50` | `color.green.900` | Success states |
| `semantic.bg.warning` | `#FFFAF0` | `#7C2D12` | Warning states |
| `semantic.bg.error` | `color.red.50` | `color.red.900` | Error states |
| `semantic.bg.info` | `color.black.50` | `color.black.800` | Info states |

#### Text Colors

| Token | Light Value | Usage |
|-------|-------------|-------|
| `semantic.text.primary` | `color.black.900` | Headings, primary text |
| `semantic.text.secondary` | `color.black.600` | Body text |
| `semantic.text.tertiary` | `color.black.500` | Metadata, captions |
| `semantic.text.muted` | `color.black.400` | Placeholders, disabled |
| `semantic.text.inverse` | `color.white` | Text on dark backgrounds |
| `semantic.text.link` | `color.red.700` | Interactive links |
| `semantic.text.link-hover` | `color.red.900` | Link hover state |
| `semantic.text.success` | `color.green.700` | Success messages |
| `semantic.text.error` | `color.red.700` | Error messages |

#### Border Colors

| Token | Light Value | Usage |
|-------|-------------|-------|
| `semantic.border.default` | `color.black.200` | Standard borders |
| `semantic.border.strong` | `color.black.300` | Emphasized borders |
| `semantic.border.focus` | `color.red.700` | Focus states |
| `semantic.border.error` | `color.red.700` | Error states |
| `semantic.border.success` | `color.green.700` | Success states |

---

### 3.2 Semantic Typography

| Token | Value | Usage |
|-------|-------|-------|
| `semantic.typography.heading.font` | `font.family.display` | All headings |
| `semantic.typography.heading.weight` | `font.weight.black` | H1-H3 |
| `semantic.typography.heading.weight-sm` | `font.weight.bold` | H4-H6 |
| `semantic.typography.body.font` | `font.family.body` | Body text |
| `semantic.typography.body.weight` | `font.weight.regular` | Standard |
| `semantic.typography.data.font` | `font.family.mono` | Data, timestamps |
| `semantic.typography.label.transform` | `uppercase` | Labels, badges |
| `semantic.typography.label.spacing` | `0.05em` | Letter spacing |

---

### 3.3 Semantic Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `semantic.space.component` | `space.4` | Component internal padding |
| `semantic.space.component-lg` | `space.5` | Large component padding |
| `semantic.space.card` | `space.5` | Card padding |
| `semantic.space.section` | `space.8` | Section vertical spacing |
| `semantic.space.gutter` | `space.4` | Grid gutters |
| `semantic.stack.gap` | `space.4` | Stack component gap |
| `semantic.stack.gap-sm` | `space.2` | Tight stack gap |
| `semantic.stack.gap-lg` | `space.6` | Loose stack gap |

---

## 4. COMPONENT TOKENS

### 4.1 Button Component

#### Variants

| Variant | Background | Text | Border | Hover BG | Active BG |
|---------|------------|------|--------|----------|-----------|
| `button.primary` | `color.red.700` | `color.white` | none | `color.red.900` | `color.red.800` |
| `button.secondary` | `color.green.700` | `color.white` | none | `color.green.900` | `color.green.800` |
| `button.ghost` | transparent | `color.black.900` | `1px solid color.black.900` | `color.black.50` | `color.black.100` |
| `button.danger` | `color.red.700` | `color.white` | none | `color.red.900` | `color.red.800` |
| `button.link` | transparent | `color.red.700` | none | transparent | transparent |

#### Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| `button.size.sm` | 32px | `space.2 space.3` | `font.size.body.sm` |
| `button.size.md` | 40px | `space.3 space.4` | `font.size.body` |
| `button.size.lg` | 48px | `space.4 space.5` | `font.size.body.lg` |

#### States

| State | Token Suffix | Effect |
|-------|--------------|--------|
| Default | (base) | As defined in variant |
| Hover | `.hover` | Background darken 10%, translateY(-1px) |
| Active | `.active` | Background darken 20%, translateY(0) |
| Disabled | `.disabled` | Opacity 0.4, cursor not-allowed |
| Loading | `.loading` | Spinner replaces text, disabled interactions |
| Focus | `.focus` | Outline `2px solid color.red.700`, offset 2px |

---

### 4.2 Card Component

#### Structure

| Token | Value |
|-------|-------|
| `card.bg` | `color.white` |
| `card.border-radius` | `border.radius.md` |
| `card.border` | `1px solid color.black.100` |
| `card.shadow` | `shadow.md` |
| `card.shadow-hover` | `shadow.lg` |
| `card.padding` | `space.5` |

#### Variants

| Variant | Background | Border | Shadow |
|---------|------------|--------|--------|
| `card.default` | `color.white` | `color.black.100` | `shadow.md` |
| `card.elevated` | `color.white` | none | `shadow.lg` |
| `card.outlined` | `color.white` | `color.black.300` | none |
| `card.filled` | `color.black.50` | none | none |

#### Status Variants

| Status | Left Border | Background |
|--------|-------------|------------|
| `card.status.success` | `4px solid color.green.700` | `color.green.50` |
| `card.status.warning` | `4px solid color.amber` | `#FFFAF0` |
| `card.status.error` | `4px solid color.red.700` | `color.red.50` |
| `card.status.info` | `4px solid color.black.600` | `color.black.50` |

---

### 4.3 Form Component

#### Input Fields

| Token | Value |
|-------|-------|
| `form.input.height` | 48px |
| `form.input.padding` | `space.3 space.4` |
| `form.input.border` | `1px solid color.black.200` |
| `form.input.border-radius` | `border.radius.md` |
| `form.input.bg` | `color.white` |
| `form.input.font` | `font.size.body` |
| `form.input.placeholder` | `color.black.400` |

#### Input States

| State | Border | Background | Shadow |
|-------|--------|------------|--------|
| Default | `color.black.200` | `color.white` | none |
| Hover | `color.black.300` | `color.white` | none |
| Focus | `color.red.700` | `color.white` | `0 0 0 3px rgba(187,0,0,0.1)` |
| Error | `color.red.700` | `color.red.50` | none |
| Disabled | `color.black.200` | `color.black.50` | none |

#### Labels

| Token | Value |
|-------|-------|
| `form.label.font` | `font.size.body.sm` |
| `form.label.weight` | `font.weight.bold` |
| `form.label.transform` | `uppercase` |
| `form.label.spacing` | `0.05em` |
| `form.label.color` | `color.black.600` |

#### Checkboxes & Radios

| Token | Value |
|-------|-------|
| `form.checkbox.size` | 20px |
| `form.checkbox.border` | `2px solid color.black.300` |
| `form.checkbox.border-radius` | `border.radius.sm` |
| `form.checkbox.checked.bg` | `color.red.700` |
| `form.checkbox.checked.border` | `color.red.700` |
| `form.checkbox.checkmark` | `color.white` |

---

### 4.4 Header Component

#### Header Types

| Type | Background | Height | Border |
|------|------------|--------|--------|
| `header.public` | transparent → `color.white` | 72px | none → `1px solid color.black.100` |
| `header.authenticated` | `color.white` | 64px | `1px solid color.black.100` |
| `header.minimal` | `color.white` | 80px | none |
| `header.legal` | `color.white` | 72px | `1px solid color.black.100` |
| `header.waiting` | `color.red.50` | 72px | `1px solid color.red.100` |

#### Logo

| Token | Value |
|-------|-------|
| `header.logo.height` | 40px |
| `header.logo.height-lg` | 48px |
| `header.logo.color` | `color.black.900` |

#### Navigation

| Token | Value |
|-------|-------|
| `header.nav.font` | `font.size.body` |
| `header.nav.color` | `color.black.600` |
| `header.nav.color-hover` | `color.red.700` |
| `header.nav.color-active` | `color.red.700` |
| `header.nav.spacing` | `space.6` |

#### Role Badges

| Role | Background | Text | Border Radius |
|------|------------|------|---------------|
| `badge.mentee` | `color.green.700` | `color.white` | `border.radius.full` |
| `badge.mentor` | `#0066CC` | `color.white` | `border.radius.full` |
| `badge.partner` | `#660099` | `color.white` | `border.radius.full` |
| `badge.moderator` | `#CC6600` | `color.white` | `border.radius.full` |
| `badge.admin` | `color.red.700` | `color.white` | `border.radius.full` |

---

### 4.5 Navigation Component

#### Sidebar (Dashboard)

| Token | Value |
|-------|-------|
| `sidebar.width` | 260px |
| `sidebar.bg` | `color.white` |
| `sidebar.border` | `1px solid color.black.100` |
| `sidebar.item.height` | 44px |
| `sidebar.item.padding` | `space.3 space.4` |
| `sidebar.item.color` | `color.black.600` |
| `sidebar.item.color-hover` | `color.red.700` |
| `sidebar.item.color-active` | `color.white` |
| `sidebar.item.bg-active` | `color.red.700` |
| `sidebar.item.radius` | `border.radius.md` |

#### Bottom Tab Bar (Mobile)

| Token | Value |
|-------|-------|
| `tabbar.height` | 64px |
| `tabbar.bg` | `color.white` |
| `tabbar.border` | `1px solid color.black.100` |
| `tabbar.icon.size` | 24px |
| `tabbar.label.font` | `font.size.caption` |
| `tabbar.active.color` | `color.red.700` |
| `tabbar.inactive.color` | `color.black.400` |

---

## 5. LAYOUT SPECIFICATIONS

### 5.1 Grid System

| Token | Value |
|-------|-------|
| `grid.columns` | 12 |
| `grid.gutter` | `space.6` |
| `grid.gutter-sm` | `space.4` |
| `grid.max-width` | 1280px |
| `grid.margin` | `space.5` |
| `grid.margin-lg` | `space.7` |

### 5.2 Container Sizes

| Token | Max Width | Padding |
|-------|-----------|---------|
| `container.sm` | 640px | `space.4` |
| `container.md` | 768px | `space.5` |
| `container.lg` | 1024px | `space.5` |
| `container.xl` | 1280px | `space.6` |
| `container.full` | 100% | `space.5` |

### 5.3 Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-index.behind` | -1 | Background elements |
| `z-index.default` | 0 | Standard content |
| `z-index.dropdown` | 100 | Dropdowns |
| `z-index.sticky` | 200 | Sticky headers |
| `z-index.modal-backdrop` | 300 | Modal overlays |
| `z-index.modal` | 400 | Modal content |
| `z-index.popover` | 500 | Popovers, tooltips |
| `z-index.toast` | 600 | Toast notifications |

---

## 6. ACCESSIBILITY SPECIFICATIONS

### 6.1 Contrast Requirements

| Element | Minimum Ratio | Target Ratio |
|---------|---------------|--------------|
| Normal text (< 18px) | 4.5:1 | 7:1 |
| Large text (≥ 18px) | 3:1 | 4.5:1 |
| UI components | 3:1 | 4.5:1 |
| Graphical objects | 3:1 | 4.5:1 |

### 6.2 Focus Indicators

| Property | Value |
|----------|-------|
| Focus outline width | 2px |
| Focus outline style | solid |
| Focus outline color | `color.red.700` |
| Focus outline offset | 2px |
| Focus outline radius | matches element |

### 6.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. THEME CONFIGURATION

### 7.1 Light Theme (Default)

```json
{
  "theme": {
    "name": "light",
    "colors": {
      "bg": {
        "page": "{color.black.50}",
        "card": "{color.white}",
        "elevated": "{color.white}"
      },
      "text": {
        "primary": "{color.black.900}",
        "secondary": "{color.black.600}",
        "inverse": "{color.white}"
      }
    }
  }
}
```

### 7.2 Dark Theme (Future)

```json
{
  "theme": {
    "name": "dark",
    "colors": {
      "bg": {
        "page": "{color.black.900}",
        "card": "{color.black.800}",
        "elevated": "{color.black.700}"
      },
      "text": {
        "primary": "{color.white}",
        "secondary": "{color.black.300}",
        "inverse": "{color.black.900}"
      }
    }
  }
}
```

---

## 8. TOKEN USAGE EXAMPLES

### Example: Primary Button

```json
{
  "component": {
    "button": {
      "primary": {
        "background": "{color.red.700}",
        "color": "{color.white}",
        "border": "none",
        "border-radius": "{border.radius.md}",
        "padding": "{space.3} {space.4}",
        "font": "{font.family.body}",
        "font-size": "{font.size.body}",
        "font-weight": "{font.weight.bold}",
        "hover": {
          "background": "{color.red.900}",
          "transform": "translateY(-1px)"
        },
        "active": {
          "background": "{color.red.800}",
          "transform": "translateY(0)"
        },
        "focus": {
          "outline": "2px solid {color.red.700}",
          "outline-offset": "2px"
        },
        "disabled": {
          "opacity": "0.4",
          "cursor": "not-allowed"
        }
      }
    }
  }
}
```

### Example: Success Card

```json
{
  "component": {
    "card": {
      "success": {
        "background": "{color.green.50}",
        "border-left": "4px solid {color.green.700}",
        "border-radius": "{border.radius.md}",
        "padding": "{space.5}",
        "shadow": "{shadow.sm}"
      }
    }
  }
}
```

---

## 9. FILE STRUCTURE FOR IMPLEMENTATION

```
/design-system
├── /tokens
│   ├── primitives.json      # Core values (colors, spacing, etc.)
│   ├── semantic.json        # Meaningful tokens (bg, text, border)
│   └── components.json      # Component-specific tokens
├── /themes
│   ├── light.json
│   └── dark.json
├── /config
│   ├── style-dictionary.json
│   └── tailwind.config.js
├── /output
│   ├── variables.css
│   ├── variables.scss
│   ├── tokens.js
│   └── tokens.json
└── /documentation
    ├── color-usage.md
    ├── typography-guidelines.md
    └── component-patterns.md
```

---

## 10. KEY DESIGN PRINCIPLES

1. **Kenya Flag Identity**: Use Black, Red, Green, and White as the foundation. Red for action, Green for success, Black for authority, White for clarity.

2. **High Contrast**: Maintain WCAG AA compliance minimum. Prefer high contrast for readability.

3. **Consistent Spacing**: Use the 4px base grid. All spacing should be multiples of 4.

4. **Clear Hierarchy**: Playfair Display for impact, Lato for readability, DM Mono for data.

5. **Meaningful Motion**: Animations should guide, not distract. Respect `prefers-reduced-motion`.

6. **Mobile-First**: Design for mobile, enhance for desktop. Touch targets minimum 44px.

7. **Semantic Tokens**: Use semantic tokens for theming. Primitives should rarely be used directly in components.

---

This design system provides a complete specification for implementing Jenga365 with consistent, maintainable, and accessible design using the Kenya flag color palette.
