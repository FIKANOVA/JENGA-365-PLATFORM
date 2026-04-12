import Link from "next/link";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";
import PageHero from "@/components/shared/PageHero";

export const metadata = {
    title: "Resources | Jenga365 — Articles, Downloads, Video & Voices",
    description: "Explore the Jenga365 knowledge hub — articles, downloadable playbooks, video sessions, and X-Spaces conversations.",
};

const SECTIONS = [
    {
        label: "Articles",
        href: "/resources/articles",
        icon: "article",
        color: "var(--primary-green)",
        heading: "Insights & Thought Leadership",
        body: "In-depth articles on mentorship, rugby development, financial literacy, and community impact — written by practitioners and experts.",
        cta: "Browse Articles",
        bg: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop",
    },
    {
        label: "Downloads",
        href: "/resources/downloads",
        icon: "download",
        color: "#c00000",
        heading: "Guides, Playbooks & Templates",
        body: "Downloadable PDFs, checklists, mentor readiness guides, and strategic frameworks built by the Jenga365 team.",
        cta: "Get Downloads",
        bg: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop",
    },
    {
        label: "Video",
        href: "/resources/video",
        icon: "play_circle",
        color: "var(--primary-green)",
        heading: "Talks, Sessions & Tutorials",
        body: "Recorded mentorship sessions, platform walkthroughs, athlete interviews, and keynote talks from Jenga365 events.",
        cta: "Watch Videos",
        bg: "https://images.unsplash.com/photo-1492724724894-7464c27d0ceb?q=80&w=800&auto=format&fit=crop",
    },
    {
        label: "Voices",
        href: "/resources/voices",
        icon: "record_voice_over",
        color: "#111111",
        heading: "X-Spaces & X-Threads",
        body: "Live and recorded X-Spaces conversations, curated X-Threads, and community discussions shaping the Jenga365 narrative.",
        cta: "Explore Voices",
        bg: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=800&auto=format&fit=crop",
    },
];

export default function ResourcesHubPage() {
    return (
        <div className="min-h-screen bg-white">
            <PageHero
                eyebrow="Knowledge Hub"
                heading={<>The Jenga365 <span className="italic text-primary">Library.</span></>}
                description="Articles, downloads, video sessions, and community voices — everything you need to grow, in one place."
                bgImage="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1920&auto=format&fit=crop"
                bgFallback="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1920&auto=format&fit=crop"
                minHeight="min-h-[55vh]"
            />

            {/* Section grid */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border)]">
                    {SECTIONS.map((section) => (
                        <Link
                            key={section.href}
                            href={section.href}
                            className="group relative bg-white overflow-hidden flex flex-col min-h-[400px]"
                        >
                            {/* Background image — subtle on hover */}
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={section.bg}
                                    alt=""
                                    className="w-full h-full object-cover opacity-[0.06] group-hover:opacity-[0.14] group-hover:scale-105 transition-all duration-700"
                                />
                            </div>

                            <div className="relative z-10 flex flex-col h-full p-10 md:p-12">
                                {/* Icon + label */}
                                <div className="flex items-center gap-3">
                                    <span
                                        className="material-symbols-outlined text-3xl transition-transform group-hover:scale-110 duration-300"
                                        style={{ color: section.color }}
                                    >
                                        {section.icon}
                                    </span>
                                    <span
                                        className="font-mono text-[9px] uppercase tracking-[0.3em] font-bold"
                                        style={{ color: section.color }}
                                    >
                                        {section.label}
                                    </span>
                                </div>

                                {/* Text — pushed to bottom */}
                                <div className="mt-auto space-y-4 pt-12">
                                    <h2 className="font-serif font-black text-2xl md:text-3xl text-black uppercase tracking-tighter leading-none group-hover:text-[var(--primary-green)] transition-colors duration-300">
                                        {section.heading}
                                    </h2>
                                    <p className="font-sans font-light text-[var(--text-secondary)] leading-relaxed text-[15px] max-w-sm">
                                        {section.body}
                                    </p>
                                </div>

                                {/* CTA row */}
                                <div className="mt-8 flex items-center gap-3">
                                    <span
                                        className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 pb-0.5"
                                        style={{ borderColor: section.color, color: section.color }}
                                    >
                                        {section.cta}
                                    </span>
                                    <span
                                        className="material-symbols-outlined text-base transition-transform group-hover:translate-x-2 duration-300"
                                        style={{ color: section.color }}
                                    >
                                        arrow_forward
                                    </span>
                                </div>
                            </div>

                            {/* Bottom accent bar */}
                            <div
                                className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500 z-10"
                                style={{ background: section.color }}
                            />
                        </Link>
                    ))}
                </div>
            </section>

            <FinalCTAStrip />
        </div>
    );
}
