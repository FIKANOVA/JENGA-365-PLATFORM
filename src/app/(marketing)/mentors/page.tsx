import Link from "next/link";
import AboutCTAStrip from "@/components/marketing/about/AboutCTAStrip";
import PageHero from "@/components/shared/PageHero";

export const metadata = {
    title: "Mentors | Jenga365",
    description: "Meet the seasoned professionals who give back through Jenga365 — guiding the next generation of athletes, leaders, and entrepreneurs.",
};

const MENTOR_QUALITIES = [
    { icon: "emoji_events", title: "Proven Track Record", body: "Mentors are vetted professionals with at least 5 years of industry experience and a history of impact." },
    { icon: "psychology", title: "Structured Guidance", body: "Each mentorship follows a structured 12-week pathway with clear milestones and accountability check-ins." },
    { icon: "groups", title: "Community Network", body: "Gain access to an exclusive network of leaders across sport, business, health, and technology." },
    { icon: "trending_up", title: "Career Acceleration", body: "Mentees report 3× faster career progression and significantly stronger professional networks." },
];

const MENTOR_SECTORS = [
    "Rugby & Elite Sport", "Business & Entrepreneurship", "Technology & Innovation",
    "Health & Wellness", "Finance & Investment", "Law & Governance",
    "Media & Communications", "Social Impact & NGO",
];

export default function MentorsPage() {
    return (
        <div className="flex flex-col bg-[var(--off-white)]">
            {/* Hero */}
            <PageHero
                eyebrow="The Guide"
                heading={<>Become a<br /><span className="italic text-primary">Mentor.</span></>}
                description="Share your expertise. Shape the next generation. Jenga365 mentors are the backbone of a movement building Total Athletes and purposeful leaders across Kenya."
                bgImage="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1920&auto=format&fit=crop"
                bgFallback="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1920&auto=format&fit=crop"
            >
                <div className="flex flex-wrap items-center gap-5">
                    <Link href="/register" className="bg-primary text-white px-8 py-4 font-mono text-[10px] uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-xl">
                        Apply as Mentor
                    </Link>
                    <Link href="/about" className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors border-b border-white/30 pb-0.5">
                        Our Mission →
                    </Link>
                </div>
            </PageHero>

            {/* Why Mentor */}
            <section className="py-28 border-b border-[var(--border)]">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="space-y-16">
                        <div className="space-y-4 max-w-xl">
                            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[var(--text-muted)]">Why it matters</span>
                            <h2 className="font-serif font-black text-5xl uppercase tracking-tighter leading-[0.95]">
                                The Mentor<br /><span className="italic text-[var(--primary-green)]">Advantage.</span>
                            </h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)]">
                            {MENTOR_QUALITIES.map((q) => (
                                <div key={q.title} className="bg-[var(--off-white)] p-10 space-y-5 group hover:bg-white transition-colors">
                                    <span className="material-symbols-outlined text-4xl text-[var(--primary-green)] group-hover:scale-110 transition-transform inline-block">{q.icon}</span>
                                    <h3 className="font-serif font-black text-lg uppercase tracking-tight">{q.title}</h3>
                                    <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">{q.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-black text-white py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
                        {[
                            { value: "120+", label: "Active Mentors" },
                            { value: "94%", label: "Mentee Satisfaction" },
                            { value: "12 wks", label: "Programme Duration" },
                            { value: "8", label: "Sectors Covered" },
                        ].map((stat) => (
                            <div key={stat.label} className="px-12 py-10 bg-black text-center">
                                <div className="font-serif font-black text-5xl text-white tracking-tighter">{stat.value}</div>
                                <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/50 mt-2">{stat.label}</div>
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
