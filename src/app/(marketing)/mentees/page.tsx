import Link from "next/link";
import { Bot, Route, MessageSquare, ShieldCheck, BookOpen, UsersRound, ArrowRight } from "lucide-react";
import AboutCTAStrip from "@/components/marketing/about/AboutCTAStrip";
import PageHero from "@/components/shared/PageHero";

export const metadata = {
    title: "Mentees | Jenga365",
    description: "Join Jenga365 as a mentee and get matched with a seasoned mentor who will guide your growth in sport, career, and life.",
};

const PROGRAMME_STEPS = [
    { step: "01", title: "Apply & onboard",      body: "Complete your profile and take the AI-powered assessment. Our system builds a deep picture of your goals, learning style, and aspirations." },
    { step: "02", title: "Get matched",          body: "Our AI matching engine pairs you with up to 3 compatible mentors based on sector fit, personality, and availability." },
    { step: "03", title: "Begin your pathway",   body: "Your 12-week structured programme launches with a kick-off session. Weekly check-ins keep you on track and accountable." },
    { step: "04", title: "Grow & graduate",      body: "Complete milestones, build your network, and unlock the alumni community — a lifetime of continued support." },
];

const MENTEE_BENEFITS = [
    { Icon: Bot,           title: "AI-powered matching",   body: "No random pairings. Our vector-similarity engine finds mentors who align with your specific goals and personality." },
    { Icon: Route,         title: "Personalised pathway",  body: "A structured learning journey tailored to where you are today and where you want to be in 90 days." },
    { Icon: MessageSquare, title: "1-on-1 sessions",       body: "Direct access to your mentor through scheduled video calls, async messaging, and session notes." },
    { Icon: ShieldCheck,   title: "Verified mentors",      body: "Every mentor is background-checked, community-vetted, and committed to your growth before they join the platform." },
    { Icon: BookOpen,      title: "Exclusive resources",   body: "Gain access to curated articles, toolkits, and playbooks from Jenga365's knowledge library." },
    { Icon: UsersRound,    title: "Alumni network",        body: "Graduate into a lifelong community of Jenga365 alumni spanning rugby, business, health, and beyond." },
];

export default function MenteesPage() {
    return (
        <div className="flex flex-col bg-background">
            <PageHero
                eyebrow="The journey"
                heading={<>Find your mentor.</>}
                description="Jenga365 connects ambitious young professionals and athletes with seasoned leaders who have walked the road before. Start your structured mentorship journey today."
            >
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/register"
                        className="inline-flex h-11 items-center gap-2 rounded-md px-5 text-label font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-green)" }}
                    >
                        Apply as mentee
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/resources"
                        className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-5 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                    >
                        Browse resources
                    </Link>
                </div>
            </PageHero>

            <section className="py-20 lg:py-24 border-b border-border">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
                    <div className="max-w-xl space-y-3">
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>The programme</p>
                        <h2 className="text-display-md text-foreground">How it works.</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {PROGRAMME_STEPS.map((s) => (
                            <div
                                key={s.step}
                                className="rounded-lg border border-border bg-background p-6 space-y-4 transition-colors hover:bg-[color:var(--surface-1)]"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                <span className="text-display-sm" style={{ color: "var(--brand-green)" }}>{s.step}</span>
                                <h3 className="text-headline text-foreground">{s.title}</h3>
                                <p className="text-body-sm text-foreground-muted">{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 lg:py-24 border-b border-border" style={{ background: "var(--surface-1)" }}>
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
                    <div className="max-w-xl space-y-3">
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>What you get</p>
                        <h2 className="text-display-md text-foreground">Built for growth.</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MENTEE_BENEFITS.map(({ Icon, title, body }) => (
                            <div
                                key={title}
                                className="rounded-lg border border-border bg-background p-6 space-y-4 transition-colors hover:bg-[color:var(--surface-2)]"
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

            <AboutCTAStrip />
        </div>
    );
}
