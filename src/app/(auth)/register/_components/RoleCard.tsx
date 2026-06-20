"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export type RoleCardProps = {
    icon: React.ComponentType<{ className?: string }>;
    name: string;
    tagline: string;
    description: string;
    benefits: string[];
    badge: { label: string; tone: "success" | "warning" };
    cta: string;
    href: string;
    background: "green" | "red" | "black";
};

const BG = {
    green: "var(--brand-green)",
    red: "var(--brand-red)",
    black: "var(--brand-black)",
} as const;

export function Badge({ tone, children }: { tone: "success" | "warning"; children: React.ReactNode }) {
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
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-label font-medium"
            style={palette}
        >
            {children}
        </span>
    );
}

export function RoleCard({
    icon: Icon,
    name,
    tagline,
    description,
    benefits,
    badge,
    cta,
    href,
    background,
}: RoleCardProps) {
    return (
        <div
            className="group flex flex-col rounded-md border border-border bg-background p-6 lg:p-8 transition-colors hover:border-[color:var(--border-strong,#D4D4D8)]"
            style={{ boxShadow: "var(--shadow-sm)" }}
        >
            <div className="flex items-start justify-between">
                <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md"
                    style={{ background: "var(--surface-2)" }}
                >
                    <Icon className="h-5 w-5 text-foreground" />
                </div>
                <Badge tone={badge.tone}>{badge.label}</Badge>
            </div>

            <div className="mt-6 space-y-1.5">
                <h3 className="text-headline text-foreground">{name}</h3>
                <p className="text-body-sm text-foreground-muted">{tagline}</p>
            </div>

            <p className="mt-4 text-body-sm text-foreground-muted">{description}</p>

            <ul className="mt-6 space-y-2.5 flex-1">
                {benefits.map((b) => (
                    <li key={b} className="flex gap-2.5 items-start">
                        <Check
                            className="h-4 w-4 mt-0.5 shrink-0"
                            style={{ color: "var(--brand-green)" }}
                        />
                        <span className="text-body-sm text-foreground-muted">{b}</span>
                    </li>
                ))}
            </ul>

            <Link
                href={href}
                className="mt-8 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-colors hover:opacity-90"
                style={{ background: BG[background] }}
            >
                <span>{cta}</span>
                <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}
