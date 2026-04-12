# JENGA365 — MINIMALIST MENU STRUCTURE
## Clean, Intuitive Navigation for All User Roles

---

## 1. CORE PRINCIPLES

| Principle | Implementation |
|-----------|----------------|
| **Maximum 5-7 items** | Prevents decision paralysis |
| **Familiar labels** | "Dashboard" not "My Hub" |
| **Clear hierarchy** | Most important items first |
| **Visual breathing room** | Adequate spacing between items |
| **Consistent placement** | Same location across all pages |
| **Progressive disclosure** | Secondary items in dropdowns |

---

## 2. PUBLIC HEADER (Guest Users)

**Structure: 4 items + 2 CTAs**

```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO]    About    Impact    Help              [Log In] [Join] │
│            ────     ─────     ────              ────────  ──── │
│            Info     Stories   Support           Ghost     Red  │
└─────────────────────────────────────────────────────────────┘
```

### Menu Items

| Position | Label | Destination | Rationale |
|----------|-------|-------------|-----------|
| 1 | **About** | `/about` | Mission, team, story — builds trust |
| 2 | **Impact** | `/impact` | Success stories, metrics — social proof |
| 3 | **Help** | `/help` | FAQ, contact, system requirements |
| 4 | **Log In** | `/login` | Ghost button — existing users |
| 5 | **Join** | `/register` | Red primary button — main CTA |

### Mobile (< 768px)
```
[Hamburger Menu]  [LOGO]  [Join]
     │
     └─ About
     └─ Impact
     └─ Help
     └─ Log In
```

---

## 3. AUTHENTICATED HEADER (Mentees & Mentors)

**Structure: 5 items + User Menu**

```
┌─────────────────────────────────────────────────────────────────────┐
│  [LOGO]    Dashboard    Explore    Community          [🔔] [👤 ▼]   │
│            ─────────    ───────    ─────────          ────  ─────   │
│            Home base    Find/Join  Share/Learn        Notify Avatar │
└─────────────────────────────────────────────────────────────────────┘
```

### Menu Items

| Position | Label | Dropdown Contents | Rationale |
|----------|-------|-------------------|-----------|
| 1 | **Dashboard** | Direct link | Home base — most used |
| 2 | **Explore** | Resources, Webinars, Events | Discovery — find opportunities |
| 3 | **Community** | Articles, Directory, Write | Social features — engagement |
| 4 | **🔔** | Notifications panel | Alerts without clutter |
| 5 | **👤** | Profile, Settings, Help, Logout | Personal actions grouped |

### Dropdown: Explore
```
Explore
├── Resources      📚
├── Webinars       🎓
└── Events         📅
```

### Dropdown: Community
```
Community
├── Articles       ✍️
├── Directory      👥
└── Write Article  ✏️
```

### Dropdown: Avatar (👤 ▼)
```
[User Name]
[Mentee/Mentor Badge]
─────────────
My Profile
Settings
Help Center
─────────────
Log Out
```

### Mobile (< 768px)
```
[☰]  [LOGO]  [🔔]  [👤]
 │
 └─ Dashboard
 └─ Explore
    ├─ Resources
    ├─ Webinars
    └─ Events
 └─ Community
    ├─ Articles
    ├─ Directory
    └─ Write Article
 └─ Notifications
 └─ Profile
 └─ Settings
 └─ Help
 └─ Log Out
```

---

## 4. CORPORATE HEADER (Corporate Partners)

**Structure: 5 items + User Menu**

```
┌─────────────────────────────────────────────────────────────────────┐
│  [LOGO]    Dashboard    Impact    Engage    Grow      [🔔] [👤 ▼]   │
│            ─────────    ──────    ──────    ────      ────  ─────   │
│            Overview     CSR       Team      Expand    Notify Avatar │
└─────────────────────────────────────────────────────────────────────┘
```

### Menu Items

| Position | Label | Dropdown Contents | Rationale |
|----------|-------|-------------------|-----------|
| 1 | **Dashboard** | Direct link | Overview, stats, quick actions |
| 2 | **Impact** | CSR data, Reports, Map | Business value — ESG focus |
| 3 | **Engage** | Employee mentors, Events | Active participation |
| 4 | **Grow** | Sponsorship, Upgrade, Invite | Expansion opportunities |
| 5 | **👤** | Profile, Billing, Settings, Support, Logout | Business account management |

### Dropdown: Impact
```
Impact
├── CSR Overview   📊
├── Reports        📈
└── Impact Map     🗺️
```

### Dropdown: Engage
```
Engage
├── Employee Mentors  👥
├── Event Sponsorship 🎯
└── Mentee Tracking   📋
```

### Dropdown: Grow
```
Grow
├── Sponsorship Tiers  ⭐
├── Upgrade Partnership 💎
└── Invite Colleagues  📧
```

---

## 5. MODERATOR HEADER (Moderators)

**Structure: 4 items + Scope Indicator + User Menu**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [LOGO]    Queue    Tools    Insights      [SCOPE A]    [🔔] [👤 ▼]     │
│            ─────    ─────    ───────       [Orange]     ────  ─────    │
│            Work     Systems  Analytics     Badge        Notify Avatar  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Menu Items

| Position | Label | Dropdown Contents | Rationale |
|----------|-------|-------------------|-----------|
| 1 | **Queue** | Direct to primary work | Immediate action — reduces clicks |
| 2 | **Tools** | Studio, Resources, People | Secondary systems |
| 3 | **Insights** | Reports, Logs, Analytics | Performance monitoring |
| 4 | **SCOPE X** | Non-clickable badge | Constant reminder of permissions |
| 5 | **👤** | Profile, Scope Info, Escalate, Logout | Moderator-specific actions |

### Dropdown: Queue (Contextual by Scope)
```
Queue (Scope A: User Approvals)
├── Mentor Queue      👨🏫
├── Mentee Flags      🚩
└── Corporate Queue   🏢
```

### Dropdown: Tools
```
Tools
├── Sanity Studio     🎨  (if Scope B)
├── Event Manager     📅  (if Scope C)
├── People Directory  👥  (if Scope D)
└── Resource Library  📚
```

### Dropdown: Insights
```
Insights
├── My Performance    📊
├── Activity Logs     📋
└── Moderation Reports 📈
```

---

## 6. SUPERADMIN HEADER (SuperAdmins)

**Structure: 5 items + System Status + User Menu**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [LOGO]    Overview    Users    Platform    System      [🟢] [🔔] [👤 ▼] │
│            ─────────   ─────    ─────────   ──────      ───  ────  ───── │
│            Dashboard   Manage   Configure   Docs        OK   Notify Admin│
└──────────────────────────────────────────────────────────────────────────┘
```

### Menu Items

| Position | Label | Dropdown Contents | Rationale |
|----------|-------|-------------------|-----------|
| 1 | **Overview** | Direct to main dashboard | High-level metrics |
| 2 | **Users** | All users, Moderators, Partners | User management hub |
| 3 | **Platform** | Settings, Content, Finance, Impact | Core configuration |
| 4 | **System** | Documentation, Security, Logs, DR | Technical operations |
| 5 | **🟢/🟡/🔴** | System status indicator | Immediate health visibility |

### Dropdown: Users
```
Users
├── All Users         👥
├── Moderators        🛡️
├── Corporate Partners 🏢
└── Access Logs       📋
```

### Dropdown: Platform
```
Platform
├── Settings          ⚙️
├── Content (Sanity)  📝
├── Financial         💰
├── Impact Map        🗺️
└── NDA Manager       📜
```

### Dropdown: System
```
System
├── Documentation     📚
├── Security          🔒
├── Audit Logs        📊
└── Disaster Recovery 🚨
```

### System Status Indicator (🟢/🟡/🔴)
| Color | Status | Action |
|-------|--------|--------|
| 🟢 Green | All systems operational | None |
| 🟡 Amber | Minor issues detected | Click for details |
| 🔴 Red | Critical incident | Immediate alert + runbook |

---

## 7. COMPARISON TABLE

| Header Type | Total Items | Primary CTA | Unique Feature |
|-------------|-------------|-------------|----------------|
| **Public** | 4 + 2 CTAs | Join (Red) | Simple, conversion-focused |
| **Authenticated** | 5 + menus | Dashboard | Explore/Community split |
| **Corporate** | 5 + menus | Dashboard | Business-value labels |
| **Moderator** | 4 + badge + menus | Queue | Scope visibility |
| **SuperAdmin** | 5 + status + menus | Overview | System health indicator |

---

## 8. LABEL RATIONALE

### Why These Words?

| Instead of... | We Use... | Because... |
|---------------|-----------|------------|
| "My Dashboard" | "Dashboard" | Shorter, universally understood |
| "Resources & Webinars" | "Explore" | Active verb, encompasses discovery |
| "Articles & Directory" | "Community" | Emotional connection, broader scope |
| "User Management" | "Users" | Simpler, still clear |
| "Configuration" | "Platform" | More concrete, less technical |
| "Documentation" | "System" | Broader, includes ops not just docs |

---

## 9. ACCESSIBILITY FEATURES

| Feature | Implementation |
|---------|----------------|
| **Keyboard navigation** | Tab through all items, Enter to open |
| **Focus states** | Red outline (`2px solid #BB0000`) |
| **ARIA labels** | "Main navigation", "User menu", "Notifications" |
| **Screen reader** | Announces current page, dropdown states |
| **Color contrast** | 7:1 minimum for all text |
| **Touch targets** | 48px minimum on mobile |

---

## 10. RESPONSIVE BEHAVIOR

### Breakpoints

| Width | Behavior |
|-------|----------|
| > 1024px | Full horizontal menu |
| 768-1024px | Condensed, some items collapse |
| < 768px | Hamburger menu, all items in drawer |

### Mobile Menu Pattern
```
[☰ Menu] triggers full-screen drawer:

┌─────────────────┐
│  ✕ Close        │
│                 │
│  [User Info]    │
│                 │
│  DASHBOARD      │
│  ─────────────  │
│  EXPLORE        │
│    Resources    │
│    Webinars     │
│    Events       │
│  ─────────────  │
│  COMMUNITY      │
│    Articles     │
│    Directory    │
│    Write        │
│  ─────────────  │
│  NOTIFICATIONS  │
│  SETTINGS       │
│  HELP           │
│  ─────────────  │
│  LOG OUT        │
└─────────────────┘
```

---

This minimalist structure ensures **users never face more than 5-7 choices** at any level, **labels are instantly understandable**, and **each role sees only what's relevant to them** — reducing cognitive load while maintaining full functionality.
