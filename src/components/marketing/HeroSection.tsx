"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useSession } from "@/lib/auth/client";
import { urlFor } from "@/lib/sanity/client";

interface SanityImage {
    asset?: { _id?: string; url?: string };
    alt?: string;
}

interface HeroSectionProps {
    readonly heroImage?: SanityImage | null;
}

/**
 * Landing hero — Total Athlete + Dual-Engine narrative.
 * DESIGN.md §11: clean neutral surface with a subtle radial accent.
 * Optional background image is rendered at low opacity behind the radial+topo overlay.
 */
export default function HeroSection({ heroImage }: HeroSectionProps) {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

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
                            AI-Native Mentorship Platform
                        </span>
                    </div>

                    <h1 className="text-display-lg md:text-display-xl">
                        Build the{" "}
                        <span style={{ color: "var(--brand-green)" }}>Total Athlete.</span>
                        <br />
                        365 days a year.
                    </h1>

                    <p
                        className="mt-6 text-body-lg max-w-2xl"
                        style={{ color: "var(--foreground-muted)" }}
                    >
                        Jenga365 is Kenya&apos;s dual-engine platform connecting human capital with
                        environmental stewardship. AI-matched mentorship pairs athletes and young
                        professionals with seasoned veterans. Quarterly M&amp;E and GPS-verified
                        climate action gives corporate sponsors the ESG data they need.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-3">
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-medium text-white"
                                style={{ background: "var(--brand-green)" }}
                            >
                                Go to dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-medium text-white"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    Apply for mentorship
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/impact"
                                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-medium border border-border text-foreground hover:bg-surface-2 transition-colors"
                                >
                                    Corporate ESG partnership
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
