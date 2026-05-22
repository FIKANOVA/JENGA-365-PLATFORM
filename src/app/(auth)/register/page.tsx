"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    GraduationCap,
    Sparkles,
    Building2,
    Check,
} from "lucide-react";
import Logo from "@/components/shared/Logo";

type Role = {
    id: "mentee" | "mentor" | "corporate";
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    tagline: string;
    description: string;
    benefits: string[];
    badge: { label: string; tone: "success" | "warning" };
    cta: string;
};

const ROLES: Role[] = [
    {
        id: "mentee",
        name: "Mentee",
        icon: GraduationCap,
        tagline: "Athletes & young professionals",
        description:
            "AI-matched mentorship, structured community engagement, and resources to compound your growth.",
        benefits: [
            "Professional mentorship matching",
            "Resource library & courses",
            "Community events & clinics",
            "AI-powered growth profile",
        ],
        badge: { label: "Instant access", tone: "success" },
        cta: "Join as mentee",
    },
    {
        id: "mentor",
        name: "Mentor",
        icon: Sparkles,
        tagline: "Experienced professionals",
        description:
            "Share expertise in focused, time-boxed sessions. Access founder circles and strategic networks.",
        benefits: [
            "Guide one focused hour per month",
            "Strategic network access",
            "Impact tracking dashboard",
            "Exclusive founder circles",
        ],
        badge: { label: "Approval required", tone: "warning" },
        cta: "Apply as mentor",
    },
    {
        id: "corporate",
        name: "Corporate partner",
        icon: Building2,
        tagline: "Organisations & businesses",
        description:
            "Integrate CSR impact, sponsor talent pipelines, and report on measurable climate action.",
        benefits: [
            "CSR impact integration",
            "Talent pipeline visibility",
            "Quarterly Looker Studio reports",
            "Aggregated trees-alive metrics",
        ],
        badge: { label: "Approval required", tone: "warning" },
        cta: "Partner with us",
    },
];

function Badge({ tone, children }: { tone: "success" | "warning"; children: React.ReactNode }) {
    const palette =
        tone === "success"
            ? {
                  background: "var(--brand-green-soft)",
                  color: "var(--brand-green)",
              }
            : {
                  background: "color-mix(in srgb, var(--warning) 12%, transparent)",
                  color: "var(--warning)",
              };
    return (
        <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium"
            style={palette}
        >
            {children}
        </span>
    );
}

export default function RegisterHubPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Minimal hub header */}
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Logo size="md" />
                    <div className="flex items-center gap-3">
                        <span className="text-eyebrow text-foreground-muted">Step 1 of 3</span>
                        <span className="hidden sm:inline-block h-px w-8 bg-border" />
                        <Link
                            href="/login"
                            className="text-label text-foreground-muted hover:text-foreground transition-colors"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 mx-auto w-full max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
                {/* Heading */}
                <div className="max-w-2xl mx-auto text-center space-y-4">
                    <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                        Choose your role
                    </p>
                    <h1 className="text-display-md text-foreground">
                        How will you contribute?
                    </h1>
                    <p className="text-body-lg text-foreground-muted">
                        Each path is built for measurable impact — at every level.
                    </p>
                </div>

                {/* Role cards */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ROLES.map((role) => {
                        const Icon = role.icon;
                        return (
                            <div
                                key={role.id}
                                className="group flex flex-col rounded-lg border border-border bg-background p-6 lg:p-8 transition-colors hover:border-[color:var(--border-strong,#D4D4D8)]"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                <div className="flex items-start justify-between">
                                    <div
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-md"
                                        style={{ background: "var(--surface-2)" }}
                                    >
                                        <Icon className="h-5 w-5 text-foreground" />
                                    </div>
                                    <Badge tone={role.badge.tone}>{role.badge.label}</Badge>
                                </div>

                                <div className="mt-6 space-y-1.5">
                                    <h3 className="text-headline text-foreground">{role.name}</h3>
                                    <p className="text-body-sm text-foreground-muted">{role.tagline}</p>
                                </div>

                                <p className="mt-4 text-body-sm text-foreground-muted">
                                    {role.description}
                                </p>

                                <ul className="mt-6 space-y-2.5 flex-1">
                                    {role.benefits.map((b) => (
                                        <li key={b} className="flex gap-2.5 items-start">
                                            <Check
                                                className="h-4 w-4 mt-0.5 shrink-0"
                                                style={{ color: "var(--brand-green)" }}
                                            />
                                            <span className="text-body-sm text-foreground-muted">{b}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => router.push(`/register/${role.id}`)}
                                    className="mt-8 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-label font-medium transition-colors"
                                    style={{
                                        background:
                                            role.id === "mentee"
                                                ? "var(--brand-green)"
                                                : "var(--foreground)",
                                        color:
                                            role.id === "mentee"
                                                ? "var(--brand-green-fg)"
                                                : "var(--background)",
                                    }}
                                >
                                    <span>{role.cta}</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Sweat-equity disclosure — required before any join CTA */}
                <div
                    className="mt-12 mx-auto max-w-3xl rounded-md border border-border p-4 lg:p-5 text-body-sm text-foreground-muted"
                    style={{ background: "var(--surface-1)" }}
                >
                    <span className="font-medium text-foreground">Sweat equity:</span>{" "}
                    Membership is reciprocal. Mentees are expected to complete a verified
                    community give-back (tree planting, clean-up, book drive) each quarter.
                    Missed contributions reset platform access — a three-strikes protocol
                    keeps the ecosystem honest.
                </div>

                {/* Login link */}
                <div className="mt-10 text-center">
                    <p className="text-body-sm text-foreground-muted">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium hover:underline"
                            style={{ color: "var(--brand-green)" }}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
