"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, FolderArchive, Lock, Download } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";
import { useSession } from "@/lib/auth/client";

const FALLBACK_DOWNLOADS = [
    { id: "d1", title: "Mentor Readiness Checklist", description: "A practical self-assessment for professionals considering joining Jenga365 as a mentor.", format: "PDF", size: "1.2 MB", category: "Mentorship", locked: false, fileUrl: null },
    { id: "d2", title: "12-Week Mentorship Pathway Template", description: "Structured session planner for mentor-mentee pairs to track milestones over a 12-week programme.", format: "PDF", size: "840 KB", category: "Mentorship", locked: false, fileUrl: null },
    { id: "d3", title: "Corporate CSR Impact Report Template", description: "A plug-and-play reporting framework for corporate partners to track and present their social impact.", format: "DOCX", size: "2.1 MB", category: "Corporate", locked: true, fileUrl: null },
    { id: "d4", title: "Financial Literacy Starter Pack", description: "Budgeting worksheets, savings trackers, and investment primers designed for young athletes.", format: "PDF", size: "3.4 MB", category: "Finance", locked: false, fileUrl: null },
    { id: "d5", title: "Green Game Environmental Pledge Kit", description: "Resources for rugby clubs committing to The Green Game initiative, sustainability checklists and pledge cards.", format: "ZIP", size: "5.8 MB", category: "Environment", locked: false, fileUrl: null },
    { id: "d6", title: "AI Profile & Matching Engine: Technical Brief", description: "An overview of how Jenga365's vector-based matching works, for corporate and institutional partners.", format: "PDF", size: "980 KB", category: "Technology", locked: true, fileUrl: null },
];

function FormatIcon({ format, className }: { format: string; className?: string }) {
    if (format === "ZIP") return <FolderArchive className={className} />;
    return <FileText className={className} />;
}

interface DownloadsPageClientProps {
    readonly initialDownloads: any[];
}

function normalizeDownload(d: any) {
    const format = (d.format ?? d.type ?? "PDF").toUpperCase();
    return {
        id: d._id ?? d.id,
        title: d.title,
        description: d.description ?? "",
        format,
        size: d.fileSize ? `${(d.fileSize / 1024).toFixed(0)} KB` : (d.size ?? ""),
        category: d.category ?? "General",
        locked: d.locked ?? false,
        fileUrl: d.fileUrl ?? d.externalLink ?? null,
    };
}

export default function DownloadsPageClient({ initialDownloads }: DownloadsPageClientProps) {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const rawDownloads = initialDownloads.length > 0 ? initialDownloads.map(normalizeDownload) : FALLBACK_DOWNLOADS;
    const allCategories = ["All", ...Array.from(new Set(rawDownloads.map((d) => d.category).filter(Boolean)))];
    const [activeCategory, setActiveCategory] = useState("All");

    const filtered = rawDownloads.filter(
        (d) => activeCategory === "All" || d.category === activeCategory
    );

    return (
        <div className="min-h-screen bg-white">
            <PageHero
                eyebrow="Downloads"
                heading={<>Guides, Playbooks <span className="italic text-primary">&amp; Templates.</span></>}
                description="Downloadable tools built by the Jenga365 team, PDFs, checklists, and strategic frameworks ready to use."
                bgImage="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1920&auto=format&fit=crop"
                bgFallback="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1920&auto=format&fit=crop"
                minHeight="min-h-[45vh]"
            />

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                {/* Breadcrumb */}
                <Link href="/resources" className="text-eyebrow text-[var(--foreground-subtle)] hover:text-black transition-colors">
                    ← Resources
                </Link>

                {/* Category tabs */}
                <div className="flex border-b border-border overflow-x-auto mt-8 mb-16">
                    {allCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-4 text-eyebrow whitespace-nowrap transition-all relative group ${activeCategory === cat ? "text-[var(--brand-green)]" : "text-[var(--foreground-subtle)] hover:text-black"}`}
                        >
                            {cat}
                            <div className={`absolute bottom-0 left-0 h-[2px] bg-[var(--brand-green)] transition-all duration-300 ${activeCategory === cat ? "w-full" : "w-0 group-hover:w-full opacity-30"}`} />
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className="group border border-border bg-[var(--surface-1)] p-8 flex flex-col gap-6 hover:border-[var(--brand-green)] transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Top accent */}
                            <div className="absolute top-0 left-0 h-[3px] w-0 group-hover:w-full bg-[var(--brand-green)] transition-all duration-500" />

                            {/* Icon + format */}
                            <div className="flex items-center justify-between">
                                <FormatIcon format={item.format} className="h-8 w-8 text-[var(--brand-green)] opacity-70 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-2">
                                    <span className="text-eyebrow text-[var(--foreground-subtle)] font-bold">{item.format}</span>
                                    {item.size && <span className="text-label text-[var(--foreground-subtle)]">· {item.size}</span>}
                                </div>
                            </div>

                            {/* Text */}
                            <div className="flex-1 space-y-3">
                                <span className="text-eyebrow text-[var(--brand-green)] font-bold">{item.category}</span>
                                <h3 className="text-headline text-foreground leading-tight group-hover:text-[var(--brand-green)] transition-colors">
                                    {item.title}
                                </h3>
                                <p className="font-sans font-light text-sm text-[var(--foreground-muted)] leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            {/* CTA */}
                            {item.locked && !isAuthenticated ? (
                                <Link
                                    href="/register/mentorship"
                                    className="flex items-center gap-2 text-eyebrow font-bold text-[var(--foreground-subtle)] hover:text-black transition-colors"
                                >
                                    <Lock className="h-4 w-4" />
                                    Members Only
                                </Link>
                            ) : item.fileUrl ? (
                                <a
                                    href={item.fileUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-eyebrow font-bold text-[var(--brand-green)] hover:text-black transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Free
                                </a>
                            ) : (
                                <span className="flex items-center gap-2 text-eyebrow font-bold text-[var(--brand-green)] opacity-50 cursor-not-allowed">
                                    <Download className="h-4 w-4" />
                                    Coming Soon
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-20">
                <FinalCTAStrip />
            </div>
        </div>
    );
}
