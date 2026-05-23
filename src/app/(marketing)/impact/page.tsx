import Link from "next/link";
import { Timer, Users, GraduationCap, Trees, Leaf, Building2, ArrowRight, Heart, HandHeart } from "lucide-react";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";
import PageHero from "@/components/shared/PageHero";
import { getGlobalImpactStats } from "@/lib/actions/marketing";
import DonateButton from "@/components/shared/DonateButton";

export const metadata = {
    title: "Impact | Jenga365 — Measurable Change Through Mentorship",
    description: "Explore the social and environmental impact of the Jenga365 platform. From mentorship hours to career placements, see our data-driven results.",
};

const IMPACT_STORIES = [
    {
        quote: "Jenga365 didn't just match me with a mentor — it matched me with a future. I went from uncertainty to leading a tech team in 18 months.",
        name: "Grace Wanjiku",
        role: "Mentee — Software Engineer",
    },
    {
        quote: "The corporate partnership framework allowed our CSR budget to create measurable, trackable impact for the first time.",
        name: "James Karanja",
        role: "Corporate Partner — Safaricom",
    },
    {
        quote: "Through Jenga365's rugby programs, I learned discipline that translated directly to my professional career in finance.",
        name: "Brian Otieno",
        role: "Mentee — Financial Analyst",
    },
];

function fmt(n: number | undefined | null): string {
    if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return "—";
    return n.toLocaleString();
}

export default async function ImpactPage() {
    const dbStats = await getGlobalImpactStats();

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

    const ENVIRONMENTAL_STATS = [
        {
            value: "100%",
            label: "Digital-First Operations",
            description: "Zero paper waste through AI-driven digital mentorship matching and reporting.",
        },
        {
            value: fmt(dbStats?.treesAliveLatestAudit),
            label: "Trees Alive (Latest Audit)",
            description: "GPS-anchored survival audits at 6/12/24-month intervals via KoBoToolbox.",
        },
        {
            value: fmt(dbStats?.activeCorporatePartners),
            label: "Active ESG Partners",
            description: "Corporate partners with verified milestone-based impact agreements.",
        },
        {
            value: fmt(dbStats?.activeNgoPartners),
            label: "Active NGO Partners",
            description: "Non-profit collaborators delivering field programmes alongside the network.",
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <main>
                <PageHero
                    eyebrow="Measurable change"
                    heading={<>Our impact.</>}
                    description="Data-driven development. From mentorship hours to career placements, every initiative is measured, reported, and refined."
                />

                <section className="py-20 lg:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
                        <div className="max-w-xl space-y-3">
                            <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>By the numbers</p>
                            <h2 className="text-display-md text-foreground">Social impact metrics.</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {IMPACT_STATS.map(({ value, label, Icon }) => (
                                <div
                                    key={label}
                                    className="rounded-lg border border-border bg-background p-6 transition-colors hover:bg-[color:var(--surface-1)]"
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

                <section className="py-20 lg:py-24" style={{ background: "var(--brand-black)" }}>
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
                        <div className="max-w-xl space-y-3">
                            <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Success stories</p>
                            <h2 className="text-display-md" style={{ color: "#FFFFFF" }}>Voices of growth.</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {IMPACT_STORIES.map((story) => (
                                <div
                                    key={story.name}
                                    className="rounded-lg border p-6 space-y-5"
                                    style={{ borderColor: "rgba(255,255,255,0.10)" }}
                                >
                                    <div className="h-px w-12" style={{ background: "var(--brand-green)" }} />
                                    <p className="text-body italic" style={{ color: "rgba(255,255,255,0.78)" }}>
                                        &ldquo;{story.quote}&rdquo;
                                    </p>
                                    <div className="space-y-1">
                                        <h4 className="text-headline" style={{ color: "#FFFFFF" }}>{story.name}</h4>
                                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>{story.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 lg:py-24 border-y border-border">
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
                                        className="rounded-lg border border-border bg-background p-5 flex items-start gap-6"
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

                <section className="py-20 lg:py-24" style={{ background: "var(--surface-1)" }}>
                    <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center space-y-6">
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Join the movement</p>
                        <h2 className="text-display-md text-foreground">Your contribution multiplies.</h2>
                        <p className="text-body-lg text-foreground-muted">
                            Every donation directly funds mentorship sessions, rugby clinics, and career development programs for Kenya&apos;s next generation.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <DonateButton
                                className="inline-flex h-12 items-center gap-2 rounded-md px-6 text-label font-medium text-white transition-opacity hover:opacity-90"
                                style={{ background: "var(--brand-red)" }}
                            >
                                <Heart className="h-4 w-4" />
                                Donate now
                            </DonateButton>
                            <Link
                                href="/about"
                                className="inline-flex h-12 items-center gap-2 rounded-md border border-border bg-background px-6 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                            >
                                Learn more
                            </Link>
                        </div>
                    </div>
                </section>

                <FinalCTAStrip />
            </main>
        </div>
    );
}
