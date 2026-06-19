"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Sparkles, Building2, Leaf, ArrowRight, ChevronDown } from "lucide-react";
import { useSession } from "@/lib/auth/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STAKEHOLDERS = [
    {
        id: "mentee",
        tag: "The Army",
        name: "Mentees",
        principle: "The Total Athlete: body, mind, and community.",
        paragraph:
            "Mentees are not just participants. They are athletes and young professionals committed to becoming Total Athletes — body, mind, and community. Mentorship is never free: every mentee owes the platform one verified Sweat Equity activity per quarter — a community clean-up, a tree-planting day, or a sustainability advocacy event. Missed quarters trigger a Welfare Officer review under the Three Strikes protocol.",
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
    const [openId, setOpenId] = useState<string>("mentee");

    return (
        <section className="bg-[color:var(--surface-1)] border-y border-border py-20 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    <div className="lg:w-1/3">
                        <div className="sticky top-24">
                            <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                                Symbiotic value exchange
                            </p>
                            <h2 className="mt-3 text-display-md text-foreground">
                                Four roles.<br/>Each earns its place.
                            </h2>
                            <p className="mt-5 text-body-lg text-foreground-muted">
                                Jenga365 is not a free service. Every stakeholder gives something measurable
                                and gets something measurable back. Here&apos;s the contract.
                            </p>
                        </div>
                    </div>

                    <div className="lg:w-2/3">
                        <div className="space-y-4">
                            {STAKEHOLDERS.map((s, i) => {
                                const isOpen = openId === s.id;
                                return (
                                    <div
                                        key={s.id}
                                        className={cn(
                                            "rounded-xl border overflow-hidden transition-all duration-300",
                                            isOpen ? "bg-background shadow-md border-border" : "bg-[color:var(--surface-2)] border-transparent hover:border-border"
                                        )}
                                    >
                                        <button
                                            onClick={() => setOpenId(isOpen ? "" : s.id)}
                                            className="w-full flex items-center justify-between p-6 text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="inline-flex h-12 w-12 items-center justify-center rounded-lg shrink-0 transition-colors"
                                                    style={{
                                                        background: isOpen ? s.colorSoft : "var(--surface-3)",
                                                        color: isOpen ? s.color : "var(--foreground-muted)"
                                                    }}
                                                >
                                                    <s.Icon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-eyebrow" style={{ color: isOpen ? s.color : "var(--foreground-muted)" }}>
                                                        {String(i + 1).padStart(2, "0")} · {s.tag}
                                                    </p>
                                                    <h3 className="mt-1 text-headline text-foreground">{s.name}</h3>
                                                </div>
                                            </div>
                                            <ChevronDown
                                                className={cn(
                                                    "h-5 w-5 text-foreground-muted transition-transform duration-300",
                                                    isOpen ? "rotate-180" : ""
                                                )}
                                            />
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="px-6 pb-8 pt-2">
                                                        <div className="h-px w-full bg-border mb-6" />

                                                        <div className="flex flex-col lg:flex-row gap-8">
                                                            <div className="lg:w-1/2 space-y-6">
                                                                <p className="text-body font-medium text-foreground">{s.principle}</p>
                                                                <p className="text-body-sm text-foreground-muted leading-relaxed">{s.paragraph}</p>

                                                                <div>
                                                                    {isAuthenticated ? (
                                                                        <Link
                                                                            href="/dashboard"
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex h-11 items-center gap-2 rounded-lg px-5 text-label font-medium text-white transition-transform hover:-translate-y-0.5 shadow-sm"
                                                                            style={{ background: s.color }}
                                                                        >
                                                                            Open dashboard
                                                                            <ArrowRight className="h-4 w-4" />
                                                                        </Link>
                                                                    ) : (
                                                                        <Link
                                                                            href={s.registerHref}
                                                                            className="inline-flex h-11 items-center gap-2 rounded-lg px-5 text-label font-medium text-white transition-transform hover:-translate-y-0.5 shadow-sm"
                                                                            style={{ background: s.color }}
                                                                        >
                                                                            {s.joinCta}
                                                                            <ArrowRight className="h-4 w-4" />
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="lg:w-1/2">
                                                                <dl className="grid grid-cols-1 gap-3">
                                                                    {s.rules.map((rule) => (
                                                                        <div
                                                                            key={rule.label}
                                                                            className="rounded-lg border border-border bg-[color:var(--surface-1)] p-4 flex gap-3"
                                                                        >
                                                                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                                                                            <div>
                                                                                <dt className="text-label text-foreground">
                                                                                    {rule.label}
                                                                                </dt>
                                                                                <dd className="mt-1 text-body-sm text-foreground-muted">
                                                                                    {rule.detail}
                                                                                </dd>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </dl>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}