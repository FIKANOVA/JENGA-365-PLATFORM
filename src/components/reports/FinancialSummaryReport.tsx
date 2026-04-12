"use client";

/**
 * Financial Summary Report Page — Stitch conversion
 * Kenya-flag design system: Playfair/DM Mono/Lato, 2px radius, #BB0000/#006600/#1A1A1A
 */

export default function FinancialSummaryReport() {
    return (
        <div className="bg-white min-h-screen relative overflow-x-hidden">
            {/* Background Grid Pattern */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(#1A1A1A 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />

            <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">
                {/* Header */}
                <header className="mb-16">
                    <div className="flex justify-between items-end border-b border-gray-100 pb-8">
                        <div>
                            <span className="text-[10px] tracking-[0.3em] text-[#BB0000] uppercase font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>Financial Transparency</span>
                            <h1 className="text-5xl mt-4 text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>Financial Summary Q1 2026</h1>
                        </div>
                        <p className="text-xs uppercase tracking-widest text-gray-400" style={{ fontFamily: "var(--font-dm-mono)" }}>Published April 2026</p>
                    </div>
                </header>

                {/* Top Stats */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-white border border-gray-100 p-8 shadow-sm" style={{ borderRadius: 2 }}>
                        <span className="text-[10px] tracking-[0.3em] text-[#BB0000] uppercase font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>Total Revenue Received</span>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-4xl font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>KES 12.4M</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: "var(--font-lato)" }}>+14% vs. Q4 2025</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-8 shadow-sm border-l-4 border-l-[#BB0000]" style={{ borderRadius: 2 }}>
                        <span className="text-[10px] tracking-[0.3em] text-[#BB0000] uppercase font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>Total Impact Spend</span>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-[#BB0000]" style={{ fontFamily: "var(--font-dm-mono)" }}>KES 11.4M</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: "var(--font-lato)" }}>Allocated to Community Projects</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-8 shadow-sm" style={{ borderRadius: 2 }}>
                        <span className="text-[10px] tracking-[0.3em] text-[#BB0000] uppercase font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>Operational Efficiency</span>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-[#006600]" style={{ fontFamily: "var(--font-dm-mono)" }}>92%</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: "var(--font-lato)" }}>Lean Overhead Operations</p>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Revenue Breakdown */}
                    <section>
                        <span className="text-[10px] tracking-[0.3em] text-[#BB0000] uppercase font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>Revenue Breakdown</span>
                        <h2 className="text-2xl mt-2 text-[#1A1A1A] mb-6" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>Funding Sources</h2>
                        <div className="space-y-6">
                            {[
                                { label: "Corporate Sponsorships", amount: "KES 7.2M", pct: 58 },
                                { label: "Individual Donations", amount: "KES 3.9M", pct: 31 },
                                { label: "Merchandise Sales", amount: "KES 1.3M", pct: 11 },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-lato)" }}>{item.label}</span>
                                        <span className="text-sm" style={{ fontFamily: "var(--font-dm-mono)" }}>{item.amount} ({item.pct}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-3" style={{ borderRadius: 2 }}>
                                        <div className="bg-[#1A1A1A] h-full" style={{ width: `${item.pct}%`, borderRadius: 2 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-6 bg-gray-50 italic text-sm text-gray-600 border-l-2 border-gray-200" style={{ borderRadius: 2, fontFamily: "var(--font-lato)" }}>
                            &ldquo;Our diversified revenue model ensures long-term sustainability and reduces dependence on single-source grants.&rdquo;
                        </div>
                    </section>

                    {/* Impact Allocation */}
                    <section>
                        <span className="text-[10px] tracking-[0.3em] text-[#BB0000] uppercase font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>Impact Allocation</span>
                        <h2 className="text-2xl mt-2 text-[#1A1A1A] mb-6" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>Where Funds Went</h2>
                        <div className="space-y-4">
                            {[
                                { label: "Rugby Clinics & Equipment", sub: "Direct Project Cost", pct: "45%", opacity: 1 },
                                { label: "Mentorship Infrastructure", sub: "Education & Support", pct: "25%", opacity: 0.8 },
                                { label: "The Green Game (Environmental)", sub: "Sustainability", pct: "15%", opacity: 0.6 },
                                { label: "Youth Scholarships", sub: "Direct Beneficiary Aid", pct: "15%", opacity: 0.4 },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between p-4 border border-gray-100 hover:bg-gray-50 transition-colors" style={{ borderRadius: 2 }}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-12 bg-[#006600]" style={{ opacity: item.opacity }} />
                                        <div>
                                            <p className="font-bold" style={{ fontFamily: "var(--font-lato)" }}>{item.label}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider" style={{ fontFamily: "var(--font-dm-mono)" }}>{item.sub}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>{item.pct}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Efficiency Showcase */}
                <section className="bg-[#1A1A1A] text-white p-12 mb-16 relative overflow-hidden" style={{ borderRadius: 2 }}>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="md:w-1/2">
                            <span className="text-[10px] tracking-[0.3em] text-[#BB0000] uppercase font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>Direct vs. Indirect</span>
                            <h2 className="text-3xl mt-4 leading-tight text-white" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>Optimized for Action, Not Overhead.</h2>
                            <p className="mt-4 text-gray-400 text-lg" style={{ fontFamily: "var(--font-lato)" }}>We maintain a lean administrative structure to ensure that the vast majority of every Shilling goes where it&apos;s needed most: into the hands of Kenya&apos;s youth.</p>
                        </div>
                        <div className="md:w-1/2 flex justify-center">
                            <div className="relative w-64 h-64 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="128" cy="128" r="110" fill="transparent" stroke="#333333" strokeWidth="24" />
                                    <circle cx="128" cy="128" r="110" fill="transparent" stroke="#006600" strokeWidth="24" strokeDasharray="691" strokeDashoffset="55" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-5xl font-black" style={{ fontFamily: "var(--font-dm-mono)" }}>92%</span>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400" style={{ fontFamily: "var(--font-dm-mono)" }}>Direct Impact</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#BB0000] opacity-10 translate-x-1/2 -translate-y-1/2 blur-3xl" />
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-100 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tighter" style={{ fontFamily: "var(--font-playfair)" }}>JENGA<span className="text-[#BB0000]">365</span></span>
                            <span className="text-[8px] uppercase tracking-[4px] text-gray-400" style={{ fontFamily: "var(--font-dm-mono)" }}>Impact Through Action</span>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-xs uppercase tracking-[2px] text-[#BB0000]" style={{ fontFamily: "var(--font-dm-mono)" }}>Internal Use Only</p>
                        <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "var(--font-lato)" }}>© 2026 Jenga365 Foundation. All financial data is audited and verified.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
