import Link from "next/link";
import { Brain, Leaf, ArrowRight } from "lucide-react";

export interface WhatWeDoCopy {
    eyebrow?: string;
    heading?: string;
    description?: string;
    engineA?: {
        eyebrow?: string;
        title?: string;
        body?: string;
        bullets?: string[];
        ctaLabel?: string;
    };
    engineB?: {
        eyebrow?: string;
        title?: string;
        body?: string;
        bullets?: string[];
        ctaLabel?: string;
    };
}

interface WhatWeDoSectionProps {
    readonly copy?: WhatWeDoCopy | null;
}

const DEFAULT_COPY: Required<WhatWeDoCopy> = {
    eyebrow: "The Dual-Engine Model",
    heading: "Two engines. One platform.",
    description: "We don't separate human development from environmental stewardship. Every athlete on Jenga365 is a mentee and a steward — earning their growth through verified climate action.",
    engineA: {
        eyebrow: "Engine A",
        title: "AI-driven mentorship & resilience",
        body: "Our pgvector matching engine pairs each mentee with a mentor on six weighted signals: semantic profile similarity, location, availability, goal alignment, partner affiliation, and profile completeness. Every mentor is capped at two active mentees so attention isn't diluted.",
        bullets: [
            "AI-matched 1:2 mentorship — never more than two mentees per mentor",
            "Quarterly resilience assessments with delta tracking",
            "Structured career, financial-literacy, and welfare pathways",
        ],
        ctaLabel: "See the matching algorithm"
    },
    engineB: {
        eyebrow: "Engine B",
        title: "Environmental Stewardship & Green Technology",
        body: "True impact extends beyond the pitch and into the soil. Through signature campaigns like Trees for Tries, we empower athletes — recognized as worthy stakeholders in our planet's future — to lead community clean-ups, advocate for sustainable waste management, and execute targeted ecosystem restoration.",
        bullets: [
            "Quarterly Monitoring & Evaluation (M&E) with GPS-anchored evidence",
            "Tree-survival audits — we track survival, not just planting",
            "Transparent, verifiable ESG data for corporate sustainability reports",
        ],
        ctaLabel: "Become a Corporate Partner"
    }
};

export default function WhatWeDoSection({ copy }: WhatWeDoSectionProps) {
    const eyebrow = copy?.eyebrow?.trim() || DEFAULT_COPY.eyebrow;
    const heading = copy?.heading?.trim() || DEFAULT_COPY.heading;
    const description = copy?.description?.trim() || DEFAULT_COPY.description;

    const engineA = copy?.engineA || DEFAULT_COPY.engineA;
    const engineB = copy?.engineB || DEFAULT_COPY.engineB;

    return (
        <section className="bg-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 md:py-24">
                <div className="max-w-2xl mb-12">
                    <span
                        className="text-eyebrow"
                        style={{ color: "var(--brand-green)" }}
                    >
                        {eyebrow}
                    </span>
                    <h2 className="mt-3 text-display-sm md:text-display-md">{heading}</h2>
                    <p
                        className="mt-5 text-body-lg"
                        style={{ color: "var(--foreground-muted)" }}
                    >
                        {description}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EngineCard
                        eyebrow={engineA.eyebrow?.trim() || DEFAULT_COPY.engineA.eyebrow!}
                        title={engineA.title?.trim() || DEFAULT_COPY.engineA.title!}
                        icon={Brain}
                        body={engineA.body?.trim() || DEFAULT_COPY.engineA.body!}
                        bullets={engineA.bullets?.length ? engineA.bullets : DEFAULT_COPY.engineA.bullets!}
                        href="/mentors"
                        ctaLabel={engineA.ctaLabel?.trim() || DEFAULT_COPY.engineA.ctaLabel!}
                    />

                    <EngineCard
                        eyebrow={engineB.eyebrow?.trim() || DEFAULT_COPY.engineB.eyebrow!}
                        title={engineB.title?.trim() || DEFAULT_COPY.engineB.title!}
                        icon={Leaf}
                        body={engineB.body?.trim() || DEFAULT_COPY.engineB.body!}
                        bullets={engineB.bullets?.length ? engineB.bullets : DEFAULT_COPY.engineB.bullets!}
                        href="/impact"
                        ctaLabel={engineB.ctaLabel?.trim() || DEFAULT_COPY.engineB.ctaLabel!}
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
            className="rounded-lg border bg-background p-6 md:p-8 transition-shadow hover:shadow-lg"
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
                        style={{
                            color: accent ? "var(--brand-green)" : "var(--foreground-muted)",
                        }}
                    >
                        {eyebrow}
                    </span>
                    <h3 className="mt-1 text-headline">{title}</h3>
                </div>
            </div>

            <p className="text-body" style={{ color: "var(--foreground-muted)" }}>
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
                className="group mt-8 inline-flex items-center gap-1.5 min-h-11 rounded-md text-label font-semibold underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
                style={{ color: "var(--brand-green)" }}
            >
                {ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
        </div>
    );
}
