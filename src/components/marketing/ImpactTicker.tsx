/**
 * Authentic baseline impact metrics — DESIGN.md §12.
 *
 * Per Moseti (2026-05-22): replace the prior vanity numbers ("750K+ Lives",
 * "12,000 Mentors") with verified DB stats. If a stat hasn't yet been verified,
 * render "—" rather than an aspirational figure. Credibility > optics.
 */
interface ImpactStats {
    youthImpacted?: number;
    livesImpacted?: number;
    activeMentors?: number;
    volunteersCount?: number;
    mentorshipHours?: number;
    treesPlanted?: number;
    activePartnerships?: number;
    activeNgoPartners?: number;
    countriesReached?: number;
}

function fmt(n: unknown): string {
    if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

export default function ImpactTicker({ stats }: { stats?: ImpactStats }) {
    const items = [
        { label: "Active mentors", value: fmt(stats?.activeMentors ?? stats?.volunteersCount) },
        { label: "Youth engaged", value: fmt(stats?.youthImpacted ?? stats?.livesImpacted) },
        { label: "Mentorship hours", value: fmt(stats?.mentorshipHours) },
        { label: "Trees planted (verified)", value: fmt(stats?.treesPlanted) },
        { label: "Corporate partners", value: fmt(stats?.activePartnerships) },
        { label: "NGO partners", value: fmt(stats?.activeNgoPartners) },
    ];

    return (
        <section
            className="border-y border-border"
            style={{ background: "var(--surface-1)" }}
            aria-label="Verified impact metrics"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-8">
                    {items.map((item) => (
                        <div key={item.label} className="flex flex-col gap-1">
                            <span className="text-display-sm" style={{ color: "var(--foreground)" }}>
                                {item.value}
                            </span>
                            <span
                                className="text-label"
                                style={{ color: "var(--foreground-muted)" }}
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
                <p
                    className="mt-6 text-body-sm"
                    style={{ color: "var(--foreground-subtle)" }}
                >
                    Verified, GPS-anchored where applicable. We publish dashes (—) for metrics
                    pending M&amp;E sign-off.
                </p>
            </div>
        </section>
    );
}
