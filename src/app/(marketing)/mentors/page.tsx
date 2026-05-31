import Link from "next/link";
import { Trophy, Brain, Users, TrendingUp, ArrowRight } from "lucide-react";
import AboutCTAStrip from "@/components/marketing/about/AboutCTAStrip";
import PageHero from "@/components/shared/PageHero";
import { getGlobalImpactStats } from "@/lib/actions/marketing";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";

export const metadata = {
    title: "Mentors | Jenga365",
    description: "Meet the seasoned professionals who give back through Jenga365, guiding the next generation of athletes, leaders, and entrepreneurs.",
};

function fmt(n: number | undefined | null): string {
    if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return "—";
    return n.toLocaleString();
}

const MENTOR_QUALITIES = [
    { Icon: Trophy,     title: "Proven Track Record",   body: "Mentors are vetted professionals with at least 5 years of industry experience and a history of impact." },
    { Icon: Brain,      title: "Structured Guidance",   body: "Each mentorship follows a structured 12-week pathway with clear milestones and accountability check-ins." },
    { Icon: Users,      title: "Community Network",     body: "Gain access to an exclusive network of leaders across sport, business, health, and technology." },
    { Icon: TrendingUp, title: "Career Acceleration",   body: "Mentees report 3× faster career progression and significantly stronger professional networks." },
];

export default async function MentorsPage() {
    const dbStats = await getGlobalImpactStats();
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
    const isAuthenticated = !!session?.user;

    const heroStats = [
        { value: fmt(dbStats?.activeMentors),         label: "Active Mentors" },
        { value: fmt(dbStats?.youthEngagedActive),    label: "Mentees Reached" },
        { value: "12 wks",                            label: "Programme Duration" },
        { value: fmt(dbStats?.mentorshipHoursTotal),  label: "Mentorship Hours" },
    ];

    return (
        <div className="flex flex-col bg-background">
            <PageHero
                eyebrow="The Guide"
                heading={<>Become a mentor.</>}
                description="Share your expertise. Shape the next generation. Jenga365 mentors are the backbone of a movement building Total Athletes and purposeful leaders across Kenya."
            >
                <div className="flex flex-wrap items-center gap-3">
                    {isAuthenticated ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex h-11 items-center gap-2 rounded-md px-5 text-label font-medium text-white transition-opacity hover:opacity-90"
                            style={{ background: "var(--brand-green)" }}
                        >
                            Go to Dashboard
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <Link
                            href="/register/mentor"
                            className="inline-flex h-11 items-center gap-2 rounded-md px-5 text-label font-medium text-white transition-opacity hover:opacity-90"
                            style={{ background: "var(--brand-green)" }}
                        >
                            Apply as mentor
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                    <Link
                        href="/about"
                        className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-5 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                    >
                        Our mission
                    </Link>
                </div>
            </PageHero>

            <section className="py-12 md:py-20 lg:py-12 md:py-24 border-b border-border">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
                    <div className="max-w-xl space-y-3">
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Why it matters</p>
                        <h2 className="text-display-md text-foreground">The mentor advantage.</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {MENTOR_QUALITIES.map(({ Icon, title, body }) => (
                            <div
                                key={title}
                                className="rounded-lg border border-border bg-background p-6 space-y-4 transition-colors hover:bg-[color:var(--surface-1)]"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                <Icon className="h-5 w-5" style={{ color: "var(--brand-green)" }} />
                                <h3 className="text-headline text-foreground">{title}</h3>
                                <p className="text-body-sm text-foreground-muted">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 lg:py-12 md:py-20" style={{ background: "var(--brand-black)" }}>
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {heroStats.map((stat) => (
                            <div key={stat.label} className="space-y-1.5 text-center">
                                <div className="text-display-sm" style={{ color: "#FFFFFF" }}>{stat.value}</div>
                                <div className="text-eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <AboutCTAStrip />
        </div>
    );
}
