import Link from "next/link";
import { Timer, Users, GraduationCap, Trees, Leaf, Building2, ArrowRight, Heart, HandHeart } from "lucide-react";
import PageHero from "@/components/shared/PageHero";

import { getGlobalImpactStats } from "@/lib/actions/marketing";
import { fetchSiteSettings } from "@/lib/sanity/queries";
import DonateButton from "@/components/shared/DonateButton";

export const metadata = {
    title: "Impact | Jenga365: Measurable Change Through Mentorship",
    description: "Explore the social and environmental impact of the Jenga365 platform. From mentorship hours to career placements, see our data-driven results.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ImpactStory {
    quote: string;
    name: string;
    role?: string;
    handle?: string;
    source?: string;
    rating?: number;
    sourceUrl?: string;
}

interface EnvStat {
    value: string;
    label: string;
    description?: string | null;
}

const DEFAULT_IMPACT_STORIES: ImpactStory[] = [
    {
        quote: "Jenga365 didn't just match me with a mentor, it matched me with a future. I went from uncertainty to leading a tech team in 18 months.",
        name: "Grace Wanjiku",
        role: "Mentee & Software Engineer",
        handle: "Google Verified Review",
        source: "google_review",
        rating: 5,
        sourceUrl: "https://google.com/maps",
    },
    {
        quote: "The corporate ESG milestone framework allowed our CSR budget to create measurable, trackable, GPS-audited impact for the first time.",
        name: "James Karanja",
        role: "CSR Director, Enterprise Partner",
        handle: "LinkedIn Recommendation",
        source: "linkedin",
        rating: 5,
        sourceUrl: "https://linkedin.com",
    },
    {
        quote: "Through Jenga365's rugby and Trees for Tries program, our cohort learned discipline while reforesting our home county.",
        name: "Brian Otieno",
        role: "Athlete & Mentee",
        handle: "@brian_rugby",
        source: "x_twitter",
        rating: 5,
        sourceUrl: "https://x.com",
    },
];

function fmt(n: number | undefined | null): string {
    if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return "—";
    return n.toLocaleString();
}

// Resolves a Sanity-authored stat value. Supports the `{{metricToken}}` placeholders
// listed in the schema description so editors can pin a card to a live metric.
function resolveStatValue(raw: string, dbStats: Awaited<ReturnType<typeof getGlobalImpactStats>>): string {
    const trimmed = (raw ?? "").trim();
    const map: Record<string, string> = {
        "{{treesAlive}}":         fmt(dbStats?.treesAliveLatestAudit),
        "{{treesPlanted}}":       fmt(dbStats?.treesPlantedTotal),
        "{{corporatePartners}}":  fmt(dbStats?.activeCorporatePartners),
        "{{ngoPartners}}":        fmt(dbStats?.activeNgoPartners),
        "{{activeMentors}}":      fmt(dbStats?.activeMentors),
        "{{youthEngaged}}":       fmt(dbStats?.youthEngagedActive),
        "{{mentorshipHours}}":    fmt(dbStats?.mentorshipHoursTotal),
        "{{survivalRate}}":       dbStats?.survivalRatePct && dbStats.survivalRatePct > 0
                                      ? `${dbStats.survivalRatePct}%`
                                      : "—",
    };
    return map[trimmed] ?? trimmed;
}

export default async function ImpactPage() {
    const [dbStats, settings] = await Promise.all([
        getGlobalImpactStats(),
        fetchSiteSettings(),
    ]);

    const stories: ImpactStory[] = settings?.impactTestimonials?.length
        ? settings.impactTestimonials
        : DEFAULT_IMPACT_STORIES;

    const IMPACT_STATS = [
        { value: fmt(dbStats?.mentorshipHoursTotal),     label: "Mentorship Hours Logged",   Icon: Timer },
        { value: fmt(dbStats?.activeMentors),            label: "Active Mentors",            Icon: Users },
        { value: fmt(dbStats?.youthEngagedActive),       label: "Youth Engaged",             Icon: GraduationCap },
        { value: fmt(dbStats?.treesPlantedTotal),        label: "Trees Planted",             Icon: Trees },
        {
            value: dbStats?.survivalRatePct && dbStats.survivalRatePct > 0
                ? `${dbStats.survivalRatePct}%`
                : "—",
            label: "Tree Survival Rate",
            Icon: Leaf,
        },
        { value: fmt(dbStats?.activeCorporatePartners),  label: "Corporate Partners",        Icon: Building2 },
        { value: fmt(dbStats?.activeNgoPartners),        label: "NGO Partners",              Icon: HandHeart },
    ];

    const DEFAULT_ENVIRONMENTAL_STATS: EnvStat[] = [
        {
            value: "100%",
            label: "Digital-First Operations",
            description: "Zero paper waste through AI-driven digital mentorship matching and reporting.",
        },
        {
            value: "{{treesAlive}}",
            label: "Trees Alive (Latest Audit)",
            description: "GPS-anchored survival audits at 6/12/24-month intervals via KoBoToolbox.",
        },
        {
            value: "{{corporatePartners}}",
            label: "Active ESG Partners",
            description: "Corporate partners with verified milestone-based impact agreements.",
        },
        {
            value: "{{ngoPartners}}",
            label: "Active NGO Partners",
            description: "Non-profit collaborators delivering field programmes alongside the network.",
        },
    ];

    const sourceStats: EnvStat[] = settings?.environmentalStats?.length
        ? settings.environmentalStats
        : DEFAULT_ENVIRONMENTAL_STATS;
    const ENVIRONMENTAL_STATS = sourceStats.map((stat) => ({
        value: resolveStatValue(stat.value, dbStats),
        label: stat.label,
        description: stat.description ?? "",
    }));

    return (
        <div className="min-h-screen bg-background">
            <main>
                <PageHero
                    eyebrow="Measurable change"
                    heading={<>Our impact.</>}
                    description="Data-driven development. From mentorship hours to career placements, every initiative is measured, reported, and refined."
                />

                <section className="py-12 md:py-20 lg:py-12 md:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
                        <div className="max-w-xl space-y-3">
                            <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>By the numbers</p>
                            <h2 className="text-display-md text-foreground">Social impact metrics.</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {IMPACT_STATS.map(({ value, label, Icon }) => (
                                <div
                                    key={label}
                                    className="rounded-3xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-[color:var(--surface-1)]"
                                    style={{ boxShadow: "var(--shadow-sm)" }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <Icon className="h-5 w-5" style={{ color: "var(--brand-green)" }} />
                                    </div>
                                    <div className="text-display-sm text-foreground">{value}</div>
                                    <p className="mt-2 text-eyebrow text-foreground-muted">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-12 md:py-20 lg:py-12 md:py-24" style={{ background: "var(--brand-black)" }}>
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
                        <div className="max-w-xl space-y-3">
                            <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Success stories</p>
                            <h2 className="text-display-md" style={{ color: "#FFFFFF" }}>Voices of growth.</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {stories.map((story) => (
                                <div
                                    key={story.name}
                                    className="rounded-3xl border p-6 space-y-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
                                    style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.02)" }}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="h-px w-12" style={{ background: "var(--brand-green)" }} />
                                            {story.source ? (
                                                <span className="text-[11px] font-medium tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 uppercase">
                                                    {story.source === "google_review" ? "Google Review" : story.source === "x_twitter" ? "X (Twitter)" : story.source.replace("_", " ")}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="text-body italic" style={{ color: "rgba(255,255,255,0.78)" }}>
                                            &ldquo;{story.quote}&rdquo;
                                        </p>
                                    </div>
                                    <div className="space-y-1 pt-4 border-t border-white/10">
                                        <h4 className="text-headline" style={{ color: "#FFFFFF" }}>{story.name}</h4>
                                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>{story.role ?? story.handle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-12 md:py-20 lg:py-12 md:py-24 border-y border-border">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>ESG compliance</p>
                                    <h2 className="text-display-md text-foreground">Environmental stewardship.</h2>
                                </div>
                                <p className="text-body-lg text-foreground-muted max-w-xl">
                                    Through our corporate partnerships, we align mentorship activities with sustainable environmental practices. Every program is evaluated against ESG criteria to ensure our growth doesn&apos;t come at the planet&apos;s expense.
                                </p>
                                <Link
                                    href="/resources"
                                    className="inline-flex items-center gap-2 text-label font-medium transition-colors"
                                    style={{ color: "var(--brand-green)" }}
                                >
                                    View ESG report
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {ENVIRONMENTAL_STATS.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-3xl border border-border bg-background p-5 flex items-start gap-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                        style={{ boxShadow: "var(--shadow-sm)" }}
                                    >
                                        <span className="text-display-sm min-w-[80px]" style={{ color: "var(--brand-green)" }}>
                                            {stat.value}
                                        </span>
                                        <div className="space-y-1">
                                            <h4 className="text-headline text-foreground">{stat.label}</h4>
                                            <p className="text-body-sm text-foreground-muted">{stat.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 md:py-20 lg:py-12 md:py-24" style={{ background: "var(--surface-1)" }}>
                    <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center space-y-6">
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Join the movement</p>
                        <h2 className="text-display-md text-foreground">Your contribution multiplies.</h2>
                        <p className="text-body-lg text-foreground-muted">
                            Every donation directly funds mentorship sessions, rugby clinics, and career development programs for Kenya&apos;s next generation.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <DonateButton
                                className="group/btn inline-flex h-12 max-w-full items-center justify-between gap-3 rounded-full pl-5 sm:pl-6 pr-1.5 text-label font-medium text-white transition-all hover:opacity-90 shadow-lg"
                                style={{ background: "var(--brand-red)" }}
                            >
                                <span className="truncate text-sm sm:text-base flex items-center gap-2"><Heart className="h-4 w-4" /> Donate now</span>
                                <span className="bg-white shrink-0 rounded-full p-2 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover/btn:translate-x-1">
                                    <ArrowRight className="h-4 w-4 text-black" />
                                </span>
                            </DonateButton>
                            <Link
                                href="/about"
                                className="group/btn inline-flex h-12 max-w-full items-center justify-between gap-3 rounded-full border border-border bg-background pl-5 sm:pl-6 pr-1.5 text-label text-foreground transition-all hover:bg-[color:var(--surface-2)] hover:shadow-lg"
                            >
                                <span className="truncate text-sm sm:text-base">Learn more</span>
                                <span className="bg-foreground shrink-0 rounded-full p-2 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover/btn:translate-x-1">
                                    <ArrowRight className="h-4 w-4 text-background" />
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

