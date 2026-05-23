"use client";

import Link from "next/link";
import { GraduationCap, Sparkles, Building2, Leaf, ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth/client";

/**
 * The four stakeholders, written long-form for the About page.
 * Auth-aware CTAs — authenticated users see "Open dashboard"; guests see role-specific join.
 */
type Stakeholder = {
    id: "mentee" | "mentor" | "corporate" | "ngo";
    tag: string;
    name: string;
    principle: string;
    paragraph: string;
    rules: { label: string; detail: string }[];
    color: string;
    colorSoft: string;
    registerHref: string;
    joinCta: string;
    Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
};

const STAKEHOLDERS: Stakeholder[] = [
    {
        id: "mentee",
        tag: "The Army",
        name: "Mentees",
        principle: "Total Athlete — earned through Sweat Equity.",
        paragraph:
            "Mentees are the lifeblood of Jenga365. They are athletes and young professionals committed to becoming Total Athletes — body, mind, and community. Mentorship is never free: every mentee owes the platform one verified Sweat Equity activity per quarter — a community clean-up, a tree-planting day, or a sustainability advocacy event. Missed quarters trigger a Welfare Officer review under the Three Strikes protocol.",
        rules: [
            { label: "Earn it",        detail: "1 verified Give Back activity per quarter — logged with GPS + photo evidence." },
            { label: "Get matched",    detail: "AI-matched 1:2 mentorship — capped so attention stays focused." },
            { label: "Track resilience", detail: "Baseline + quarterly re-assessments power your growth delta." },
            { label: "Three strikes",  detail: "Three missed quarters → Welfare Officer review → potential suspension." },
        ],
        color: "var(--brand-green)",
        colorSoft: "var(--brand-green-soft)",
        registerHref: "/register/mentee",
        joinCta: "Join as a mentee",
        Icon: GraduationCap,
    },
    {
        id: "mentor",
        tag: "Human Capital",
        name: "Mentors",
        principle: "Plug-and-play philanthropy — one Power Hour per month.",
        paragraph:
            "Mentors are seasoned professionals who shape the next generation without the overhead. We call the commitment a Power Hour: one focused hour every month. We handle every logistical detail — AI matching, scheduling, session prompts, follow-ups, and impact logging. Mentors are capped at two active mentees so attention isn't diluted across a roster.",
        rules: [
            { label: "Power Hour",      detail: "Just one focused hour per month. We send the brief and run the comms." },
            { label: "1:2 cap",         detail: "Never more than two active mentees. Quality over volume." },
            { label: "Admin handled",   detail: "AI matching, scheduling, prompts, notes, follow-ups — all on us." },
            { label: "Impact tracked",  detail: "Your hours flow into the corporate-partner ESG ledger that funds the platform." },
        ],
        color: "var(--brand-red)",
        colorSoft: "var(--brand-red-soft)",
        registerHref: "/register/mentor",
        joinCta: "Apply as a mentor",
        Icon: Sparkles,
    },
    {
        id: "corporate",
        tag: "Enablers",
        name: "Corporate Partners",
        principle: "Invest in people. Measure the return.",
        paragraph:
            "Corporate Partners fund the engine — but funds are not released on a handshake. The Corporate Unlock Challenge ties every disbursement to a verified ESG milestone. When 500 sponsored trees survive the latest GPS-anchored audit, the milestone unlocks. When mentorship hours hit the contracted target, the next tranche unlocks. Every metric lives in a Looker Studio dashboard you can forward straight to your board.",
        rules: [
            { label: "Milestone-tied",  detail: "Funds release only on verified ESG audits (e.g. 500 trees alive)." },
            { label: "GPS evidence",    detail: "Tree-survival checks at 6 / 12 / 24 months — geo-tagged, KoBo-piped." },
            { label: "Looker reporting", detail: "Per-partner Looker Studio dashboards + shareable links for the board." },
            { label: "Quarterly M&E",   detail: "Aggregate impact rolled up to your sustainability report each quarter." },
        ],
        color: "var(--brand-black)",
        colorSoft: "var(--surface-2)",
        registerHref: "/register/corporate",
        joinCta: "Become a partner",
        Icon: Building2,
    },
    {
        id: "ngo",
        tag: "Technical Experts",
        name: "NGOs / CBOs",
        principle: "Resource Exchange — hardware in, workforce out.",
        paragraph:
            "NGOs and CBOs are the technical backbone. You bring the seedlings, the books, the equipment, the on-the-ground expertise. We bring a disciplined, organized volunteer workforce — vetted athlete-mentees doing their quarterly Sweat Equity. A simple Resource Exchange MOU formalises the swap; no payment flow, no corporate Unlock Challenge, no friction.",
        rules: [
            { label: "MOU, not invoice", detail: "Resource Exchange MOU — signed inside your NGO dashboard." },
            { label: "Workforce on tap", detail: "Mentees show up to your projects to clear their Sweat Equity." },
            { label: "Co-branded impact", detail: "Every event is tracked + attributed to both NGO and platform." },
            { label: "No Unlock Challenge", detail: "Lightweight onboarding — NGOs skip the milestone-tied corporate flow." },
        ],
        color: "var(--brand-green)",
        colorSoft: "var(--brand-green-soft)",
        registerHref: "/register/ngo",
        joinCta: "Sign an MOU",
        Icon: Leaf,
    },
];

export default function StakeholdersDeepDive() {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    return (
        <section className="bg-background border-y border-border">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28">
                <div className="max-w-2xl mb-14">
                    <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                        Symbiotic value exchange
                    </p>
                    <h2 className="mt-3 text-display-md text-foreground">
                        Four roles. Each earns its place.
                    </h2>
                    <p className="mt-5 text-body-lg text-foreground-muted">
                        Jenga365 is not a free service. Every stakeholder gives something measurable
                        and gets something measurable back. Here&apos;s the contract.
                    </p>
                </div>

                <div className="space-y-12 lg:space-y-16">
                    {STAKEHOLDERS.map((s, i) => (
                        <article
                            key={s.id}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
                        >
                            <div className="lg:col-span-4 space-y-4">
                                <div
                                    className="inline-flex h-12 w-12 items-center justify-center rounded-md"
                                    style={{ background: s.colorSoft }}
                                >
                                    <s.Icon className="h-6 w-6" style={{ color: s.color }} />
                                </div>
                                <div>
                                    <p className="text-eyebrow" style={{ color: s.color }}>
                                        {String(i + 1).padStart(2, "0")} · {s.tag}
                                    </p>
                                    <h3 className="mt-1 text-display-sm text-foreground">{s.name}</h3>
                                </div>
                                <p className="text-body font-medium text-foreground">{s.principle}</p>
                                <p className="text-body-sm text-foreground-muted">{s.paragraph}</p>

                                <div className="pt-2">
                                    {isAuthenticated ? (
                                        <Link
                                            href="/dashboard"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-label font-medium text-white transition-opacity hover:opacity-90"
                                            style={{ background: s.color }}
                                        >
                                            Open dashboard
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={s.registerHref}
                                            className="inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-label font-medium text-white transition-opacity hover:opacity-90"
                                            style={{ background: s.color }}
                                        >
                                            {s.joinCta}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-8">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {s.rules.map((rule) => (
                                        <div
                                            key={rule.label}
                                            className="rounded-md border border-border bg-background p-4"
                                        >
                                            <dt className="text-eyebrow" style={{ color: s.color }}>
                                                {rule.label}
                                            </dt>
                                            <dd className="mt-1 text-body-sm text-foreground-muted">
                                                {rule.detail}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
