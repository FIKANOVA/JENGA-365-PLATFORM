"use client";

export default function ImpactTicker({ stats }: { stats?: any }) {
    const displayStats = [
        `${stats?.youthImpacted ?? stats?.livesImpacted?.toLocaleString() ?? "750,000+"} LIVES IMPACTED`,
        `${stats?.activeMentors ?? stats?.volunteersCount?.toLocaleString() ?? "12,000+"} MENTORS REGISTERED`,
        `${stats?.mentorshipHours ?? "9,840+"} MENTORSHIP HOURS LOGGED`,
        `${stats?.treesPlanted ?? "5,000+"} TREES PLANTED`,
        `${stats?.activePartnerships ?? "45"} ACTIVE CORPORATE PARTNERS`,
        `${stats?.countriesReached ?? "7"} COUNTRIES REACHED`,
    ];

    return (
        <section className="bg-foreground py-4 overflow-hidden whitespace-nowrap border-y border-border/50">
            <div className="flex items-center animate-ticker hover:scale-105 transition-transform">
                {[...displayStats, ...displayStats, ...displayStats].map((stat, i) => (
                    <div key={i} className="flex items-center">
                        {i % displayStats.length === 0 && (
                            <span className="text-primary font-black px-8 text-sm uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined scale-75">campaign</span> LATEST IMPACT:
                            </span>
                        )}
                        <span className="text-white font-medium px-4 text-sm font-sans tracking-wide">
                            {stat}
                        </span>
                        <span className="text-primary px-4 font-bold text-xl">•</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
