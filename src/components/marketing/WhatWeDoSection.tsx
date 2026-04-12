"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const engines = [
    {
        id: "mentorship",
        label: "Engine A",
        title: "Human & Social Capital",
        tagline: "Mentorship. Resilience. Financial Literacy.",
        body: "We pair athletes and young professionals with world-class mentors using AI-driven matching. Our platform builds mental resilience, financial literacy, and career pathways — giving every member 365 days of structured growth support.",
        stats: [{ val: "12,000+", label: "Mentors" }, { val: "5 roles", label: "Platform access" }, { val: "AI-matched", label: "Pairing engine" }],
        cta: { label: "Find a Mentor", href: "/register" },
        color: "var(--primary-green)",
    },
    {
        id: "environment",
        label: "Engine B",
        title: "Environmental Stewardship",
        tagline: "The Green Game. Athletes for the Planet.",
        body: "Sport has the power to mobilise communities. We integrate environmental restoration into rugby culture — connecting athlete networks with conservation projects, sustainability education, and measurable ecological impact.",
        stats: [{ val: "45+", label: "Community hubs" }, { val: "98%", label: "Projects on time" }, { val: "750K+", label: "Lives touched" }],
        cta: { label: "See Our Impact", href: "/impact" },
        color: "var(--secondary)",
    },
    {
        id: "corporate",
        label: "Partners",
        title: "Corporate Sponsorship",
        tagline: "Invest in People. Measure the Return.",
        body: "Our Corporate Social Responsibility engine gives companies a transparent, trackable way to sponsor athletes and mentees. Real-time dashboards, impact reports, and direct mentee connections make every shilling accountable.",
        stats: [{ val: "$1.2M", label: "Funding granted" }, { val: "54+", label: "Active partners" }, { val: "Live", label: "CSR dashboards" }],
        cta: { label: "Become a Partner", href: "/register" },
        color: "var(--foreground)",
    },
];

export default function WhatWeDoSection() {
    const [openId, setOpenId] = useState<string>("mentorship");

    return (
        <section className="py-24 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="mb-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div>
                        <span className="section-label block mb-3">What We Do</span>
                        <h2 className="font-serif font-black text-4xl md:text-5xl text-foreground uppercase tracking-tighter leading-none">
                            The Dual-Engine<br />
                            <span className="text-primary italic">Platform</span>
                        </h2>
                    </div>
                    <p className="font-sans text-muted-foreground text-lg leading-relaxed md:text-right">
                        Two engines. One mission — building the Total Athlete and the communities that sustain them.
                    </p>
                </div>

                {/* Accordion */}
                <div className="divide-y divide-border border border-border">
                    {engines.map((engine) => {
                        const isOpen = openId === engine.id;
                        return (
                            <div key={engine.id}>
                                <button
                                    onClick={() => setOpenId(isOpen ? "" : engine.id)}
                                    className="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-6">
                                        <span
                                            className="font-mono text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-1 border"
                                            style={{ color: engine.color, borderColor: engine.color }}
                                        >
                                            {engine.label}
                                        </span>
                                        <span className="font-serif font-bold text-xl md:text-2xl text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                                            {engine.title}
                                        </span>
                                        <span className="hidden md:block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                                            {engine.tagline}
                                        </span>
                                    </div>
                                    <div
                                        className="shrink-0 w-8 h-8 flex items-center justify-center border transition-colors"
                                        style={isOpen ? { background: engine.color, borderColor: engine.color, color: "white" } : {}}
                                    >
                                        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                                                {/* Body */}
                                                <div className="md:col-span-2 space-y-6">
                                                    <p className="font-sans font-light text-lg text-muted-foreground leading-relaxed">
                                                        {engine.body}
                                                    </p>
                                                    <Link
                                                        href={engine.cta.href}
                                                        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest font-bold border-b-2 pb-1 transition-colors hover:text-primary"
                                                        style={{ borderColor: engine.color }}
                                                    >
                                                        {engine.cta.label}
                                                        <span className="text-primary">→</span>
                                                    </Link>
                                                </div>

                                                {/* Stats */}
                                                <div className="flex flex-col gap-4 justify-center">
                                                    {engine.stats.map((s) => (
                                                        <div key={s.label} className="border-l-2 pl-4" style={{ borderColor: engine.color }}>
                                                            <p className="font-serif font-black text-3xl text-foreground">{s.val}</p>
                                                            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
