"use client";

interface TimelineNode {
    title: string;
    date?: string | null;
    content?: string | null;
}

const DEFAULT_NODES: TimelineNode[] = [
    {
        title: "The Genesis",
        date: "Established 2024",
        content: "Conceptualization of a unified platform for Kenyan rugby development and athlete career transitioning. A dual-engine initiative merging sports heritage with AI-native mentorship.",
    },
    {
        title: "The Strategic Pivot",
        date: "Year 2025",
        content: "Integration of AI-native mentorship tools and the establishment of corporate partnership frameworks. Expanding the model to include mental well-being and financial literacy.",
    },
    {
        title: "Community Expansion",
        date: "Year 2025–2026",
        content: "Launch of the Jenga365 mobile ecosystem, onboarding the first 500 regional mentees across Nairobi, Mombasa, and Kisumu hubs.",
    },
    {
        title: "Global Impact",
        date: "Projected 2026+",
        content: "Scaling the \"Total Athlete\" model across other disciplines and international markets. Targeting 10,000+ mentees and full ESG reporting compliance.",
    },
];

interface HistoryTimelineProps {
    readonly nodes?: readonly TimelineNode[] | null;
}

export default function HistoryTimeline({ nodes: propNodes }: HistoryTimelineProps = {}) {
    const nodes = propNodes && propNodes.length > 0 ? propNodes : DEFAULT_NODES;
    return (
        <section className="py-12 md:py-24 bg-accent relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="mb-20 text-center space-y-4">
                    <span className="text-eyebrow block" style={{ color: "var(--brand-green)" }}>
                        Historical milestones
                    </span>
                    <h2 className="text-display-lg text-foreground">
                        The evolution of Jenga.
                    </h2>
                    <div className="w-16 h-0.5 mx-auto mt-4" style={{ background: "var(--brand-green)" }} />
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line */}
                    <div
                        className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-0.5 md:-translate-x-1/2 rounded-full"
                        style={{ background: "var(--brand-green-soft)" }}
                    />

                    <div className="space-y-16">
                        {nodes.map((node, i) => (
                            <div
                                key={i}
                                className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-14 h-14 flex items-center justify-center z-10 bg-accent rounded-full border-4 border-accent">
                                    <div
                                        className="w-5 h-5 rounded-full"
                                        style={{
                                            background: "var(--brand-green)",
                                            boxShadow: "0 0 14px rgba(0, 102, 0, 0.4)",
                                        }}
                                    />
                                </div>

                                {/* Content Card */}
                                <div className={`flex-1 w-full pl-20 md:pl-0 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                                    <div
                                        className="group rounded-lg border border-border bg-background p-8 transition-colors hover:border-[color:var(--border-strong,#D4D4D8)] cursor-default"
                                        style={{ boxShadow: "var(--shadow-sm)" }}
                                    >
                                        <span className="text-eyebrow block mb-3" style={{ color: "var(--brand-green)" }}>
                                            {node.date}
                                        </span>
                                        <h3 className="text-display-sm text-foreground mb-3">
                                            {node.title}
                                        </h3>
                                        <p className="text-body-lg text-foreground-muted leading-relaxed">
                                            {node.content}
                                        </p>
                                    </div>
                                </div>

                                {/* Desktop Spacer */}
                                <div className="hidden md:block flex-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
