import Link from "next/link";

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
        { label: "Active mentors", value: fmt(stats?.activeMentors ?? stats?.volunteersCount), href: "/mentors#directory" },
        { label: "Youth engaged", value: fmt(stats?.youthImpacted ?? stats?.livesImpacted), href: "/mentees#directory" },
        { label: "Mentorship hours", value: fmt(stats?.mentorshipHours), href: "/impact" },
        { label: "Trees planted (verified)", value: fmt(stats?.treesPlanted), href: "/impact#environmental" },
        { label: "Corporate partners", value: fmt(stats?.activePartnerships), href: "/impact#partners" },
        { label: "NGO partners", value: fmt(stats?.activeNgoPartners), href: "/impact#partners" },
    ];

    const Stat = ({ label, value, href }: { label: string; value: string; href: string }) => (
        <Link
            href={href}
            className="group flex items-center gap-3 px-8 shrink-0 transition-opacity hover:opacity-80 cursor-pointer"
        >
            <span className="text-display-sm leading-none group-hover:text-[color:var(--brand-green)] transition-colors" style={{ color: "#ffffff" }}>
                {value}
            </span>
            <span className="text-label whitespace-nowrap group-hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.65)" }}>
                {label}
            </span>
            <span className="ml-5 h-5 w-px" style={{ background: "rgba(255,255,255,0.15)" }} aria-hidden />
        </Link>
    );

    return (
        <section
            className="jenga-marquee relative border-y"
            style={{ background: "var(--brand-black)", borderColor: "rgba(255,255,255,0.08)" }}
            aria-label="Verified impact metrics"
        >
            {/* Screen-reader / no-motion accessible version */}
            <ul className="sr-only">
                {items.map((i) => (
                    <li key={i.label}>
                        <Link href={i.href}>{i.label}: {i.value}</Link>
                    </li>
                ))}
            </ul>

            {/* Edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10"
                 style={{ background: "linear-gradient(to right, var(--brand-black), transparent)" }} aria-hidden />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10"
                 style={{ background: "linear-gradient(to left, var(--brand-black), transparent)" }} aria-hidden />

            {/* Two identical sets => seamless -50% loop */}
            <div className="jenga-marquee-track flex w-max py-6" aria-hidden>
                {[0, 1].map((set) => (
                    <div key={set} className="flex shrink-0">
                        {items.map((item) => (
                            <Stat key={`${set}-${item.label}`} label={item.label} value={item.value} href={item.href} />
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}
