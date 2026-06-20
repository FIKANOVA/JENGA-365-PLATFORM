"use client"

export default function ImpactAttributionCard() {
    return (
        <section
            className="rounded-md border p-6 animate-fade-up"
            style={{ background: "var(--brand-green-soft)", borderColor: "var(--brand-green)" }}
        >
            <span className="text-eyebrow mb-2 block" style={{ color: "var(--brand-green)" }}>
                Impact attribution
            </span>
            <p className="text-eyebrow mb-6" style={{ color: "var(--brand-green)" }}>
                Your CSR contribution
            </p>

            <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                    <span className="text-xl">🏉</span>
                    <p className="text-body-sm text-foreground-muted leading-relaxed">
                        This mentorship was funded by your <strong className="text-foreground">Silver Partner</strong> contribution
                    </p>
                </div>
                <div className="flex gap-4">
                    <span className="text-xl">📊</span>
                    <p className="text-body-sm text-foreground-muted leading-relaxed">
                        Counts toward your <strong className="text-foreground">ESG Youth Impact</strong> metric
                    </p>
                </div>
                <div className="flex gap-4">
                    <span className="text-xl">🌱</span>
                    <p className="text-body-sm text-foreground-muted leading-relaxed">
                        Linked to: <strong className="text-foreground">Nairobi Rugby Clinic</strong> sponsorship
                    </p>
                </div>
            </div>

            <button
                className="w-full text-eyebrow hover:underline text-left"
                style={{ color: "var(--brand-red)" }}
            >
                View in ESG Report →
            </button>
        </section>
    );
}
