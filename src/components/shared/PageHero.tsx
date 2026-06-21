"use client";

import { urlFor } from "@/lib/sanity/client";

interface SanityImage {
    asset?: { _id?: string; url?: string };
    alt?: string;
}

interface PageHeroProps {
    eyebrow?: string;
    heading: React.ReactNode;
    description?: string;
    heroImage?: SanityImage | null;
    bgImage?: string; // fallback for string urls
    children?: React.ReactNode;
}

export default function PageHero({
    eyebrow,
    heading,
    description,
    heroImage,
    bgImage,
    children,
}: PageHeroProps) {
    let heroUrl: string | null = null;
    if (bgImage) {
        heroUrl = bgImage;
    } else if (heroImage?.asset?.url) {
        heroUrl = heroImage.asset.url.match(/\.(mp4|webm|mov)(\?.*)?$/i)
            ? heroImage.asset.url
            : urlFor(heroImage).width(1920).height(1080).fit("crop").auto("format").url();
    }

    const hasImage = !!heroUrl;
    const isVideo = hasImage && !!heroUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i);

    const headingColor = hasImage ? "#ffffff" : "var(--foreground)";
    const mutedColor = hasImage ? "rgba(255,255,255,0.88)" : "var(--foreground-muted)";

    return (
        <section
            className={`relative overflow-hidden bg-background flex flex-col justify-end border-b border-border ${
                hasImage ? "h-[85vh] min-h-[500px] -mt-16" : "py-24 lg:py-32"
            }`}
        >
            {hasImage ? (
                <>
                    {isVideo ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 h-full w-full object-cover pointer-events-none z-0"
                            src={heroUrl!}
                        />
                    ) : (
                        <img
                            src={heroUrl!}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 h-full w-full object-cover pointer-events-none z-0"
                        />
                    )}
                    {/* Cinematic Bottom Blur Overlay Mask */}
                    <div
                        className="absolute inset-0 pointer-events-none z-0 backdrop-blur-xl"
                        style={{
                            WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 45%)",
                            maskImage: "linear-gradient(to top, black 0%, transparent 45%)",
                        }}
                        aria-hidden
                    />
                </>
            ) : (
                <>
                    <div className="absolute inset-0 bg-hero-radial pointer-events-none z-0" aria-hidden />
                    <div className="absolute inset-0 bg-topo opacity-[0.35] pointer-events-none z-0" aria-hidden />
                </>
            )}

            <div className={`relative z-10 w-full mx-auto max-w-7xl px-6 lg:px-8 ${hasImage ? "pb-12 md:pb-16" : ""}`}>
                <div className="max-w-3xl space-y-6">
                    {eyebrow && (
                        <p
                            className="text-eyebrow animate-blur-fade-up"
                            style={{ color: hasImage ? "#7CE2A8" : "var(--brand-green)", animationDelay: "100ms" }}
                        >
                            {eyebrow}
                        </p>
                    )}
                    <h1
                        className="text-display-xl leading-tight animate-blur-fade-up"
                        style={{ color: headingColor, animationDelay: "200ms" }}
                    >
                        {heading}
                    </h1>
                    {description && (
                        <p
                            className="text-body-lg max-w-2xl leading-relaxed animate-blur-fade-up"
                            style={{ color: mutedColor, animationDelay: "300ms" }}
                        >
                            {description}
                        </p>
                    )}
                    {children && (
                        <div className="pt-2 animate-blur-fade-up" style={{ animationDelay: "400ms" }}>
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
