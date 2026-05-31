"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useSession } from "@/lib/auth/client";
import { urlFor } from "@/lib/sanity/client";
import { motion, Variants } from "framer-motion";

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
 *
 * Enhanced with Framer Motion for better attention capture.
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
    const hasImage = !!heroUrl;

    const headingColor = hasImage ? "#ffffff" : "var(--foreground)";
    const mutedColor = hasImage ? "rgba(255,255,255,0.88)" : "var(--foreground-muted)";
    const subtleColor = hasImage ? "rgba(255,255,255,0.72)" : "var(--foreground-subtle)";

    const staggerVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.8,
                ease: "easeOut" as const,
            },
        }),
    };

    return (
        <section
            className={`relative overflow-hidden bg-background ${hasImage ? "-mt-16" : ""}`}
        >
            {hasImage ? (
                <>
                    <motion.img
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        src={heroUrl!}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                    />
                    <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/80 via-black/60 to-black/35"
                        aria-hidden
                    />
                    <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent"
                        aria-hidden
                    />
                    <div className="absolute inset-0 bg-topo opacity-[0.10] pointer-events-none" aria-hidden />
                </>
            ) : (
                <>
                    <div className="absolute inset-0 bg-hero-radial pointer-events-none" aria-hidden />
                    <div className="absolute inset-0 bg-topo opacity-[0.35] pointer-events-none" aria-hidden />
                </>
            )}

            <div
                className={`relative mx-auto max-w-7xl px-6 lg:px-8 ${hasImage ? "pt-40 pb-24 md:pt-48 md:pb-32 lg:pt-56 lg:pb-40" : "py-24 md:py-32 lg:py-40"}`}
            >
                <div className="max-w-3xl">
                    <motion.div
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        variants={staggerVariants}
                        className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border backdrop-blur-sm"
                        style={{
                            background: hasImage ? "rgba(255,255,255,0.12)" : "var(--surface-1)",
                            borderColor: hasImage ? "rgba(255,255,255,0.25)" : "var(--border)",
                        }}
                    >
                        <Sparkles className="h-3.5 w-3.5" style={{ color: hasImage ? "#7CE2A8" : "var(--brand-green)" }} />
                        <span className="text-eyebrow" style={{ color: mutedColor }}>
                            {eyebrow}
                        </span>
                    </motion.div>

                    <motion.h1
                        custom={1}
                        initial="hidden"
                        animate="visible"
                        variants={staggerVariants}
                        className="text-display-lg md:text-display-xl whitespace-pre-line"
                        style={{ color: headingColor }}
                    >
                        {heading}
                    </motion.h1>

                    <motion.p
                        custom={2}
                        initial="hidden"
                        animate="visible"
                        variants={staggerVariants}
                        className="mt-6 text-body-lg max-w-2xl"
                        style={{ color: mutedColor }}
                    >
                        {description}
                    </motion.p>

                    <motion.div
                        custom={3}
                        initial="hidden"
                        animate="visible"
                        variants={staggerVariants}
                        className="mt-10 flex flex-col md:flex-row gap-3"
                    >
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full md:w-auto items-center justify-center gap-2 h-12 px-6 rounded-md font-medium text-white transition-transform hover:-translate-y-0.5 shadow-lg whitespace-nowrap"
                                style={{ background: "var(--brand-green)" }}
                            >
                                Go to dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={primaryCtaHref}
                                    className="inline-flex w-full md:w-auto items-center justify-center gap-2 h-12 px-6 rounded-md font-medium text-white transition-transform hover:-translate-y-0.5 shadow-lg whitespace-nowrap"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    {primaryCtaLabel}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={secondaryCtaHref}
                                    className={
                                        hasImage
                                            ? "inline-flex w-full md:w-auto items-center justify-center gap-2 h-12 px-6 rounded-md font-medium border border-white/30 text-white backdrop-blur-sm hover:bg-white/10 transition-colors whitespace-nowrap"
                                            : "inline-flex w-full md:w-auto items-center justify-center gap-2 h-12 px-6 rounded-md font-medium border border-border text-foreground hover:bg-surface-2 transition-colors whitespace-nowrap"
                                    }
                                >
                                    {secondaryCtaLabel}
                                </Link>
                            </>
                        )}
                    </motion.div>

                    <motion.p
                        custom={4}
                        initial="hidden"
                        animate="visible"
                        variants={staggerVariants}
                        className="mt-6 text-body-sm"
                        style={{ color: subtleColor }}
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
                    </motion.p>
                </div>
            </div>
        </section>
    );
}