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
    heading: "Build the Total Athlete. 365 days a year.",
    description:
        "Jenga365 is Kenya's dual-engine platform connecting human capital with environmental stewardship. AI-matched mentorship pairs athletes and young professionals with seasoned veterans. Quarterly M&E and GPS-verified climate action gives corporate sponsors the ESG data they need.",
    primaryCtaLabel: "Apply for mentorship",
    primaryCtaHref: "/register/mentorship",
    secondaryCtaLabel: "Corporate ESG partnership",
    secondaryCtaHref: "/impact",
};

/**
 * Landing hero — Total Athlete + Dual-Engine narrative.
 * Copy is sourced from siteSettings.landingHero in Sanity; in-code DEFAULT_COPY
 * is the fallback when a field is empty.
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
        ? urlFor(heroImage).width(1920).height(1080).fit("crop").auto("format").url()
        : null;

    return (
        <section className="relative overflow-hidden bg-background">
            {heroUrl && (
                <img
                    src={heroUrl}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.12] pointer-events-none"
                />
            )}
            <div className="absolute inset-0 bg-hero-radial pointer-events-none" aria-hidden />
            <div className="absolute inset-0 bg-topo opacity-[0.35] pointer-events-none" aria-hidden />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 md:py-32 lg:py-40">
                <div className="max-w-3xl">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border"
                        style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
                    >
                        <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--brand-green)" }} />
                        <span className="text-eyebrow" style={{ color: "var(--foreground-muted)" }}>
                            {eyebrow}
                        </span>
                    </div>

                    <h1 className="text-display-lg md:text-display-xl whitespace-pre-line">
                        {heading}
                    </h1>

                    <p
                        className="mt-6 text-body-lg max-w-2xl"
                        style={{ color: "var(--foreground-muted)" }}
                    >
                        {description}
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-3">
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-medium text-white"
                                style={{ background: "var(--brand-green)" }}
                            >
                                Go to dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={primaryCtaHref}
                                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-medium text-white"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    {primaryCtaLabel}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={secondaryCtaHref}
                                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-medium border border-border text-foreground hover:bg-surface-2 transition-colors"
                                >
                                    {secondaryCtaLabel}
                                </Link>
                            </>
                        )}
                    </div>

                    <p
                        className="mt-6 text-body-sm"
                        style={{ color: "var(--foreground-subtle)" }}
                    >
                        Mentorship is earned — not free. Read the{" "}
                        <Link
                            href="#sweat-equity"
                            className="underline underline-offset-4"
                            style={{ color: "var(--foreground)" }}
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
