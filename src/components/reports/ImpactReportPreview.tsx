"use client";

/**
 * Jenga365 — Impact Report Preview & PDF Download
 *
 * Renders the Kenya-flag—design-system-compliant Impact Report
 * as an HTML preview that can also be printed / saved as PDF
 * via the browser's native print dialog (Ctrl+P).
 *
 * For programmatic PDF generation (server-side), see
 * `src/lib/reports/generateImpactPDF.ts` which uses jsPDF.
 */

import { FileDown, Printer } from "lucide-react";

interface ImpactReportProps {
    readonly companyName: string;
    readonly period: string;
    readonly generatedDate: string;
    readonly stats: {
        totalInvestment: string;
        employeeMentors: string;
        volunteerHours: string;
        sponsorshipROI: string;
    };
    readonly mentorshipMetrics: {
        metric: string;
        value: string;
        change: string;
        status: "On Track" | "Needs Attention";
    }[];
    readonly esg: {
        environmental: number;
        social: number;
        governance: number;
    };
    readonly events: {
        name: string;
        date: string;
        type: string;
        attendees: number;
        cost: string;
    }[];
}

export default function ImpactReportPreview(props: ImpactReportProps) {
    const {
        companyName,
        period,
        generatedDate,
        stats,
        mentorshipMetrics,
        esg,
        events,
    } = props;

    const handlePrint = () => window.print();

    return (
        <div className="bg-[#F5F5F5] p-8 print:p-0 print:bg-white">
            <div
                className="max-w-[850px] mx-auto bg-white shadow-xl print:shadow-none"
                style={{ borderRadius: 2 }}
                id="impact-report"
            >
                {/* ── HEADER ─────────────────────────────────── */}
                <div className="p-10 pb-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 bg-[#BB0000] text-white flex items-center justify-center font-black text-sm"
                                style={{
                                    borderRadius: 2,
                                    fontFamily: "var(--font-playfair)",
                                }}
                            >
                                J365
                            </div>
                            <span
                                className="text-[10px] text-[#BB0000] font-bold tracking-[0.3em]"
                                style={{ fontFamily: "var(--font-dm-mono)" }}
                            >
                                IMPACT REPORT
                            </span>
                        </div>
                        <div className="text-right">
                            <p
                                className="text-2xl text-[#1A1A1A]"
                                style={{
                                    fontFamily: "var(--font-playfair)",
                                    fontWeight: 700,
                                }}
                            >
                                {period}
                            </p>
                            <p
                                className="text-[9px] text-[#8A8A8A] mt-1"
                                style={{ fontFamily: "var(--font-dm-mono)" }}
                            >
                                GENERATED {generatedDate}
                            </p>
                        </div>
                    </div>

                    {/* Kenya-flag stripe */}
                    <div className="flex h-[3px] w-full mb-6">
                        <div className="flex-1 bg-[#BB0000]" />
                        <div className="flex-1 bg-[#006600]" />
                        <div className="flex-1 bg-[#1A1A1A]" />
                    </div>

                    <h1
                        className="text-4xl text-[#1A1A1A]"
                        style={{
                            fontFamily: "var(--font-playfair)",
                            fontWeight: 900,
                        }}
                    >
                        {companyName}
                    </h1>
                </div>

                {/* ── EXECUTIVE SUMMARY ──────────────────────── */}
                <div className="px-10 pb-8">
                    <p
                        className="text-[10px] text-[#BB0000] font-bold tracking-[0.3em] mb-6"
                        style={{ fontFamily: "var(--font-dm-mono)" }}
                    >
                        EXECUTIVE SUMMARY
                    </p>
                    <div className="grid grid-cols-4 gap-6">
                        {[
                            {
                                value: stats.totalInvestment,
                                label: "Total Investment",
                            },
                            {
                                value: stats.employeeMentors,
                                label: "Employee Mentors",
                            },
                            {
                                value: stats.volunteerHours,
                                label: "Volunteer Hours",
                            },
                            {
                                value: stats.sponsorshipROI,
                                label: "Sponsorship ROI",
                            },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="border-b border-[#E8E4DC] pb-4"
                            >
                                <p
                                    className="text-3xl text-[#1A1A1A] mb-1"
                                    style={{
                                        fontFamily: "var(--font-playfair)",
                                        fontWeight: 900,
                                    }}
                                >
                                    {stat.value}
                                </p>
                                <p
                                    className="text-[9px] text-[#8A8A8A] tracking-[0.15em]"
                                    style={{
                                        fontFamily: "var(--font-dm-mono)",
                                    }}
                                >
                                    {stat.label.toUpperCase()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── MENTORSHIP METRICS ─────────────────────── */}
                <div className="px-10 pb-8">
                    <p
                        className="text-[10px] text-[#BB0000] font-bold tracking-[0.3em] mb-4"
                        style={{ fontFamily: "var(--font-dm-mono)" }}
                    >
                        MENTORSHIP METRICS
                    </p>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#E8E4DC]">
                                {["Metric", "Value", "Change", "Status"].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="text-left py-3 text-[9px] text-[#8A8A8A] font-bold tracking-[0.15em]"
                                            style={{
                                                fontFamily:
                                                    "var(--font-dm-mono)",
                                            }}
                                        >
                                            {h.toUpperCase()}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {mentorshipMetrics.map((row) => (
                                <tr
                                    key={row.metric}
                                    className="border-b border-[#E8E4DC]"
                                >
                                    <td
                                        className="py-3 text-[#1A1A1A]"
                                        style={{
                                            fontFamily: "var(--font-lato)",
                                        }}
                                    >
                                        {row.metric}
                                    </td>
                                    <td
                                        className="py-3 font-bold text-[#1A1A1A]"
                                        style={{
                                            fontFamily:
                                                "var(--font-dm-mono)",
                                        }}
                                    >
                                        {row.value}
                                    </td>
                                    <td
                                        className="py-3 text-[#4A4A4A]"
                                        style={{
                                            fontFamily: "var(--font-lato)",
                                        }}
                                    >
                                        {row.change}
                                    </td>
                                    <td className="py-3">
                                        <span
                                            className={`px-2 py-0.5 text-[9px] font-bold ${row.status === "On Track"
                                                    ? "bg-[#F0FFF0] text-[#006600]"
                                                    : "bg-[#FFF8E0] text-[#B8860B]"
                                                }`}
                                            style={{
                                                borderRadius: 2,
                                                fontFamily:
                                                    "var(--font-dm-mono)",
                                            }}
                                        >
                                            {row.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── ESG ALIGNMENT ──────────────────────────── */}
                <div className="px-10 pb-8">
                    <p
                        className="text-[10px] text-[#BB0000] font-bold tracking-[0.3em] mb-6"
                        style={{ fontFamily: "var(--font-dm-mono)" }}
                    >
                        ESG ALIGNMENT
                    </p>
                    <div className="grid grid-cols-3 gap-8">
                        {(
                            [
                                ["Environmental", esg.environmental],
                                ["Social", esg.social],
                                ["Governance", esg.governance],
                            ] as const
                        ).map(([label, score]) => (
                            <div key={label} className="text-center">
                                <div className="relative h-40 w-10 mx-auto bg-[#F5F5F5] mb-3" style={{ borderRadius: 2 }}>
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-[#006600]"
                                        style={{
                                            height: `${score}%`,
                                            borderRadius: 2,
                                        }}
                                    />
                                </div>
                                <p
                                    className="text-lg font-bold text-[#1A1A1A]"
                                    style={{
                                        fontFamily: "var(--font-dm-mono)",
                                    }}
                                >
                                    {score}/100
                                </p>
                                <p
                                    className="text-[9px] text-[#8A8A8A] tracking-[0.1em] mt-1"
                                    style={{
                                        fontFamily: "var(--font-dm-mono)",
                                    }}
                                >
                                    {label.toUpperCase()}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* SDG Badges */}
                    <div className="flex gap-2 mt-6 justify-center">
                        {[1, 4, 8, 10, 17].map((sdg) => (
                            <div
                                key={sdg}
                                className="w-8 h-8 bg-[#BB0000] text-white flex items-center justify-center text-[10px] font-bold"
                                style={{
                                    borderRadius: 2,
                                    fontFamily: "var(--font-dm-mono)",
                                }}
                            >
                                {sdg}
                            </div>
                        ))}
                    </div>
                    <p
                        className="text-center text-[9px] text-[#8A8A8A] mt-2"
                        style={{ fontFamily: "var(--font-dm-mono)" }}
                    >
                        ALIGNED UN SUSTAINABLE DEVELOPMENT GOALS
                    </p>
                </div>

                {/* ── SPONSORED EVENTS ───────────────────────── */}
                <div className="px-10 pb-8">
                    <p
                        className="text-[10px] text-[#BB0000] font-bold tracking-[0.3em] mb-4"
                        style={{ fontFamily: "var(--font-dm-mono)" }}
                    >
                        SPONSORED EVENTS
                    </p>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#E8E4DC]">
                                {[
                                    "Event",
                                    "Date",
                                    "Type",
                                    "Attendees",
                                    "Cost",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left py-3 text-[9px] text-[#8A8A8A] font-bold tracking-[0.15em]"
                                        style={{
                                            fontFamily:
                                                "var(--font-dm-mono)",
                                        }}
                                    >
                                        {h.toUpperCase()}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((evt) => (
                                <tr
                                    key={evt.name}
                                    className="border-b border-[#E8E4DC]"
                                >
                                    <td
                                        className="py-3 text-[#1A1A1A] font-medium"
                                        style={{
                                            fontFamily: "var(--font-lato)",
                                        }}
                                    >
                                        {evt.name}
                                    </td>
                                    <td
                                        className="py-3 text-[#4A4A4A]"
                                        style={{
                                            fontFamily:
                                                "var(--font-dm-mono)",
                                            fontSize: 11,
                                        }}
                                    >
                                        {evt.date}
                                    </td>
                                    <td className="py-3">
                                        <span
                                            className="px-2 py-0.5 bg-[#FFF0F0] text-[#BB0000] text-[9px] font-bold"
                                            style={{
                                                borderRadius: 2,
                                                fontFamily:
                                                    "var(--font-dm-mono)",
                                            }}
                                        >
                                            {evt.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td
                                        className="py-3 text-[#1A1A1A]"
                                        style={{
                                            fontFamily:
                                                "var(--font-dm-mono)",
                                        }}
                                    >
                                        {evt.attendees}
                                    </td>
                                    <td
                                        className="py-3 text-[#1A1A1A] font-bold"
                                        style={{
                                            fontFamily:
                                                "var(--font-dm-mono)",
                                        }}
                                    >
                                        {evt.cost}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── FOOTER ─────────────────────────────────── */}
                <div className="px-10 pb-6">
                    {/* Kenya-flag stripe */}
                    <div className="flex h-[2px] w-full mb-4">
                        <div className="flex-1 bg-[#BB0000]" />
                        <div className="flex-1 bg-[#006600]" />
                        <div className="flex-1 bg-[#1A1A1A]" />
                    </div>
                    <div className="flex justify-between items-center">
                        <p
                            className="text-[9px] text-[#8A8A8A]"
                            style={{ fontFamily: "var(--font-dm-mono)" }}
                        >
                            GENERATED BY JENGA365 AI PLATFORM
                        </p>
                        <p
                            className="text-[8px] text-[#BB0000] font-bold tracking-[0.2em]"
                            style={{ fontFamily: "var(--font-dm-mono)" }}
                        >
                            CONFIDENTIAL — FOR INTERNAL USE ONLY
                        </p>
                        <p
                            className="text-[9px] text-[#8A8A8A]"
                            style={{ fontFamily: "var(--font-dm-mono)" }}
                        >
                            PAGE 1 OF 2
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Action Buttons (hidden on print) ──────── */}
            <div className="max-w-[850px] mx-auto mt-6 flex gap-4 print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex-1 py-4 bg-[#BB0000] text-white flex items-center justify-center gap-3 text-xs font-bold tracking-[0.2em] hover:opacity-90 transition-opacity"
                    style={{
                        borderRadius: 2,
                        fontFamily: "var(--font-dm-mono)",
                    }}
                >
                    <Printer size={16} /> PRINT / SAVE AS PDF
                </button>
                <button
                    className="py-4 px-8 border border-[#E8E4DC] text-[#1A1A1A] flex items-center justify-center gap-3 text-xs font-bold tracking-[0.2em] hover:bg-[#F5F5F5] transition-colors"
                    style={{
                        borderRadius: 2,
                        fontFamily: "var(--font-dm-mono)",
                    }}
                >
                    <FileDown size={16} /> DOWNLOAD PDF
                </button>
            </div>
        </div>
    );
}
