"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Search, Download, Layers, Calendar } from "lucide-react";
import { FundingMapFilters } from "@/lib/actions/fundingMap";

const FundingMap = dynamic(() => import("@/components/dashboard/impact/FundingMap"), {
    ssr: false,
    loading: () => (
        <div
            className="w-full h-[600px] animate-pulse flex items-center justify-center text-eyebrow text-foreground-muted"
            style={{ background: "var(--surface-1)" }}
        >
            Initializing spatial data engine…
        </div>
    ),
});

interface Props {
    role: "SuperAdmin" | "CorporatePartner";
}

export default function ImpactMapDashboard({ role }: Props) {
    const [filters, setFilters] = useState<FundingMapFilters>({
        timeFilter: "all",
        layers: ["funding", "trees", "clinics"],
    });

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            {/* Map Header */}
            <header className="p-6 border-b border-border bg-background flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <span className="text-eyebrow text-foreground-muted">Impact geography</span>
                    <h1 className="text-display-md text-foreground">Project funding map</h1>
                    <p className="text-body-sm text-foreground-muted">
                        Visualising where Jenga365 and partners are creating impact across Kenya.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
                        <input
                            type="text"
                            placeholder="Search location…"
                            className="h-9 w-64 pl-10 pr-4 rounded-md border border-border bg-background text-body-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-[color:var(--border-strong,#D4D4D8)] focus:ring-2 focus:ring-[color:var(--brand-green-soft)] transition-all"
                        />
                    </div>
                    <button className="inline-flex items-center gap-2 h-9 rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]">
                        <Download className="w-4 h-4" /> Export data
                    </button>
                    <button
                        className="inline-flex items-center gap-2 h-9 rounded-md px-5 text-label font-medium transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                    >
                        Add project
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Side Controls */}
                <aside className="w-80 border-r border-border bg-background overflow-y-auto p-6 space-y-8">
                    {/* Role Scoping indicator */}
                    <div
                        className="p-4 rounded-md border border-border flex items-center gap-3"
                        style={{ background: "var(--surface-1)" }}
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: role === "SuperAdmin" ? "var(--brand-red)" : "var(--brand-green)" }}
                        />
                        <span className="text-eyebrow text-foreground font-medium">
                            {role === "SuperAdmin" ? "Global view (admin)" : "Scoped view (partner)"}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <span className="text-eyebrow text-foreground-muted flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5" /> Map layers
                        </span>
                        <div className="space-y-3">
                            {["Clinics", "Webinars", "Tree planting", "Mentorship hubs", "Corporate funding"].map((layer) => (
                                <label key={layer} className="flex items-center justify-between group cursor-pointer">
                                    <span className="text-body-sm text-foreground-muted group-hover:text-foreground transition-colors">
                                        {layer}
                                    </span>
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className="w-4 h-4"
                                        style={{ accentColor: "var(--brand-green)" }}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <span className="text-eyebrow text-foreground-muted flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Timeframe
                        </span>
                        <select className="w-full h-10 px-3 rounded-md border border-border bg-background text-body-sm text-foreground outline-none focus:border-[color:var(--border-strong,#D4D4D8)]">
                            <option>All time</option>
                            <option>Past year</option>
                            <option>Current quarter</option>
                            <option>Custom range</option>
                        </select>
                    </div>

                    <div className="pt-8 border-t border-border space-y-6">
                        <span className="text-eyebrow text-foreground-muted">Quick summary</span>
                        <div className="grid grid-cols-1 gap-3">
                            <SummaryItem label="Total funded" value="—" color="var(--brand-green)" />
                            <SummaryItem label="Active projects" value="—" color="var(--foreground)" />
                            <SummaryItem label="Youth reached" value="—" color="var(--brand-green)" />
                        </div>
                        <button
                            className="w-full py-2.5 rounded-md border text-label transition-colors hover:bg-[color:var(--brand-green-soft)]"
                            style={{ borderColor: "var(--brand-green)", color: "var(--brand-green)" }}
                        >
                            View full impact report
                        </button>
                    </div>
                </aside>

                {/* Map Interface */}
                <main className="flex-1 relative" style={{ background: "var(--surface-1)" }}>
                    <FundingMap filters={filters} role={role} />

                    {/* Mini Floating Legend */}
                    <div
                        className="absolute bottom-6 right-6 rounded-md border border-border bg-background p-4 z-[1000]"
                        style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                        <span className="text-eyebrow text-foreground-muted block mb-3">Legend</span>
                        <div className="space-y-2">
                            <LegendItem color="var(--brand-red)" label="Medical clinics" />
                            <LegendItem color="var(--brand-green)" label="Tree planting" />
                            <LegendItem color="#000000" label="Mentorship hub" />
                            <LegendItem color="#FFD700" label="Webinars" />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div
            className="p-4 flex flex-col gap-1 border border-transparent hover:border-border transition-colors rounded-md"
            style={{ background: "var(--surface-1)" }}
        >
            <span className="text-eyebrow text-foreground-muted">{label}</span>
            <span className="text-display-sm" style={{ color }}>
                {value}
            </span>
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-eyebrow text-foreground-muted">{label}</span>
        </div>
    );
}
