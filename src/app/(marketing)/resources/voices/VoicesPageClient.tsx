"use client";

import { useState } from "react";
import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";

type VoiceType = "SPACES" | "THREADS";

const FALLBACK_VOICES = [
    { id: "vc1", type: "SPACES" as VoiceType, title: "Building the Total Athlete — A Jenga365 X-Space", description: "Coaches, mentors, and athletes joined live to discuss what holistic athlete development really looks like in East Africa.", host: "@jenga365", date: "Mar 14, 2026", duration: "58 min", listeners: "1.2K", recorded: true, xUrl: "https://x.com/jenga365" },
    { id: "vc2", type: "THREADS" as VoiceType, title: "Why AI Mentor Matching Changes Everything", description: "A 12-post X-Thread breaking down how Jenga365 uses vector embeddings to match mentors and mentees with 94% satisfaction.", host: "@jenga365", date: "Mar 08, 2026", posts: 12, impressions: "48K", recorded: false, xUrl: "https://x.com/jenga365" },
    { id: "vc3", type: "SPACES" as VoiceType, title: "Corporate Partnerships & CSR in African Sport", description: "A panel discussion on how companies can create trackable, ethical CSR impact through sport and mentorship.", host: "@jenga365", date: "Feb 25, 2026", duration: "72 min", listeners: "890", recorded: true, xUrl: "https://x.com/jenga365" },
    { id: "vc4", type: "THREADS" as VoiceType, title: "The Green Game: Rugby & Environmental Stewardship", description: "A curated thread on how rugby clubs across Kenya are taking sustainability pledges and what that means for community impact.", host: "@jenga365", date: "Feb 18, 2026", posts: 8, impressions: "31K", recorded: false, xUrl: "https://x.com/jenga365" },
    { id: "vc5", type: "SPACES" as VoiceType, title: "Financial Literacy for Athletes — Live Q&A", description: "An open X-Space where athletes and young professionals asked questions about saving, investment, and financial planning.", host: "@jenga365", date: "Feb 06, 2026", duration: "45 min", listeners: "2.1K", recorded: true, xUrl: "https://x.com/jenga365" },
    { id: "vc6", type: "THREADS" as VoiceType, title: "What Makes a Great Mentor? 10 Traits", description: "The Jenga365 team distilled feedback from 500+ mentees into a definitive thread on what separates good mentors from great ones.", host: "@jenga365", date: "Jan 30, 2026", posts: 10, impressions: "62K", recorded: false, xUrl: "https://x.com/jenga365" },
];

const TABS: { id: VoiceType | "ALL"; label: string; icon: string }[] = [
    { id: "ALL", label: "All Voices", icon: "record_voice_over" },
    { id: "SPACES", label: "X-Spaces", icon: "spatial_audio" },
    { id: "THREADS", label: "X-Threads", icon: "thread_unread" },
];

interface VoicesPageClientProps {
    readonly initialVoices: any[];
}

function normalizeVoice(v: any) {
    return {
        id: v._id ?? v.id,
        type: v.type as VoiceType,
        title: v.title,
        description: v.description ?? "",
        host: v.host ?? "@jenga365",
        date: v.date ? new Date(v.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
        duration: v.duration,
        listeners: v.listeners,
        recorded: v.recorded ?? false,
        posts: v.posts,
        impressions: v.impressions,
        xUrl: v.xUrl ?? "https://x.com/jenga365",
    };
}

export default function VoicesPageClient({ initialVoices }: VoicesPageClientProps) {
    const [activeTab, setActiveTab] = useState<VoiceType | "ALL">("ALL");

    const rawVoices = initialVoices.length > 0 ? initialVoices.map(normalizeVoice) : FALLBACK_VOICES;
    const filtered = rawVoices.filter((v) => activeTab === "ALL" || v.type === activeTab);

    return (
        <div className="min-h-screen bg-white">
            <PageHero
                eyebrow="Voices"
                heading={<>X-Spaces <span className="italic text-primary">&amp; X-Threads.</span></>}
                description="Live and recorded X-Spaces conversations, curated X-Threads, and community discussions shaping the Jenga365 narrative."
                bgImage="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1920&auto=format&fit=crop"
                bgFallback="https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1920&auto=format&fit=crop"
                minHeight="min-h-[45vh]"
            />

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                {/* Breadcrumb */}
                <Link href="/resources" className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] hover:text-black transition-colors">
                    ← Resources
                </Link>

                {/* Tabs */}
                <div className="flex gap-2 mt-8 mb-16">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] font-bold border transition-all duration-200 ${
                                activeTab === tab.id
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-[var(--text-muted)] border-[var(--border)] hover:border-black hover:text-black"
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="divide-y divide-[var(--border)] border border-[var(--border)]">
                    {filtered.map((voice) => (
                        <div
                            key={voice.id}
                            className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 hover:bg-[var(--off-white)] transition-colors"
                        >
                            {/* Left */}
                            <div className="flex items-start gap-6">
                                <div className={`shrink-0 w-12 h-12 flex items-center justify-center border ${
                                    voice.type === "SPACES"
                                        ? "border-[var(--primary-green)] bg-[var(--green-tint)]"
                                        : "border-black bg-black/5"
                                }`}>
                                    <span className={`material-symbols-outlined text-xl ${
                                        voice.type === "SPACES" ? "text-[var(--primary-green)]" : "text-black"
                                    }`}>
                                        {voice.type === "SPACES" ? "spatial_audio" : "thread_unread"}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-mono text-[8px] uppercase tracking-[0.3em] font-bold ${
                                            voice.type === "SPACES" ? "text-[var(--primary-green)]" : "text-black"
                                        }`}>
                                            {voice.type === "SPACES" ? "X-Space" : "X-Thread"}
                                        </span>
                                        {voice.type === "SPACES" && voice.recorded && (
                                            <span className="font-mono text-[8px] uppercase tracking-widest text-white bg-[var(--primary-green)] px-2 py-0.5">
                                                Recorded
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-serif font-black text-xl text-black uppercase tracking-tight leading-tight group-hover:text-[var(--primary-green)] transition-colors">
                                        {voice.title}
                                    </h3>
                                    <p className="font-sans font-light text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                                        {voice.description}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 pt-1">
                                        <span className="font-mono text-[9px] text-[var(--text-muted)]">{voice.host}</span>
                                        <span className="font-mono text-[9px] text-[var(--text-muted)]">{voice.date}</span>
                                        {voice.type === "SPACES" && (
                                            <>
                                                {voice.duration && <span className="font-mono text-[9px] text-[var(--text-muted)]">{voice.duration}</span>}
                                                {voice.listeners && <span className="font-mono text-[9px] text-[var(--text-muted)]">{voice.listeners} listeners</span>}
                                            </>
                                        )}
                                        {voice.type === "THREADS" && (
                                            <>
                                                {voice.posts && <span className="font-mono text-[9px] text-[var(--text-muted)]">{voice.posts} posts</span>}
                                                {voice.impressions && <span className="font-mono text-[9px] text-[var(--text-muted)]">{voice.impressions} impressions</span>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <Link
                                href={voice.xUrl}
                                className="shrink-0 flex items-center gap-2 px-6 py-3 border border-black text-black font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all duration-200"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                {voice.type === "SPACES" ? (voice.recorded ? "Listen" : "Join Space") : "Read Thread"}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Follow CTA */}
                <div className="mt-16 border border-[var(--border)] p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-[var(--off-white)]">
                    <div className="space-y-3">
                        <h3 className="font-serif font-black text-2xl text-black uppercase tracking-tight">Stay in the Conversation</h3>
                        <p className="font-sans font-light text-[var(--text-secondary)] max-w-xl">
                            Follow <strong className="text-black">@jenga365</strong> on X to get notified of live Spaces and new Threads as they publish.
                        </p>
                    </div>
                    <Link
                        href="https://x.com/jenga365"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-3 px-8 py-4 bg-black text-white font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-[var(--primary-green)] transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">alternate_email</span>
                        Follow @jenga365
                    </Link>
                </div>
            </div>

            <div className="mt-20">
                <FinalCTAStrip />
            </div>
        </div>
    );
}
