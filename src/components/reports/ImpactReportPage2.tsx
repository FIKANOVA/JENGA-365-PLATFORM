"use client";

/**
 * Impact Report Page 2 — Qualitative Stories & Testimonials
 * Converted from Stitch screen 5ff720b13e444b9ea1f4bfb4d7f1200f
 */

interface SuccessStory {
    name: string;
    role: string;
    quote: string;
    mentorName: string;
    sessions: number;
    rating: string;
    growth: string;
}

interface QualitativeInsight {
    title: string;
    description: string;
    metric: string;
    accent: string;
}

interface Recommendation {
    title: string;
    description: string;
}

interface ImpactReportPage2Props {
    readonly companyName: string;
    readonly stories: SuccessStory[];
    readonly insights: QualitativeInsight[];
    readonly testimonial: {
        quote: string;
        attribution: string;
        title: string;
    };
    readonly recommendations: Recommendation[];
}

export default function ImpactReportPage2(props: ImpactReportPage2Props) {
    const { companyName, stories, insights, testimonial, recommendations } = props;

    return (
        <div className="bg-[#F5F5F5] p-8 print:p-0 print:bg-white">
            <div className="max-w-[850px] mx-auto bg-white shadow-xl print:shadow-none" style={{ borderRadius: 2 }}>
                {/* ── HEADER ───────────────────────────────── */}
                <div className="p-10 pb-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#BB0000] text-white flex items-center justify-center font-black text-xs" style={{ borderRadius: 2, fontFamily: "var(--font-playfair)" }}>
                                J365
                            </div>
                            <span className="text-[10px] text-[#BB0000] font-bold tracking-[0.3em]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                IMPACT REPORT — CONTINUED
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-lg text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}>{companyName}</p>
                            <p className="text-[9px] text-[#8A8A8A]" style={{ fontFamily: "var(--font-dm-mono)" }}>PAGE 2 OF 2</p>
                        </div>
                    </div>
                    <div className="flex h-[3px] w-full">
                        <div className="flex-1 bg-[#BB0000]" />
                        <div className="flex-1 bg-[#006600]" />
                        <div className="flex-1 bg-[#1A1A1A]" />
                    </div>
                </div>

                {/* ── SUCCESS STORIES ───────────────────────── */}
                <div className="px-10 pb-10">
                    <p className="text-[10px] text-[#BB0000] font-bold tracking-[0.3em] mb-6" style={{ fontFamily: "var(--font-dm-mono)" }}>
                        SUCCESS STORIES
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        {stories.slice(0, 2).map((story) => (
                            <div key={story.name} className="border border-[#E8E4DC] p-6" style={{ borderRadius: 2 }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-[#E8E4DC] flex items-center justify-center text-[#8A8A8A] text-lg font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
                                        {story.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}>{story.name}</p>
                                        <p className="text-[9px] text-[#8A8A8A]" style={{ fontFamily: "var(--font-dm-mono)" }}>{story.role}</p>
                                    </div>
                                </div>
                                <div className="border-l-[3px] border-[#BB0000] pl-4 mb-4">
                                    <p className="text-base italic text-[#1A1A1A] leading-relaxed" style={{ fontFamily: "var(--font-playfair)", fontWeight: 400 }}>
                                        &ldquo;{story.quote}&rdquo;
                                    </p>
                                </div>
                                <p className="text-[9px] text-[#8A8A8A] mb-3" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                    MATCHED WITH: {story.mentorName.toUpperCase()}
                                </p>
                                <div className="flex gap-4 text-[9px] text-[#4A4A4A]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                    <span>SESSIONS: {story.sessions}</span>
                                    <span>|</span>
                                    <span>RATING: {story.rating}</span>
                                    <span>|</span>
                                    <span>GROWTH: {story.growth}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── QUALITATIVE INSIGHTS ──────────────────── */}
                <div className="px-10 pb-10">
                    <p className="text-[10px] text-[#BB0000] font-bold tracking-[0.3em] mb-6" style={{ fontFamily: "var(--font-dm-mono)" }}>
                        QUALITATIVE INSIGHTS
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        {insights.map((insight) => (
                            <div key={insight.title} className="border border-[#E8E4DC] overflow-hidden" style={{ borderRadius: 2 }}>
                                <div className="h-[3px]" style={{ backgroundColor: insight.accent }} />
                                <div className="p-5">
                                    <h4 className="text-sm text-[#1A1A1A] mb-2" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}>{insight.title}</h4>
                                    <p className="text-xs text-[#4A4A4A] leading-relaxed mb-3" style={{ fontFamily: "var(--font-lato)" }}>{insight.description}</p>
                                    <p className="text-[10px] text-[#006600] font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>{insight.metric}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── PARTNER TESTIMONIAL ───────────────────── */}
                <div className="mx-10 mb-10 bg-[#F7F5F0] p-10 relative overflow-hidden" style={{ borderRadius: 2 }}>
                    <span className="absolute top-2 left-4 text-[120px] text-[#BB0000] opacity-[0.06] leading-none" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>&ldquo;</span>
                    <p className="text-center text-lg italic text-[#1A1A1A] leading-relaxed max-w-lg mx-auto mb-6 relative z-10" style={{ fontFamily: "var(--font-lato)" }}>
                        &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="text-center">
                        <p className="text-[10px] text-[#1A1A1A] font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>{testimonial.attribution}</p>
                        <p className="text-[9px] text-[#8A8A8A]" style={{ fontFamily: "var(--font-dm-mono)" }}>{testimonial.title}</p>
                    </div>
                </div>

                {/* ── RECOMMENDATIONS ───────────────────────── */}
                <div className="px-10 pb-10">
                    <p className="text-[10px] text-[#BB0000] font-bold tracking-[0.3em] mb-6" style={{ fontFamily: "var(--font-dm-mono)" }}>
                        RECOMMENDATIONS FOR Q2 2024
                    </p>
                    <div className="space-y-6">
                        {recommendations.map((rec, i) => (
                            <div key={i} className="flex gap-6">
                                <span className="text-4xl text-[#BB0000] shrink-0 leading-none" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>{i + 1}</span>
                                <div>
                                    <h4 className="text-base text-[#1A1A1A] mb-1" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}>{rec.title}</h4>
                                    <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ fontFamily: "var(--font-lato)" }}>{rec.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FOOTER ─────────────────────────────────── */}
                <div className="px-10 pb-6">
                    <div className="flex h-[2px] w-full mb-4">
                        <div className="flex-1 bg-[#BB0000]" />
                        <div className="flex-1 bg-[#006600]" />
                        <div className="flex-1 bg-[#1A1A1A]" />
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-[9px] text-[#8A8A8A]" style={{ fontFamily: "var(--font-dm-mono)" }}>GENERATED BY JENGA365 AI PLATFORM</p>
                        <p className="text-[8px] text-[#BB0000] font-bold tracking-[0.2em]" style={{ fontFamily: "var(--font-dm-mono)" }}>CONFIDENTIAL — FOR INTERNAL USE ONLY</p>
                        <p className="text-[9px] text-[#8A8A8A]" style={{ fontFamily: "var(--font-dm-mono)" }}>PAGE 2 OF 2</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
