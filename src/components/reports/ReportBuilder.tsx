"use client";

/**
 * Report Builder Dashboard — Corporate Partner
 * Converted from Stitch screen f23fa27dcff449e88ec800f3ef41f176
 */

import { useState } from "react";
import { FileDown, Eye, Plus, RefreshCw, Trash2, Calendar } from "lucide-react";

const PERIOD_PRESETS = ["Q1 2024", "Q2 2024", "H1 2024", "Full Year 2024"];

const REPORT_SECTIONS = [
    { id: "executive", label: "Executive Summary", locked: true },
    { id: "mentorship", label: "Mentorship Metrics Table" },
    { id: "esg", label: "ESG Alignment Scores" },
    { id: "engagement", label: "Employee Engagement Chart" },
    { id: "events", label: "Sponsored Events Table" },
    { id: "stories", label: "Success Stories & Testimonials" },
    { id: "financial", label: "Financial Transparency" },
    { id: "sdg", label: "SDG Mapping Detail" },
];

const REPORT_HISTORY = [
    { name: "Q4 2023 Impact Report", period: "Oct – Dec 2023", generated: "Jan 5, 2024", pages: 2 },
    { name: "H2 2023 Full Report", period: "Jul – Dec 2023", generated: "Jan 12, 2024", pages: 4 },
    { name: "Q3 2023 Summary", period: "Jul – Sep 2023", generated: "Oct 3, 2023", pages: 1 },
];

export default function ReportBuilderPage() {
    const [activePeriod, setActivePeriod] = useState("Q1 2024");
    const [selectedSections, setSelectedSections] = useState<string[]>(
        REPORT_SECTIONS.filter((s) => s.id !== "financial" && s.id !== "sdg").map((s) => s.id)
    );

    const toggleSection = (id: string) => {
        setSelectedSections((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            <div className="flex">
                {/* ── SIDEBAR ───────────────────────────────── */}
                <aside className="w-[220px] bg-[#F2F0EB] min-h-screen border-r border-[#E8E4DC] p-6 shrink-0 print:hidden">
                    <div className="mb-10">
                        <span className="text-xl font-black italic text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)" }}>
                            Jenga<span className="text-[#BB0000]">365</span>
                        </span>
                    </div>
                    <nav className="space-y-1">
                        {["Overview", "ESG Reports", "Employee Mentors", "Events", "Sponsorships", "Settings"].map((item) => (
                            <a
                                key={item}
                                href="/"
                                className={`block px-4 py-2.5 text-[10px] tracking-[0.15em] transition-all ${item === "ESG Reports" ? "bg-[#FFF0F0] text-[#BB0000] border-l-[3px] border-[#BB0000]" : "text-[#4A4A4A] hover:bg-[#EDE9E0]"}`}
                                style={{ fontFamily: "var(--font-dm-mono)", borderRadius: 2 }}
                            >
                                {item.toUpperCase()}
                            </a>
                        ))}
                    </nav>
                    <div className="mt-auto pt-10">
                        <div className="flex items-center gap-3 p-3 bg-white/50" style={{ borderRadius: 2 }}>
                            <div className="w-8 h-8 bg-[#BB0000] text-white flex items-center justify-center text-[8px] font-bold" style={{ borderRadius: 2, fontFamily: "var(--font-dm-mono)" }}>AC</div>
                            <span className="text-[10px] text-[#1A1A1A] font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>ACME CORP</span>
                        </div>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ──────────────────────────── */}
                <main className="flex-1 p-8">
                    {/* Breadcrumb + Header */}
                    <p className="text-[9px] text-[#8A8A8A] mb-2 tracking-[0.15em]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                        DASHBOARD / ESG REPORTS / REPORT BUILDER
                    </p>
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>
                            Generate Impact Report
                        </h1>
                        <button className="flex items-center gap-2 bg-[#BB0000] text-white px-5 py-3 text-[10px] font-bold tracking-[0.2em] hover:opacity-90 transition-opacity" style={{ borderRadius: 2, fontFamily: "var(--font-dm-mono)" }}>
                            <Plus size={14} /> NEW REPORT
                        </button>
                    </div>

                    <div className="grid grid-cols-5 gap-8">
                        {/* ── CONFIGURATION PANEL (3 cols) ── */}
                        <div className="col-span-3 bg-white border border-[#E8E4DC] p-8" style={{ borderRadius: 2 }}>
                            <p className="text-[10px] text-[#BB0000] font-bold tracking-[0.3em] mb-6" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                CONFIGURE YOUR REPORT
                            </p>

                            {/* Period */}
                            <div className="mb-8">
                                <p className="text-[9px] text-[#8A8A8A] font-bold tracking-[0.15em] mb-3" style={{ fontFamily: "var(--font-dm-mono)" }}>REPORTING PERIOD</p>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="flex-1 border border-[#E8E4DC] px-3 py-2.5 flex items-center gap-2" style={{ borderRadius: 2 }}>
                                            <Calendar size={14} className="text-[#8A8A8A]" />
                                            <span className="text-sm text-[#8A8A8A]" style={{ fontFamily: "var(--font-lato)" }}>Jan 1, 2024</span>
                                        </div>
                                        <span className="text-[9px] text-[#8A8A8A]" style={{ fontFamily: "var(--font-dm-mono)" }}>TO</span>
                                        <div className="flex-1 border border-[#E8E4DC] px-3 py-2.5 flex items-center gap-2" style={{ borderRadius: 2 }}>
                                            <Calendar size={14} className="text-[#8A8A8A]" />
                                            <span className="text-sm text-[#8A8A8A]" style={{ fontFamily: "var(--font-lato)" }}>Mar 31, 2024</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {PERIOD_PRESETS.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setActivePeriod(p)}
                                            className={`px-3 py-1.5 text-[9px] font-bold tracking-[0.1em] transition-all ${activePeriod === p ? "bg-[#BB0000] text-white" : "bg-[#F5F5F5] text-[#4A4A4A] border border-[#E8E4DC] hover:border-[#BB0000]/30"}`}
                                            style={{ borderRadius: 2, fontFamily: "var(--font-dm-mono)" }}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section Toggles */}
                            <div className="mb-8">
                                <p className="text-[9px] text-[#8A8A8A] font-bold tracking-[0.15em] mb-3" style={{ fontFamily: "var(--font-dm-mono)" }}>INCLUDE IN REPORT</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {REPORT_SECTIONS.map((section) => (
                                        <label key={section.id} className="flex items-center gap-3 cursor-pointer group">
                                            <div
                                                className={`w-4 h-4 border-2 flex items-center justify-center transition-all ${selectedSections.includes(section.id) || section.locked ? "bg-[#BB0000] border-[#BB0000]" : "border-[#D0CBC0] group-hover:border-[#BB0000]/40"}`}
                                                style={{ borderRadius: 2 }}
                                                onClick={() => !section.locked && toggleSection(section.id)}
                                            >
                                                {(selectedSections.includes(section.id) || section.locked) && (
                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="square" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`text-xs ${section.locked ? "text-[#8A8A8A]" : "text-[#1A1A1A]"}`} style={{ fontFamily: "var(--font-lato)" }}>
                                                {section.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Branding */}
                            <div>
                                <p className="text-[9px] text-[#8A8A8A] font-bold tracking-[0.15em] mb-3" style={{ fontFamily: "var(--font-dm-mono)" }}>BRANDING</p>
                                <div className="border-2 border-dashed border-[#D0CBC0] p-6 text-center mb-4 hover:border-[#BB0000]/30 transition-colors cursor-pointer" style={{ borderRadius: 2 }}>
                                    <p className="text-xs text-[#8A8A8A]" style={{ fontFamily: "var(--font-dm-mono)" }}>DRAG COMPANY LOGO HERE</p>
                                    <p className="text-[9px] text-[#D0CBC0] mt-1" style={{ fontFamily: "var(--font-lato)" }}>SVG, PNG, or JPG (max 2MB)</p>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="w-4 h-4 bg-[#BB0000] border-2 border-[#BB0000] flex items-center justify-center" style={{ borderRadius: 2 }}>
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="square" />
                                        </svg>
                                    </div>
                                    <span className="text-xs text-[#1A1A1A]" style={{ fontFamily: "var(--font-lato)" }}>Include Jenga365 co-branding</span>
                                </label>
                            </div>
                        </div>

                        {/* ── LIVE PREVIEW PANEL (2 cols) ── */}
                        <div className="col-span-2">
                            <p className="text-[9px] text-[#8A8A8A] font-bold tracking-[0.15em] mb-3" style={{ fontFamily: "var(--font-dm-mono)" }}>LIVE PREVIEW</p>
                            <div className="bg-white border border-[#E8E4DC] p-4 shadow-lg" style={{ borderRadius: 2 }}>
                                <div className="aspect-[210/297] bg-[#FAFAF8] border border-[#E8E4DC] p-4 overflow-hidden" style={{ borderRadius: 2 }}>
                                    {/* Miniature report preview */}
                                    <div className="scale-[0.35] origin-top-left w-[280%]">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 bg-[#BB0000]" style={{ borderRadius: 2 }} />
                                            <span className="text-[6px] text-[#BB0000]" style={{ fontFamily: "var(--font-dm-mono)" }}>IMPACT REPORT</span>
                                        </div>
                                        <div className="flex h-[2px] w-full mb-3">
                                            <div className="flex-1 bg-[#BB0000]" />
                                            <div className="flex-1 bg-[#006600]" />
                                            <div className="flex-1 bg-[#1A1A1A]" />
                                        </div>
                                        <p className="text-lg font-black mb-4" style={{ fontFamily: "var(--font-playfair)" }}>Acme Corporation</p>
                                        <div className="grid grid-cols-4 gap-2 mb-4">
                                            {["KES 250K", "12", "480 hrs", "4.2x"].map((v) => (
                                                <div key={v} className="border-b border-[#E8E4DC] pb-2">
                                                    <p className="text-sm font-bold" style={{ fontFamily: "var(--font-playfair)" }}>{v}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="h-3 bg-[#F5F5F5] border-b border-[#E8E4DC]" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-[9px] text-[#8A8A8A] mt-3" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                    ESTIMATED: 2 PAGES · {selectedSections.length} SECTIONS
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="mt-6 space-y-3">
                                <button className="w-full py-4 bg-[#BB0000] text-white flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] hover:opacity-90 transition-opacity" style={{ borderRadius: 2, fontFamily: "var(--font-dm-mono)" }}>
                                    <FileDown size={16} /> GENERATE PDF →
                                </button>
                                <button className="w-full py-3 border border-[#E8E4DC] text-[#1A1A1A] flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.15em] hover:bg-[#F5F5F5] transition-colors" style={{ borderRadius: 2, fontFamily: "var(--font-dm-mono)" }}>
                                    <Eye size={14} /> PREVIEW FULL REPORT
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── REPORT HISTORY ─────────────────────── */}
                    <div className="mt-10">
                        <p className="text-[10px] text-[#BB0000] font-bold tracking-[0.3em] mb-4" style={{ fontFamily: "var(--font-dm-mono)" }}>
                            REPORT HISTORY
                        </p>
                        <div className="bg-white border border-[#E8E4DC]" style={{ borderRadius: 2 }}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#E8E4DC]">
                                        {["Report Name", "Period", "Generated", "Pages", "Actions"].map((h) => (
                                            <th key={h} className="text-left px-6 py-3 text-[9px] text-[#8A8A8A] font-bold tracking-[0.15em]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                                {h.toUpperCase()}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {REPORT_HISTORY.map((report) => (
                                        <tr key={report.name} className="border-b border-[#E8E4DC] last:border-b-0">
                                            <td className="px-6 py-4 text-[#1A1A1A] font-medium" style={{ fontFamily: "var(--font-lato)" }}>{report.name}</td>
                                            <td className="px-6 py-4 text-[#4A4A4A]" style={{ fontFamily: "var(--font-dm-mono)", fontSize: 11 }}>{report.period}</td>
                                            <td className="px-6 py-4 text-[#4A4A4A]" style={{ fontFamily: "var(--font-dm-mono)", fontSize: 11 }}>{report.generated}</td>
                                            <td className="px-6 py-4 text-[#1A1A1A] font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>{report.pages}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <button className="text-[10px] text-[#BB0000] font-bold hover:underline" style={{ fontFamily: "var(--font-dm-mono)" }}>DOWNLOAD</button>
                                                    <button className="text-[10px] text-[#4A4A4A] hover:text-[#1A1A1A]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                                        <RefreshCw size={12} />
                                                    </button>
                                                    <button className="text-[10px] text-[#D0CBC0] hover:text-[#BB0000]" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
