import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getGlobalImpactStats } from "@/lib/actions/marketing";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";

function fmt(n: number | undefined | null): string {
    if (n === undefined || n === null || !Number.isFinite(Number(n)) || Number(n) <= 0) return "—";
    return new Intl.NumberFormat("en-US").format(Number(n));
}

export default async function ImpactSocialPage() {
    const stats = await getGlobalImpactStats();
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
    const isAuthenticated = !!session?.user;

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 py-20 container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
                    <span className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                        Measurable change
                    </span>
                    <h1 className="text-display-lg text-foreground">Direct social impact</h1>
                    <p className="text-body-lg text-foreground-muted leading-relaxed">
                        Visualizing the human connection behind the numbers. Our social impact engine tracks every hour of mentorship and every success story.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
                    <ImpactCard
                        title="Active mentees"
                        value={fmt(stats?.youthEngagedActive)}
                        sub="Verified, currently engaged"
                    />
                    <ImpactCard
                        title="Active mentors"
                        value={fmt(stats?.activeMentors)}
                        sub="Approved & active"
                    />
                    <ImpactCard
                        title="Mentorship hours"
                        value={fmt(stats?.mentorshipHoursTotal)}
                        sub="Logged across the platform"
                    />
                </div>

                <p className="max-w-2xl mx-auto text-center text-body-sm text-foreground-muted italic mb-12">
                    Verified figures from our operational data. We display a dash (—) for any metric pending M&amp;E sign-off.
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                    <Link
                        href="/impact/map"
                        className="inline-flex items-center gap-2 h-11 rounded-md px-5 text-label font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-green)" }}
                    >
                        View funding map <ArrowRight className="h-4 w-4" />
                    </Link>
                    {isAuthenticated ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 h-11 rounded-md border border-border bg-background px-5 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/register/mentorship"
                            className="inline-flex items-center gap-2 h-11 rounded-md border border-border bg-background px-5 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                        >
                            Join the movement
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
}

function ImpactCard({ title, value, sub }: { title: string; value: string; sub: string }) {
    return (
        <div
            className="rounded-md border border-border bg-background p-10 text-center"
            style={{ boxShadow: "var(--shadow-sm)" }}
        >
            <h3 className="text-eyebrow text-foreground-muted mb-4">{title}</h3>
            <div className="text-display-md text-foreground mb-2">{value}</div>
            <p className="text-body-sm text-foreground-muted italic py-2 border-t border-border mt-4">{sub}</p>
        </div>
    );
}
