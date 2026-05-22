"use client";

import { Mail, Download, Ban, ChevronRight, Check } from "lucide-react";
import Link from "next/link";

export default function MenteeDetail({ id }: { id: string }) {
    return (
        <div className="flex-1 bg-background p-6 md:p-12 h-full overflow-y-auto w-full">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 mb-8 text-eyebrow text-foreground-muted">
                <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href="/dashboard/people" className="hover:text-foreground transition-colors">Mentees</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground">Aisha Kamau</span>
            </nav>

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-border pb-6">
                <div className="flex items-center gap-6">
                    <div
                        className="w-16 h-16 flex items-center justify-center rounded-lg border"
                        style={{
                            background: "var(--brand-green-soft)",
                            borderColor: "var(--brand-green)",
                            color: "var(--brand-green)",
                        }}
                    >
                        <span className="text-display-sm">AK</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-display-md text-foreground">Aisha Kamau</h1>
                            <span
                                className="text-eyebrow px-2 py-0.5 rounded border"
                                style={{
                                    background: "var(--brand-green-soft)",
                                    borderColor: "var(--brand-green)",
                                    color: "var(--brand-green)",
                                }}
                            >
                                Mentee role
                            </span>
                            <div className="flex items-center gap-1.5 ml-2">
                                <div
                                    className="w-2 h-2 rounded-full animate-pulse"
                                    style={{ background: "var(--brand-green)" }}
                                />
                                <span className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Active</span>
                            </div>
                        </div>
                        <p className="text-body-sm text-foreground-muted">Member since 14 Jan 2026 · ID M-9920-KE</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button className="inline-flex items-center gap-2 h-9 rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]">
                        <Mail className="w-4 h-4" /> Message mentee
                    </button>
                    <button className="inline-flex items-center gap-2 h-9 rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]">
                        <Download className="w-4 h-4" /> Download report
                    </button>
                    <button
                        className="inline-flex items-center gap-2 h-9 rounded-md px-4 text-label font-medium transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-red)", color: "var(--brand-red-fg)" }}
                    >
                        <Ban className="w-4 h-4" /> Suspend
                    </button>
                </div>
            </header>

            {/* Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                <StatCard label="Sessions completed" value="12" delta="+3 this month" deltaColor="var(--brand-green)" />
                <StatCard label="Pathway progress" value="67%" deltaNode={
                    <div
                        className="w-10 h-10 rounded-full border-4 border-r-transparent rotate-45"
                        style={{ borderColor: "var(--brand-green)", borderRightColor: "transparent" }}
                    />
                } />
                <StatCard label="Last session (days)" value="4" deltaNode={
                    <span
                        className="px-2 py-0.5 rounded text-eyebrow"
                        style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                    >
                        On track
                    </span>
                } />
                <StatCard label="Mentor match score" value="91%" deltaNode={
                    <span className="text-eyebrow text-foreground-muted text-right leading-tight">
                        Goals · Location<br />Availability
                    </span>
                } />
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                {/* Left Column (Main) */}
                <div className="xl:col-span-2 flex flex-col gap-12">
                    <section>
                        <h2 className="text-display-sm text-foreground mb-6 flex items-center gap-3">
                            Learning pathway
                            <span className="text-body-sm text-foreground-muted font-normal">Level 2 of 4</span>
                        </h2>
                        <div className="space-y-0 relative ml-4">
                            <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

                            <PathwayStep
                                status="completed"
                                date="Completed · 02 Feb"
                                title="Financial Literacy Foundations"
                                body="Successfully completed the assessment with 94% score."
                            />
                            <PathwayStep
                                status="in_progress"
                                date="In progress"
                                title="Portfolio management & risk"
                                body={null}
                                progress={40}
                                nextMilestone="Next milestone: risk mitigation strategy"
                            />
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-display-sm text-foreground">Session history</h2>
                            <button
                                className="inline-flex items-center gap-2 h-9 rounded-md px-4 text-label font-medium transition-opacity hover:opacity-90"
                                style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                            >
                                + Log new session
                            </button>
                        </div>
                        <div className="rounded-lg border border-border bg-background overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
                            <table className="w-full text-left">
                                <thead className="border-b border-border" style={{ background: "var(--surface-1)" }}>
                                    <tr>
                                        <th className="p-4 text-eyebrow text-foreground-muted">Date</th>
                                        <th className="p-4 text-eyebrow text-foreground-muted">Topic</th>
                                        <th className="p-4 text-eyebrow text-foreground-muted">Outcome</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <tr className="transition-colors hover:bg-[color:var(--surface-1)]">
                                        <td className="p-4 text-body-sm text-foreground-muted">24 Mar</td>
                                        <td className="p-4 text-body-sm text-foreground font-medium">Q1 planning</td>
                                        <td className="p-4 text-body-sm text-foreground-muted">Milestones defined</td>
                                    </tr>
                                    <tr className="transition-colors hover:bg-[color:var(--surface-1)]">
                                        <td className="p-4 text-body-sm text-foreground-muted">17 Mar</td>
                                        <td className="p-4 text-body-sm text-foreground font-medium">Budgeting basics</td>
                                        <td className="p-4 text-body-sm text-foreground-muted">Module passed</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Right Columns (Sidebars) */}
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-6">
                        {/* Attendance */}
                        <section
                            className="rounded-lg border border-border bg-background p-6"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <h3 className="text-eyebrow text-foreground-muted mb-2">Attendance rate</h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-display-lg" style={{ color: "var(--brand-green)" }}>92%</span>
                            </div>
                            <div className="flex items-end gap-1 h-12 mt-4">
                                {[60, 80, 70, 90, 100].map((h, i) => {
                                    const opacities = [0.2, 0.4, 0.6, 0.8, 1];
                                    return (
                                        <div
                                            key={i}
                                            className="flex-1 rounded-t-sm"
                                            style={{
                                                height: `${h}%`,
                                                background: "var(--brand-green)",
                                                opacity: opacities[i],
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </section>

                        <section
                            className="rounded-lg border border-border bg-background p-6"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <h3 className="text-eyebrow text-foreground-muted mb-4">Mood journal (7 days)</h3>
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {[0, 1, 2, 3, 4, 5, 6].map(i => {
                                    const isNeutral = i === 2;
                                    return (
                                        <div
                                            key={i}
                                            className="aspect-square flex items-center justify-center text-lg rounded"
                                            style={{
                                                background: isNeutral
                                                    ? "var(--surface-2)"
                                                    : "var(--brand-green-soft)",
                                            }}
                                        >
                                            {isNeutral ? "😐" : "😊"}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="pt-3 border-t border-border text-center">
                                <span className="text-body-sm text-foreground font-medium">Generally positive</span>
                            </div>
                        </section>
                    </div>

                    <div className="flex flex-col gap-6">
                        <section
                            className="rounded-lg border p-6"
                            style={{
                                background: "var(--brand-green-soft)",
                                borderColor: "var(--brand-green)",
                            }}
                        >
                            <h3 className="text-eyebrow mb-4" style={{ color: "var(--brand-green)" }}>
                                CSR / ESG metric impact
                            </h3>
                            <p className="text-body-sm text-foreground leading-relaxed">
                                Aisha's progress contributes to the <strong className="font-medium">Corporate Social Responsibility Goal: Economic Empowerment</strong>.
                            </p>
                        </section>

                        <section
                            className="rounded-lg border border-border bg-background p-6"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <h3 className="text-eyebrow text-foreground-muted mb-4">Flags & alerts</h3>
                            <div className="flex items-center gap-3" style={{ color: "var(--brand-green)" }}>
                                <Check className="w-5 h-5" />
                                <span className="text-label">No active flags</span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    delta,
    deltaColor,
    deltaNode,
}: {
    label: string;
    value: string;
    delta?: string;
    deltaColor?: string;
    deltaNode?: React.ReactNode;
}) {
    return (
        <div
            className="rounded-lg border border-border bg-background p-6 hover:border-[color:var(--border-strong,#D4D4D8)] transition-colors"
            style={{ boxShadow: "var(--shadow-sm)" }}
        >
            <p className="text-eyebrow text-foreground-muted mb-4">{label}</p>
            <div className="flex items-end justify-between gap-2">
                <span className="text-display-md text-foreground">{value}</span>
                {deltaNode ?? (delta && (
                    <span className="text-eyebrow mb-1" style={{ color: deltaColor }}>
                        {delta}
                    </span>
                ))}
            </div>
        </div>
    );
}

function PathwayStep({
    status,
    date,
    title,
    body,
    progress,
    nextMilestone,
}: {
    status: "completed" | "in_progress" | "pending";
    date: string;
    title: string;
    body: string | null;
    progress?: number;
    nextMilestone?: string;
}) {
    const isCompleted = status === "completed";
    const isInProgress = status === "in_progress";
    const accentColor = isCompleted
        ? "var(--brand-green)"
        : isInProgress
          ? "var(--brand-green)"
          : "var(--foreground-subtle)";

    return (
        <div className="relative pl-12 pb-8">
            <div
                className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 border-2"
                style={
                    isCompleted
                        ? { background: accentColor, borderColor: accentColor }
                        : { background: "var(--background)", borderColor: accentColor }
                }
            >
                {isCompleted ? (
                    <Check className="text-white w-4 h-4" />
                ) : isInProgress ? (
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: accentColor }} />
                ) : null}
            </div>
            <p className="text-eyebrow mb-1" style={{ color: accentColor }}>{date}</p>
            <h3 className="text-headline text-foreground mb-1">{title}</h3>
            {body && <p className="text-body-sm text-foreground-muted">{body}</p>}
            {isInProgress && (
                <>
                    <div className="w-full max-w-sm h-1.5 bg-border rounded-full overflow-hidden mt-2">
                        <div
                            className="h-full"
                            style={{ width: `${progress ?? 40}%`, background: accentColor }}
                        />
                    </div>
                    {nextMilestone && (
                        <p className="text-eyebrow text-foreground-muted mt-2">{nextMilestone}</p>
                    )}
                </>
            )}
        </div>
    );
}
