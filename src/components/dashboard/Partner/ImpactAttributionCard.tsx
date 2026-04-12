"use client"

export default function ImpactAttributionCard() {
    return (
        <section className="bg-[#F0FFF0] border border-border rounded-[2px] p-6 animate-fade-up">
            <span className="section-label mb-6">Impact Attribution</span>
            <p className="font-mono text-[10px] text-[#006600] tracking-widest uppercase mb-6">
                Your CSR Contribution
            </p>

            <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                    <span className="text-xl">🏉</span>
                    <p className="font-lato text-[13px] text-[#4A4A4A] leading-relaxed">
                        This mentorship was funded by your <strong>Silver Partner</strong> contribution
                    </p>
                </div>
                <div className="flex gap-4">
                    <span className="text-xl">📊</span>
                    <p className="font-lato text-[13px] text-[#4A4A4A] leading-relaxed">
                        Counts toward your <strong>ESG Youth Impact</strong> metric
                    </p>
                </div>
                <div className="flex gap-4">
                    <span className="text-xl">🌱</span>
                    <p className="font-lato text-[13px] text-[#4A4A4A] leading-relaxed">
                        Linked to: <strong>Nairobi Rugby Clinic</strong> sponsorship
                    </p>
                </div>
            </div>

            <button className="w-full font-mono text-[10px] text-[#BB0000] uppercase tracking-widest hover:underline text-left">
                View in ESG Report →
            </button>
        </section>
    );
}
