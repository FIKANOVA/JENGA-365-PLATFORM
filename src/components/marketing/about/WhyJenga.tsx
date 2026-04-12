"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const reasons = [
    {
        id: "holistic",
        title: "Holistic Excellence",
        color: "var(--primary-green)",
        copy: "We don't just build players — we build people. Every programme balances mental health, education, and professional rugby skills to ensure well-rounded, sustainable growth.",
    },
    {
        id: "community",
        title: "Community Focused",
        color: "var(--mentorship-green, #2d7a3a)",
        copy: "Our mandate grows from raw talent and professional opportunity. Every effort is for the athlete and the community that sustains them — no top-down, no shortcuts.",
    },
    {
        id: "safe",
        title: "Safe Haven",
        color: "var(--primary-green)",
        copy: "We provide a secure environment where mentorship and growth are monitored through precision protocols and AI-assisted matchmaking — so every connection is intentional and accountable.",
    },
    {
        id: "environment",
        title: "Environmental Impact",
        color: "var(--accent-green, #5a9e6f)",
        copy: "\"The Green Game\" integrates sustainability into rugby culture. Every project we run leaves a lasting, positive ecological footprint, making athletes agents of environmental change.",
    },
    {
        id: "ai",
        title: "AI-Native Platform",
        color: "var(--foreground)",
        copy: "Our matching engine uses 768-dimensional vector embeddings and cosine similarity to pair mentors with mentees based on goals, personality, and expertise — not guesswork.",
    },
];

export default function WhyJenga() {
    const [openId, setOpenId] = useState<string | null>("holistic");

    return (
        <section className="py-24 bg-white border-t border-[#E8E4DC]">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="mb-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div>
                        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--primary-green)] font-bold block mb-3">
                            Our Differentiators
                        </span>
                        <h2 className="font-serif font-black text-4xl md:text-5xl text-black uppercase tracking-tighter leading-none">
                            Why Jenga365?
                        </h2>
                    </div>
                    <p className="font-sans text-[#6b6b6b] text-lg leading-relaxed md:text-right">
                        Five principles that make Jenga365 different from every other platform.
                    </p>
                </div>

                <div className="divide-y divide-[#E8E4DC] border border-[#E8E4DC]">
                    {reasons.map((reason, i) => {
                        const isOpen = openId === reason.id;
                        return (
                            <div key={reason.id}>
                                <button
                                    onClick={() => setOpenId(isOpen ? null : reason.id)}
                                    className="w-full flex items-center justify-between px-8 py-5 text-left group hover:bg-[#F9F7F4] transition-colors"
                                >
                                    <div className="flex items-center gap-5">
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#999]">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span className="font-serif font-bold text-xl md:text-2xl text-black uppercase tracking-tight group-hover:text-[var(--primary-green)] transition-colors">
                                            {reason.title}
                                        </span>
                                    </div>
                                    <div
                                        className="shrink-0 w-8 h-8 flex items-center justify-center border transition-all duration-200"
                                        style={isOpen ? { background: reason.color, borderColor: reason.color, color: "white" } : { borderColor: "#D1CCC4" }}
                                    >
                                        {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.28, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div
                                                className="px-8 pb-8 pt-2 border-l-4 ml-8"
                                                style={{ borderColor: reason.color }}
                                            >
                                                <p className="font-sans font-light text-xl text-[#555] leading-relaxed max-w-3xl">
                                                    {reason.copy}
                                                </p>
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
