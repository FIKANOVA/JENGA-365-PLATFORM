import Link from "next/link";
import { ShieldCheck, Leaf, AlertTriangle } from "lucide-react";

export interface SweatEquityCopy {
    eyebrow?: string;
    heading?: string;
    description?: string;
    cards?: Array<{ title: string; body: string }>;
    ctaLabel?: string;
}

interface SweatEquityBandProps {
    readonly copy?: SweatEquityCopy | null;
}

const DEFAULT_CARDS = [
    {
        title: "The commitment",
        body: "One verified Give Back activity per quarter. Logged through the platform with GPS coordinates.",
    },
    {
        title: "The impact",
        body: "Your hours contribute directly to a Corporate Partner's quarterly ESG scorecard and unlock additional funding.",
    },
    {
        title: "The protocol",
        body: "Three missed quarters → Welfare Officer review → potential suspension. We track this because the model only works if it's measured.",
    }
];

export default function SweatEquityBand({ copy }: SweatEquityBandProps) {
    const eyebrow = copy?.eyebrow?.trim() || "Sweat Equity Protocol";
    const heading = copy?.heading?.trim() || "Mentorship is earned — not free.";
    const description = copy?.description?.trim() || "Every mentee on Jenga365 commits to quarterly Give Back activities: community clean-ups, tree-planting, or sustainability advocacy. We log each activity with GPS and photo evidence. Three missed quarters and the platform suspends mentorship access pending Welfare Officer review.";
    const ctaLabel = copy?.ctaLabel?.trim() || "I accept — apply for mentorship";

    const cards = copy?.cards?.length === 3 ? copy.cards : DEFAULT_CARDS;

    return (
        <section
            id="sweat-equity"
            className="bg-background border-b border-border"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 md:py-24">
                <div className="max-w-2xl">
                    <span
                        className="text-eyebrow"
                        style={{ color: "var(--brand-green)" }}
                    >
                        {eyebrow}
                    </span>
                    <h2 className="mt-3 text-display-sm md:text-display-md">
                        {heading}
                    </h2>
                    <p
                        className="mt-5 text-body-lg"
                        style={{ color: "var(--foreground-muted)" }}
                    >
                        {description}
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card
                        icon={ShieldCheck}
                        title={cards[0].title}
                        body={cards[0].body}
                    />
                    <Card
                        icon={Leaf}
                        title={cards[1].title}
                        body={cards[1].body}
                        accent
                    />
                    <Card
                        icon={AlertTriangle}
                        title={cards[2].title}
                        body={cards[2].body}
                    />
                </div>

                <div className="mt-10">
                    <Link
                        href="/register/mentorship"
                        className="inline-flex items-center justify-center h-11 px-5 rounded-md font-medium text-white"
                        style={{ background: "var(--brand-green)" }}
                    >
                        {ctaLabel}
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
