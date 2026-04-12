"use client";

/**
 * Impact Metrics Summary Report — Stitch conversion
 * Key Impact Metrics dashboard page with brutalist card design
 */

export default function ImpactMetricsSummary() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white text-[#1A1A1A]">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-[#1A1A1A]/10 px-6 py-4 md:px-20 lg:px-40">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#BB0000] flex items-center justify-center text-white" style={{ borderRadius: 2 }}>
                        <span className="text-xs font-black" style={{ fontFamily: "var(--font-playfair)" }}>J</span>
                    </div>
                    <h1 className="font-bold text-xl tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>Jenga365 Impact</h1>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center justify-center border border-[#1A1A1A]/10 bg-white px-3 py-2 text-[#1A1A1A] hover:bg-slate-50 transition-colors text-sm" style={{ borderRadius: 2, fontFamily: "var(--font-dm-mono)" }}>↓ PDF</button>
                    <button className="flex items-center justify-center border border-[#1A1A1A]/10 bg-white px-3 py-2 text-[#1A1A1A] hover:bg-slate-50 transition-colors text-sm" style={{ borderRadius: 2, fontFamily: "var(--font-dm-mono)" }}>↗ Share</button>
                </div>
            </header>

            <main className="flex-1 px-6 py-10 md:px-20 lg:px-40" style={{ backgroundImage: "linear-gradient(45deg, rgba(26,26,26,0.03) 25%, transparent 25%, transparent 50%, rgba(26,26,26,0.03) 50%, rgba(26,26,26,0.03) 75%, transparent 75%, transparent)", backgroundSize: "40px 40px" }}>
                {/* Section Title */}
                <div className="mb-10">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] mb-2 text-[#BB0000]" style={{ fontFamily: "var(--font-dm-mono)" }}>QUARTERLY SUMMARY Q1 2026</p>
                    <h2 className="text-5xl md:text-6xl tracking-tighter text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>Key Impact Metrics</h2>
                </div>

                {/* Top Row: High Level Cards (Brutalist shadow) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { num: "01", label: "Total Investment", value: "KES 12.4M", change: "+14%", sub: "vs Q4 2025" },
                        { num: "02", label: "Youth Impacted", value: "1,200", change: "+22%", sub: "Cumulative Growth" },
                        { num: "03", label: "Mentorship Hours", value: "3,840", change: "Steady", sub: "Target Met" },
                    ].map((card) => (
                        <div key={card.num} className="relative p-8 border border-[#1A1A1A] overflow-hidden bg-white" style={{ boxShadow: "4px 4px 0px 0px rgba(26,26,26,1)" }}>
                            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                                <span className="text-[120px]" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>{card.num}</span>
                            </div>
                            <p className="text-sm text-[#1A1A1A]/60 uppercase mb-4" style={{ fontFamily: "var(--font-dm-mono)" }}>{card.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>{card.value}</h3>
                                <span className="text-sm font-bold text-[#006600]" style={{ fontFamily: "var(--font-dm-mono)" }}>{card.change}</span>
                            </div>
                            <p className="text-xs text-[#1A1A1A]/40 mt-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-dm-mono)" }}>{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Detailed Metrics + ESG Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <h4 className="text-2xl mb-6 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}>
                            <span className="w-8 h-[2px] bg-[#BB0000]" />
                            Detailed Metric Grid
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[
                                { label: "Efficiency", value: "92%", sub: "Direct Impact Rate" },
                                { label: "Active Mentors", value: "482", sub: "Verified Personnel" },
                                { label: "Rugby Clinics", value: "12", sub: "Bi-weekly Events" },
                                { label: "Trees Planted", value: "847", sub: "Sustainability Program", valueColor: "#006600" },
                                { label: "Partner Orgs", value: "28", sub: "Strategic Alliances" },
                                { label: "Certificates", value: "89", sub: "Technical Training" },
                            ].map((metric) => (
                                <div key={metric.label} className="border border-[#1A1A1A]/10 p-5 bg-white" style={{ borderRadius: 2 }}>
                                    <p className="text-[10px] text-[#1A1A1A]/60 uppercase mb-2" style={{ fontFamily: "var(--font-dm-mono)" }}>{metric.label}</p>
                                    <p className="text-xl font-bold" style={{ fontFamily: "var(--font-dm-mono)", color: metric.valueColor || "#1A1A1A" }}>{metric.value}</p>
                                    <p className="text-[10px] text-[#1A1A1A]/50 mt-1" style={{ fontFamily: "var(--font-dm-mono)" }}>{metric.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ESG Progress Panel */}
                    <div className="bg-[#1A1A1A] p-8 text-white flex flex-col justify-between" style={{ borderRadius: 2 }}>
                        <div>
                            <h4 className="text-2xl mb-2" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}>ESG Progress</h4>
                            <p className="text-[10px] text-white/60 uppercase mb-8" style={{ fontFamily: "var(--font-dm-mono)" }}>Annual Goal Track</p>
                        </div>
                        <div className="mb-12">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-5xl font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>78%</span>
                                <span className="text-xs uppercase text-white/60" style={{ fontFamily: "var(--font-dm-mono)" }}>Current State</span>
                            </div>
                            <div className="w-full bg-white/20 h-2" style={{ borderRadius: 2 }}>
                                <div className="bg-[#BB0000] h-full" style={{ width: "78%", borderRadius: 2 }} />
                            </div>
                        </div>
                        <div className="text-[10px] leading-relaxed text-white/50 uppercase tracking-widest" style={{ fontFamily: "var(--font-dm-mono)" }}>
                            Environment · Social · Governance<br />
                            Benchmark: 2026 Resilience Index
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#1A1A1A]/10 px-6 py-6 md:px-20 lg:px-40 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest" style={{ fontFamily: "var(--font-dm-mono)" }}>© 2026 Jenga365 Impact Report. All rights reserved.</div>
                <div className="text-[10px] text-[#BB0000] uppercase font-bold tracking-widest px-4 py-1 border border-[#BB0000]/20" style={{ fontFamily: "var(--font-dm-mono)", borderRadius: 2 }}>Strictly Confidential</div>
                <div className="text-[10px] text-[#1A1A1A]/40 uppercase" style={{ fontFamily: "var(--font-dm-mono)" }}>Page 001 of 042</div>
            </footer>
        </div>
    );
}
