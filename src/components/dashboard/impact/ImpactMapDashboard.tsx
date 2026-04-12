import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { Filter, Search, Download, Layers, Calendar } from "lucide-react";
import { getFundingMapData, getFundingBreakdown } from "@/lib/actions/fundingMap";
import { motion, AnimatePresence } from "framer-motion";

// Dynamic import for Leaflet map to avoid SSR issues
const FundingMap = dynamic(() => import("@/components/dashboard/impact/FundingMap"), {
    ssr: false,
    loading: () => <div className="w-full h-[600px] bg-muted animate-pulse flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Initializing Spatial Data Engine...</div>
});

interface Props {
    role: "SuperAdmin" | "CorporatePartner";
}

export default function ImpactMapDashboard({ role }: Props) {
    const [filters, setFilters] = useState<any>({
        timeFilter: "all",
        layers: ["funding", "trees", "clinics"],
    });

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            {/* Map Header */}
            <header className="p-6 border-b border-border bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <span className="section-label">Impact Geography</span>
                    <h1 className="font-playfair font-black text-3xl text-foreground">
                        Project Funding Map
                    </h1>
                    <p className="font-lato text-sm text-muted-foreground">
                        Visualising where Jenga365 and partners are creating impact across Kenya.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="SEARCH LOCATION..."
                            className="pl-10 pr-4 py-2 border border-input focus:border-primary outline-none font-mono text-[11px] uppercase tracking-widest bg-white w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 border border-input px-4 py-2 font-mono text-[11px] uppercase tracking-widest hover:border-primary transition-colors">
                        <Download className="w-4 h-4" /> Export Data
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-white px-6 py-2 font-mono text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity font-bold">
                        Add Project
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Side Controls (25%) */}
                <aside className="w-80 border-r border-border bg-white overflow-y-auto p-6 space-y-8">
                    {/* Role Scoping indicator */}
                    <div className="p-4 bg-muted/50 border border-border rounded flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${role === 'SuperAdmin' ? 'bg-[#BB0000]' : 'bg-[#006600]'}`} />
                        <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
                            {role === 'SuperAdmin' ? 'Global View (Admin)' : 'Scoped View (Partner)'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <span className="section-label flex items-center gap-2 italic">
                            <Layers className="w-3.5 h-3.5" /> Map Layers
                        </span>
                        <div className="space-y-3">
                            {["Clinics", "Webinars", "Tree Planting", "Mentorship Hubs", "Corporate Funding"].map((layer) => (
                                <label key={layer} className="flex items-center justify-between group cursor-pointer">
                                    <span className="font-lato text-sm text-[#4A4A4A] group-hover:text-foreground transition-colors">
                                        {layer}
                                    </span>
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className="w-4 h-4 accent-primary"
                                        onChange={(e) => {
                                            // handle change
                                        }}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <span className="section-label flex items-center gap-2 italic">
                            <Calendar className="w-3.5 h-3.5" /> Timeframe
                        </span>
                        <select className="w-full p-2 border border-input font-mono text-[11px] uppercase tracking-widest outline-none">
                            <option>All Time</option>
                            <option>Past Year</option>
                            <option>Current Quarter</option>
                            <option>Custom Range</option>
                        </select>
                    </div>

                    <div className="pt-8 border-t border-border space-y-6">
                        <span className="section-label">Quick Summary</span>
                        <div className="grid grid-cols-1 gap-4">
                            <SummaryItem label="Total Funded" value="KES 4.2M" color="text-primary" />
                            <SummaryItem label="Active Projects" value="48" color="text-foreground" />
                            <SummaryItem label="Youth Reached" value="1.2k" color="text-[#006600]" />
                        </div>
                        <button className="w-full py-3 text-center border border-primary text-primary font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all">
                            View Full Impact Report
                        </button>
                    </div>
                </aside>

                {/* Map Interface (75%) */}
                <main className="flex-1 relative bg-[#F9F9F8]">
                    <FundingMap filters={filters} role={role} />

                    {/* Mini Floating Legend */}
                    <div className="absolute bottom-6 right-6 bg-white border border-border p-4 z-[1000] shadow-sm">
                        <span className="section-label block mb-3 text-[9px]">Legend</span>
                        <div className="space-y-2">
                            <LegendItem color="#BB0000" label="Medical Clinics" />
                            <LegendItem color="#006600" label="Tree Planting" />
                            <LegendItem color="#000000" label="Mentorship Hub" />
                            <LegendItem color="#FFD700" label="Webinars" />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function SummaryItem({ label, value, color }: any) {
    return (
        <div className="p-4 bg-muted/5 flex flex-col gap-1 border border-transparent hover:border-border transition-all">
            <span className="font-mono text-[9px] text-muted-foreground uppercase">{label}</span>
            <span className={`font-playfair font-black text-2xl ${color}`}>{value}</span>
        </div>
    );
}

function LegendItem({ color, label }: any) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-mono text-[9px] uppercase tracking-tight text-muted-foreground">{label}</span>
        </div>
    );
}
