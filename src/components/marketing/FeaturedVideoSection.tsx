import { PlayCircle } from "lucide-react";

interface FeaturedVideo {
    title: string;
    description?: string | null;
    videoUrl?: string | null;
    duration?: string | null;
    thumbnail?: { asset?: { url?: string } } | null;
}

interface FeaturedVideoSectionProps {
    readonly video: FeaturedVideo | null | undefined;
    readonly heading?: string | null;
}

function toEmbedUrl(url: string): { embed: string; isFile: boolean } | null {
    // YouTube
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&\s/]+)/);
    if (yt) return { embed: `https://www.youtube.com/embed/${yt[1]}`, isFile: false };
    // Vimeo
    const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return { embed: `https://player.vimeo.com/video/${vm[1]}`, isFile: false };
    // Direct file (mp4/webm) — render via <video>
    if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) return { embed: url, isFile: true };
    return null;
}

export default function FeaturedVideoSection({ video, heading }: FeaturedVideoSectionProps) {
    if (!video || !video.videoUrl) return null;
    const parsed = toEmbedUrl(video.videoUrl);
    if (!parsed) return null;

    const thumbUrl = video.thumbnail?.asset?.url ?? null;

    return (
        <section className="py-12 md:py-20 lg:py-12 md:py-24 border-b border-border bg-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-10">
                <div className="max-w-2xl space-y-3">
                    <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                        See it in motion
                    </p>
                    <h2 className="text-display-md text-foreground">
                        {heading?.trim() || video.title}
                    </h2>
                    {video.description && (
                        <p className="text-body-lg text-foreground-muted">
                            {video.description}
                        </p>
                    )}
                </div>

                <div
                    className="relative rounded-md overflow-hidden border border-border"
                    style={{ aspectRatio: "16 / 9", background: "var(--surface-1)", boxShadow: "var(--shadow-sm)" }}
                >
                    {parsed.isFile ? (
                        /* eslint-disable-next-line jsx-a11y/media-has-caption */
                        <video
                            src={parsed.embed}
                            controls
                            preload="metadata"
                            poster={thumbUrl ?? undefined}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <iframe
                            src={parsed.embed}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                        />
                    )}
                    {!thumbUrl && (
                        <PlayCircle
                            className="absolute top-4 right-4 w-6 h-6 pointer-events-none"
                            style={{ color: "var(--foreground-subtle)" }}
                        />
                    )}
                </div>

                {video.duration && (
                    <p className="text-eyebrow text-foreground-muted">
                        {video.duration}
                    </p>
                )}
            </div>
        </section>
    );
}
