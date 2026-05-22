"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Heart, ShoppingBag } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { useSession } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

/**
 * Minimal Jenga365 header — modeled on the prior version Moseti approved
 * (Logo left, right-side cluster only — no center nav). Updated with the new
 * DESIGN.md typography (Inter) and saturated Kenya flag colors.
 */
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
                    ? "bg-background/85 backdrop-blur-md border-b border-border"
                    : "bg-background border-b border-transparent",
            )}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Left: wordmark */}
                    <Logo size="md" />

                    {/* Right: global CTAs + auth */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Link
                            href="/donate"
                            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-label transition-colors"
                            style={{
                                color: "var(--brand-red)",
                            }}
                        >
                            <Heart className="h-4 w-4" aria-hidden />
                            Donate
                        </Link>
                        <Link
                            href="/shop"
                            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-label text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                        >
                            <ShoppingBag className="h-4 w-4" aria-hidden />
                            Store
                        </Link>

                        <span className="hidden sm:inline-block h-5 w-px bg-border mx-1" aria-hidden />

                        {/* Auth-aware */}
                        {isPending ? (
                            <div className="h-9 w-24 animate-pulse rounded-md bg-surface-2" />
                        ) : isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center h-9 px-4 text-label font-medium rounded-md text-white transition-opacity hover:opacity-90"
                                style={{ background: "var(--brand-black)" }}
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="hidden sm:inline-flex items-center h-9 px-3 text-label text-foreground hover:bg-surface-2 rounded-md transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center h-9 px-4 text-label font-medium rounded-md text-white transition-colors"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}

                        {/* Mobile hamburger — only for the Donate/Store on small screens */}
                        <button
                            type="button"
                            aria-label={open ? "Close menu" : "Open menu"}
                            aria-expanded={open}
                            className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-foreground hover:bg-surface-2"
                            onClick={() => setOpen((v) => !v)}
                        >
                            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile drawer */}
            {open && (
                <div className="sm:hidden border-t border-border bg-background">
                    <div className="mx-auto max-w-7xl px-6 py-3 flex flex-col gap-1">
                        <Link
                            href="/donate"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-3 rounded-md hover:bg-surface-2 text-body"
                            style={{ color: "var(--brand-red)" }}
                        >
                            <Heart className="h-4 w-4" aria-hidden />
                            Donate
                        </Link>
                        <Link
                            href="/shop"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-3 rounded-md hover:bg-surface-2 text-body text-foreground"
                        >
                            <ShoppingBag className="h-4 w-4" aria-hidden />
                            Store
                        </Link>
                        {!isAuthenticated && (
                            <Link
                                href="/login"
                                onClick={() => setOpen(false)}
                                className="px-3 py-3 rounded-md hover:bg-surface-2 text-body text-foreground"
                            >
                                Log In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
