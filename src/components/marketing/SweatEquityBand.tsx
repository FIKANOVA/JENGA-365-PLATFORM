import Link from "next/link";
import { ShieldCheck, Leaf, AlertTriangle } from "lucide-react";

/**
 * Sweat Equity band — communicates the Give Back / Three Strikes protocol
 * BEFORE any "Join Free" CTA on marketing. DESIGN.md §12.
 *
 * Moseti 2026-05-22: "platform heavily promotes 'Join Free' but it fails to
 * communicate the strict Give Back model. Mentorship is earned."
 */
export default function SweatEquityBand() {
    return (
        <section
            id="sweat-equity"
            className="bg-background border-y border-border"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-24">
                <div className="max-w-2xl">
                    <span
                        className="text-eyebrow"
                        style={{ color: "var(--brand-green)" }}
                    >
                        Sweat Equity Protocol
                    </span>
                    <h2 className="mt-3 text-display-md">
                        Mentorship is earned — not free.
                    </h2>
                    <p
                        className="mt-5 text-body-lg"
                        style={{ color: "var(--foreground-muted)" }}
                    >
                        Every mentee on Jenga365 commits to quarterly Give Back activities:
                        community clean-ups, tree-planting, or sustainability advocacy. We log
                        each activity with GPS and photo evidence. Three missed quarters and the
                        platform suspends mentorship access pending Welfare Officer review.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div className="mt-10">
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center h-11 px-5 rounded-md font-medium text-white"
                        style={{ background: "var(--brand-green)" }}
                    >
                        I accept — apply for mentorship
                    </Link>
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
            className="rounded-md border border-border bg-background p-6 transition-shadow hover:shadow-sm"
            style={{ borderColor: accent ? "var(--brand-green)" : "var(--border)" }}
        >
            <div
                className="flex h-9 w-9 items-center justify-center rounded-md mb-4"
                style={{
                    background: accent ? "var(--brand-green-soft)" : "var(--surface-2)",
                    color: accent ? "var(--brand-green)" : "var(--foreground-muted)",
                }}
            >
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-title">{title}</h3>
            <p className="mt-2 text-body-sm" style={{ color: "var(--foreground-muted)" }}>
                {body}
            </p>
        </div>
    );
}
