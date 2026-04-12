import Link from "next/link";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";
import PageHero from "@/components/shared/PageHero";
import { getGlobalImpactStats } from "@/lib/actions/marketing";

export const metadata = {
    title: "Impact | Jenga365 — Measurable Change Through Mentorship",
    description: "Explore the social and environmental impact of the Jenga365 platform. From mentorship hours to career placements, see our data-driven results.",
};


const IMPACT_STORIES = [
    {
        quote: "Jenga365 didn't just match me with a mentor — it matched me with a future. I went from uncertainty to leading a tech team in 18 months.",
        name: "Grace Wanjiku",
        role: "Mentee — Software Engineer",
    },
    {
        quote: "The corporate partnership framework allowed our CSR budget to create measurable, trackable impact for the first time.",
        name: "James Karanja",
        role: "Corporate Partner — Safaricom",
    },
    {
        quote: "Through Jenga365's rugby programs, I learned discipline that translated directly to my professional career in finance.",
        name: "Brian Otieno",
        role: "Mentee — Financial Analyst",
    },
];

const ENVIRONMENTAL_STATS = [
    { value: "100%", label: "Digital-First Operations", description: "Zero paper waste through AI-driven digital mentorship matching and reporting." },
    { value: "15", label: "Green Events Hosted", description: "Community events aligned with sustainable practices and environmental awareness." },
    { value: "3", label: "Tree-Planting Partners", description: "Active partnerships with environmental NGOs for community reforestation." },
];

export default async function ImpactPage() {
    const dbStats = await getGlobalImpactStats();

    const IMPACT_STATS = [
        {
            value: dbStats?.totalMentorshipHours ? `${dbStats.totalMentorshipHours.toLocaleString()}+` : "10,000+",
            label: "Mentorship Hours Logged",
            icon: "timer",
        },
        { value: "500+", label: "Active Mentors", icon: "groups" },
        {
            value: dbStats?.youthEngaged ? `${dbStats.youthEngaged.toLocaleString()}+` : "2,500+",
            label: "Youth Impacted",
            icon: "school",
        },
        { value: "95%", label: "Mentee Satisfaction", icon: "trending_up" },
        { value: "47", label: "Counties Reached", icon: "map" },
        {
            value: dbStats?.totalDonations
                ? `KES ${Number(dbStats.totalDonations).toLocaleString()}+`
                : "KES 12M+",
            label: "Funds Deployed",
            icon: "payments",
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <main>
                <PageHero
                    eyebrow="Measurable Change"
                    heading={<>Our <span className="italic text-primary">Impact.</span></>}
                    description="Data-driven development. From mentorship hours to career placements, every initiative is measured, reported, and refined."
                    bgImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1920&auto=format&fit=crop"
                    bgFallback="https://images.unsplash.com/photo-1546519638405-a2b98cd5d9f2?q=80&w=1920&auto=format&fit=crop"
                />

                {/* ── Impact Stats Grid ── */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="space-y-4 mb-16">
                            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--primary-green)] block font-bold">
                                By The Numbers
                            </span>
                            <h2 className="font-serif font-bold text-4xl md:text-5xl text-black uppercase tracking-tighter">
                                Social Impact <span className="italic text-[var(--primary-green)]">Metrics.</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {IMPACT_STATS.map((stat, i) => (
                                <div
                                    key={i}
                                    className="bg-[var(--off-white)] border border-[var(--border)] p-8 md:p-10 group hover:border-[var(--primary-green)] transition-all duration-500 relative overflow-hidden"
                                >
                                    {/* Accent bar */}
                                    <div className="absolute top-0 left-0 h-[3px] w-0 group-hover:w-full bg-[var(--primary-green)] transition-all duration-700" />
                                    
                                    <div className="flex items-start justify-between mb-6">
                                        <span className="material-symbols-outlined text-3xl text-[var(--primary-green)] opacity-60 group-hover:opacity-100 transition-opacity">
                                            {stat.icon}
                                        </span>
                                    </div>
                                    <span className="block text-4xl md:text-5xl font-bold text-black mb-3 font-mono tracking-tight">
                                        {stat.value}
                                    </span>
                                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/50 font-bold">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Impact Stories ── */}
                <section className="py-24 bg-black text-white relative overflow-hidden">
                    {/* Background accents */}
                    <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-[var(--primary-green)] opacity-[0.03] blur-[100px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                        <div className="space-y-4 mb-16">
                            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--primary-green)] block font-bold">
                                Success Stories
                            </span>
                            <h2 className="font-serif font-bold text-4xl md:text-5xl text-white uppercase tracking-tighter">
                                Voices of <span className="italic text-[var(--primary-green)]">Growth.</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {IMPACT_STORIES.map((story, i) => (
                                <div
                                    key={i}
                                    className="border border-white/10 p-10 space-y-8 hover:border-[var(--primary-green)]/30 transition-all duration-500 group"
                                >
                                    <div className="w-12 h-px bg-[var(--primary-green)] group-hover:w-20 transition-all duration-500" />
                                    <p className="font-light text-white/70 leading-relaxed text-lg italic">
                                        &ldquo;{story.quote}&rdquo;
                                    </p>
                                    <div className="space-y-2">
                                        <h4 className="font-serif font-bold text-xl text-white uppercase tracking-tight">
                                            {story.name}
                                        </h4>
                                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--primary-green)] font-bold block">
                                            {story.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Environmental Impact ── */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--primary-green)] block font-bold">
                                        ESG Compliance
                                    </span>
                                    <h2 className="font-serif font-bold text-4xl md:text-5xl text-black uppercase tracking-tighter">
                                        Environmental <span className="italic text-[var(--primary-green)]">Stewardship.</span>
                                    </h2>
                                </div>
                                <p className="text-[var(--text-secondary)] text-lg font-light leading-relaxed">
                                    Through our corporate partnerships, we align mentorship activities with sustainable environmental practices. Every program is evaluated against ESG criteria to ensure our growth doesn&apos;t come at the planet&apos;s expense.
                                </p>
                                <Link
                                    href="/resources"
                                    className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--primary-green)] hover:text-[var(--red)] transition-colors group"
                                >
                                    View ESG Report
                                    <span className="w-6 h-px bg-[var(--primary-green)] group-hover:bg-[var(--red)] group-hover:w-10 transition-all" />
                                </Link>
                            </div>

                            <div className="space-y-6">
                                {ENVIRONMENTAL_STATS.map((stat, i) => (
                                    <div
                                        key={i}
                                        className="bg-[var(--off-white)] border border-[var(--border)] p-8 flex items-start gap-8 group hover:border-[var(--primary-green)] transition-all"
                                    >
                                        <span className="text-4xl font-bold font-mono text-[var(--primary-green)] leading-none min-w-[80px]">
                                            {stat.value}
                                        </span>
                                        <div className="space-y-2">
                                            <h4 className="font-serif font-bold text-lg text-black uppercase tracking-tight">
                                                {stat.label}
                                            </h4>
                                            <p className="font-light text-[var(--text-secondary)] leading-relaxed">
                                                {stat.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Donation CTA ── */}
                <section className="py-24 bg-[var(--off-white)] border-y border-[var(--border)]">
                    <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
                        <div className="space-y-8">
                            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--primary-green)] block font-bold">
                                Join The Movement
                            </span>
                            <h2 className="font-serif font-bold text-4xl md:text-5xl text-black uppercase tracking-tighter">
                                Your Contribution <span className="italic text-[var(--primary-green)]">Multiplies.</span>
                            </h2>
                            <p className="text-[var(--text-secondary)] text-lg font-light leading-relaxed max-w-2xl mx-auto">
                                Every donation directly funds mentorship sessions, rugby clinics, and career development programs for Kenya&apos;s next generation.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                                <Link
                                    href="/donate"
                                    className="px-12 py-5 bg-[var(--primary-green)] text-white font-mono text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-all duration-500 border border-transparent hover:border-[var(--red)]"
                                >
                                    Donate Now
                                    <span className="material-symbols-outlined ml-2 align-middle text-sm">payments</span>
                                </Link>
                                <Link
                                    href="/about"
                                    className="px-12 py-5 border border-black/10 text-black font-mono text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-black hover:text-white transition-all duration-500"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ── */}
                <FinalCTAStrip />
            </main>
        </div>
    );
}
