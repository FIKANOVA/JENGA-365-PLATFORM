# JENGA365 — COMPLETE SCREEN FLOW & USER JOURNEY MAP (FINAL v2)
## With Correct Header States: Authenticated Users See Authenticated Header on ALL Pages

---

## CORRECTED HEADER SYSTEM

### Critical Rule: Header is Determined by Authentication State, Not Route

| User State | On Public Pages (`/`, `/about`, `/articles`, etc.) | On Dashboard Pages (`/dashboard/*`) | On Auth Pages (`/register`, `/login`, `/legal/nda`) |
|------------|---------------------------------------------------|-------------------------------------|---------------------------------------------------|
| **GUEST (Not Logged In)** | **Public Header** — Logo, nav links, "Sign Up" + "Login" CTAs | N/A (redirect to login) | **Minimal Header** — Logo only, no CTAs |
| **AUTHENTICATED (Any Role)** | **Authenticated Header** — Logo, mega-menu, notifications, avatar dropdown, **NO "Sign Up/Login" CTAs** | **Authenticated Header** — Same as left | N/A (redirect to dashboard) |

### Header Component Logic

```typescript
// Header Component Pseudo-Code
function Header() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    // GUEST: Public Header
    return <PublicHeader />;
  }
  
  // AUTHENTICATED: Role-specific Authenticated Header
  return <AuthenticatedHeader role={user.role} />;
}

// PublicHeader.tsx
function PublicHeader() {
  return (
    <header>
      <Logo />
      <nav>{/* Public links: About, Articles, Events, Resources */}</nav>
      <div className="cta-group">
        <Button variant="ghost" href="/login">Log In</Button>
        <Button variant="primary" href="/register">Sign Up</Button>
        <Button variant="secondary" href="/donate">Donate</Button>
        <Button variant="outline" href="/shop">Store</Button>
      </div>
    </header>
  );
}

// AuthenticatedHeader.tsx
function AuthenticatedHeader({ role }) {
  return (
    <header>
      <Logo />
      <MegaMenu role={role} /> {/* Role-filtered links */}
      <div className="actions">
        <Button variant="secondary" href="/donate">Donate</Button>
        <Button variant="outline" href="/shop">Store</Button>
        <NotificationBell role={role} />
        <RoleBadge role={role} /> {/* Color-coded chip */}
        <AvatarDropdown>
          <a href="/dashboard">My Dashboard</a>
          <a href="/dashboard/articles">My Articles</a>
          <a href="/dashboard/settings">Profile Settings</a>
          <button onClick={logout}>Log Out</button>
        </AvatarDropdown>
      </div>
    </header>
  );
}
```

### CTA Visibility Matrix

| CTA Button | Guest View | Authenticated View |
|------------|-----------|-------------------|
| **Sign Up** | ✅ Visible (top right) | ❌ Hidden (already registered) |
| **Log In** | ✅ Visible (top right) | ❌ Hidden (already logged in) |
| **Donate Now** | ✅ Visible | ✅ Visible (always shown) |
| **Store** | ✅ Visible | ✅ Visible (always shown) |
| **My Dashboard** | ❌ Hidden | ✅ Visible (avatar dropdown) |
| **Notifications** | ❌ Hidden | ✅ Visible (bell icon) |
| **Role Badge** | ❌ Hidden | ✅ Visible (color-coded) |

---

## JOURNEY 0: GENERAL / GUEST USER (NOT AUTHENTICATED)

**START:** Arrives at jenga365.com (no session cookie)

```
│
├── / HOMEPAGE
│   ├── **HEADER:** Public Header (transparent → solid on scroll)
│   │   ├── Logo (left)
│   │   ├── Nav: About · Articles · Events · Resources · Donate · Shop
│   │   └── CTAs (right): "Log In" (ghost) · "Sign Up" (primary red)
│   │
│   ├── Reads hero section
│   ├── Watches hero background video
│   ├── Sees impact ticker scrolling
│   ├── Reads 3 pillar cards
│   ├── Browses upcoming events
│   │   └── Clicks "Register →" → /register?intent=mentee
│   ├── Reads article cards
│   │   └── Clicks article → /articles/[slug]
│   ├── Sees partner logos scrolling
│   ├── Reads testimonials
│   └── CTA strip: "Donate Now" · "Sign Up as Mentor" · "Sign Up as Mentee"
│
├── /about ABOUT PAGE
│   ├── **HEADER:** Public Header (solid white)
│   ├── Reads vision + mission
│   ├── Scrolls history timeline
│   ├── Views leadership team
│   └── Clicks "Join the Movement" → /register
│
├── /articles ARTICLES LIST
│   ├── **HEADER:** Public Header
│   ├── Searches articles
│   ├── Filters by category
│   └── Clicks article → /articles/[slug]
│       ├── **HEADER:** Public Header
│       ├── Reads full article
│       └── Sees "Create Free Account →" footer CTA
│
├── /events EVENTS PAGE
│   ├── **HEADER:** Public Header
│   ├── Toggle: Webinars | Clinics | All
│   └── Clicks "Register →" → /register?event=[id]
│
├── /resources RESOURCE LIBRARY
│   ├── **HEADER:** Public Header
│   ├── Browses public articles
│   ├── Sees locked downloads
│   │   └── Clicks "Sign Up to Access →" → /register
│   └── Watches public videos
│
├── /donate DONATE PAGE
│   ├── **HEADER:** Public Header (minimal — no Sign Up/Login CTAs shown? NO — still shows them for guests)
│   │   ⚠️ **Correction:** Public Header ALWAYS shows Sign Up/Login for guests
│   ├── Selects amount
│   ├── Selects fund allocation
│   ├── Clicks "Donate with Paystack →"
│   │   └── Paystack Checkout → /donate/thank-you
│   │       ├── **HEADER:** Minimal Header (post-action)
│   │       ├── "Create account to track impact" prompt
│   │       └── CTAs: "Create Free Account" / "Continue as Guest"
│   └── Returns to homepage
│
├── /shop MERCHANDISE STORE
│   ├── **HEADER:** Public Header with cart icon
│   ├── Browses products
│   ├── Adds to cart
│   ├── Clicks "Checkout with Paystack →"
│   │   └── Paystack Checkout → /shop/order-confirmed
│   └── Returns to shop
│
├── /login LOGIN PAGE
│   ├── **HEADER:** Minimal Header (logo only, no CTAs)
│   ├── Email input
│   ├── Password input
│   ├── "Log In →" button
│   ├── "Forgot password?" link
│   └── "Don't have an account? Sign Up →" link
│       └── Successful login → redirect to role-appropriate dashboard
│
└── /register ROLE SELECTION
    ├── **HEADER:** Minimal Header with step indicator: ●○○
    ├── Sees 3 role cards
    ├── Clicks Mentee → /register/mentee
    ├── Clicks Mentor → /register/mentor
    └── Clicks Corporate → /register/corporate
```

---

## JOURNEY 0B: AUTHENTICATED USER ON PUBLIC PAGES

**START:** Logged-in user navigates to public page (e.g., clicks logo from dashboard)

```
│
├── / HOMEPAGE (Authenticated)
│   ├── **HEADER:** Authenticated Header (solid white, no transparency)
│   │   ├── Logo
│   │   ├── Mega-menu: Dashboard · Articles · Events · Resources · Directory
│   │   ├── "Donate" button
│   │   ├── "Store" button
│   │   ├── Notification bell (with unread count)
│   │   ├── Role badge: "Mentee" (green) / "Mentor" (blue) / "Partner" (purple) / "Moderator" (orange) / "Admin" (red)
│   │   └── Avatar dropdown: My Dashboard · My Articles · Settings · Log Out
│   │
│   ├── Reads hero section (same content as guest)
│   ├── **DIFFERENCE:** No "Sign Up" or "Login" CTAs anywhere
│   ├── **DIFFERENCE:** "Register for Event" buttons now say "View Event" (already registered) or show registered state
│   └── Clicks "My Dashboard" in avatar dropdown → /dashboard/[role]
│
├── /about, /articles, /events, /resources (Authenticated)
│   ├── **HEADER:** Authenticated Header (same as above)
│   ├── Same content as guest view
│   ├── **DIFFERENCE:** No registration prompts or "Sign Up to access" gates
│   └── All resources accessible (no locks)
│
├── /donate DONATE PAGE (Authenticated)
│   ├── **HEADER:** Authenticated Header
│   ├── Pre-filled name/email from profile
│   ├── "Your donation will be tracked in your impact dashboard"
│   └── Post-donation: /donate/thank-you → "View in Dashboard" button
│
└── /shop STORE (Authenticated)
    ├── **HEADER:** Authenticated Header with cart
    ├── Same shopping experience
    └── Order history linked to account
```

---

## JOURNEY 1: MENTEE — FULL FLOW

```
│
├── /register/mentee STEP 1 — CREDENTIALS
│   ├── **HEADER:** Minimal Header ●○○ (guest only — authenticated users can't access)
│   ├── Form fields...
│   └── "Continue →"
│
├── /register/mentee STEP 2 — AI INTERVIEWER
│   ├── **HEADER:** Minimal Header ●●○
│   └── "Continue →"
│
├── /register/mentee STEP 3 — PREFERENCES
│   ├── **HEADER:** Minimal Header ●●●
│   └── "Complete Registration →"
│       └── SUCCESS: "Check Your Inbox" with 3-step list
│
├── /verify-email/[token]
│   ├── **HEADER:** Minimal Header
│   ├── Success → /legal/nda?role=mentee
│
├── /legal/nda?role=mentee NDA SIGNING
│   ├── **HEADER:** Legal Header with progress ●●●○
│   ├── Document + signing panel
│   └── "Sign & Access Dashboard →"
│       └── → /dashboard/mentee (AUTO-APPROVED)
│
└── /dashboard/mentee MENTEE DASHBOARD
    ├── **HEADER:** Authenticated Header with Mentee badge (green)
    ├── Sidebar: Overview · My Mentor · Learning Pathway · Webinars · Resources · Articles · Settings
    └── All subsequent navigation uses Authenticated Header
```

---

## JOURNEY 2: MENTOR — FULL FLOW

```
│
├── /register/mentor (Steps 1-3)
│   ├── **HEADER:** Minimal Header (guest only)
│   └── Email verification → /legal/nda?role=mentor
│
├── /legal/nda?role=mentor NDA SIGNING
│   ├── **HEADER:** Legal Header with progress ●●●○
│   └── "Sign & Submit for Review →"
│       └── → /pending-approval
│
├── /pending-approval WAITING STATE
│   ├── **HEADER:** Waiting Header with status "Under Review"
│   ├── 4-step progress: ●●●○
│   └── Approved → /dashboard/mentor
│
└── /dashboard/mentor MENTOR DASHBOARD
    ├── **HEADER:** Authenticated Header with Mentor badge (blue)
    └── All navigation uses Authenticated Header
```

---

## JOURNEY 3: CORPORATE PARTNER — FULL FLOW

```
│
├── /register/corporate (Steps 1-3)
│   ├── **HEADER:** Minimal Header (guest only)
│   └── Email verification → /legal/nda?role=corporate
│
├── /legal/nda?role=corporate NDA SIGNING
│   ├── **HEADER:** Legal Header with progress ●●●○
│   └── "Sign & Submit Partnership Application →"
│       └── → /pending-approval/corporate
│
├── /pending-approval/corporate WAITING
│   ├── **HEADER:** Waiting Header with status "Under Review"
│   ├── 5-step progress
│   └── Approved → /dashboard/partner
│
└── /dashboard/partner CORPORATE DASHBOARD
    ├── **HEADER:** Authenticated Header with Corporate badge (purple)
    └── All navigation uses Authenticated Header
```

---

## JOURNEY 4: MODERATOR — FULL FLOW

```
│
├── MODERATOR INVITATION EMAIL
│   └── Link to /moderator-invite/[token]
│
├── /moderator-invite/[token] PASSWORD SETUP
│   ├── **HEADER:** Minimal Header
│   └── → /legal/nda?role=moderator
│
├── /legal/nda?role=moderator NDA SIGNING
│   ├── **HEADER:** Legal Header with progress ●●○
│   └── "Sign & Access Moderation Dashboard →"
│       └── → /dashboard/moderator
│
└── /dashboard/moderator MODERATOR DASHBOARD
    ├── **HEADER:** Admin Header with Moderator badge (orange) + Scope chips
    └── All navigation uses Admin Header
```

---

## JOURNEY 5: SUPERADMIN — FULL FLOW

```
│
├── /admin-setup/[token] FIRST LOGIN
│   ├── **HEADER:** Minimal Header
│   ├── Step 1: Credentials
│   ├── Step 2: 2FA Setup
│   └── Step 3: → /legal/nda?role=superadmin
│
├── /legal/nda?role=superadmin NDA SIGNING
│   ├── **HEADER:** Legal Header with progress ●●○
│   └── "Sign & Access SuperAdmin Dashboard →"
│       └── → /dashboard/admin
│
└── /dashboard/admin SUPERADMIN DASHBOARD
    ├── **HEADER:** Admin Header with SuperAdmin badge (red)
    └── All navigation uses Admin Header
```

---

## UPDATED HEADER STATE MATRIX (CORRECTED)

| Route | Guest Header | Authenticated Header | Notes |
|-------|-------------|---------------------|-------|
| `/` | **Public** — Shows Sign Up + Login | **Authenticated** — Shows avatar, notifications, role badge | CTA visibility toggles |
| `/about`, `/articles`, `/events`, `/resources` | **Public** — Shows Sign Up + Login | **Authenticated** — Full auth header | No registration prompts for auth users |
| `/donate` | **Public** — Shows Sign Up + Login | **Authenticated** — Full auth header | Pre-filled data for auth users |
| `/shop` | **Public** — Shows Sign Up + Login + cart | **Authenticated** — Full auth header + cart | Order history for auth users |
| `/login`, `/register/*` | **Minimal** — Logo only | **N/A** — Redirect to dashboard | Auth users can't access |
| `/verify-email/*` | **Minimal** — Logo only | **N/A** | One-time use |
| `/legal/nda` | **Legal** — Progress bar | **N/A** | Only during registration |
| `/pending-approval` | **Waiting** — Status pill | **N/A** | Only pre-approval |
| `/dashboard/*` | **N/A** — Redirect to login | **Authenticated/Admin** — Role-specific | Always auth header |
| Error pages (404/403/500) | **Minimal** — Logo only | **Authenticated** — If session exists | Context-aware |

---

## CTA VISIBILITY RULES (SUMMARY)

### For GUEST Users (Not Authenticated):
- ✅ **Show:** "Sign Up" button (primary red)
- ✅ **Show:** "Log In" button (ghost/secondary)
- ✅ **Show:** "Donate Now" button
- ✅ **Show:** "Store" button
- ✅ **Show:** "Register for Event" on event cards
- ✅ **Show:** "Sign Up to Download" on locked resources
- ✅ **Show:** "Create Free Account" prompts in article footers

### For AUTHENTICATED Users (Any Role):
- ❌ **Hide:** "Sign Up" button (everywhere)
- ❌ **Hide:** "Log In" button (everywhere)
- ❌ **Hide:** "Register" CTAs on events (show "Registered" or "View Details")
- ❌ **Hide:** "Sign Up to Download" locks (all resources unlocked)
- ❌ **Hide:** "Create Free Account" prompts
- ✅ **Show:** "Donate Now" button (always visible)
- ✅ **Show:** "Store" button (always visible)
- ✅ **Show:** Avatar dropdown with "My Dashboard", "Settings", "Log Out"
- ✅ **Show:** Notification bell with unread count
- ✅ **Show:** Role badge (color-coded per role)

---

## MIDDLEWARE UPDATES (Header State Detection)

```typescript
// middleware.ts — Updated for Header State
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSession(request);
  
  // Add header state to request for client-side header component
  const requestHeaders = new Headers(request.headers);
  
  if (session) {
    // Authenticated: pass role to header component
    requestHeaders.set('x-user-role', session.user.role);
    requestHeaders.set('x-user-authenticated', 'true');
    
    // Prevent authenticated users from accessing auth pages
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    // Guest: mark as unauthenticated
    requestHeaders.set('x-user-authenticated', 'false');
    
    // Allow access to public pages with Public Header
    // Allow access to auth flows with Minimal Header
  }
  
  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}
```

---

## COMPONENT ARCHITECTURE (Header)

```typescript
// components/layout/Header.tsx
export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  
  // Determine header variant
  if (!isAuthenticated) {
    // GUEST flows
    if (isAuthRoute(pathname)) {
      return <MinimalHeader />; // Logo only
    }
    return <PublicHeader />; // Full nav + Sign Up/Login CTAs
  }
  
  // AUTHENTICATED flows
  if (isDashboardRoute(pathname)) {
    return <AuthenticatedHeader role={user.role} variant="dashboard" />;
  }
  
  // Authenticated user on public page
  return <AuthenticatedHeader role={user.role} variant="public" />;
}

// Variants handle subtle differences:
// - "public" variant: Donate + Store buttons more prominent
// - "dashboard" variant: Dashboard link active in mega-menu
```

This correction ensures:
1. **Authenticated users NEVER see "Sign Up" or "Log In" buttons**
2. **Authenticated users ALWAYS see their avatar/role badge, even on public pages**
3. **Guest users ALWAYS see registration CTAs on public pages**
4. **Header state is determined by auth status, not route**
