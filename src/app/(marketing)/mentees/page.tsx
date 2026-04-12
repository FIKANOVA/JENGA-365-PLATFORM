import Link from "next/link";
import AboutCTAStrip from "@/components/marketing/about/AboutCTAStrip";
import PageHero from "@/components/shared/PageHero";

export const metadata = {
    title: "Mentees | Jenga365",
    description: "Join Jenga365 as a mentee and get matched with a seasoned mentor who will guide your growth in sport, career, and life.",
};

const PROGRAMME_STEPS = [
    { step: "01", title: "Apply & Onboard", body: "Complete your profile and take the AI-powered assessment. Our system builds a deep picture of your goals, learning style, and aspirations." },
    { step: "02", title: "Get Matched", body: "Our AI matching engine pairs you with up to 3 compatible mentors based on sector fit, personality, and availability." },
    { step: "03", title: "Begin Your Pathway", body: "Your 12-week structured programme launches with a kick-off session. Weekly check-ins keep you on track and accountable." },
    { step: "04", title: "Grow & Graduate", body: "Complete milestones, build your network, and unlock the alumni community — a lifetime of continued support." },
];

const MENTEE_BENEFITS = [
    { icon: "smart_toy", title: "AI-Powered Matching", body: "No random pairings. Our vector-similarity engine finds mentors who align with your specific goals and personality." },
    { icon: "route", title: "Personalised Pathway", body: "A structured learning journey tailored to where you are today and where you want to be in 90 days." },
    { icon: "forum", title: "1-on-1 Sessions", body: "Direct access to your mentor through scheduled video calls, async messaging, and session notes." },
    { icon: "verified", title: "Verified Mentors", body: "Every mentor is background-checked, community-vetted, and committed to your growth before they join the platform." },
    { icon: "workspace_premium", title: "Exclusive Resources", body: "Gain access to curated articles, toolkits, and playbooks from Jenga365's knowledge library." },
    { icon: "group_add", title: "Alumni Network", body: "Graduate into a lifelong community of Jenga365 alumni spanning rugby, business, health, and beyond." },
];

export default function MenteesPage() {
    return (
        <div className="flex flex-col bg-[var(--off-white)]">
            {/* Hero */}
            <PageHero
                eyebrow="The Journey"
                heading={<>Find Your<br /><span className="italic text-primary">Mentor.</span></>}
                description="Jenga365 connects ambitious young professionals and athletes with seasoned leaders who have walked the road before. Start your structured mentorship journey today."
                bgImage="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1920&auto=format&fit=crop"
                bgFallback="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1920&auto=format&fit=crop"
            >
                <div className="flex flex-wrap items-center gap-5">
                    <Link href="/register" className="bg-primary text-white px-8 py-4 font-mono text-[10px] uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-xl">
                        Apply as Mentee
                    </Link>
                    <Link href="/resources" className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors border-b border-white/30 pb-0.5">
                        Browse Resources →
                    </Link>
                </div>
            </PageHero>

            {/* How it works */}
            <section className="py-28 border-b border-[var(--border)]">
                <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
                    <div className="space-y-4">
                        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[var(--text-muted)]">The Programme</span>
                        <h2 className="font-serif font-black text-5xl uppercase tracking-tighter leading-[0.95]">
                            How It<br /><span className="italic text-[var(--primary-green)]">Works.</span>
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)]">
                        {PROGRAMME_STEPS.map((s) => (
                            <div key={s.step} className="bg-[var(--off-white)] p-10 space-y-6 group hover:bg-white transition-colors">
                                <span className="font-serif font-black text-6xl text-[var(--border)] group-hover:text-[var(--primary-green)]/20 transition-colors leading-none">{s.step}</span>
                                <h3 className="font-serif font-black text-xl uppercase tracking-tight">{s.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits grid */}
            <section className="py-28 border-b border-[var(--border)] bg-white">
                <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
                    <div className="space-y-4 max-w-xl">
                        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[var(--text-muted)]">What you get</span>
                        <h2 className="font-serif font-black text-5xl uppercase tracking-tighter leading-[0.95]">
                            Built for<br /><span className="italic text-[var(--primary-green)]">Growth.</span>
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">
                        {MENTEE_BENEFITS.map((b) => (
                            <div key={b.title} className="bg-white p-10 space-y-5 group hover:bg-[var(--off-white)] transition-colors">
                                <span className="material-symbols-outlined text-3xl text-[var(--primary-green)]">{b.icon}</span>
                                <h3 className="font-serif font-black text-lg uppercase tracking-tight">{b.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">{b.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <AboutCTAStrip />
        </div>
    );
}
