"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useSession } from "@/lib/auth/client";
import { urlFor } from "@/lib/sanity/client";

interface SanityImage {
    asset?: { _id?: string; url?: string };
    alt?: string;
}

export interface HeroCopy {
    eyebrow?: string;
    heading?: string;
    description?: string;
    primaryCtaLabel?: string;
    primaryCtaHref?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
}

interface HeroSectionProps {
    readonly heroImage?: SanityImage | null;
    readonly copy?: HeroCopy | null;
}

const DEFAULT_COPY: Required<HeroCopy> = {
    eyebrow: "AI-Native Mentorship Platform",
    heading: "Build the Total Athlete.\n365 days a year.",
    description:
        "Jenga365 is Kenya's dual-engine platform connecting human capital with environmental stewardship. AI-matched mentorship pairs athletes and young professionals with seasoned veterans.",
    primaryCtaLabel: "Apply for mentorship",
    primaryCtaHref: "/register/mentorship",
    secondaryCtaLabel: "Corporate ESG partnership",
    secondaryCtaHref: "/impact",
};

/**
 * Cinematic Landing Hero — Total Athlete + Dual-Engine narrative.
 * Copy is sourced from siteSettings.landingHero in Sanity.
 */
export default function HeroSection({ heroImage, copy }: HeroSectionProps) {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const eyebrow = copy?.eyebrow?.trim() || DEFAULT_COPY.eyebrow;
    const heading = copy?.heading?.trim() || DEFAULT_COPY.heading;
    const description = copy?.description?.trim() || DEFAULT_COPY.description;
    const primaryCtaLabel = copy?.primaryCtaLabel?.trim() || DEFAULT_COPY.primaryCtaLabel;
    const primaryCtaHref = copy?.primaryCtaHref?.trim() || DEFAULT_COPY.primaryCtaHref;
    const secondaryCtaLabel = copy?.secondaryCtaLabel?.trim() || DEFAULT_COPY.secondaryCtaLabel;
    const secondaryCtaHref = copy?.secondaryCtaHref?.trim() || DEFAULT_COPY.secondaryCtaHref;

    const heroUrl = heroImage?.asset?.url
        ? heroImage.asset.url.match(/\.(mp4|webm|mov)(\?.*)?$/i)
            ? heroImage.asset.url // Don't use urlFor on video
            : urlFor(heroImage).width(1920).height(1080).fit("crop").auto("format").url()
        : null;
    const hasImage = !!heroUrl;
    const isVideo = hasImage && !!heroUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i);

    const headingColor = hasImage ? "#ffffff" : "var(--foreground)";
    const mutedColor = hasImage ? "rgba(255,255,255,0.88)" : "var(--foreground-muted)";
    const subtleColor = hasImage ? "rgba(255,255,255,0.72)" : "var(--foreground-subtle)";

    return (
        <section
            className={`relative overflow-hidden bg-background flex flex-col justify-end ${
                hasImage ? "h-[85vh] min-h-[600px] -mt-16" : "py-24 lg:py-32"
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
                    <div className="absolute inset-0 bg-topo opacity-[0.10] pointer-events-none z-0" aria-hidden />
                </>
            ) : (
                <>
                    <div className="absolute inset-0 bg-hero-radial pointer-events-none z-0" aria-hidden />
                    <div className="absolute inset-0 bg-topo opacity-[0.35] pointer-events-none z-0" aria-hidden />
                </>
            )}

            <div className={`relative z-10 w-full mx-auto max-w-7xl px-6 lg:px-8 ${hasImage ? "pb-12 md:pb-16" : ""}`}>
                <div className="max-w-3xl">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border backdrop-blur-sm animate-blur-fade-up"
                        style={{
                            background: hasImage ? "rgba(255,255,255,0.12)" : "var(--surface-1)",
                            borderColor: hasImage ? "rgba(255,255,255,0.25)" : "var(--border)",
                            animationDelay: "100ms"
                        }}
                    >
                        <Sparkles className="h-3.5 w-3.5" style={{ color: hasImage ? "#7CE2A8" : "var(--brand-green)" }} />
                        <span className="text-eyebrow" style={{ color: mutedColor }}>
                            {eyebrow}
                        </span>
                    </div>

                    <h1
                        className="text-display-lg md:text-display-xl whitespace-pre-line leading-tight animate-blur-fade-up"
                        style={{ color: headingColor, animationDelay: "200ms" }}
                    >
                        {heading}
                    </h1>

                    <p
                        className="mt-6 text-body-lg max-w-2xl leading-relaxed animate-blur-fade-up"
                        style={{ color: mutedColor, animationDelay: "300ms" }}
                    >
                        {description}
                    </p>

                    <div
                        className="mt-10 flex flex-col sm:flex-row items-start gap-4 animate-blur-fade-up"
                        style={{ animationDelay: "400ms" }}
                    >
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex w-full sm:w-auto items-center justify-between gap-3 h-12 pl-7 pr-1.5 rounded-full font-medium text-white transition-colors hover:bg-[#004d00] shadow-lg whitespace-nowrap"
                                style={{ background: "var(--brand-green)" }}
                            >
                                Go to dashboard
                                <span className="bg-white rounded-full p-2 flex items-center justify-center">
                                    <ArrowRight className="h-4 w-4 text-black" />
                                </span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={primaryCtaHref}
                                    className="inline-flex w-full sm:w-auto items-center justify-between gap-3 h-12 pl-7 pr-1.5 rounded-full font-medium text-white transition-colors hover:bg-[#004d00] shadow-lg whitespace-nowrap"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    {primaryCtaLabel}
                                    <span className="bg-white rounded-full p-2 flex items-center justify-center">
                                        <ArrowRight className="h-4 w-4 text-black" />
                                    </span>
                                </Link>
                                <Link
                                    href={secondaryCtaHref}
                                    className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 h-12 px-7 rounded-full font-medium transition-colors whitespace-nowrap ${hasImage ? "liquid-glass text-white" : "bg-surface-2 hover:bg-surface-3 text-foreground"}`}
                                >
                                    {secondaryCtaLabel}
                                </Link>
                            </>
                        )}
                    </div>

                    <p
                        className="mt-6 text-sm animate-blur-fade-up"
                        style={{ color: subtleColor, animationDelay: "500ms" }}
                    >
                        Mentorship is earned, not free. Read the{" "}
                        <Link
                            href="#sweat-equity"
                            className="font-medium underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
                            style={{ color: headingColor }}
                        >
                            Sweat Equity protocol
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </section>
    );
}