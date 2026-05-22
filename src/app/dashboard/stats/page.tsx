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
        { label: "Mentorship Hours",   value: fmt(stats?.mentorshipHoursTotal),    icon: Clock,       color: "text-blue-500" },
        { label: "Youth Engaged",      value: fmt(stats?.youthEngagedActive),      icon: Users,       color: "text-[var(--brand-green)]" },
        { label: "Active Mentors",     value: fmt(stats?.activeMentors),           icon: TrendingUp,  color: "text-purple-500" },
        { label: "Trees Planted",      value: fmt(stats?.treesPlantedTotal),       icon: Trees,       color: "text-[var(--brand-green)]" },
        { label: "Trees Alive (Audit)", value: fmt(stats?.treesAliveLatestAudit), icon: Leaf,         color: "text-emerald-600" },
        { label: "Corporate Partners", value: fmt(stats?.activeCorporatePartners), icon: BarChart3,   color: "text-amber-500" },
    ];

    return (
        <div className="flex-1 p-8 lg:p-12 bg-background min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="font-playfair text-4xl font-black text-foreground mb-2">Impact Stats</h1>
                    <p className="text-muted-foreground font-mono text-sm">
                        Live platform-wide impact metrics — sourced from v_public_impact_aggregate.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {statCards.map((card) => (
                        <div key={card.label} className="bg-card border border-border/50 rounded-lg p-6 space-y-3">
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                            <div>
                                <p className="font-playfair text-3xl font-black text-foreground">{card.value}</p>
                                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-1">{card.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {!stats && (
                    <div className="py-12 text-center border border-dashed border-border rounded-lg">
                        <p className="font-mono text-sm text-muted-foreground">No impact report data yet. Reports are generated periodically.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
