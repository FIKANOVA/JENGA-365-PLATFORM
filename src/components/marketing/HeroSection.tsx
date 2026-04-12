"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/client";
import { ArrowRight, ShoppingCart, Heart, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
};

export default function HeroSection() {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    if (isAuthenticated) {
        const firstName = session.user?.name?.split(" ")[0] ?? "Back";
        return (
            <section className="relative min-h-[60vh] flex items-center bg-background overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
                    <div className="space-y-8">
                        <div className="h-px w-10 bg-primary" />
                        <h1 className="font-serif font-black text-5xl md:text-6xl text-foreground leading-none uppercase tracking-tighter">
                            Welcome Back,{" "}
                            <span className="text-primary italic">{firstName}.</span>
                        </h1>
                        <p className="font-sans text-lg text-muted-foreground max-w-md leading-relaxed">
                            Your support keeps the mission alive. Head to your dashboard or take action below.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/dashboard" className="btn-primary shadow-lg flex items-center gap-2">
                                My Dashboard <ArrowRight size={14} />
                            </Link>
                            <Link href="/donate" className="flex items-center gap-2 px-6 py-3 border border-[var(--secondary)] text-[var(--secondary)] font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-[var(--secondary)] hover:text-white transition-all">
                                <Heart size={13} /> Donate
                            </Link>
                            <Link href="/shop" className="flex items-center gap-2 px-6 py-3 border border-border text-foreground font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-all">
                                <ShoppingCart size={13} /> Shop
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:block aspect-[4/3] overflow-hidden border border-border shadow-xl">
                        <img
                            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop"
                            alt="Mentorship"
                            className="w-full h-full object-cover grayscale opacity-80"
                        />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden">
            {/* Full-bleed background image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://jenga365.com/wp-content/uploads/2025/07/Fanaka-Studios-SportPesa-Cheza-Dimba-Northrift-66-of-429-scaled.jpg"
                    alt=""
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1546519638405-a2b98cd5d9f2?q=80&w=1920&auto=format&fit=crop";
                    }}
                />
                {/* Dark overlay so text stays readable */}
                <div className="absolute inset-0 bg-black/65" />
                {/* Subtle green-tinted left glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
            </div>

            {/* Accent lines */}
            <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute bottom-0 left-0 w-px h-[40%] bg-gradient-to-t from-primary to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-20 lg:py-0 relative z-20">
                {/* Text block */}
                <div className="lg:col-span-7 space-y-8">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={0}
                        className="flex items-center gap-3"
                    >
                        <div className="h-px w-8 bg-primary" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
                            Kenya's Rugby &amp; Mentorship Platform
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={1}
                        className="font-serif font-black text-5xl md:text-7xl lg:text-[5.5rem] text-white leading-[0.92] uppercase tracking-tighter"
                    >
                        Building <span className="text-primary italic">Growth.</span>
                        <br />
                        Connecting
                        <br />
                        Futures.
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={2}
                        className="font-sans text-lg md:text-xl text-white/75 max-w-xl leading-relaxed"
                    >
                        Jenga365 is a dual-engine AI platform — building the Total Athlete through mentorship, financial literacy, and environmental stewardship.
                    </motion.p>

                    {/* 4 actions */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={3}
                        className="flex flex-wrap gap-3 pt-2"
                    >
                        <Link
                            href="/register"
                            className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/30"
                        >
                            Join Free <ArrowRight size={14} strokeWidth={2.5} />
                        </Link>
                        <Link
                            href="/donate"
                            className="flex items-center gap-2 px-6 py-3 border border-[var(--secondary)] text-[var(--secondary)] font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-[var(--secondary)] hover:text-white transition-all"
                        >
                            <Heart size={13} strokeWidth={2} />
                            Donate
                        </Link>
                        <Link
                            href="/shop"
                            className="flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-all"
                        >
                            <ShoppingCart size={13} strokeWidth={1.5} />
                            Store
                        </Link>
                        <Link
                            href="/about"
                            className="flex items-center gap-2 px-6 py-3 text-white/60 font-mono text-[10px] uppercase tracking-widest font-bold hover:text-white transition-all underline-offset-4 hover:underline"
                        >
                            Explore
                        </Link>
                    </motion.div>
                </div>

                {/* Stats panel — right column, 2×2 grid */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={4}
                    className="hidden lg:grid lg:col-span-5 grid-cols-2 gap-px border border-white/10 self-center"
                >
                    {[
                        { val: "750K+", label: "Lives Impacted", sub: "since 2023" },
                        { val: "12,000", label: "Mentors Registered", sub: "& growing" },
                        { val: "$1.2M", label: "Funding Granted", sub: "to community hubs" },
                        { val: "45", label: "Community Hubs", sub: "across East Africa" },
                    ].map((s) => (
                        <div key={s.label} className="p-8 border border-white/10 hover:bg-white/5 transition-colors">
                            <p className="font-serif font-black text-4xl xl:text-5xl text-white leading-none">{s.val}</p>
                            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/70 mt-2">{s.label}</p>
                            <p className="font-mono text-[8px] text-white/30 mt-0.5">{s.sub}</p>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Scroll cue */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 z-20"
            >
                <span className="font-mono text-[8px] uppercase tracking-[0.3em]">Scroll</span>
                <ChevronDown size={14} className="animate-bounce" />
            </motion.div>
        </section>
    );
}
