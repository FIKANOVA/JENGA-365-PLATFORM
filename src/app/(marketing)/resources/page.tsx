import Link from "next/link";
import { FileText, Download, PlayCircle, Mic, ArrowRight } from "lucide-react";
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
        Icon: FileText,
        color: "var(--brand-green)",
        colorSoft: "var(--brand-green-soft)",
        heading: "Insights & thought leadership",
        body: "In-depth articles on mentorship, rugby development, financial literacy, and community impact — written by practitioners and experts.",
        cta: "Browse articles",
    },
    {
        label: "Downloads",
        href: "/resources/downloads",
        Icon: Download,
        color: "var(--brand-red)",
        colorSoft: "var(--brand-red-soft)",
        heading: "Guides, playbooks & templates",
        body: "Downloadable PDFs, checklists, mentor-readiness guides, and strategic frameworks built by the Jenga365 team.",
        cta: "Get downloads",
    },
    {
        label: "Video",
        href: "/resources/video",
        Icon: PlayCircle,
        color: "var(--brand-green)",
        colorSoft: "var(--brand-green-soft)",
        heading: "Talks, sessions & tutorials",
        body: "Recorded mentorship sessions, platform walkthroughs, athlete interviews, and keynote talks from Jenga365 events.",
        cta: "Watch videos",
    },
    {
        label: "Voices",
        href: "/resources/voices",
        Icon: Mic,
        color: "var(--brand-black)",
        colorSoft: "var(--surface-2)",
        heading: "X-Spaces & X-Threads",
        body: "Live and recorded X-Spaces conversations, curated X-Threads, and community discussions shaping the Jenga365 narrative.",
        cta: "Explore voices",
    },
];

export default function ResourcesHubPage() {
    return (
        <div className="min-h-screen bg-background">
            <PageHero
                eyebrow="Knowledge hub"
                heading={<>The Jenga365 library.</>}
                description="Articles, downloads, video sessions, and community voices — everything you need to grow, in one place."
            />

            <section className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    {SECTIONS.map(({ label, href, Icon, color, colorSoft, heading, body, cta }) => (
                        <Link
                            key={href}
                            href={href}
                            {...(label === "Downloads" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="group relative rounded-lg border border-border bg-background overflow-hidden flex flex-col p-6 lg:p-8 min-h-[260px] transition-shadow hover:shadow-md"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-md"
                                    style={{ background: colorSoft }}
                                >
                                    <Icon className="h-5 w-5" style={{ color }} />
                                </span>
                                <span className="text-eyebrow" style={{ color }}>
                                    {label}
                                </span>
                            </div>

                            <div className="mt-auto pt-10 space-y-3">
                                <h2 className="text-headline text-foreground transition-colors group-hover:text-[color:var(--brand-green)]">
                                    {heading}
                                </h2>
                                <p className="text-body-sm text-foreground-muted">{body}</p>
                            </div>

                            <div className="mt-6 inline-flex items-center gap-2 text-label font-medium" style={{ color }}>
                                {cta}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <FinalCTAStrip />
        </div>
    );
}
