import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getGlobalImpactStats } from "@/lib/actions/marketing";

function fmt(n: number | undefined | null): string {
    if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return "—";
    return n.toLocaleString();
}

export default async function OurPhilosophy() {
    const stats = await getGlobalImpactStats();

    const bottomStats = [
        { val: "2023",                                  label: "Year founded" },
        { val: fmt(stats?.youthEngagedActive),          label: "Mentees engaged" },
        { val: fmt(stats?.activeMentors),               label: "Active mentors" },
        { val: fmt(stats?.activeCorporatePartners),     label: "Corporate partners" },
        { val: fmt(stats?.activeNgoPartners),           label: "NGO partners" },
    ];

    return (
        <section className="border-b border-border" style={{ background: "var(--surface-1)" }}>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28">
                <div className="flex items-center gap-3 mb-12">
                    <div className="h-px w-8" style={{ background: "var(--brand-green)" }} />
                    <span className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                        Our philosophy
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                    <div className="lg:col-span-7 space-y-8">
                        <blockquote
                            className="text-display-md text-foreground border-l-4 pl-6"
                            style={{ borderColor: "var(--brand-green)" }}
                        >
                            &ldquo;Building the <span style={{ color: "var(--brand-green)" }}>Total Athlete</span> requires nourishing the body, the mind, and the community that sustains them.&rdquo;
                        </blockquote>

                        <p className="text-body-lg text-foreground-muted max-w-xl">
                            Jenga365 was born from the realisation that athletic talent alone
                            isn&apos;t enough to break cycles of poverty. We focus on the holistic
                            ecosystem surrounding the player — connecting mentors, unlocking
                            financial literacy, and stewarding the environments our athletes call
                            home.
                        </p>

                        <Link
                            href="/impact"
                            className="inline-flex items-center gap-2 text-label font-medium"
                            style={{ color: "var(--brand-green)" }}
                        >
                            Read our foundation paper
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="lg:col-span-5 flex flex-col gap-3">
                        <PhilosophyCard
                            heading="Mission"
                            body="To leverage the power of rugby and structured mentorship as a catalyst for educational advancement and vocational stability across Kenya's urban centres."
                            ctaLabel="Join the network"
                            ctaHref="/register"
                            primary
                        />
                        <PhilosophyCard
                            heading="The approach"
                            body="We integrate world-class coaching with mandatory mentorship and digital literacy programmes — ensuring every participant has a future, with or without a professional contract."
                            ctaLabel="Meet our mentors"
                            ctaHref="/mentors"
                        />
                    </div>
                </div>

                <div className="mt-16 pt-10 border-t border-border grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {bottomStats.map((s) => (
                        <div key={s.label}>
                            <p className="text-display-sm text-foreground">{s.val}</p>
                            <p className="mt-2 text-eyebrow text-foreground-muted">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PhilosophyCard({
    heading,
    body,
    ctaLabel,
    ctaHref,
    primary = false,
}: {
    heading: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
    primary?: boolean;
}) {
    return (
        <div
            className="rounded-lg border border-border bg-background p-6 lg:p-7 space-y-3 transition-colors hover:bg-[color:var(--surface-2)]"
            style={{ boxShadow: "var(--shadow-sm)" }}
        >
            <h3 className="text-headline text-foreground">{heading}</h3>
            <p className="text-body-sm text-foreground-muted">{body}</p>
            <Link
                href={ctaHref}
                className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-label font-medium transition-opacity hover:opacity-90"
                style={
                    primary
                        ? { background: "var(--brand-green)", color: "#FFFFFF" }
                        : { background: "var(--surface-2)", color: "var(--foreground)" }
                }
            >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}
