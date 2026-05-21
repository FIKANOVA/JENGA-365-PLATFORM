"use client";

import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { useSession } from "@/lib/auth/client";

export default function Header() {
    const { data: session, isPending } = useSession();
    const isAuthenticated = !!session?.user;

    if (isPending) {
        return (
            <header className="sticky top-0 z-50 bg-background border-b border-border h-16 flex items-center px-6">
                <div className="h-10 w-32 bg-accent animate-pulse rounded" />
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-50 bg-background border-b border-border h-16 flex items-center justify-between px-6">
            <Logo />
            <nav className="flex items-center gap-4">
                <Link
                    href="/donate"
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors"
                >
                    Donate
                </Link>
                <Link
                    href="/shop"
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors"
                >
                    Store
                </Link>
                {isAuthenticated ? (
                    <Link
                        href="/dashboard"
                        className="font-mono text-[10px] uppercase tracking-[0.2em] bg-white text-black px-4 py-2 hover:bg-white/90 transition-colors"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            className="font-mono text-[10px] uppercase tracking-[0.2em] bg-white text-black px-4 py-2 hover:bg-white/90 transition-colors"
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
}
