"use client";

import { motion } from "framer-motion";

const FALLBACK_TESTIMONIALS = [
    {
        quote: "Jenga365 didn't just give me a place to play; they gave me a roadmap for my entire future.",
        name: "David Omondi",
        role: "Pro athlete / scholarship recipient",
    },
    {
        quote: "Seeing the economic shift in our village since the hub opened has been nothing short of a miracle.",
        name: "Sarah Wanjiku",
        role: "Community partner",
    },
];

interface TestimonialsProps {
    readonly voices?: any[];
}

export default function Testimonials({ voices }: TestimonialsProps) {
    const displayVoices = voices && voices.filter((v: any) => v.type === "SOCIALS" || v.type === "ARTICLE_COMMENTS").length > 0
        ? voices.filter((v: any) => v.type === "SOCIALS" || v.type === "ARTICLE_COMMENTS").map((v: any) => ({
            quote: v.description,
            name: v.host,
            role: v.type === "SOCIALS" ? "Socials" : "Article Comment",
        }))
        : FALLBACK_TESTIMONIALS;

    return (
        <section className="py-16 md:py-24 bg-accent relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8" style={{ background: "var(--brand-green)" }} />
                            <span className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                                Community voices
                            </span>
                        </div>
                        <h2 className="text-display-lg text-foreground">
                            What people are saying about Jenga365.
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {displayVoices.map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                            className="group rounded-md border border-border bg-background p-10 md:p-12 relative flex flex-col justify-between min-h-[400px] transition-colors hover:border-[color:var(--border-strong,#D4D4D8)]"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <div className="relative">
                                <span
                                    className="absolute -top-6 -left-2 text-6xl opacity-[0.08]"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    “
                                </span>
                                <blockquote className="text-display-sm italic text-foreground leading-relaxed relative z-10">
                                    “{t.quote}”
                                </blockquote>
                            </div>

                            <div className="flex items-center gap-4 mt-12 pt-8 border-t border-border">
                                <div
                                    className="w-12 h-12 rounded-full shrink-0 overflow-hidden relative"
                                    style={{ background: "var(--surface-2)" }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.05] to-transparent" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-headline text-foreground">{t.name}</h4>
                                    <p className="text-eyebrow text-foreground-muted">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
