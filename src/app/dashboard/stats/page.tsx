import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getGlobalImpactStats } from "@/lib/actions/marketing";
import { BarChart3, Clock, Users, TrendingUp, Trees, Leaf } from "lucide-react";

function fmt(n: number | undefined | null): string {
    if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return "—";
    return n.toLocaleString();
}

export default async function StatsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");
    const role = (session.user as any).role as string;
    if (!["Mentor", "CorporatePartner", "SuperAdmin"].includes(role)) redirect("/dashboard");

    const stats = await getGlobalImpactStats();

    const statCards = [
        { label: "Mentorship hours",    value: fmt(stats?.mentorshipHoursTotal),    Icon: Clock,       color: "var(--brand-green)" },
        { label: "Youth engaged",       value: fmt(stats?.youthEngagedActive),      Icon: Users,       color: "var(--brand-green)" },
        { label: "Active mentors",      value: fmt(stats?.activeMentors),           Icon: TrendingUp,  color: "var(--brand-green)" },
        { label: "Trees planted",       value: fmt(stats?.treesPlantedTotal),       Icon: Trees,       color: "var(--brand-green)" },
        { label: "Trees alive (audit)", value: fmt(stats?.treesAliveLatestAudit),   Icon: Leaf,        color: "var(--brand-green)" },
        { label: "Corporate partners",  value: fmt(stats?.activeCorporatePartners), Icon: BarChart3,   color: "var(--brand-green)" },
    ];

    return (
        <div className="flex-1 p-8 lg:p-12 bg-background min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-display-md text-foreground mb-2">Impact stats</h1>
                    <p className="text-body-sm text-foreground-muted">
                        Live platform-wide impact metrics — sourced from v_public_impact_aggregate.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-lg border border-border bg-background p-6 space-y-3"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <card.Icon className="w-5 h-5" style={{ color: card.color }} />
                            <div>
                                <p className="text-display-sm text-foreground">{card.value}</p>
                                <p className="text-eyebrow text-foreground-muted mt-1">{card.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {!stats && (
                    <div
                        className="py-12 text-center border border-dashed border-border rounded-lg"
                        style={{ background: "var(--surface-1)" }}
                    >
                        <p className="text-body-sm text-foreground-muted">
                            No impact report data yet. Reports are generated periodically.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
