"use client";

import { useState } from "react";
import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";

const FALLBACK_VIDEOS = [
    { id: "v1", title: "Welcome to Jenga365: Our Mission", description: "An introduction to the platform — who we are, what we do, and how we're building the Total Athlete.", duration: "12:45", category: "Platform", thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800", isFeatured: true, videoUrl: null },
    { id: "v2", title: "AI Mentorship Matching — How It Works", description: "A walkthrough of our 768-dimensional vector matching engine and what makes it different.", duration: "08:30", category: "Technology", thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800", isFeatured: false, videoUrl: null },
    { id: "v3", title: "Mentorship Session: Financial Literacy Fundamentals", description: "A recorded live session between a Jenga365 mentor and mentee group on budgeting and saving.", duration: "34:20", category: "Finance", thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800", isFeatured: false, videoUrl: null },
    { id: "v4", title: "The Green Game — Environmental Stewardship in Rugby", description: "Athletes explain how they're integrating sustainability into their sport and community practices.", duration: "22:15", category: "Environment", thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800", isFeatured: false, videoUrl: null },
    { id: "v5", title: "Corporate Partnership Onboarding Walkthrough", description: "For new corporate partners — a step-by-step guide to the Jenga365 dashboard and CSR reporting tools.", duration: "18:00", category: "Corporate", thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800", isFeatured: false, videoUrl: null },
    { id: "v6", title: "Athlete Keynote: Building Resilience Off The Field", description: "A Jenga365 event keynote by a professional rugby player on mental resilience and leadership.", duration: "28:40", category: "Mentorship", thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800", isFeatured: false, videoUrl: null },
];

interface VideoPageClientProps {
    readonly initialVideos: any[];
}

function normalizeVideo(v: any) {
    return {
        id: v._id ?? v.id,
        title: v.title,
        description: v.description ?? "",
        category: v.category ?? "Platform",
        thumbnail: v.thumbnail ?? v.mainImage?.asset?.url ?? "",
        duration: v.duration ?? "",
        isFeatured: v.isFeatured ?? false,
        videoUrl: v.videoUrl ?? null,
    };
}

export default function VideoPageClient({ initialVideos }: VideoPageClientProps) {
    const rawVideos = initialVideos.length > 0 ? initialVideos.map(normalizeVideo) : FALLBACK_VIDEOS;

    const allCategories = ["All", ...Array.from(new Set(rawVideos.map((v) => v.category).filter(Boolean)))];
    const [activeCategory, setActiveCategory] = useState("All");

    const filtered = rawVideos.filter((v) => activeCategory === "All" || v.category === activeCategory);
    const featuredVideo = filtered.find((v) => v.isFeatured) ?? filtered[0];
    const restVideos = filtered.filter((v) => v.id !== featuredVideo?.id);

    function VideoWrapper({ video, children }: { video: any; children: React.ReactNode }) {
        if (video.videoUrl) {
            return <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="block">{children}</a>;
        }
        return <div>{children}</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <PageHero
                eyebrow="Video"
                heading={<>Talks, Sessions <span className="italic text-primary">&amp; Tutorials.</span></>}
                description="Recorded mentorship sessions, platform walkthroughs, athlete interviews, and keynote talks."
                bgImage="https://images.unsplash.com/photo-1492724724894-7464c27d0ceb?q=80&w=1920&auto=format&fit=crop"
                bgFallback="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1920&auto=format&fit=crop"
                minHeight="min-h-[45vh]"
            />

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                {/* Breadcrumb */}
                <Link href="/resources" className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] hover:text-black transition-colors">
                    ← Resources
                </Link>

                {/* Category tabs */}
                <div className="flex border-b border-[var(--border)] overflow-x-auto mt-8 mb-16">
                    {allCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-4 font-mono text-[10px] uppercase tracking-[0.25em] whitespace-nowrap transition-all relative group ${activeCategory === cat ? "text-[var(--primary-green)]" : "text-[var(--text-muted)] hover:text-black"}`}
                        >
                            {cat}
                            <div className={`absolute bottom-0 left-0 h-[2px] bg-[var(--primary-green)] transition-all duration-300 ${activeCategory === cat ? "w-full" : "w-0 group-hover:w-full opacity-30"}`} />
                        </button>
                    ))}
                </div>

                {/* Featured video */}
                {featuredVideo && (
                    <VideoWrapper video={featuredVideo}>
                        <div className="mb-16 group relative overflow-hidden border border-[var(--border)] bg-black cursor-pointer">
                            <div className="aspect-[21/9] relative overflow-hidden">
                                {featuredVideo.thumbnail && (
                                    <img
                                        src={featuredVideo.thumbnail}
                                        alt={featuredVideo.title}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                                    />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                                        <span className="material-symbols-outlined text-5xl text-white">play_arrow</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--primary-green)] font-bold">{featuredVideo.category} · {featuredVideo.duration}</span>
                                    <h2 className="font-serif font-black text-3xl md:text-4xl text-white uppercase tracking-tighter mt-2 leading-none">
                                        {featuredVideo.title}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </VideoWrapper>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restVideos.map((video) => (
                        <VideoWrapper key={video.id} video={video}>
                            <div className="group cursor-pointer">
                                <div className="aspect-video relative overflow-hidden bg-black mb-4">
                                    {video.thumbnail && (
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover opacity-70 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                                        />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <span className="material-symbols-outlined text-3xl text-white">play_arrow</span>
                                        </div>
                                    </div>
                                    {video.duration && (
                                        <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1">
                                            <span className="font-mono text-[9px] text-white">{video.duration}</span>
                                        </div>
                                    )}
                                </div>
                                <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--primary-green)] font-bold">{video.category}</span>
                                <h3 className="font-serif font-black text-lg text-black uppercase tracking-tight leading-tight group-hover:text-[var(--primary-green)] transition-colors mt-1">
                                    {video.title}
                                </h3>
                                <p className="font-sans font-light text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                                    {video.description}
                                </p>
                            </div>
                        </VideoWrapper>
                    ))}
                </div>
            </div>

            <div className="mt-20">
                <FinalCTAStrip />
            </div>
        </div>
    );
}
