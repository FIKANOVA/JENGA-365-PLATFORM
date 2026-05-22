"use client";

import { Package, Users, CalendarCheck, ArrowRight, FileCheck } from "lucide-react";
import Link from "next/link";

interface MouStatus {
    signed: boolean;
    signedAt: Date | null;
    resourceTypes: string[] | null;
    expiresAt: Date | null;
}

interface ExchangeEntry {
    id: string;
    resourceType: string;
    quantity: number | null;
    notes: string | null;
    exchangedAt: Date | null;
}

interface NgoDashboardProps {
    orgName: string;
    mouStatus: MouStatus | null;
    exchangeLog: ExchangeEntry[];
}

export default function NgoDashboard({ orgName, mouStatus, exchangeLog }: NgoDashboardProps) {
    const totalResourcesLogged = exchangeLog.length;
    const totalUnits = exchangeLog.reduce((sum, e) => sum + (e.quantity ?? 0), 0);
    const resourceTypeSet = new Set(exchangeLog.map((e) => e.resourceType));

    const metrics = [
        {
            label: "Resources contributed",
            value: String(totalResourcesLogged),
            sub: "exchange events logged",
            icon: Package,
        },
        {
            label: "Total units mobilised",
            value: totalUnits > 0 ? String(totalUnits) : "—",
            sub: "across all resource types",
            icon: Users,
        },
        {
            label: "Resource categories",
            value: resourceTypeSet.size > 0 ? String(resourceTypeSet.size) : "—",
            sub: Array.from(resourceTypeSet).slice(0, 2).join(", ") || "none yet",
            icon: CalendarCheck,
        },
    ];

    return (
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-6 lg:py-8 space-y-10">
            {/* Header */}
            <header className="space-y-1.5 border-b border-border pb-6">
                <p className="text-eyebrow text-foreground-muted">
                    NGO Resource Exchange portal
                </p>
                <h1 className="text-display-sm text-foreground">{orgName}</h1>
                <p className="text-body-sm text-foreground-muted">
                    You provide the resources. We mobilise the workforce.
                </p>
            </header>

            {/* MOU Status Banner */}
            {mouStatus?.signed && (
                <div
                    className="flex items-center gap-3 rounded-md border px-5 py-3"
                    style={{
                        borderColor: "var(--brand-green)",
                        background: "var(--brand-green-soft)",
                        color: "var(--brand-green)",
                    }}
                >
                    <FileCheck className="h-4 w-4 shrink-0" />
                    <span className="text-label">
                        Resource Exchange MOU active
                        {mouStatus.signedAt
                            ? ` — signed ${new Date(mouStatus.signedAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}`
                            : ""}
                        {mouStatus.expiresAt
                            ? ` · expires ${new Date(mouStatus.expiresAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}`
                            : ""}
                    </span>
                </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map(({ label, value, sub, icon: Icon }) => (
                    <div
                        key={label}
                        className="rounded-lg border border-border bg-background p-6 space-y-4 hover:border-[color:var(--border-strong,#D4D4D8)] transition-colors"
                        style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                        <div className="flex items-start justify-between">
                            <p className="text-eyebrow text-foreground-muted">{label}</p>
                            <Icon className="h-4 w-4 text-foreground-subtle" />
                        </div>
                        <p className="text-display-sm text-foreground">{value}</p>
                        <p className="text-body-sm text-foreground-muted">{sub}</p>
                    </div>
                ))}
            </div>

            {/* Exchange Log */}
            <section className="space-y-4">
                <h2 className="text-headline text-foreground">Resource exchange log</h2>

                {exchangeLog.length === 0 ? (
                    <div
                        className="rounded-md border border-dashed border-border p-10 text-center space-y-3"
                        style={{ background: "var(--surface-1)" }}
                    >
                        <Package className="mx-auto h-8 w-8 text-foreground-subtle" />
                        <p className="text-label text-foreground-muted">No exchanges logged yet</p>
                        <p className="text-body-sm text-foreground-muted max-w-xs mx-auto">
                            Resource exchanges will appear here as your team contributes materials, seedlings, or expertise to Jenga365 projects.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-md border border-border bg-background divide-y divide-border overflow-hidden">
                        {exchangeLog.map((entry) => (
                            <div
                                key={entry.id}
                                className="px-6 py-4 flex items-center justify-between gap-4 transition-colors"
                                style={{ background: "transparent" }}
                            >
                                <div className="space-y-0.5 min-w-0">
                                    <p className="text-label text-foreground truncate">
                                        {entry.resourceType}
                                    </p>
                                    {entry.notes && (
                                        <p className="text-body-sm text-foreground-muted truncate">{entry.notes}</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0 space-y-0.5">
                                    {entry.quantity != null && (
                                        <p className="text-headline text-foreground">{entry.quantity}</p>
                                    )}
                                    {entry.exchangedAt && (
                                        <p className="text-eyebrow text-foreground-muted">
                                            {new Date(entry.exchangedAt).toLocaleDateString("en-KE", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Quick links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/dashboard/ngo/mou"
                    className="group flex items-center justify-between rounded-md border border-border bg-background px-6 py-5 hover:border-[color:var(--border-strong,#D4D4D8)] transition-colors"
                >
                    <div className="space-y-1">
                        <p className="text-eyebrow text-foreground-muted">Agreement</p>
                        <p className="text-headline text-foreground">View / renew MOU</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-foreground-subtle group-hover:translate-x-1 group-hover:text-foreground transition-all" />
                </Link>

                <Link
                    href="/dashboard/settings"
                    className="group flex items-center justify-between rounded-md border border-border bg-background px-6 py-5 hover:border-[color:var(--border-strong,#D4D4D8)] transition-colors"
                >
                    <div className="space-y-1">
                        <p className="text-eyebrow text-foreground-muted">Organisation</p>
                        <p className="text-headline text-foreground">Profile & settings</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-foreground-subtle group-hover:translate-x-1 group-hover:text-foreground transition-all" />
                </Link>
            </div>
        </div>
    );
}
