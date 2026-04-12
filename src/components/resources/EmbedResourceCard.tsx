"use client";

import { FileText, ExternalLink, Play, Headphones, Newspaper, Download } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */
export type EmbedResourceType =
    | "pdf"
    | "youtube"
    | "spotify"
    | "x_post"
    | "linkedin"
    | "article"
    | "slides"
    | "other";

interface EmbedResourceCardProps {
    readonly title: string;
    readonly resourceType: EmbedResourceType;
    readonly externalUrl?: string;
    readonly fileUrl?: string;
    readonly description?: string;
    readonly category?: string;
    readonly author?: string;
    readonly isFeatured?: boolean;
}

/* ── Helpers ───────────────────────────────────────────────── */

/** Extract YouTube video ID from various URL formats */
function getYouTubeId(url: string): string | null {
    const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
    );
    return match?.[1] ?? null;
}

/** Extract Spotify embed path */
function getSpotifyEmbedUrl(url: string): string | null {
    // handles: open.spotify.com/episode/xxx or open.spotify.com/show/xxx
    const match = url.match(/open\.spotify\.com\/(episode|show|playlist)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`;
}

/** Type metadata */
const TYPE_META: Record<
    EmbedResourceType,
    { label: string; color: string; icon: React.ReactNode }
> = {
    pdf: { label: "PDF", color: "#BB0000", icon: <FileText size={14} /> },
    youtube: { label: "YouTube", color: "#FF0000", icon: <Play size={14} /> },
    spotify: { label: "Spotify", color: "#1DB954", icon: <Headphones size={14} /> },
    x_post: { label: "𝕏 Post", color: "#1A1A1A", icon: <Newspaper size={14} /> },
    linkedin: { label: "LinkedIn", color: "#0A66C2", icon: <Newspaper size={14} /> },
    article: { label: "Article", color: "#006600", icon: <ExternalLink size={14} /> },
    slides: { label: "Slides", color: "#E8740C", icon: <FileText size={14} /> },
    other: { label: "Resource", color: "#666", icon: <ExternalLink size={14} /> },
};

/* ── Component ─────────────────────────────────────────────── */
export default function EmbedResourceCard({
    title,
    resourceType,
    externalUrl,
    fileUrl,
    description,
    category,
    author,
    isFeatured,
}: EmbedResourceCardProps) {
    const meta = TYPE_META[resourceType];

    return (
        <div
            className={`group flex flex-col bg-white border transition-all duration-300 hover:-translate-y-1 ${isFeatured ? "border-[#BB0000]/40 shadow-sm" : "border-[#E8E4DC] hover:border-[#BB0000]"
                }`}
            style={{ borderRadius: 2 }}
        >
            {/* ── Embed Area ── */}
            <div className="relative w-full overflow-hidden bg-[#F5F5F5]">
                {/* YouTube Embed */}
                {resourceType === "youtube" && externalUrl && getYouTubeId(externalUrl) && (
                    <div className="aspect-video">
                        <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeId(externalUrl)}`}
                            title={title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* Spotify Embed */}
                {resourceType === "spotify" && externalUrl && getSpotifyEmbedUrl(externalUrl) && (
                    <div className="h-[152px]">
                        <iframe
                            src={getSpotifyEmbedUrl(externalUrl)!}
                            title={title}
                            className="w-full h-full"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            style={{ border: 0 }}
                        />
                    </div>
                )}

                {/* X (Twitter) Embed */}
                {resourceType === "x_post" && externalUrl && (
                    <div className="aspect-[4/3] flex items-center justify-center bg-[#F7F9FA] p-6">
                        <a
                            href={externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center group/x"
                        >
                            <div className="w-14 h-14 mx-auto mb-3 bg-[#1A1A1A] flex items-center justify-center" style={{ borderRadius: 2 }}>
                                <span className="text-white text-2xl font-bold">𝕏</span>
                            </div>
                            <p className="text-xs text-gray-500 group-hover/x:text-[#1A1A1A] transition-colors" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                VIEW ON X →
                            </p>
                        </a>
                    </div>
                )}

                {/* LinkedIn Embed */}
                {resourceType === "linkedin" && externalUrl && (
                    <div className="aspect-[4/3] flex items-center justify-center bg-[#F3F6F8] p-6">
                        <a
                            href={externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center group/li"
                        >
                            <div className="w-14 h-14 mx-auto mb-3 bg-[#0A66C2] flex items-center justify-center" style={{ borderRadius: 2 }}>
                                <span className="text-white text-lg font-bold">in</span>
                            </div>
                            <p className="text-xs text-gray-500 group-hover/li:text-[#0A66C2] transition-colors" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                READ ON LINKEDIN →
                            </p>
                        </a>
                    </div>
                )}

                {/* PDF / Document */}
                {(resourceType === "pdf" || resourceType === "slides") && (
                    <div className="aspect-[4/3] flex flex-col items-center justify-center bg-[#FFF8F8] p-6">
                        <FileText size={48} className="text-[#BB0000] mb-3" />
                        <span className="text-gray-400" style={{ fontFamily: "var(--font-dm-mono)", fontSize: 10 }}>
                            {resourceType === "pdf" ? "PDF DOCUMENT" : "SLIDE DECK"}
                        </span>
                    </div>
                )}

                {/* Article / Other */}
                {(resourceType === "article" || resourceType === "other") && (
                    <div className="aspect-[4/3] flex items-center justify-center bg-[#F0FFF0] p-6">
                        <span className="text-[#006600]" style={{ fontFamily: "var(--font-dm-mono)", fontSize: 10, letterSpacing: "0.2em" }}>
                            READABLE
                        </span>
                    </div>
                )}

                {/* Featured badge */}
                {isFeatured && (
                    <div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-[#BB0000] text-white"
                        style={{ fontFamily: "var(--font-dm-mono)", fontSize: 9, fontWeight: 600, borderRadius: 2 }}>
                        ⭐ FEATURED
                    </div>
                )}
            </div>

            {/* ── Content Area ── */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <span
                        className="flex items-center gap-1.5"
                        style={{ color: meta.color, fontFamily: "var(--font-dm-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.1em" }}
                    >
                        {meta.icon} {meta.label}
                    </span>
                    {category && (
                        <span className="text-[#8A8A8A]" style={{ fontFamily: "var(--font-dm-mono)", fontSize: 9 }}>
                            {category}
                        </span>
                    )}
                </div>

                <h3 className="text-lg mb-2 text-[#1A1A1A] line-clamp-2" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, lineHeight: 1.3 }}>
                    {title}
                </h3>

                {description && (
                    <p className="text-sm text-[#6A6A6A] mb-3 line-clamp-2" style={{ fontFamily: "var(--font-lato)" }}>
                        {description}
                    </p>
                )}

                {author && (
                    <p className="text-xs text-[#8A8A8A] mb-4" style={{ fontFamily: "var(--font-dm-mono)" }}>
                        by {author}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-[#E8E4DC]">
                    {(resourceType === "pdf" || resourceType === "slides") && fileUrl ? (
                        <a
                            href={fileUrl}
                            download
                            className="flex items-center gap-2 text-[#BB0000] hover:translate-x-1 transition-transform"
                            style={{ fontFamily: "var(--font-dm-mono)", fontSize: 10, fontWeight: 600 }}
                        >
                            DOWNLOAD <Download size={12} />
                        </a>
                    ) : externalUrl ? (
                        <a
                            href={externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[#BB0000] hover:translate-x-1 transition-transform"
                            style={{ fontFamily: "var(--font-dm-mono)", fontSize: 10, fontWeight: 600 }}
                        >
                            {resourceType === "youtube" ? "WATCH NOW" : resourceType === "spotify" ? "LISTEN NOW" : "VIEW NOW"} →
                        </a>
                    ) : (
                        <span className="text-[#D0CBC0]" style={{ fontFamily: "var(--font-dm-mono)", fontSize: 10, fontWeight: 600 }}>
                            COMING SOON
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
