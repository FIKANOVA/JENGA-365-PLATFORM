import Link from "next/link";
import { Brain, Leaf, ArrowRight } from "lucide-react";

/**
 * Dual-Engine section — Engine A (AI-driven mentorship) + Engine B
 * (Environmental Stewardship & Green Technology, corporate-ESG framing).
 *
 * Engine B copy is the verbatim corporate-friendly draft Moseti relayed on
 * 2026-05-22 — Green Technology and measurable climate action.
 */
export default function WhatWeDoSection() {
    return (
        <section className="bg-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 md:py-32">
                <div className="max-w-2xl mb-16">
                    <span
                        className="text-eyebrow"
                        style={{ color: "var(--brand-green)" }}
                    >
                        The Dual-Engine Model
                    </span>
                    <h2 className="mt-3 text-display-md">
                        Two engines. One platform.
                    </h2>
                    <p
                        className="mt-5 text-body-lg"
                        style={{ color: "var(--foreground-muted)" }}
                    >
                        We don&apos;t separate human development from environmental stewardship.
                        Every athlete on Jenga365 is a mentee and a steward — earning their growth
                        through verified climate action.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EngineCard
                        eyebrow="Engine A"
                        title="AI-driven mentorship & resilience"
                        icon={Brain}
                        body="Our pgvector matching engine pairs each mentee with a mentor on six weighted signals: semantic profile similarity, location, availability, goal alignment, partner affiliation, and profile completeness. Every mentor is capped at two active mentees so attention isn't diluted."
                        bullets={[
                            "AI-matched 1:2 mentorship — never more than two mentees per mentor",
                            "Quarterly resilience assessments with delta tracking",
                            "Structured career, financial-literacy, and welfare pathways",
                        ]}
                        href="/mentors"
                        ctaLabel="See the matching algorithm"
                    />

                    <EngineCard
                        eyebrow="Engine B"
                        title="Environmental Stewardship & Green Technology"
                        icon={Leaf}
                        body="True impact extends beyond the pitch and into the soil. Through signature campaigns like Trees for Tries, we empower athletes — recognized as worthy stakeholders in our planet's future — to lead community clean-ups, advocate for sustainable waste management, and execute targeted ecosystem restoration."
                        bullets={[
                            "Quarterly Monitoring & Evaluation (M&E) with GPS-anchored evidence",
                            "Tree-survival audits — we track survival, not just planting",
                            "Transparent, verifiable ESG data for corporate sustainability reports",
                        ]}
                        href="/impact"
                        ctaLabel="Become a Corporate Partner"
                        accent
                    />
                </div>
            </div>
        </section>
    );
}

function EngineCard({
    eyebrow,
    title,
    icon: Icon,
    body,
    bullets,
    href,
    ctaLabel,
    accent = false,
}: {
    eyebrow: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    body: string;
    bullets: string[];
    href: string;
    ctaLabel: string;
    accent?: boolean;
}) {
    return (
        <div
            className="rounded-lg border bg-background p-8 md:p-10 transition-shadow hover:shadow-lg"
            style={{ borderColor: "var(--border)" }}
        >
            <div className="flex items-start gap-4 mb-6">
                <div
                    className="flex h-11 w-11 items-center justify-center rounded-md flex-shrink-0"
                    style={{
                        background: accent ? "var(--brand-green-soft)" : "var(--surface-2)",
                        color: accent ? "var(--brand-green)" : "var(--foreground)",
                    }}
                >
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <span
                        className="text-eyebrow"
                        style={{ color: accent ? "var(--brand-green)" : "var(--foreground-muted)" }}
                    >
                        {eyebrow}
                    </span>
                    <h3 className="mt-1 text-headline">{title}</h3>
                </div>
            </div>

            <p
                className="text-body"
                style={{ color: "var(--foreground-muted)" }}
            >
                {body}
            </p>

            <ul className="mt-6 space-y-3">
                {bullets.map((b) => (
                    <li
                        key={b}
                        className="flex items-start gap-3 text-body-sm"
                        style={{ color: "var(--foreground)" }}
                    >
                        <span
                            className="mt-2 h-1 w-1 rounded-full flex-shrink-0"
                            style={{ background: "var(--brand-green)" }}
                            aria-hidden
                        />
                        {b}
                    </li>
                ))}
            </ul>

            <Link
                href={href}
                className="mt-8 inline-flex items-center gap-1.5 text-label font-medium"
                style={{ color: "var(--foreground)" }}
            >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}
