"use client";

/**
 * Donation Report Page — Stitch conversion
 * "How Your Support Builds Growth" — donation tiers + payment methods
 */

export default function DonationReportPage() {
    return (
        <div className="bg-white antialiased">
            {/* Header */}
            <header className="max-w-6xl mx-auto px-6 pt-12 pb-8 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#BB0000] flex items-center justify-center" style={{ borderRadius: 2 }}>
                        <span className="text-white font-bold text-xl">J</span>
                    </div>
                    <div>
                        <h1 className="font-black text-xl leading-none tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>IMPACT REPORT</h1>
                        <p className="text-[8px] mt-1 text-[#BB0000] tracking-[0.1em] uppercase font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>Empowering Kenyan Youth</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-gray-100 px-3 py-1 text-[10px] font-bold inline-block" style={{ fontFamily: "var(--font-dm-mono)" }}>Q1 2026</div>
                    <div className="text-[9px] text-gray-400 mt-2 uppercase tracking-widest" style={{ fontFamily: "var(--font-dm-mono)" }}>Page 04<br />Support &amp; Growth</div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="max-w-3xl">
                    <span className="text-[10px] tracking-[0.3em] text-[#BB0000] uppercase font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>Support Our Mission</span>
                    <h2 className="text-5xl md:text-6xl mt-4 mb-6 leading-tight text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>How Your Support Builds Growth</h2>
                    <p className="text-xl max-w-2xl leading-relaxed text-[#4A4A4A]" style={{ fontFamily: "var(--font-lato)" }}>Every contribution directly fuels the tripartite model of mentorship, networking, and sustainability.</p>
                </div>

                {/* Donation Tiers */}
                <section className="mt-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { amount: "R250", desc: "Plant 3 indigenous trees in the Mau Forest for environmental restoration.", label: "Environmental Impact", color: "#006600" },
                            { amount: "R500", desc: "Support 2 youth at a Rugby Mentorship Clinic, combining sport and leadership.", label: "Youth Development", color: "#BB0000" },
                            { amount: "R1,000", desc: "Fund 5 hours of professional career mentorship for graduating student-athletes.", label: "Career Coaching", color: "#1A1A1A" },
                            { amount: "R5,000", desc: "Sponsor a community rugby festival for 100+ youth, fostering unity and health.", label: "Community Outreach", color: "#BB0000" },
                        ].map((tier) => (
                            <div key={tier.amount} className="bg-[#F9F9F9] p-8 flex flex-col h-full border-t-4 hover:-translate-y-1 transition-transform" style={{ borderTopColor: tier.color, borderRadius: 2 }}>
                                <div className="mb-6">
                                    <svg className="w-8 h-8" style={{ color: tier.color }} fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" opacity="0.2" /><circle cx="12" cy="12" r="6" /></svg>
                                </div>
                                <h3 className="font-bold text-2xl mb-2" style={{ fontFamily: "var(--font-lato)" }}>{tier.amount}</h3>
                                <p className="text-sm mb-6 flex-grow text-[#4A4A4A]" style={{ fontFamily: "var(--font-lato)" }}>{tier.desc}</p>
                                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-dm-mono)", color: tier.color }}>{tier.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Ways to Give */}
                <section className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-[10px] tracking-[0.3em] text-[#BB0000] uppercase font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>Payment Methods</span>
                        <h3 className="text-4xl mt-4 mb-8 text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>Simple Ways to Give</h3>
                        <div className="space-y-8">
                            {[
                                { num: "01", title: "Online Payment", desc: "Secure credit/debit card processing via Paystack for international and local donations." },
                                { num: "02", title: "Mobile Money (Kenya)", desc: "Use M-PESA Paybill 365365. Account name: Your Name / Phone Number." },
                                { num: "03", title: "Corporate Partnership", desc: "Dedicated ESG reporting and employee engagement packages for institutional donors." },
                            ].map((step) => (
                                <div key={step.num} className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 border border-gray-200 flex items-center justify-center font-bold" style={{ fontFamily: "var(--font-dm-mono)", borderRadius: 2 }}>{step.num}</div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1" style={{ fontFamily: "var(--font-lato)" }}>{step.title}</h4>
                                        <p className="text-sm text-[#4A4A4A]" style={{ fontFamily: "var(--font-lato)" }}>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12">
                            <button className="bg-[#BB0000] text-white px-8 py-3 font-bold text-sm uppercase tracking-widest hover:bg-[#990000] transition-colors" style={{ fontFamily: "var(--font-dm-mono)", borderRadius: 2 }}>Donate Now</button>
                        </div>
                    </div>
                    <div className="relative bg-gray-50 p-12 overflow-hidden" style={{ borderRadius: 2 }}>
                        <div className="aspect-square bg-white shadow-2xl p-8 flex flex-col justify-center border-l-8 border-[#BB0000]">
                            <div className="text-xs uppercase text-gray-400 mb-4 tracking-tighter" style={{ fontFamily: "var(--font-dm-mono)" }}>Transaction Verified</div>
                            <div className="h-1 bg-gray-100 w-full mb-8" />
                            <div className="text-4xl mb-2" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>100%</div>
                            <p className="text-sm leading-tight text-[#4A4A4A]" style={{ fontFamily: "var(--font-lato)" }}>of public donations go directly to community programs. All administrative costs are covered by corporate endowments.</p>
                            <div className="mt-12 flex gap-2">
                                <div className="w-8 h-1 bg-[#1A1A1A]" />
                                <div className="w-8 h-1 bg-[#BB0000]" />
                                <div className="w-8 h-1 bg-[#006600]" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="max-w-6xl mx-auto px-6 py-12 mt-12 border-t border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <p className="text-[11px] uppercase tracking-widest text-gray-500" style={{ fontFamily: "var(--font-dm-mono)" }}>Jenga365 Impact Report Q1 2026</p>
                        <p className="text-[11px] text-[#BB0000] mt-1" style={{ fontFamily: "var(--font-dm-mono)" }}>CONFIDENTIAL • INTERNAL USE ONLY</p>
                    </div>
                    <div className="flex flex-col md:items-end">
                        <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-2" style={{ fontFamily: "var(--font-dm-mono)" }}>Contact For Support</p>
                        <div className="flex gap-6 text-[11px]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                            <a className="hover:text-[#BB0000] underline decoration-gray-200" href="mailto:impact@jenga365.org">impact@jenga365.org</a>
                            <span className="text-gray-300">|</span>
                            <span>+254 700 365 365</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
