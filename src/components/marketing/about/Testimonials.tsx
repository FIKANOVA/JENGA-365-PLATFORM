"use client";

import { motion } from "framer-motion";
import { Star, ExternalLink, MessageSquare, AudioLines, Share2, Quote } from "lucide-react";
import Image from "next/image";

const FALLBACK_TESTIMONIALS = [
    {
        quote: "Jenga365 didn't just give me a place to play; they gave me a roadmap for my entire professional future. The 1:2 mentorship model is game-changing.",
        name: "David Omondi",
        role: "Mentee & Junior Software Developer",
        handle: "Google Verified Review",
        source: "google_review",
        rating: 5,
        url: "https://google.com/maps",
    },
    {
        quote: "Through the Trees for Tries initiative, our team planted 500 indigenous trees. Knowing each tree is tracked and audited via GPS gives real pride.",
        name: "Sarah Wanjiku",
        role: "Athlete & Environmental Lead",
        handle: "@sarah_w_rugby",
        source: "x_twitter",
        rating: 5,
        url: "https://x.com",
    },
    {
        quote: "As a corporate partner, the ESG Milestone unlocks give our CSR committee 100% audit confidence. It's the most transparent youth initiative in East Africa.",
        name: "James Karanja",
        role: "CSR Director, Enterprise Partner",
        handle: "LinkedIn Recommendation",
        source: "linkedin",
        rating: 5,
        url: "https://linkedin.com",
    },
    {
        quote: "Power Hour protocol makes giving back completely seamless. One hour a month, all logistics handled, and direct impact with an aspiring athlete.",
        name: "Dr. Angela Mutiso",
        role: "Senior Mentor & Strategic Advisor",
        handle: "Google Verified Review",
        source: "google_review",
        rating: 5,
        url: "https://google.com/maps",
    },
];

interface TestimonialItem {
    quote: string;
    name: string;
    role?: string;
    handle?: string;
    source?: string;
    rating?: number;
    url?: string;
    avatar?: { asset?: { url?: string } } | string;
}

interface TestimonialsProps {
    readonly voices?: any[];
}

function SourceBadge({ source, rating }: { source?: string; rating?: number }) {
    const s = (source || "").toLowerCase();
    if (s.includes("google")) {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-xs font-medium text-foreground">
                <span className="font-bold text-[#4285F4]">G</span>
                <span>Google Review</span>
                {rating ? (
                    <div className="flex items-center ml-1 gap-0.5 text-amber-500">
                        {Array.from({ length: Math.min(5, Math.max(1, rating)) }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                    </div>
                ) : null}
            </div>
        );
    }
    if (s.includes("twitter") || s.includes("x_") || s === "threads" || s === "spaces") {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-xs font-medium text-foreground">
                <span className="font-bold text-foreground">𝕏</span>
                <span>{s === "spaces" ? "X-Space" : "X (Twitter)"}</span>
            </div>
        );
    }
    if (s.includes("linkedin")) {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-xs font-medium text-[#0A66C2]">
                <span className="font-bold">in</span>
                <span className="text-foreground">LinkedIn</span>
            </div>
        );
    }
    if (s.includes("instagram")) {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-xs font-medium text-[#E4405F]">
                <span>Instagram</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-xs font-medium text-foreground-muted">
            <Quote className="h-3 w-3" />
            <span>Public Mention</span>
        </div>
    );
}

export default function Testimonials({ voices }: TestimonialsProps) {
    const rawList = Array.isArray(voices) && voices.length > 0
        ? voices.map((v) => ({
            quote: v.description || v.quote || "",
            name: v.host || v.name || "Community Member",
            role: v.authorRole || v.role || (v.type === "GOOGLE_REVIEW" ? "Google Verified Review" : "Community Voice"),
            handle: v.handle || (v.type === "GOOGLE_REVIEW" ? "Google Review" : v.host),
            source: v.type || v.source || "google_review",
            rating: v.rating ?? 5,
            url: v.url || v.sourceUrl,
            avatar: v.authorAvatar?.asset?.url || v.avatar?.asset?.url || v.avatar,
        })).filter((item) => item.quote.length > 0)
        : [];

    const displayVoices: TestimonialItem[] = rawList.length > 0 ? rawList : FALLBACK_TESTIMONIALS;

    return (
        <section className="py-12 md:py-20 lg:py-28 bg-[color:var(--surface-1)] relative overflow-hidden border-b border-border/40">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-3 max-w-2xl">
                        <span className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                            Public mentions &amp; Reviews
                        </span>
                        <h2 className="text-display-md text-foreground">
                            Voices from Google reviews &amp; socials.
                        </h2>
                        <p className="text-body text-foreground-muted">
                            Verified athlete stories, Google reviews, and community conversations across the ecosystem.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {displayVoices.map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="group rounded-2xl border border-border bg-background p-6 sm:p-8 relative flex flex-col justify-between transition-all duration-300 hover:border-border hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <SourceBadge source={t.source} rating={t.rating} />
                                    {t.url ? (
                                        <a
                                            href={t.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-foreground-subtle hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
                                        >
                                            View original <ExternalLink className="h-3 w-3" />
                                        </a>
                                    ) : null}
                                </div>

                                <blockquote className="text-body-lg text-foreground leading-relaxed">
                                    &ldquo;{t.quote}&rdquo;
                                </blockquote>
                            </div>

                            <div className="flex items-center gap-3.5 mt-8 pt-6 border-t border-border/60">
                                <div
                                    className="w-10 h-10 rounded-full shrink-0 overflow-hidden relative flex items-center justify-center font-bold text-sm bg-surface-2 text-foreground-muted border border-border"
                                >
                                    {typeof t.avatar === "string" && t.avatar ? (
                                        <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{t.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-body font-semibold text-foreground truncate">{t.name}</h4>
                                    <p className="text-caption text-foreground-muted truncate">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
