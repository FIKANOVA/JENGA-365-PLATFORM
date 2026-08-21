"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { useSession } from "@/lib/auth/client";
import DonateButton from "@/components/shared/DonateButton";
import { urlFor } from "@/lib/sanity/client";

interface SanityImage {
    asset?: { _id?: string; url?: string };
    alt?: string;
}

interface AboutHeroProps {
    readonly heroImage?: SanityImage | null;
}

export default function AboutHero({ heroImage }: AboutHeroProps) {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const heroUrl = heroImage?.asset?.url
        ? heroImage.asset.url.match(/\.(mp4|webm|mov)(\?.*)?$/i)
            ? heroImage.asset.url // Don't use urlFor on video
            : urlFor(heroImage).width(1920).height(1080).fit("crop").auto("format").url()
        : null;
    const hasImage = !!heroUrl;
    const isVideo = hasImage && !!heroUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i);

    const headingColor = hasImage ? "#ffffff" : "var(--foreground)";
    const mutedColor = hasImage ? "rgba(255,255,255,0.88)" : "var(--foreground-muted)";

    return (
        <section
            className={`relative overflow-hidden bg-background flex flex-col justify-end border-b border-border ${
                hasImage ? "h-[60vh] sm:h-[70vh] md:h-[80vh] min-h-[400px] -mt-16" : "py-12 sm:py-16 md:py-20 lg:py-28"
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
                    {/* Dark gradient overlay for clear white text readability */}
                    <div
                        className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-black/90 via-black/65 to-black/45"
                        aria-hidden
                    />
                    {/* Cinematic Bottom Blur Overlay Mask */}
                    <div
                        className="absolute inset-0 pointer-events-none z-0 backdrop-blur-md"
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

            <div className={`relative z-10 w-full mx-auto max-w-7xl px-6 lg:px-8 pt-24 ${hasImage ? "pb-12 md:pb-16" : ""}`}>
                <div className="max-w-3xl space-y-8">
                    <p
                        className="text-xs sm:text-eyebrow animate-blur-fade-up"
                        style={{
                            color: hasImage ? "#7CE2A8" : "var(--brand-green)",
                            animationDelay: "100ms"
                        }}
                    >
                        Established 2023 · Nairobi, Kenya
                    </p>

                    <h1
                        className="text-display-md sm:text-display-lg lg:text-display-xl leading-tight animate-blur-fade-up"
                        style={{ color: headingColor, animationDelay: "200ms" }}
                    >
                        More than a game.
                    </h1>

                    <p
                        className="text-body sm:text-body-lg max-w-2xl leading-relaxed animate-blur-fade-up"
                        style={{ color: mutedColor, animationDelay: "300ms" }}
                    >
                        A dual-engine development initiative committed to sustainable
                        community uplift, through elite sports training and integrated
                        socio-economic support systems.
                    </p>

                    <div
                        className="flex flex-col sm:flex-row items-start gap-4 animate-blur-fade-up"
                        style={{ animationDelay: "400ms" }}
                    >
                        <DonateButton
                            className="inline-flex w-full sm:w-auto items-center justify-between gap-3 h-12 pl-7 pr-1.5 rounded-full font-medium text-white transition-colors hover:bg-[#004d00] shadow-lg whitespace-nowrap"
                            style={{ background: "var(--brand-green)" }}
                        >
                            Donate
                            <span className="bg-white rounded-full p-2 flex items-center justify-center">
                                <Heart className="h-4 w-4 text-black" />
                            </span>
                        </DonateButton>
                        <Link
                            href={isAuthenticated ? "/dashboard" : "/register"}
                            className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 h-12 px-7 rounded-full font-medium transition-colors whitespace-nowrap ${hasImage ? "liquid-glass text-white" : "bg-surface-2 hover:bg-surface-3 text-foreground"}`}
                        >
                            {isAuthenticated ? "Open dashboard" : "Join the movement"}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}