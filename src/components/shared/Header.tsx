"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Heart, ShoppingBag, ChevronDown, LayoutDashboard, Settings, LogOut } from "lucide-react";
import Logo from "@/components/shared/Logo";
import UserAvatar from "@/components/shared/UserAvatar";
import NotificationBell from "@/components/shared/NotificationBell";
import RoleBadge from "@/components/shared/RoleBadge";
import { useSession, signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

/**
 * Three header variants driven by AUTH STATUS, not by route:
 *   1. Public      — guest on general pages: Logo + nav + Donate/Store + Log In + Sign Up (red)
 *   2. Authenticated — any logged-in role: Logo + nav + Donate/Store + Avatar/Bell/Badge
 *   3. Minimal     — guest on /login | /register | /legal/nda | /verify-email: Logo only
 */

const NAV_LINKS = [
    { label: "About", href: "/about" },
    { label: "Articles", href: "/articles" },
    { label: "Events", href: "/events" },
    { label: "Resources", href: "/resources" },
] as const;

const MINIMAL_PREFIXES = ["/login", "/register", "/legal/nda", "/verify-email", "/admin-setup", "/moderator-invite", "/forgot-password", "/reset-password"];

function isMinimalRoute(pathname: string | null): boolean {
    if (!pathname) return false;
    return MINIMAL_PREFIXES.some((p) => pathname.startsWith(p));
}

// ── Outer shell ──────────────────────────────────────────────────────────────
function Shell({ scrolled, children }: { scrolled: boolean; children: React.ReactNode }) {
    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-200",
                scrolled
                    ? "bg-background/85 backdrop-blur-md border-b border-border"
                    : "bg-transparent border-b border-transparent",
            )}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">{children}</div>
            </div>
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

// ── Shared: nav links list ───────────────────────────────────────────────────
function PrimaryNav({ onItemClick }: { onItemClick?: () => void }) {
    return (
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {NAV_LINKS.map((l) => (
                <Link
                    key={l.href}
                    href={l.href}
                    onClick={onItemClick}
                    className="px-3 py-2 text-label rounded-md hover:bg-surface-2 transition-colors"
                    style={{ color: "var(--foreground-muted)" }}
                >
                    {l.label}
                </Link>
            ))}
        </nav>
    );
}

function GlobalCTAs() {
    return (
        <>
            <Link
                href="/donate"
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-label transition-colors hover:bg-surface-2"
                style={{ color: "var(--brand-red)" }}
            >
                <Heart className="h-4 w-4" aria-hidden />
                Donate
            </Link>
            <Link
                href="/shop"
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-label hover:bg-surface-2 transition-colors"
                style={{ color: "var(--foreground-muted)" }}
            >
                <ShoppingBag className="h-4 w-4" aria-hidden />
                Store
            </Link>
        </>
    );
}

// ── Variant 1: Public ────────────────────────────────────────────────────────
function PublicHeader({ scrolled, mobileOpen, setMobileOpen }: { scrolled: boolean; mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
    return (
        <Shell scrolled={scrolled}>
            <Logo size="md" />
            <PrimaryNav />

            <div className="flex items-center gap-1.5 sm:gap-2">
                <GlobalCTAs />
                <span className="hidden sm:inline-block h-5 w-px bg-border mx-1" aria-hidden />
                <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center h-9 px-3 text-label text-foreground hover:bg-surface-2 rounded-md transition-colors"
                >
                    Log In
                </Link>
                <Link
                    href="/register"
                    className="inline-flex items-center h-9 px-4 text-label font-medium rounded-md text-white transition-colors"
                    style={{ background: "var(--brand-red)" }}
                >
                    Sign Up
                </Link>
                <button
                    type="button"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                    className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-foreground hover:bg-surface-2"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>
        </Shell>
    );
}

// ── Avatar dropdown for authenticated users ──────────────────────────────────
function AvatarMenu({ name, image, role }: { name: string; image?: string; role?: string }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const ref = useRef<HTMLDivElement>(null);

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
            router.push("/");
            router.refresh();
        }
    }

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-2 h-9 pl-1.5 pr-2 rounded-full hover:bg-surface-2 transition-colors"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <UserAvatar name={name} image={image} />
                <ChevronDown className="h-3.5 w-3.5 text-foreground-muted" aria-hidden />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-background shadow-lg overflow-hidden"
                >
                    <div className="px-4 py-3 border-b border-border bg-surface-1">
                        <p className="text-label font-semibold text-foreground truncate">{name}</p>
                        <div className="mt-1.5">
                            <RoleBadge role={role} />
                        </div>
                    </div>
                    <ul className="py-1">
                        <li>
                            <Link
                                href="/dashboard"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-body-sm hover:bg-surface-2 text-foreground"
                            >
                                <LayoutDashboard className="h-4 w-4" aria-hidden />
                                My Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dashboard/settings"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-body-sm hover:bg-surface-2 text-foreground"
                            >
                                <Settings className="h-4 w-4" aria-hidden />
                                Settings
                            </Link>
                        </li>
                        <li className="border-t border-border my-1" aria-hidden />
                        <li>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setOpen(false);
                                    handleSignOut();
                                }}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-body-sm hover:bg-surface-2 text-foreground"
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
    mobileOpen,
    setMobileOpen,
}: {
    user: { name?: string | null; image?: string | null; role?: string | null };
    scrolled: boolean;
    mobileOpen: boolean;
    setMobileOpen: (v: boolean) => void;
}) {
    const displayName = user.name ?? "User";
    return (
        <Shell scrolled={scrolled}>
            <div className="flex items-center gap-4">
                <Logo size="md" />
                <RoleBadge role={user.role ?? null} className="hidden lg:inline-flex" />
            </div>
            <PrimaryNav />

            <div className="flex items-center gap-1.5 sm:gap-2">
                <GlobalCTAs />
                <span className="hidden sm:inline-block h-5 w-px bg-border mx-1" aria-hidden />
                <NotificationBell />
                <AvatarMenu name={displayName} image={user.image ?? undefined} role={user.role ?? undefined} />

                <button
                    type="button"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                    className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-foreground hover:bg-surface-2"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>
        </Shell>
    );
}

// ── Mobile drawer (shared, render outside Shell for full-width) ──────────────
function MobileDrawer({ isAuthenticated, onClose }: { isAuthenticated: boolean; onClose: () => void }) {
    return (
        <div className="md:hidden border-t border-border bg-background">
            <div className="mx-auto max-w-7xl px-6 py-3 flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                    <Link
                        key={l.href}
                        href={l.href}
                        onClick={onClose}
                        className="px-3 py-3 rounded-md hover:bg-surface-2 text-body text-foreground"
                    >
                        {l.label}
                    </Link>
                ))}
                <div className="h-px bg-border my-2" />
                <Link
                    href="/donate"
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-md hover:bg-surface-2 text-body"
                    style={{ color: "var(--brand-red)" }}
                >
                    <Heart className="h-4 w-4" aria-hidden /> Donate
                </Link>
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
                            className="inline-flex items-center justify-center h-11 px-4 text-body rounded-md border border-border text-foreground"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            onClick={onClose}
                            className="inline-flex items-center justify-center h-11 px-4 text-body font-medium rounded-md text-white"
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
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (mobileOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    // Variant 3: Minimal — guest on auth/legal routes
    if (!isAuthenticated && isMinimalRoute(pathname)) {
        return <MinimalHeader />;
    }

    // Loading: render Shell with just the logo to avoid CTA flash
    if (isPending) {
        return (
            <Shell scrolled={scrolled}>
                <Logo size="md" />
                <div className="h-9 w-24 rounded-md bg-surface-2 animate-pulse" aria-hidden />
            </Shell>
        );
    }

    return (
        <>
            {isAuthenticated && session?.user ? (
                <AuthenticatedHeader
                    user={{
                        name: session.user.name ?? "User",
                        image: (session.user as { image?: string | null }).image ?? null,
                        role: (session.user as { role?: string | null }).role ?? null,
                    }}
                    scrolled={scrolled}
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                />
            ) : (
                <PublicHeader scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            )}
            {mobileOpen && (
                <MobileDrawer isAuthenticated={isAuthenticated} onClose={() => setMobileOpen(false)} />
            )}
        </>
    );
}
