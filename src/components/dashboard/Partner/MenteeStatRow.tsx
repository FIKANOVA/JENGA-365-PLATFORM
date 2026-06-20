"use client"

interface Props {
    sessionsCount: number;
    progress: number;
    lastSessionDate?: Date;
    matchScorePct?: number;
}

export default function MenteeStatRow({ sessionsCount, progress, lastSessionDate, matchScorePct }: Props) {
    const daysSinceLastSession = lastSessionDate
        ? Math.floor((new Date().getTime() - new Date(lastSessionDate).getTime()) / (1000 * 3600 * 24))
        : null;

    const overdueLast = daysSinceLastSession !== null && daysSinceLastSession > 14;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label="Sessions completed"
                value={sessionsCount.toString()}
                delta="Live"
                deltaColor="var(--brand-green)"
            />
            <StatCard
                label="Pathway progress"
                value={`${progress}%`}
                delta="Live"
                deltaColor="var(--brand-green)"
                suffix={
                    <div
                        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ml-2"
                        style={{ borderColor: "var(--brand-green)", borderTopColor: "transparent" }}
                    />
                }
            />
            <StatCard
                label="Days since last session"
                value={daysSinceLastSession !== null ? daysSinceLastSession.toString() : "—"}
                delta={overdueLast ? "Overdue" : "On track"}
                deltaColor={overdueLast ? "var(--brand-red)" : "var(--brand-green)"}
            />
            <StatCard
                label="Mentor match score"
                value={typeof matchScorePct === "number" ? `${matchScorePct}%` : "—"}
                delta="Goals · Location · Availability"
                deltaColor="var(--foreground-muted)"
                valueColor="var(--brand-red)"
            />
        </div>
    );
}

function StatCard({
    label,
    value,
    delta,
    deltaColor,
    suffix,
    valueColor,
}: {
    label: string;
    value: string;
    delta: string;
    deltaColor: string;
    suffix?: React.ReactNode;
    valueColor?: string;
}) {
    return (
        <div
            className="rounded-md border border-border bg-background p-6 flex flex-col justify-between"
            style={{ boxShadow: "var(--shadow-sm)" }}
        >
            <span className="text-eyebrow text-foreground-muted mb-4">{label}</span>
            <div className="flex items-baseline gap-2">
                <h3
                    className="text-display-md"
                    style={valueColor ? { color: valueColor } : { color: "var(--foreground)" }}
                >
                    {value}
                </h3>
                {suffix}
            </div>
            <p className="text-eyebrow mt-4" style={{ color: deltaColor }}>
                {delta}
            </p>
        </div>
    );
}
