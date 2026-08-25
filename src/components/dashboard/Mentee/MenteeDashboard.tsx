"use client";

import Link from "next/link";
import { Plus, Smile, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import LearningPathwayTracker from "./LearningPathwayTracker";
import AiMentorMatches from "./AiMentorMatches";

interface MentorMatch {
    id: string;
    name: string | null;
    image?: string | null;
    title?: string;
    locationRegion: string | null;
    matchPercentage: number;
    insights: {
        profileMatch: number;
        deepSkillMatch?: number;
        goalAlignment?: number;
        reason?: string;
    };
}

interface PathwayData {
    milestones: unknown;
    progress: number;
}

interface JournalEntry {
    id: string;
    recordedAt: string | Date;
    moodScore: number;
    notes: string | null;
}

interface MenteeDashboardProps {
    userName?: string;
    matches?: MentorMatch[];
    pathway?: PathwayData | null;
    journalEntries?: JournalEntry[];
    ndaSigned?: boolean;
    onboarded?: boolean;
    hasMentorMatch?: boolean;
}

export default function MenteeDashboard({
    userName = "there",
    matches = [],
    pathway = null,
    journalEntries = [],
    ndaSigned = false,
    onboarded = false,
    hasMentorMatch = false,
}: MenteeDashboardProps) {
    const checklistSteps = [
        { label: "Sign your platform NDA", done: ndaSigned, href: "/legal/nda", action: "Sign now" },
        { label: "Complete diagnostic profile intake", done: onboarded, href: "/onboarding/intake", action: "Complete profile" },
        { label: "Refine AI Profile & Interview", done: onboarded, href: "/dashboard/profile", action: "Start interview" },
        { label: "Explore & connect with AI mentors", done: hasMentorMatch, href: "/dashboard/people", action: "Browse mentors" },
    ];
    const completedCount = checklistSteps.filter((s) => s.done).length;
    const allComplete = completedCount === checklistSteps.length;
    const completenessPct = Math.round((completedCount / checklistSteps.length) * 100);

    return (
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-6 lg:py-8 grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                {/* Welcome + status */}
                <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-border pb-6">
                    <div className="space-y-1.5">
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                            Jenga365 Mentee
                        </p>
                        <h2 className="text-display-sm text-foreground">
                            Welcome back, {userName.split(" ")[0]}
                        </h2>
                    </div>
                    <button
                        className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-label font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-green)" }}
                    >
                        <Plus className="h-4 w-4" />
                        New journal entry
                    </button>
                </header>

                {/* Getting started checklist & profile completeness */}
                {!allComplete && (
                    <section
                        className="rounded-md border border-border bg-background p-6 space-y-4"
                        style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-headline text-foreground">
                                    Profile Completeness
                                </h3>
                                <p className="text-body-sm text-foreground-muted">
                                    Complete these steps to maximize your mentorship matches.
                                </p>
                            </div>
                            <span className="text-label font-semibold text-foreground bg-[color:var(--surface-2)] px-2.5 py-1 rounded-full">
                                {completenessPct}% complete
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[color:var(--surface-2)] h-2 rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-500 rounded-full"
                                style={{
                                    width: `${completenessPct}%`,
                                    background: "var(--brand-green)",
                                }}
                            />
                        </div>

                        <ul className="space-y-2.5 pt-2">
                            {checklistSteps.map((step) => (
                                <li
                                    key={step.label}
                                    className="flex items-center justify-between p-2.5 rounded-md hover:bg-[color:var(--surface-1)] transition-colors border border-border/50"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {step.done ? (
                                            <CheckCircle2
                                                className="h-4 w-4 shrink-0"
                                                style={{ color: "var(--brand-green)" }}
                                            />
                                        ) : (
                                            <Circle className="h-4 w-4 shrink-0 text-foreground-subtle" />
                                        )}
                                        <span
                                            className={`text-body-sm truncate ${
                                                step.done
                                                    ? "line-through text-foreground-muted"
                                                    : "text-foreground font-medium"
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                    {!step.done && (
                                        <Link
                                            href={step.href}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-green)] hover:underline shrink-0 ml-2"
                                        >
                                            {step.action}
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <LearningPathwayTracker pathway={pathway} />
                <AiMentorMatches matches={matches} />
            </div>

            {/* Right column — journal */}
            <aside className="xl:col-span-1">
                <div
                    className="rounded-md border border-border bg-background p-6 sticky top-4"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                >
                    <header className="flex items-center justify-between mb-5">
                        <h3 className="text-headline text-foreground">My journal</h3>
                    </header>

                    {journalEntries.length === 0 ? (
                        <div
                            className="rounded-md border border-dashed border-border p-6 text-center text-body-sm text-foreground-muted"
                            style={{ background: "var(--surface-1)" }}
                        >
                            No journal entries yet. Track your mood after sessions.
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {journalEntries.map((entry) => {
                                const sentiment =
                                    entry.moodScore >= 4
                                        ? "Positive"
                                        : entry.moodScore <= 2
                                          ? "Low"
                                          : "Neutral";
                                const palette =
                                    sentiment === "Positive"
                                        ? {
                                              background: "var(--brand-green-soft)",
                                              color: "var(--brand-green)",
                                          }
                                        : {
                                              background: "var(--surface-2)",
                                              color: "var(--foreground-muted)",
                                          };
                                return (
                                    <li
                                        key={entry.id}
                                        className="rounded-md border border-border bg-background p-3"
                                    >
                                        <div className="flex justify-between items-start mb-1.5 gap-2">
                                            <span className="text-body-sm text-foreground-muted">
                                                {new Date(entry.recordedAt).toLocaleDateString()}
                                            </span>
                                            <span
                                                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-label font-medium shrink-0"
                                                style={palette}
                                            >
                                                <Smile className="h-3 w-3" />
                                                {sentiment}
                                            </span>
                                        </div>
                                        <p className="text-body-sm text-foreground-muted line-clamp-2">
                                            {entry.notes ?? "No notes"}
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <button className="mt-4 w-full inline-flex h-10 items-center justify-center rounded-md border border-dashed border-border text-label text-foreground-muted hover:bg-[color:var(--surface-2)] transition-colors">
                        View all entries
                    </button>
                </div>
            </aside>
        </div>
    );
}
