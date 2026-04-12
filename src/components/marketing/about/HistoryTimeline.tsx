"use client";

import { motion } from "framer-motion";

const nodes = [
    {
        title: "The Genesis",
        date: "ESTABLISHED 2024",
        content: "Conceptualization of a unified platform for Kenyan rugby development and athlete career transitioning. A dual-engine initiative merging sports heritage with AI-native mentorship.",
    },
    {
        title: "The Strategic Pivot",
        date: "YEAR 2025",
        content: "Integration of AI-native mentorship tools and the establishment of corporate partnership frameworks. Expanding the model to include mental well-being and financial literacy.",
    },
    {
        title: "Community Expansion",
        date: "YEAR 2025–2026",
        content: "Launch of the Jenga365 mobile ecosystem, onboarding the first 500 regional mentees across Nairobi, Mombasa, and Kisumu hubs.",
    },
    {
        title: "Global Impact",
        date: "PROJECTED 2026+",
        content: "Scaling the \"Total Athlete\" model across other disciplines and international markets. Targeting 10,000+ mentees and full ESG reporting compliance.",
    },
];

export default function HistoryTimeline() {
    return (
        <section className="py-32 md:py-40 bg-accent relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="mb-24 text-center space-y-4">
                    <span className="text-primary font-mono font-bold uppercase tracking-widest text-sm block">
                        Historical Milestones
                    </span>
                    <h2 className="font-playfair font-black text-4xl md:text-5xl text-foreground uppercase">
                        The Evolution of Jenga
                    </h2>
                    <div className="w-24 h-1 bg-primary mx-auto mt-6"></div>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-1 bg-primary/20 md:-translate-x-1/2 rounded-full" />

                    <div className="space-y-24">
                        {nodes.map((node, i) => (
                            <div key={i} className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                                
                                {/* Timeline Dot */}
                                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-14 h-14 flex items-center justify-center z-10 bg-accent rounded-full border-4 border-accent">
                                    <div className="w-6 h-6 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                                </div>

                                {/* Content Card */}
                                <div className={`flex-1 w-full pl-20 md:pl-0 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                                    <div className="bg-background border border-border/50 p-8 rounded-xl shadow-lg hover:shadow-xl hover:border-primary/30 transition-all group cursor-default">
                                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary font-bold block mb-4">
                                            {node.date}
                                        </span>
                                        <h3 className="font-playfair font-bold text-2xl md:text-3xl text-foreground uppercase mb-4 group-hover:text-primary transition-colors">
                                            {node.title}
                                        </h3>
                                        <p className="font-sans font-light text-base md:text-lg text-muted-foreground leading-relaxed">
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
