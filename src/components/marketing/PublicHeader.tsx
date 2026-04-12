"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, ShoppingCart, Heart, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/shared/Logo";
import { useSession } from "@/lib/auth/client";

const navGroups = [
    {
        label: "Platform",
        items: [
            { label: "About Us", href: "/about", desc: "Our mission, story & team" },
            { label: "Impact", href: "/impact", desc: "How we're changing lives" },
            { label: "Contact", href: "/contact", desc: "Get in touch" },
        ],
    },
    {
        label: "Community",
        items: [
            { label: "Mentors", href: "/mentors", desc: "Find a mentor" },
            { label: "Mentees", href: "/mentees", desc: "Support a mentee" },
            { label: "Events", href: "/events", desc: "Upcoming gatherings" },
        ],
    },
    {
        label: "Resources",
        items: [
            { label: "Articles", href: "/resources/articles", desc: "Insights & thought leadership" },
            { label: "Downloads", href: "/resources/downloads", desc: "Guides, playbooks & PDFs" },
            { label: "Video", href: "/resources/video", desc: "Sessions, talks & tutorials" },
            { label: "Voices", href: "/resources/voices", desc: "X-Spaces & X-Threads" },
        ],
    },
];

function DropdownMenu({ group, pathname }: { group: typeof navGroups[0]; pathname: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const isGroupActive = group.items.some((i) => pathname === i.href);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-2 transition-colors ${
                    isGroupActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
            >
                {group.label}
                <ChevronDown
                    size={11}
                    className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        onMouseEnter={() => setOpen(true)}
                        onMouseLeave={() => setOpen(false)}
                        className="absolute top-full left-0 mt-1 min-w-[220px] bg-background border border-border shadow-xl z-50 py-2"
                    >
                        {group.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`flex flex-col px-5 py-3 transition-colors group/item ${
                                    pathname === item.href
                                        ? "bg-primary/5 border-l-2 border-primary"
                                        : "hover:bg-accent border-l-2 border-transparent"
                                }`}
                            >
                                <span className={`font-mono text-[10px] uppercase tracking-[0.15em] font-bold transition-colors ${
                                    pathname === item.href ? "text-primary" : "text-foreground group-hover/item:text-primary"
                                }`}>
                                    {item.label}
                                </span>
                                <span className="text-muted-foreground text-[10px] font-sans mt-0.5">{item.desc}</span>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PublicHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    return (
        <>
            <header className="sticky top-0 z-50 glass-nav border-b border-border h-20 transition-all duration-500">
                <nav className="max-w-7xl mx-auto px-6 md:px-12 h-full flex items-center justify-between gap-6">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-3 shrink-0">
                        <Logo variant="premium" theme="premium" height={36} />
                    </Link>

                    {/* Grouped nav — desktop */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navGroups.map((group) => (
                            <DropdownMenu key={group.label} group={group} pathname={pathname} />
                        ))}
                    </div>

                    {/* Actions — desktop */}
                    <div className="hidden lg:flex items-center gap-3 shrink-0">
                        <Link
                            href="/shop"
                            className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-2 transition-colors ${pathname === "/shop" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <ShoppingCart size={14} strokeWidth={1.5} />
                            Store
                        </Link>

                        <Link
                            href="/donate"
                            className="flex items-center gap-2 px-4 py-2 border border-[var(--secondary)] text-[var(--secondary)] font-mono text-[9px] uppercase tracking-widest font-bold hover:bg-[var(--secondary)] hover:text-white transition-all"
                        >
                            <Heart size={12} strokeWidth={2} />
                            Donate
                        </Link>

                        {!isAuthenticated ? (
                            <>
                                <Link
                                    href="/register"
                                    className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] font-bold px-4 py-2 border border-border text-foreground hover:bg-accent transition-all"
                                >
                                    Register
                                </Link>
                                <Link href="/login" className="btn-primary flex items-center gap-2 shadow-md">
                                    Login
                                    <ArrowRight size={13} strokeWidth={2.5} />
                                </Link>
                            </>
                        ) : (
                            <Link
                                href="/dashboard"
                                className="btn-primary flex items-center gap-2 shadow-md"
                            >
                                Dashboard
                                <ArrowRight size={13} strokeWidth={2.5} />
                            </Link>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="lg:hidden p-2 text-foreground ml-auto"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={24} strokeWidth={1.5} />
                    </button>
                </nav>
            </header>

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 26, stiffness: 220 }}
                        className="fixed inset-0 z-[60] bg-background flex flex-col"
                    >
                        <div className="flex justify-between items-center px-8 h-20 border-b border-border shrink-0">
                            <Logo variant="premium" theme="premium" height={32} />
                            <button onClick={() => setMobileOpen(false)} className="p-2 border border-foreground" aria-label="Close menu">
                                <X size={22} className="text-foreground" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {/* Group labels */}
                            {navGroups.map((group) => (
                                <div key={group.label} className="border-b border-border">
                                    <p className="px-8 pt-5 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                                        {group.label}
                                    </p>
                                    {group.items.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center justify-between px-8 py-4 font-serif font-bold text-2xl uppercase tracking-tight transition-colors ${
                                                pathname === item.href ? "text-primary" : "text-foreground hover:text-primary"
                                            }`}
                                        >
                                            {item.label}
                                            <ArrowRight size={16} className="text-muted-foreground" />
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-4 border-t border-border shrink-0">
                            <Link
                                href="/donate"
                                onClick={() => setMobileOpen(false)}
                                className="py-6 text-center text-[var(--secondary)] font-mono font-bold uppercase tracking-widest text-[9px] border-r border-border hover:bg-[var(--secondary)]/10 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Heart size={11} /> Donate
                            </Link>
                            <Link
                                href="/shop"
                                onClick={() => setMobileOpen(false)}
                                className="py-6 text-center text-foreground font-mono font-bold uppercase tracking-widest text-[9px] border-r border-border hover:bg-accent transition-colors flex items-center justify-center gap-1.5"
                            >
                                <ShoppingCart size={11} /> Shop
                            </Link>
                            {!isAuthenticated && (
                                <Link
                                    href="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="py-6 text-center text-foreground font-mono font-bold uppercase tracking-widest text-[9px] border-r border-border hover:bg-accent transition-all flex items-center justify-center"
                                >
                                    Register
                                </Link>
                            )}
                            <Link
                                href={isAuthenticated ? "/dashboard" : "/login"}
                                onClick={() => setMobileOpen(false)}
                                className={`py-6 text-center bg-foreground text-background font-mono font-bold uppercase tracking-widest text-[9px] hover:bg-primary hover:text-white transition-all flex items-center justify-center ${isAuthenticated ? "col-span-2" : ""}`}
                            >
                                {isAuthenticated ? "Dashboard" : "Login"}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
