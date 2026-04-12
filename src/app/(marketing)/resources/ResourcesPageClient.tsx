"use client";

import { useState, useMemo } from "react";
import { RESOURCES } from "@/data/mockData";
import ResourcesGrid from "@/components/resources/ResourcesGrid";
import CategoryTabs from "@/components/marketing/resources/CategoryTabs";
import TopicFilters from "@/components/marketing/resources/TopicFilters";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";
import PageHero from "@/components/shared/PageHero";

interface ResourcesPageClientProps {
    readonly initialResources?: any[];
}

export default function ResourcesPageClient({ initialResources = [] }: ResourcesPageClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("ALL");
    const [activeTopic, setActiveTopic] = useState("All Topics");

    const resourcesToUse = initialResources.length > 0 ? initialResources : RESOURCES;

    const filteredResources = useMemo(() => {
        return resourcesToUse.filter((resource) => {
            const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (resource.author?.toLowerCase() || "").includes(searchQuery.toLowerCase());

            const matchesCategory = activeCategory === "ALL" || resource.type === activeCategory;

            const matchesTopic = activeTopic === "All Topics" ||
                (resource.category || "") === activeTopic ||
                (resource.role || "") === activeTopic;

            return matchesSearch && matchesCategory && matchesTopic;
        });
    }, [searchQuery, activeCategory, activeTopic, resourcesToUse]);

    return (
        <div className="min-h-screen bg-white">
            <main>
                <PageHero
                    eyebrow="Knowledge Repository"
                    heading={<>Tools <span className="italic text-primary">&amp; Frameworks.</span></>}
                    description="Access our curated library of tools, playbooks, and strategic frameworks designed to accelerate professional excellence and community impact."
                    bgImage="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1920&auto=format&fit=crop"
                    bgFallback="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1920&auto=format&fit=crop"
                >
                    <div className="relative max-w-2xl group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary">
                            <span className="material-symbols-outlined text-[22px]">search</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search resources, formats, or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 backdrop-blur-sm rounded-sm py-5 pl-14 pr-8 text-white placeholder:text-white/40 placeholder:font-mono placeholder:text-[10px] placeholder:uppercase placeholder:tracking-widest focus:outline-none focus:border-primary transition-all font-sans"
                        />
                    </div>
                </PageHero>

                {/* ── Controls & Grid Section ── */}
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
                    <div className="space-y-16">
                        {/* Filters Bar */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-[var(--border)] pb-12">
                            <div className="flex flex-col gap-6 w-full lg:w-auto">
                                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold">Content Type</span>
                                <CategoryTabs
                                    activeCategory={activeCategory}
                                    onCategoryChange={setActiveCategory}
                                />
                            </div>
                            
                            <div className="flex flex-col gap-6 w-full lg:w-auto">
                                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold">Pathways</span>
                                <TopicFilters
                                    activeTopic={activeTopic}
                                    onTopicChange={setActiveTopic}
                                />
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="min-h-[600px]">
                            {filteredResources.length > 0 ? (
                                <ResourcesGrid resources={filteredResources} />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
                                    <span className="material-symbols-outlined text-8xl text-[var(--border)]">travel_explore</span>
                                    <div className="space-y-3">
                                        <h3 className="font-serif font-bold text-4xl text-black uppercase tracking-tight">No Resources found</h3>
                                        <p className="text-[var(--text-muted)] font-light text-lg">Your search didn&apos;t match any items in our repository.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setActiveCategory("ALL");
                                            setActiveTopic("All Topics");
                                        }}
                                        className="px-10 py-4 border border-[var(--border)] text-black font-mono text-[10px] uppercase tracking-widest hover:bg-black hover:text-white hover:border-[var(--red)] transition-all rounded-sm shadow-xl"
                                    >
                                        RESET ALL FILTERS
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Final CTA Section ── */}
                <section className="mt-20">
                    <FinalCTAStrip />
                </section>
            </main>
        </div>
    );
}
