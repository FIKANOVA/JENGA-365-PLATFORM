"use client";

import { useState, useMemo } from "react";
import EventsGrid from "@/components/marketing/EventsGrid";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";
import PageHero from "@/components/shared/PageHero";

interface Event {
    _id: string;
    title: string;
    type: string;
    date: string;
    isOnline: boolean;
    image?: string;
    description?: string;
}

const EVENT_TYPES = ["ALL", "WEBINAR", "WORKSHOP", "CONFERENCE", "MEETUP"];

export default function EventsPageClient({ initialEvents }: { initialEvents: Event[] }) {
    const [activeCategory, setActiveCategory] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredEvents = useMemo(() => {
        return initialEvents.filter(event => {
            const matchesCategory = activeCategory === "ALL" || event.type.toUpperCase() === activeCategory;
            const matchesSearch =
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            return matchesCategory && matchesSearch;
        });
    }, [initialEvents, activeCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-white">
            <main>
                <PageHero
                    eyebrow="Global Network"
                    heading={<>Community <span className="italic text-primary">Events.</span></>}
                    description="Join our ecosystem of workshops, high-performance clinics, and strategic summits designed to foster growth and excellence."
                    bgImage="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1920&auto=format&fit=crop"
                    bgFallback="https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1920&auto=format&fit=crop"
                >
                    <div className="relative max-w-2xl group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary">
                            <span className="material-symbols-outlined text-[22px]">search</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search events, topics, or dates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 backdrop-blur-sm rounded-sm py-5 pl-14 pr-8 text-white placeholder:text-white/40 placeholder:font-mono placeholder:text-[10px] placeholder:uppercase placeholder:tracking-widest focus:outline-none focus:border-primary transition-all font-sans"
                        />
                    </div>
                </PageHero>

                {/* ── Grid Section ── */}
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
                    <div className="space-y-16">
                        {/* Type Selection */}
                        <div className="flex flex-col gap-6">
                            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold">Event Type</span>
                            <div className="flex border-b border-[var(--border)] overflow-x-auto hide-scrollbar">
                                {EVENT_TYPES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-8 py-5 text-[10px] font-bold tracking-[0.3em] whitespace-nowrap transition-all relative group ${activeCategory === cat
                                            ? "text-[var(--primary-green)]"
                                            : "text-[var(--text-muted)] hover:text-black"
                                            }`}
                                        style={{ fontFamily: "var(--font-dm-mono)" }}
                                    >
                                        {cat}
                                        <div className={`absolute bottom-0 left-0 h-[2px] bg-[var(--primary-green)] transition-all duration-300 ${activeCategory === cat ? "w-full" : "w-0 group-hover:w-full opacity-30"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Events Grid */}
                        <div className="min-h-[600px]">
                            {filteredEvents.length > 0 ? (
                                <EventsGrid events={filteredEvents} />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
                                    <span className="material-symbols-outlined text-8xl text-[var(--border)]">event_busy</span>
                                    <div className="space-y-3">
                                        <h3 className="font-serif font-bold text-4xl text-black uppercase tracking-tight">No Events Scheduled</h3>
                                        <p className="text-[var(--text-muted)] font-light text-lg">We couldn&apos;t find any events matching your selection.</p>
                                    </div>
                                    <button
                                        onClick={() => { setActiveCategory("ALL"); setSearchQuery(""); }}
                                        className="px-10 py-4 border border-[var(--border)] text-black font-mono text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-sm shadow-xl"
                                    >
                                        RESET FILTERS
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Final CTA Section ── */}
                <section>
                    <FinalCTAStrip />
                </section>
            </main>
        </div>
    );
}
