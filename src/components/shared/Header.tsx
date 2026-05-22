"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Heart, ShoppingBag } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { useSession } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

interface NavLink {
    label: string;
    href: string;
}

const NAV: NavLink[] = [
    { label: "Mentorship", href: "/mentors" },
    { label: "Engine B", href: "/impact" },
    { label: "Journal", href: "/articles" },
    { label: "Resources", href: "/resources" },
    { label: "About", href: "/about" },
];

export default function Header() {
    const { data: session, isPending } = useSession();
    const isAuthenticated = !!session?.user;
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-colors duration-200",
                scrolled
                    ? "bg-background/80 backdrop-blur-md border-b border-border"
                    : "bg-background border-b border-transparent",
            )}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Left: wordmark */}
                    <div className="flex items-center">
                        <Logo size="md" />
                    </div>

                    {/* Center: primary nav (desktop) */}
                    <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
                        {NAV.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="px-3 py-2 text-label text-foreground-muted hover:text-foreground transition-colors rounded-md hover:bg-surface-2"
                                style={{ color: "var(--foreground-muted)" }}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: CTAs */}
                    <div className="flex items-center gap-2">
                        {/* Always-visible global CTAs */}
                        <Link
                            href="/donate"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-label text-foreground-muted hover:text-foreground transition-colors rounded-md hover:bg-surface-2"
                            style={{ color: "var(--foreground-muted)" }}
                        >
                            <Heart className="h-4 w-4" />
                            Donate
                        </Link>
                        <Link
                            href="/shop"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-label text-foreground-muted hover:text-foreground transition-colors rounded-md hover:bg-surface-2"
                            style={{ color: "var(--foreground-muted)" }}
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Store
                        </Link>

                        {/* Auth-aware right cluster */}
                        <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l border-border">
                            {isPending ? (
                                <div className="h-9 w-28 animate-pulse rounded-md bg-surface-2" />
                            ) : isAuthenticated ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center h-9 px-4 text-label font-medium rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center h-9 px-3 text-label text-foreground hover:bg-surface-2 rounded-md transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center h-9 px-4 text-label font-medium rounded-md bg-[var(--brand-green)] text-white hover:opacity-90 transition-opacity"
                                    >
                                        Get started
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            type="button"
                            aria-label={open ? "Close menu" : "Open menu"}
                            aria-expanded={open}
                            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-foreground hover:bg-surface-2"
                            onClick={() => setOpen((v) => !v)}
                        >
                            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile drawer */}
            {open && (
                <div className="md:hidden border-t border-border bg-background">
                    <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-1">
                        {NAV.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className="px-3 py-3 text-body rounded-md hover:bg-surface-2 text-foreground"
                            >
                                {l.label}
                            </Link>
                        ))}
                        <div className="h-px bg-border my-2" />
                        <Link
                            href="/donate"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-3 py-3 text-body rounded-md hover:bg-surface-2 text-foreground"
                        >
                            <Heart className="h-4 w-4" />
                            Donate
                        </Link>
                        <Link
                            href="/shop"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-3 py-3 text-body rounded-md hover:bg-surface-2 text-foreground"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Store
                        </Link>
                        <div className="h-px bg-border my-2" />
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center justify-center h-11 px-4 text-body font-medium rounded-md bg-foreground text-background"
                            >
                                Go to dashboard
                            </Link>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/login"
                                    onClick={() => setOpen(false)}
                                    className="inline-flex items-center justify-center h-11 px-4 text-body rounded-md border border-border text-foreground"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setOpen(false)}
                                    className="inline-flex items-center justify-center h-11 px-4 text-body font-medium rounded-md bg-[var(--brand-green)] text-white"
                                >
                                    Get started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
