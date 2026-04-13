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
                    isGroupActive ? "text-white" : "text-white/55 hover:text-white"
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
            <header className="sticky top-0 z-50 bg-black/85 backdrop-blur-xl border-b border-white/8 h-16 transition-all duration-300">
                <nav className="max-w-7xl mx-auto px-6 md:px-12 h-full flex items-center justify-between gap-6">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-3 shrink-0">
                        <Logo variant="white" theme="dark" height={32} />
                    </Link>

                    {/* Grouped nav — desktop */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navGroups.map((group) => (
                            <DropdownMenu key={group.label} group={group} pathname={pathname} />
                        ))}
                    </div>

                    {/* Actions — desktop */}
                    <div className="hidden lg:flex items-center gap-2 shrink-0">
                        {/* Store — ghost */}
                        <Link
                            href="/shop"
                            className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-2 transition-colors ${pathname === "/shop" ? "text-white" : "text-white/50 hover:text-white"}`}
                        >
                            <ShoppingCart size={13} strokeWidth={1.5} />
                            Store
                        </Link>

                        {/* Donate — red outline */}
                        <Link
                            href="/donate"
                            className="flex items-center gap-1.5 px-4 py-[7px] border border-[#bc0100]/60 text-[#ff4444] font-mono text-[9px] uppercase tracking-widest font-bold hover:bg-[#bc0100] hover:text-white hover:border-[#bc0100] transition-all duration-200"
                        >
                            <Heart size={11} strokeWidth={2} />
                            Donate
                        </Link>

                        {!isAuthenticated ? (
                            <>
                                {/* Register — white outline */}
                                <Link
                                    href="/register"
                                    className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest font-bold px-4 py-[7px] border border-white/25 text-white/75 hover:border-white/60 hover:text-white transition-all duration-200"
                                >
                                    Register
                                </Link>
                                {/* Login — solid red */}
                                <Link
                                    href="/login"
                                    className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest font-bold px-5 py-[7px] bg-[#bc0100] text-white hover:bg-[#a00000] transition-colors duration-200"
                                >
                                    Login
                                    <ArrowRight size={12} strokeWidth={2.5} />
                                </Link>
                            </>
                        ) : (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest font-bold px-5 py-[7px] bg-[#bc0100] text-white hover:bg-[#a00000] transition-colors duration-200"
                            >
                                Dashboard
                                <ArrowRight size={12} strokeWidth={2.5} />
                            </Link>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="lg:hidden p-2 text-white/70 hover:text-white ml-auto transition-colors"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={22} strokeWidth={1.5} />
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
                        className="fixed inset-0 z-[60] bg-[#0a0a0a] flex flex-col"
                    >
                        <div className="flex justify-between items-center px-8 h-16 border-b border-white/10 shrink-0">
                            <Logo variant="white" theme="dark" height={30} />
                            <button onClick={() => setMobileOpen(false)} className="p-2 border border-white/20 text-white/70 hover:text-white transition-colors" aria-label="Close menu">
                                <X size={22} className="text-foreground" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {/* Group labels */}
                            {navGroups.map((group) => (
                                <div key={group.label} className="border-b border-white/8">
                                    <p className="px-8 pt-5 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">
                                        {group.label}
                                    </p>
                                    {group.items.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center justify-between px-8 py-4 font-serif font-bold text-2xl uppercase tracking-tight transition-colors ${
                                                pathname === item.href ? "text-white" : "text-white/70 hover:text-white"
                                            }`}
                                        >
                                            {item.label}
                                            <ArrowRight size={16} className="text-muted-foreground" />
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-4 border-t border-white/10 shrink-0">
                            <Link
                                href="/donate"
                                onClick={() => setMobileOpen(false)}
                                className="py-5 text-center text-[#ff4444] font-mono font-bold uppercase tracking-widest text-[9px] border-r border-white/10 hover:bg-[#bc0100]/15 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Heart size={11} /> Donate
                            </Link>
                            <Link
                                href="/shop"
                                onClick={() => setMobileOpen(false)}
                                className="py-5 text-center text-white/60 font-mono font-bold uppercase tracking-widest text-[9px] border-r border-white/10 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <ShoppingCart size={11} /> Shop
                            </Link>
                            {!isAuthenticated && (
                                <Link
                                    href="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="py-5 text-center text-white/70 font-mono font-bold uppercase tracking-widest text-[9px] border-r border-white/10 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center"
                                >
                                    Register
                                </Link>
                            )}
                            <Link
                                href={isAuthenticated ? "/dashboard" : "/login"}
                                onClick={() => setMobileOpen(false)}
                                className={`py-5 text-center bg-[#bc0100] text-white font-mono font-bold uppercase tracking-widest text-[9px] hover:bg-[#a00000] transition-colors flex items-center justify-center gap-1.5 ${isAuthenticated ? "col-span-2" : ""}`}
                            >
                                {isAuthenticated ? "Dashboard" : "Login"}
                                <ArrowRight size={10} strokeWidth={2.5} />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
