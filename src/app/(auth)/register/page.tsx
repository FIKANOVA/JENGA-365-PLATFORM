import Link from "next/link";
import { ArrowRight, Users, Handshake } from "lucide-react";
import { RegisterShell } from "./_components/RegisterShell";

type Pathway = {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    blurb: string;
    options: string[];
    href: string;
    cta: string;
    background: string;
};

const PATHWAYS: Pathway[] = [
    {
        icon: Users,
        title: "Join Free",
        blurb:
            "Mentorship for athletes, young professionals, and experienced mentors. AI-matched, time-boxed, impact-tracked.",
        options: ["Mentee — instant access", "Mentor — approval required"],
        href: "/register/mentorship",
        cta: "Continue to mentorship",
        background: "var(--brand-green)",
    },
    {
        icon: Handshake,
        title: "Become a Partner",
        blurb:
            "Corporates and NGOs fund or amplify field programmes with GPS-anchored evidence and quarterly ESG reporting.",
        options: ["Corporate — CSR + Looker Studio", "NGO — programme collaboration"],
        href: "/register/partner",
        cta: "Continue to partnership",
        background: "var(--brand-black)",
    },
];

export default function RegisterHubPage() {
    return (
        <RegisterShell
            step="Step 1 of 3"
            eyebrow="Choose your path"
            heading="How will you contribute?"
            subheading="Two pathways. Both built around measurable, verifiable impact."
        >
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {PATHWAYS.map((p) => {
                    const Icon = p.icon;
                    return (
                        <div
                            key={p.title}
                            className="group flex flex-col rounded-lg border border-border bg-background p-8 lg:p-10 transition-colors hover:border-[color:var(--border-strong,#D4D4D8)]"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <div
                                className="inline-flex h-12 w-12 items-center justify-center rounded-md"
                                style={{ background: "var(--surface-2)" }}
                            >
                                <Icon className="h-6 w-6 text-foreground" />
                            </div>

                            <h3 className="mt-6 text-headline text-foreground">{p.title}</h3>
                            <p className="mt-3 text-body-lg text-foreground-muted">{p.blurb}</p>

                            <ul className="mt-6 space-y-2 flex-1">
                                {p.options.map((o) => (
                                    <li
                                        key={o}
                                        className="text-body-sm text-foreground-muted before:content-['—'] before:mr-2 before:text-foreground-muted/60"
                                    >
                                        {o}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={p.href}
                                className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-colors hover:opacity-90"
                                style={{ background: p.background }}
                            >
                                <span>{p.cta}</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    );
                })}
            </div>
        </RegisterShell>
    );
}
