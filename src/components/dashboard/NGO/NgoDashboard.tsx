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
            label: "Resources Contributed",
            value: String(totalResourcesLogged),
            sub: "exchange events logged",
            icon: Package,
        },
        {
            label: "Total Units Mobilised",
            value: totalUnits > 0 ? String(totalUnits) : "—",
            sub: "across all resource types",
            icon: Users,
        },
        {
            label: "Resource Categories",
            value: resourceTypeSet.size > 0 ? String(resourceTypeSet.size) : "—",
            sub: Array.from(resourceTypeSet).slice(0, 2).join(", ") || "none yet",
            icon: CalendarCheck,
        },
    ];

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                    NGO Resource Exchange Portal
                </p>
                <h1 className="font-serif font-black text-4xl uppercase tracking-tighter leading-none">
                    {orgName}
                </h1>
                <p className="text-sm text-muted-foreground font-light">
                    You provide the resources. We mobilise the workforce.
                </p>
            </div>

            {/* MOU Status Banner */}
            {mouStatus?.signed && (
                <div className="flex items-center gap-4 px-6 py-4 border border-green-600/30 bg-green-600/5 text-sm">
                    <FileCheck className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-green-700">
                        Resource Exchange MOU Active
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
                        className="jenga-card p-6 space-y-4 border-foreground/10 hover:border-foreground/30 transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
                                {label}
                            </p>
                            <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="font-serif font-black text-4xl tracking-tighter">{value}</p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                ))}
            </div>

            {/* Exchange Log */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground font-bold">
                        Resource Exchange Log
                    </h2>
                </div>

                {exchangeLog.length === 0 ? (
                    <div className="jenga-card p-10 text-center space-y-4 border-dashed">
                        <Package className="w-8 h-8 text-muted-foreground mx-auto" />
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            No exchanges logged yet
                        </p>
                        <p className="text-sm text-muted-foreground font-light max-w-xs mx-auto">
                            Resource exchanges will appear here as your team contributes materials, seedlings, or expertise to Jenga365 projects.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border border border-border">
                        {exchangeLog.map((entry) => (
                            <div key={entry.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                <div className="space-y-0.5 min-w-0">
                                    <p className="font-mono text-[10px] uppercase tracking-widest font-bold truncate">
                                        {entry.resourceType}
                                    </p>
                                    {entry.notes && (
                                        <p className="text-xs text-muted-foreground truncate">{entry.notes}</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0 space-y-0.5">
                                    {entry.quantity != null && (
                                        <p className="font-serif font-black text-xl">{entry.quantity}</p>
                                    )}
                                    {entry.exchangedAt && (
                                        <p className="font-mono text-[9px] text-muted-foreground">
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
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <Link
                    href="/dashboard/ngo/mou"
                    className="flex items-center justify-between px-6 py-5 border border-border hover:border-foreground transition-all group"
                >
                    <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Agreement</p>
                        <p className="font-serif font-bold text-lg mt-1">View / Renew MOU</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                    href="/dashboard/settings"
                    className="flex items-center justify-between px-6 py-5 border border-border hover:border-foreground transition-all group"
                >
                    <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Organisation</p>
                        <p className="font-serif font-bold text-lg mt-1">Profile & Settings</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
