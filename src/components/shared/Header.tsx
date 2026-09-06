"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Heart, ShoppingBag, ChevronDown, LayoutDashboard, User, Settings, LogOut, LifeBuoy } from "lucide-react";
import Logo from "@/components/shared/Logo";
import UserAvatar from "@/components/shared/UserAvatar";
import NotificationBell from "@/components/shared/NotificationBell";
import RoleBadge from "@/components/shared/RoleBadge";
import DonateButton from "@/components/shared/DonateButton";
import { useSession, signOut } from "@/lib/auth/client";
import { getDashboardHref } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

/**
 * Three header variants driven by AUTH STATUS, not by route:
 *   1. Public        — guest on general pages: Logo + grouped dropdown nav + Donate/Store + Log In + Sign Up
 *   2. Authenticated — any logged-in role: Logo + grouped dropdown nav + Donate/Store + Avatar/Bell/Badge
 *   3. Minimal       — guest on /login | /register | /legal/nda | /verify-email: Logo only
 *
 * Nav is grouped into three dropdowns: Platform, Community, Get Involved.
 * Donate + Store + Sign Up remain visible header CTAs (CLAUDE.md §6); they are NOT
 * duplicated inside the Get Involved dropdown, which carries only distinct links.
 *
 * "light" (overlay) mode: on the landing page, before scroll, the header is
 * transparent and overlays the dark hero with white text; on scroll it gains the
 * blurred surface and flips to dark text. This is the only route-aware styling
 * (Moseti owns §6); auth-variant selection remains auth-driven, never route-driven.
 */

type NavItem = { label: string; href?: string; isDonate?: boolean; description?: string; newTab?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
    {
        label: "Platform",
        items: [
            { label: "About Us", href: "/about", description: "Who we are and how the engine works" },
            { label: "Impact", href: "/impact", description: "Verified outcomes and ESG metrics" },
            { label: "Help & Support", href: "/help", description: "Manuals, FAQs, and support" },
        ],
    },
    {
        label: "Community",
        items: [
            { label: "Mentors", href: "/mentors", description: "Apply or learn how mentorship works" },
            { label: "Mentees", href: "/mentees", description: "Find your structured mentorship path" },
            { label: "Articles", href: "/articles", description: "Insights from the field" },
            { label: "Resources", href: "/resources", description: "Downloads, video, and voices" },
        ],
    },
    {
        label: "Get Involved",
        items: [
            { label: "Become a Partner", href: "/register/partner", description: "Corporate or NGO partnerships" },
            { label: "Events", href: "/events", description: "Clinics, summits, and community drives" },
            { label: "Contact", href: "/contact", description: "Reach the team" },
        ],
    },
];

const MINIMAL_PREFIXES = ["/login", "/register", "/legal/nda", "/verify-email", "/admin-setup", "/moderator-invite", "/forgot-password", "/reset-password"];

function isMinimalRoute(pathname: string | null): boolean {
    if (!pathname) return false;
    return MINIMAL_PREFIXES.some((p) => pathname.startsWith(p));
}

// ── Outer shell ──────────────────────────────────────────────────────────────
function Shell({ scrolled, hideHeader, light, children, drawer }: { scrolled: boolean; hideHeader: boolean; light: boolean; children: React.ReactNode; drawer?: React.ReactNode }) {
    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                hideHeader ? "-translate-y-full" : "translate-y-0",
                light
                    ? "bg-transparent border-b border-transparent"
                    : scrolled
                      ? "bg-background/70 backdrop-blur-xl backdrop-saturate-150 border-b border-border/60 shadow-lg shadow-black/5"
                      : "bg-background/30 backdrop-blur-md backdrop-saturate-150 border-b border-transparent",
            )}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">{children}</div>
            </div>
            {drawer}
        </header>
    );
}

// ── Variant 3: Minimal ───────────────────────────────────────────────────────
function MinimalHeader() {
    return (
        <header className="w-full border-b border-border bg-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-16 items-center justify-center">
                    <Logo size="md" />
                </div>
            </div>
        </header>
    );
}

// ── Nav dropdown ─────────────────────────────────────────────────────────────
function NavDropdown({ group, light, onItemClick }: { group: NavGroup; light: boolean; onItemClick?: () => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        function onEscape(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEscape);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEscape);
        };
    }, []);

    function handleEnter() {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        setOpen(true);
    }
    function handleLeave() {
        hoverTimer.current = setTimeout(() => setOpen(false), 120);
    }
    function close() {
        setOpen(false);
        onItemClick?.();
    }

    return (
        <div
            className="relative"
            ref={ref}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "inline-flex items-center gap-1 px-4 py-2 text-label font-medium rounded-full transition-colors",
                    light ? "text-white hover:bg-white/10" : "text-foreground hover:bg-surface-2",
                )}
            >
                {group.label}
                <span className={light ? "text-white/60" : "text-foreground-subtle"} aria-hidden>
                    +
                </span>
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute left-0 mt-2 w-72 rounded-lg border border-white/10 bg-[color:var(--brand-black)]/90 backdrop-blur-xl backdrop-saturate-150 shadow-2xl overflow-hidden z-50"
                >
                    <ul className="py-2">
                        {group.items.map((item) => (
                            <li key={item.label}>
                                {item.isDonate ? (
                                    <DonateButton
                                        onAfterClick={close}
                                        className="flex w-full items-start gap-3 px-4 py-3 hover:bg-surface-2 text-left"
                                    >
                                        <Heart className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--brand-red)" }} aria-hidden />
                                        <span className="flex flex-col">
                                            <span className="text-label font-medium" style={{ color: "var(--brand-red)" }}>
                                                {item.label}
                                            </span>
                                            {item.description && (
                                                <span className="text-body-sm text-foreground-muted">{item.description}</span>
                                            )}
                                        </span>
                                    </DonateButton>
                                ) : (
                                    <Link
                                        href={item.href!}
                                        role="menuitem"
                                        onClick={close}
                                        {...(item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                        className="flex items-start gap-3 px-4 py-3 hover:bg-white/5"
                                    >
                                        <span className="flex flex-col">
                                            <span className="text-label font-medium text-white">{item.label}</span>
                                            {item.description && (
                                                <span className="text-body-sm text-white/60">{item.description}</span>
                                            )}
                                        </span>
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function PrimaryNav({ isAuthenticated, light }: { isAuthenticated: boolean; light: boolean }) {
    const navGroups = isAuthenticated
        ? NAV_GROUPS.map(group => ({
            ...group,
            items: group.items.filter(item => item.href !== "/register/partner")
        }))
        : NAV_GROUPS;

    return (
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {navGroups.map((g) => (
                <NavDropdown key={g.label} group={g} light={light} />
            ))}
        </nav>
    );
}

function GlobalCTAs({ light }: { light: boolean }) {
    return (
        <>
            <DonateButton
                className={cn(
                    "hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-label font-semibold transition-colors",
                    light ? "hover:bg-white/10" : "hover:bg-surface-2",
                )}
                style={{ color: light ? "#FF6B6B" : "var(--brand-red)" }}
            >
                <Heart className="h-4 w-4" aria-hidden />
                Donate
            </DonateButton>
            <Link
                href="/shop"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-label transition-colors",
                    light ? "text-white/90 hover:bg-white/10" : "hover:bg-surface-2",
                )}
                style={light ? undefined : { color: "var(--foreground-muted)" }}
            >
                <ShoppingBag className="h-4 w-4" aria-hidden />
                Store
            </Link>
        </>
    );
}

// ── Variant 1: Public ────────────────────────────────────────────────────────
function PublicHeader({ scrolled, hideHeader, light, mobileOpen, setMobileOpen }: { scrolled: boolean; hideHeader: boolean; light: boolean; mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
    return (
        <Shell
            scrolled={scrolled}
            hideHeader={hideHeader}
            light={light}
            drawer={mobileOpen ? <MobileDrawer isAuthenticated={false} onClose={() => setMobileOpen(false)} /> : null}
        >
            <Logo size="md" tone={light ? "light" : "default"} />
            <PrimaryNav isAuthenticated={false} light={light} />

            <div className="flex items-center gap-1.5 sm:gap-2">
                <GlobalCTAs light={light} />
                <span className={cn("hidden sm:inline-block h-5 w-px mx-1", light ? "bg-white/25" : "bg-border")} aria-hidden />
                <Link
                    href="/login"
                    className={cn(
                        "hidden sm:inline-flex items-center h-9 px-4 text-label rounded-full transition-colors",
                        light ? "text-white hover:bg-white/10" : "text-foreground hover:bg-surface-2",
                    )}
                >
                    Log In
                </Link>
                <Link
                    href="/register"
                    className="inline-flex items-center h-8 px-3 sm:h-9 sm:px-5 text-xs sm:text-label font-medium rounded-full text-white transition-colors"
                    style={{ background: "var(--brand-red)" }}
                >
                    Sign Up
                </Link>
                <button
                    type="button"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                    className={cn(
                        "md:hidden inline-flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-colors",
                        light ? "text-white hover:bg-white/10" : "text-foreground hover:bg-surface-2",
                    )}
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>
        </Shell>
    );
}

// ── Avatar dropdown for authenticated users ──────────────────────────────────
function AvatarMenu({ name, image, role, userId, light }: { name: string; image?: string; role?: string; userId?: string; light: boolean }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const ref = useRef<HTMLDivElement>(null);

    const dashboardHref = getDashboardHref(role);
    const profileHref = userId ? `/profile/${userId}` : "/dashboard/profile";

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    async function handleSignOut() {
        try {
            await signOut();
        } finally {
            window.location.href = "/";
        }
    }

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "inline-flex items-center gap-2 h-9 pl-1.5 pr-2 rounded-full transition-colors",
                    light ? "hover:bg-white/10" : "hover:bg-surface-2",
                )}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <UserAvatar name={name} image={image} light={light} />
                <ChevronDown className={cn("h-3.5 w-3.5", light ? "text-white/80" : "text-foreground-muted")} aria-hidden />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 mt-2 w-64 rounded-lg border border-white/10 bg-[color:var(--brand-black)]/90 backdrop-blur-xl backdrop-saturate-150 shadow-2xl overflow-hidden"
                >
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                        <p className="text-label font-semibold text-white truncate">{name}</p>
                        <div className="mt-1.5">
                            <RoleBadge role={role} />
                        </div>
                    </div>
                    <ul className="py-1">
                        <li>
                            <Link
                                href={dashboardHref}
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-body-sm hover:bg-white/10 text-white"
                            >
                                <LayoutDashboard className="h-4 w-4" aria-hidden />
                                My Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={profileHref}
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-body-sm hover:bg-white/10 text-white"
                            >
                                <User className="h-4 w-4" aria-hidden />
                                View Profile
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dashboard/settings"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-body-sm hover:bg-white/10 text-white"
                            >
                                <Settings className="h-4 w-4" aria-hidden />
                                Settings
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/help"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-body-sm hover:bg-white/10 text-white"
                            >
                                <LifeBuoy className="h-4 w-4" aria-hidden />
                                Help Center
                            </Link>
                        </li>
                        <li className="border-t border-white/10 my-1" aria-hidden />
                        <li>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setOpen(false);
                                    handleSignOut();
                                }}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-body-sm hover:bg-white/10 text-white"
                            >
                                <LogOut className="h-4 w-4" aria-hidden />
                                Log Out
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

// ── Variant 2: Authenticated ─────────────────────────────────────────────────
function AuthenticatedHeader({
    user,
    scrolled,
    hideHeader,
    light,
    mobileOpen,
    setMobileOpen,
}: {
    user: { id?: string; name?: string | null; image?: string | null; role?: string | null };
    scrolled: boolean;
    hideHeader: boolean;
    light: boolean;
    mobileOpen: boolean;
    setMobileOpen: (v: boolean) => void;
}) {
    const displayName = user.name ?? "User";
    return (
        <Shell
            scrolled={scrolled}
            hideHeader={hideHeader}
            light={light}
            drawer={mobileOpen ? <MobileDrawer isAuthenticated={true} userRole={user.role ?? undefined} userId={user.id} onClose={() => setMobileOpen(false)} /> : null}
        >
            <div className="flex items-center gap-4">
                <Logo size="md" tone={light ? "light" : "default"} />
                <RoleBadge role={user.role ?? null} className="hidden lg:inline-flex" />
            </div>
            <PrimaryNav isAuthenticated={true} light={light} />

            <div className="flex items-center gap-1.5 sm:gap-2">
                <GlobalCTAs light={light} />
                <span className={cn("hidden sm:inline-block h-5 w-px mx-1", light ? "bg-white/25" : "bg-border")} aria-hidden />
                <NotificationBell />
                <AvatarMenu name={displayName} image={user.image ?? undefined} role={user.role ?? undefined} userId={user.id} light={light} />

                <button
                    type="button"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                    className={cn(
                        "md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full transition-colors",
                        light ? "text-white hover:bg-white/10" : "text-foreground hover:bg-surface-2",
                    )}
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>
        </Shell>
    );
}

// ── Mobile drawer (shared, render outside Shell for full-width) ──────────────
function MobileDrawer({ isAuthenticated, userRole, userId, onClose }: { isAuthenticated: boolean; userRole?: string; userId?: string; onClose: () => void }) {
    const dashboardHref = getDashboardHref(userRole);
    const profileHref = userId ? `/profile/${userId}` : "/dashboard/profile";
    const navGroups = isAuthenticated
        ? NAV_GROUPS.map(group => ({
            ...group,
            items: group.items.filter(item => item.href !== "/register/partner")
        }))
        : NAV_GROUPS;

    return (
        <div className="md:hidden border-t border-border/60 bg-background/80 backdrop-blur-xl backdrop-saturate-150 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="mx-auto max-w-7xl px-6 py-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col gap-1">
                {isAuthenticated && (
                    <div className="flex flex-col gap-1 pb-2 border-b border-border mb-1">
                        <Link
                            href={dashboardHref}
                            onClick={onClose}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md hover:bg-surface-2 text-body font-medium text-foreground"
                        >
                            <LayoutDashboard className="h-4 w-4" style={{ color: "var(--brand-green)" }} /> My Dashboard
                        </Link>
                        <Link
                            href={profileHref}
                            onClick={onClose}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md hover:bg-surface-2 text-body font-medium text-foreground"
                        >
                            <User className="h-4 w-4" style={{ color: "var(--brand-green)" }} /> View Profile
                        </Link>
                    </div>
                )}

                {navGroups.map((group) => (
                    <details key={group.label} className="group/section">
                        <summary className="flex items-center justify-between px-3 py-3 rounded-md hover:bg-surface-2 text-body text-foreground cursor-pointer list-none">
                            <span className="font-medium">{group.label}</span>
                            <ChevronDown className="h-4 w-4 text-foreground-muted transition-transform group-open/section:rotate-180" aria-hidden />
                        </summary>
                        <ul className="pl-3 pb-2 flex flex-col gap-0.5">
                            {group.items.map((item) =>
                                item.isDonate ? (
                                    <li key={item.label}>
                                        <DonateButton
                                            onAfterClick={onClose}
                                            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-md hover:bg-surface-2 text-body text-left"
                                            style={{ color: "var(--brand-red)" }}
                                        >
                                            <Heart className="h-4 w-4" aria-hidden /> {item.label}
                                        </DonateButton>
                                    </li>
                                ) : (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href!}
                                            onClick={onClose}
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md hover:bg-surface-2 text-body text-foreground"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ),
                            )}
                        </ul>
                    </details>
                ))}

                <div className="h-px bg-border my-2" />

                {/* Primary CTAs stay visible at the bottom of the drawer */}
                <DonateButton
                    onAfterClick={onClose}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-md hover:bg-surface-2 text-body text-left"
                    style={{ color: "var(--brand-red)" }}
                >
                    <Heart className="h-4 w-4" aria-hidden /> Donate
                </DonateButton>
                <Link
                    href="/shop"
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-md hover:bg-surface-2 text-body text-foreground"
                >
                    <ShoppingBag className="h-4 w-4" aria-hidden /> Store
                </Link>

                {!isAuthenticated && (
                    <>
                        <div className="h-px bg-border my-2" />
                        <Link
                            href="/login"
                            onClick={onClose}
                            className="inline-flex items-center justify-center h-11 px-5 text-body rounded-full border border-border text-foreground"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            onClick={onClose}
                            className="inline-flex items-center justify-center h-11 px-5 text-body font-medium rounded-full text-white"
                            style={{ background: "var(--brand-red)" }}
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Public entry ─────────────────────────────────────────────────────────────
export default function Header() {
    const { data: session, isPending } = useSession();
    const pathname = usePathname();
    const isAuthenticated = !!session?.user;
    const [scrolled, setScrolled] = useState(false);
    const [hideHeader, setHideHeader] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const onScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 8);

            if (currentScrollY > lastScrollY.current && currentScrollY > 100 && !mobileOpen) {
                setHideHeader(true);
            } else {
                setHideHeader(false);
            }
            lastScrollY.current = currentScrollY;
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [mobileOpen]);

    useEffect(() => {
        if (mobileOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    // Overlay (transparent + white text) only on the landing hero, before scroll
    // and before the mobile drawer opens.
    const isHome = pathname === "/";
    const light = isHome && !scrolled && !mobileOpen;

    // Variant 3: Minimal — guest on auth/legal routes
    if (!isAuthenticated && isMinimalRoute(pathname)) {
        return <MinimalHeader />;
    }

    // Loading: render Shell with just the logo to avoid CTA flash
    if (isPending) {
        return (
            <Shell scrolled={scrolled} hideHeader={false} light={light}>
                <Logo size="md" tone={light ? "light" : "default"} />
                <div className="h-9 w-24 rounded-md bg-surface-2 animate-pulse" aria-hidden />
            </Shell>
        );
    }

    return isAuthenticated && session?.user ? (
        <AuthenticatedHeader
            user={{
                id: session.user.id,
                name: session.user.name ?? "User",
                image: (session.user as { image?: string | null }).image ?? null,
                role: (session.user as { role?: string | null }).role ?? null,
            }}
            scrolled={scrolled}
            hideHeader={hideHeader}
            light={light}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
        />
    ) : (
        <PublicHeader scrolled={scrolled} hideHeader={hideHeader} light={light} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    );
}
