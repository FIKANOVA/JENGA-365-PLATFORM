import Link from "next/link";
import { ShieldCheck, Leaf, AlertTriangle, ArrowRight } from "lucide-react";

/**
 * Sweat Equity band — communicates the Give Back / Three Strikes protocol
 * BEFORE any "Join Free" CTA on marketing. DESIGN.md §12.
 *
 * Transformed into a dark band for visual contrast and attention capture.
 */
export default function SweatEquityBand() {
    return (
        <section
            id="sweat-equity"
            className="relative overflow-hidden py-24 md:py-32"
            style={{ background: "var(--brand-black)" }}
        >
            <div className="absolute inset-0 bg-topo opacity-[0.10] pointer-events-none" aria-hidden />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="lg:w-1/2 max-w-2xl">
                        <span
                            className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border bg-white/5 border-white/10 text-eyebrow"
                            style={{ color: "var(--brand-green)" }}
                        >
                            Sweat Equity Protocol
                        </span>
                        <h2 className="text-display-md text-white">
                            Mentorship is earned — not free.
                        </h2>
                        <p
                            className="mt-6 text-body-lg"
                            style={{ color: "rgba(255,255,255,0.72)" }}
                        >
                            Every mentee on Jenga365 commits to quarterly Give Back activities:
                            community clean-ups, tree-planting, or sustainability advocacy. We log
                            each activity with GPS and photo evidence. Three missed quarters and the
                            platform suspends mentorship access pending Welfare Officer review.
                        </p>

                        <div className="mt-10">
                            <Link
                                href="/register/mentorship"
                                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-medium text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                                style={{ background: "var(--brand-green)" }}
                            >
                                I accept — apply for mentorship
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="lg:w-1/2 grid grid-cols-1 gap-4 w-full">
                        <Card
                            icon={ShieldCheck}
                            title="The commitment"
                            body="One verified Give Back activity per quarter. Logged through the platform with GPS coordinates."
                        />
                        <Card
                            icon={Leaf}
                            title="The impact"
                            body="Your hours contribute directly to a Corporate Partner's quarterly ESG scorecard and unlock additional funding."
                            accent
                        />
                        <Card
                            icon={AlertTriangle}
                            title="The protocol"
                            body="Three missed quarters → Welfare Officer review → potential suspension. We track this because the model only works if it's measured."
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

function Card({
    icon: Icon,
    title,
    body,
    accent = false,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: string;
    accent?: boolean;
}) {
    return (
        <div
            className="flex gap-6 rounded-xl border bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/10"
            style={{
                borderColor: accent ? "rgba(46, 160, 67, 0.3)" : "rgba(255,255,255,0.1)"
            }}
        >
            <div
                className="flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0"
                style={{
                    background: accent ? "var(--brand-green-soft)" : "rgba(255,255,255,0.05)",
                    color: accent ? "var(--brand-green)" : "rgba(255,255,255,0.8)",
                }}
            >
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h3 className="text-headline text-white">{title}</h3>
                <p className="mt-2 text-body-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {body}
                </p>
            </div>
        </div>
    );
}