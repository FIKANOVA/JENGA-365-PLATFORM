"use client";

import Link from "next/link";
import { GraduationCap, Sparkles, Building2, Leaf, ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth/client";

export interface ChoosePathCopy {
    eyebrow?: string;
    heading?: string;
    description?: string;
    paths?: Array<{
        id: string;
        tag: string;
        name: string;
        tagline: string;
        description: string;
        highlights: string[];
        joinCta: string;
    }>;
}

interface ChoosePathSectionProps {
    readonly copy?: ChoosePathCopy | null;
}

const DEFAULT_PATHS = [
    {
        id: "mentee",
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
        joinCta: "Join as a mentee",
    },
    {
        id: "mentor",
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
        joinCta: "Apply as a mentor",
    },
    {
        id: "corporate",
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
        joinCta: "Become a partner",
    },
    {
        id: "ngo",
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
        joinCta: "Sign an MOU",
    },
];

export default function ChoosePathSection({ copy }: ChoosePathSectionProps) {
/**
 * Choose Your Path, symbiotic value exchange across the four stakeholders.
 * Refactored into an interactive tabbed interface to reduce vertical scrolling.
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

    const eyebrow = copy?.eyebrow?.trim() || "Choose your path";
    const heading = copy?.heading?.trim() || "Four stakeholders. One ecosystem.";
    const description = copy?.description?.trim() || "Jenga365 only works because each role earns its place. Pick the contribution that matches you — every path is reciprocal and measurable.";

    const configuredPaths = copy?.paths?.length ? copy.paths : DEFAULT_PATHS;

    const pathsData = configuredPaths.map((p) => {
        let color = "var(--brand-green)";
        let colorSoft = "var(--brand-green-soft)";
        let registerHref = `/register/${p.id}`;
        let Icon = GraduationCap;

        if (p.id === "mentor") {
            color = "var(--brand-red)";
            colorSoft = "var(--brand-red-soft)";
            Icon = Sparkles;
        } else if (p.id === "corporate") {
            color = "var(--brand-black)";
            colorSoft = "var(--surface-2)";
            Icon = Building2;
        } else if (p.id === "ngo") {
            Icon = Leaf;
        }

        return { ...p, color, colorSoft, registerHref, Icon };
    });

    return (
        <section className="bg-background border-y border-border">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 md:py-24">
                <div className="max-w-2xl mb-12">
                    <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                        {eyebrow}
                    </p>
                    <h2 className="mt-3 text-display-sm md:text-display-md text-foreground">
                        {heading}
                    </h2>
                    <p className="mt-5 text-body-lg text-foreground-muted">
                        {description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    {pathsData.map(({ id, tag, name, tagline, description, highlights, color, colorSoft, registerHref, joinCta, Icon }) => (
                        <article
                            key={id}
                            className="rounded-lg border border-border bg-background p-6 flex flex-col transition-shadow hover:shadow-md"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <header className="flex items-start gap-4">
    const PATHS = [
        {
            id: "mentee" as const,
            tag: "The Army",
            name: "Mentee",
            tagline: "Athletes & young professionals",
            description:
                "AI-matched mentorship, structured career pathways, and resilience coaching. You earn it through quarterly Sweat Equity, one verified give-back activity per quarter.",
            highlights: [
                "Total Athlete philosophy, body, mind, community",
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
                "Plug-and-play philanthropy. Commit one Power Hour a month, we handle the matching, scheduling, and admin. Capped at two mentees so your attention isn't diluted.",
            highlights: [
                "Power Hour protocol, one hour per month",
                "All logistics handled, matching, scheduling, follow-ups",
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
                "Invest in people. Measure the return. The Corporate Unlock Challenge releases your funds only when verified ESG milestones are hit, like 500 trees surviving the latest audit.",
            highlights: [
                "Milestone-tied funding (release on verified ESG audit)",
                "Looker Studio dashboards, quarterly M&E reports",
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
                "You bring the hardware, seedlings, books, expertise. We bring a disciplined, organized volunteer workforce of athletes. A Resource Exchange MOU formalises the swap.",
            highlights: [
                "Resource Exchange MOU, no payment flow required",
                "Volunteer workforce of vetted athlete-mentees",
                "Co-branded community impact tracking",
                "Lightweight onboarding, no Unlock Challenge",
            ],
            color: "var(--brand-green)",
            colorSoft: "var(--brand-green-soft)",
            registerHref: "/register/ngo",
            joinCta: "Sign an MOU",
            Icon: Leaf,
        },
    ];

    const activeData = PATHS.find((p) => p.id === activeTab)!;

    return (
        <section className="bg-background border-y border-border py-12 md:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    <div className="lg:w-1/3 shrink-0">
                        <div className="sticky top-24">
                            <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                                Choose your path
                            </p>
                            <h2 className="mt-3 text-display-md text-foreground">
                                Four stakeholders. One ecosystem.
                            </h2>
                            <p className="mt-5 text-body-lg text-foreground-muted mb-8">
                                Jenga365 only works because each role earns its place. Pick the
                                contribution that matches you, every path is reciprocal and measurable.
                            </p>

                            <div className="flex flex-col gap-2">
                                {PATHS.map((path) => (
                                    <button
                                        key={path.id}
                                        onClick={() => setActiveTab(path.id)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-md text-left transition-all duration-200 border",
                                            activeTab === path.id
                                                ? "bg-[color:var(--surface-2)] shadow-sm border-transparent"
                                                : "bg-transparent border-transparent hover:bg-[color:var(--surface-1)] hover:border-border"
                                        )}
                                        style={activeTab === path.id ? { borderColor: path.color } : {}}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-md shrink-0 transition-colors"
                                                style={{
                                                    background: activeTab === path.id ? path.color : "var(--surface-2)",
                                                    color: activeTab === path.id ? "white" : "var(--foreground-muted)"
                                                }}
                                            >
                                                <path.Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className={cn(
                                                    "font-medium transition-colors",
                                                    activeTab === path.id ? "text-foreground" : "text-foreground-muted"
                                                )}>
                                                    {path.name}
                                                </h3>
                                                <p className="text-xs text-foreground-subtle hidden sm:block">{path.tagline}</p>
                                            </div>
                                        </div>
                                        {activeTab === path.id && (
                                            <ArrowRight className="h-4 w-4 shrink-0 hidden md:block" style={{ color: path.color }} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-2/3 flex items-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full rounded-md border border-border bg-[color:var(--surface-1)] p-8 md:p-12 shadow-lg relative overflow-hidden"
                            >
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
                                <div className="flex-1">
                                    <p className="text-eyebrow" style={{ color }}>
                                        {tag}
                                    </p>
                                    <h3 className="mt-0.5 text-headline text-foreground">{name}</h3>
                                    <p className="text-body-sm text-foreground-muted">{tagline}</p>
                                    className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3"
                                    style={{ background: activeData.color }}
                                />

                                <header className="flex items-start gap-4 relative z-10">
                                    <div className="flex-1">
                                        <p className="text-eyebrow" style={{ color: activeData.color }}>
                                            {activeData.tag}
                                        </p>
                                        <h3 className="mt-2 text-display-sm text-foreground">{activeData.name}</h3>
                                        <p className="text-body-lg text-foreground-muted mt-2">{activeData.tagline}</p>
                                    </div>
                                </header>

                                <p className="mt-8 text-body-lg text-foreground relative z-10 leading-relaxed max-w-2xl">
                                    {activeData.description}
                                </p>

                                <div className="mt-10 bg-background rounded-md p-6 border border-border relative z-10">
                                    <h4 className="text-label text-foreground-muted mb-4 uppercase tracking-wider">The Exchange</h4>
                                    <ul className="space-y-4">
                                        {activeData.highlights.map((line) => (
                                            <li key={line} className="flex items-start gap-3 text-body text-foreground">
                                                <div
                                                    className="mt-1 h-5 w-5 rounded-full shrink-0 flex items-center justify-center"
                                                    style={{ background: activeData.colorSoft }}
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: activeData.color }} />
                                                </div>
                                                {line}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-10 flex flex-wrap items-center gap-4 relative z-10">
                                    {isAuthenticated ? (
                                        <Link
                                            href={dashboardHref}
                                            className="inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 font-medium text-white transition-transform hover:-translate-y-0.5"
                                            style={{ background: activeData.color }}
                                        >
                                            Open dashboard
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={activeData.registerHref}
                                            className="inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 font-medium text-white transition-transform hover:-translate-y-0.5"
                                            style={{ background: activeData.color }}
                                        >
                                            {activeData.joinCta}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    )}
                                    {!isAuthenticated && (
                                        <Link
                                            href="/about"
                                            className="inline-flex h-12 items-center justify-center px-6 rounded-md font-medium text-foreground bg-[color:var(--surface-2)] hover:bg-[color:var(--surface-3)] transition-colors"
                                        >
                                            Learn more
                                        </Link>
                                    )}
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
