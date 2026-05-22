"use client";

import { FileText, ExternalLink, Play, Headphones, Newspaper, Download } from "lucide-react";

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

function getYouTubeId(url: string): string | null {
    const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
    );
    return match?.[1] ?? null;
}

function getSpotifyEmbedUrl(url: string): string | null {
    const match = url.match(/open\.spotify\.com\/(episode|show|playlist)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`;
}

const TYPE_META: Record<
    EmbedResourceType,
    { label: string; color: string; icon: React.ReactNode }
> = {
    pdf: { label: "PDF", color: "var(--brand-red)", icon: <FileText size={14} /> },
    youtube: { label: "YouTube", color: "#FF0000", icon: <Play size={14} /> },
    spotify: { label: "Spotify", color: "#1DB954", icon: <Headphones size={14} /> },
    x_post: { label: "𝕏 Post", color: "var(--foreground)", icon: <Newspaper size={14} /> },
    linkedin: { label: "LinkedIn", color: "#0A66C2", icon: <Newspaper size={14} /> },
    article: { label: "Article", color: "var(--brand-green)", icon: <ExternalLink size={14} /> },
    slides: { label: "Slides", color: "#E8740C", icon: <FileText size={14} /> },
    other: { label: "Resource", color: "var(--foreground-muted)", icon: <ExternalLink size={14} /> },
};

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
            className="group flex flex-col bg-background border rounded-lg transition-all duration-300 hover:-translate-y-1"
            style={{
                borderColor: isFeatured ? "var(--brand-red)" : "var(--border)",
                boxShadow: "var(--shadow-sm)",
            }}
        >
            {/* ── Embed Area ── */}
            <div className="relative w-full overflow-hidden rounded-t-lg" style={{ background: "var(--surface-1)" }}>
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
                    <div className="aspect-[4/3] flex items-center justify-center p-6" style={{ background: "var(--surface-1)" }}>
                        <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="text-center group/x">
                            <div
                                className="w-14 h-14 mx-auto mb-3 flex items-center justify-center rounded-md"
                                style={{ background: "#0a0a0a" }}
                            >
                                <span className="text-white text-2xl font-bold">𝕏</span>
                            </div>
                            <p className="text-eyebrow text-foreground-muted group-hover/x:text-foreground transition-colors">
                                View on X →
                            </p>
                        </a>
                    </div>
                )}

                {/* LinkedIn Embed */}
                {resourceType === "linkedin" && externalUrl && (
                    <div className="aspect-[4/3] flex items-center justify-center p-6" style={{ background: "#F3F6F8" }}>
                        <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="text-center group/li">
                            <div
                                className="w-14 h-14 mx-auto mb-3 flex items-center justify-center rounded-md"
                                style={{ background: "#0A66C2" }}
                            >
                                <span className="text-white text-lg font-bold">in</span>
                            </div>
                            <p className="text-eyebrow text-foreground-muted group-hover/li:text-foreground transition-colors">
                                Read on LinkedIn →
                            </p>
                        </a>
                    </div>
                )}

                {/* PDF / Document */}
                {(resourceType === "pdf" || resourceType === "slides") && (
                    <div
                        className="aspect-[4/3] flex flex-col items-center justify-center p-6"
                        style={{ background: "var(--brand-red-soft)" }}
                    >
                        <FileText size={48} className="mb-3" style={{ color: "var(--brand-red)" }} />
                        <span className="text-eyebrow text-foreground-muted">
                            {resourceType === "pdf" ? "PDF document" : "Slide deck"}
                        </span>
                    </div>
                )}

                {/* Article / Other */}
                {(resourceType === "article" || resourceType === "other") && (
                    <div
                        className="aspect-[4/3] flex items-center justify-center p-6"
                        style={{ background: "var(--brand-green-soft)" }}
                    >
                        <span className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                            Readable
                        </span>
                    </div>
                )}

                {/* Featured badge */}
                {isFeatured && (
                    <div
                        className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-eyebrow"
                        style={{ background: "var(--brand-red)", color: "var(--brand-red-fg)" }}
                    >
                        ⭐ Featured
                    </div>
                )}
            </div>

            {/* ── Content Area ── */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <span
                        className="flex items-center gap-1.5 text-eyebrow font-medium"
                        style={{ color: meta.color }}
                    >
                        {meta.icon} {meta.label}
                    </span>
                    {category && (
                        <span className="text-eyebrow text-foreground-muted">{category}</span>
                    )}
                </div>

                <h3 className="text-headline text-foreground mb-2 line-clamp-2 leading-tight">
                    {title}
                </h3>

                {description && (
                    <p className="text-body-sm text-foreground-muted mb-3 line-clamp-2">
                        {description}
                    </p>
                )}

                {author && (
                    <p className="text-eyebrow text-foreground-muted mb-4">by {author}</p>
                )}

                <div className="mt-auto pt-4 border-t border-border">
                    {(resourceType === "pdf" || resourceType === "slides") && fileUrl ? (
                        <a
                            href={fileUrl}
                            download
                            className="flex items-center gap-2 text-eyebrow font-medium hover:translate-x-1 transition-transform"
                            style={{ color: "var(--brand-red)" }}
                        >
                            Download <Download size={12} />
                        </a>
                    ) : externalUrl ? (
                        <a
                            href={externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-eyebrow font-medium hover:translate-x-1 transition-transform"
                            style={{ color: "var(--brand-red)" }}
                        >
                            {resourceType === "youtube" ? "Watch now" : resourceType === "spotify" ? "Listen now" : "View now"} →
                        </a>
                    ) : (
                        <span className="text-eyebrow text-foreground-subtle">Coming soon</span>
                    )}
                </div>
            </div>
        </div>
    );
}
