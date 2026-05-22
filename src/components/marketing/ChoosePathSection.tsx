"use client";

import Link from "next/link";
import { GraduationCap, Sparkles, Building2, Leaf, ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth/client";

/**
 * Choose Your Path — symbiotic value exchange across the four stakeholders.
 * Auth-aware: authenticated users never see "Sign Up / Join" CTAs.
 *
 * Mentees ──── Total Athlete + Sweat Equity (1 give-back per quarter)
 * Mentors ──── Power Hour (1 hour/month, admin handled by Jenga365)
 * Corporate ── Corporate Unlock (funds released on verified ESG milestones)
 * NGOs ─────── Resource Exchange (hardware + expertise ↔ volunteer workforce)
 */
export default function ChoosePathSection() {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const dashboardHref = "/dashboard";

    const PATHS = [
        {
            id: "mentee" as const,
            tag: "The Army",
            name: "Mentee",
            tagline: "Athletes & young professionals",
            description:
                "AI-matched mentorship, structured career pathways, and resilience coaching. You earn it through quarterly Sweat Equity — one verified give-back activity per quarter.",
            highlights: [
                "Total Athlete philosophy — body, mind, community",
                "AI-matched 1:2 mentorship with a vetted mentor",
                "Quarterly resilience assessments with delta tracking",
                "One Sweat Equity activity per quarter",
            ],
            color: "var(--brand-green)",
            colorSoft: "var(--brand-green-soft)",
            registerHref: "/register/mentee",
            joinCta: "Join as a mentee",
            Icon: GraduationCap,
        },
        {
            id: "mentor" as const,
            tag: "Human Capital",
            name: "Mentor",
            tagline: "Experienced professionals",
            description:
                "Plug-and-play philanthropy. Commit one Power Hour a month — we handle the matching, scheduling, and admin. Capped at two mentees so your attention isn't diluted.",
            highlights: [
                "Power Hour protocol — one hour per month",
                "All logistics handled — matching, scheduling, follow-ups",
                "Never more than two active mentees at once",
                "Vetted strategic network access",
            ],
            color: "var(--brand-red)",
            colorSoft: "var(--brand-red-soft)",
            registerHref: "/register/mentor",
            joinCta: "Apply as a mentor",
            Icon: Sparkles,
        },
        {
            id: "corporate" as const,
            tag: "Enablers",
            name: "Corporate Partner",
            tagline: "Brands & businesses",
            description:
                "Invest in people. Measure the return. The Corporate Unlock Challenge releases your funds only when verified ESG milestones are hit — like 500 trees surviving the latest audit.",
            highlights: [
                "Milestone-tied funding (release on verified ESG audit)",
                "Looker Studio dashboards — quarterly M&E reports",
                "GPS-anchored tree-survival evidence",
                "Aggregated trees-alive + youth-engaged metrics",
            ],
            color: "var(--brand-black)",
            colorSoft: "var(--surface-2)",
            registerHref: "/register/corporate",
            joinCta: "Become a partner",
            Icon: Building2,
        },
        {
            id: "ngo" as const,
            tag: "Technical Experts",
            name: "NGO / CBO",
            tagline: "Resource exchange partners",
            description:
                "You bring the hardware — seedlings, books, expertise. We bring a disciplined, organized volunteer workforce of athletes. A Resource Exchange MOU formalises the swap.",
            highlights: [
                "Resource Exchange MOU — no payment flow required",
                "Volunteer workforce of vetted athlete-mentees",
                "Co-branded community impact tracking",
                "Lightweight onboarding — no Unlock Challenge",
            ],
            color: "var(--brand-green)",
            colorSoft: "var(--brand-green-soft)",
            registerHref: "/register/ngo",
            joinCta: "Sign an MOU",
            Icon: Leaf,
        },
    ];

    return (
        <section className="bg-background border-y border-border">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-24">
                <div className="max-w-2xl mb-12 lg:mb-16">
                    <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                        Choose your path
                    </p>
                    <h2 className="mt-3 text-display-md text-foreground">
                        Four stakeholders. One ecosystem.
                    </h2>
                    <p className="mt-5 text-body-lg text-foreground-muted">
                        Jenga365 only works because each role earns its place. Pick the
                        contribution that matches you — every path is reciprocal and measurable.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    {PATHS.map(({ id, tag, name, tagline, description, highlights, color, colorSoft, registerHref, joinCta, Icon }) => (
                        <article
                            key={id}
                            className="rounded-lg border border-border bg-background p-6 lg:p-7 flex flex-col transition-shadow hover:shadow-md"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <header className="flex items-start gap-4">
                                <div
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-md shrink-0"
                                    style={{ background: colorSoft }}
                                >
                                    <Icon className="h-5 w-5" style={{ color }} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-eyebrow" style={{ color }}>
                                        {tag}
                                    </p>
                                    <h3 className="mt-0.5 text-headline text-foreground">{name}</h3>
                                    <p className="text-body-sm text-foreground-muted">{tagline}</p>
                                </div>
                            </header>

                            <p className="mt-4 text-body text-foreground-muted">{description}</p>

                            <ul className="mt-5 space-y-2 flex-1">
                                {highlights.map((line) => (
                                    <li key={line} className="flex items-start gap-2.5 text-body-sm text-foreground">
                                        <span
                                            className="mt-2 h-1 w-1 rounded-full shrink-0"
                                            style={{ background: color }}
                                            aria-hidden
                                        />
                                        {line}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 flex items-center justify-between gap-3">
                                {isAuthenticated ? (
                                    <Link
                                        href={dashboardHref}
                                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-4 text-label font-medium text-white transition-opacity hover:opacity-90"
                                        style={{ background: color }}
                                    >
                                        Open dashboard
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={registerHref}
                                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-4 text-label font-medium text-white transition-opacity hover:opacity-90"
                                        style={{ background: color }}
                                    >
                                        {joinCta}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                )}
                                {!isAuthenticated && (
                                    <Link
                                        href="/about"
                                        className="text-label font-medium text-foreground-muted hover:text-foreground transition-colors"
                                    >
                                        Learn more
                                    </Link>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
