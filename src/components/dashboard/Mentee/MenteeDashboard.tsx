"use client";

import { Plus, Smile, CheckCircle2, Circle } from "lucide-react";
import LearningPathwayTracker from "./LearningPathwayTracker";
import AiMentorMatches from "./AiMentorMatches";

interface MentorMatch {
    id: string;
    name: string | null;
    locationRegion: string | null;
    matchPercentage: number;
    insights: { profileMatch: number; deepSkillMatch: number };
}

interface PathwayData {
    milestones: unknown;
    progress: number;
}

interface JournalEntry {
    id: string;
    recordedAt: Date;
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
    const allComplete = ndaSigned && onboarded && hasMentorMatch;
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-8 bg-background h-full">
            <div className="xl:col-span-2 space-y-8">
                {/* Welcome & Status */}
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-2">
                            Welcome back, {userName.split(" ")[0]}
                        </h2>
                        <span className="inline-block bg-kenya-green text-white font-mono text-xs px-3 py-1 rounded tracking-wider shadow-sm">
                            JENGA365 MEMBER
                        </span>
                    </div>
                    <button className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-primary/20 transition-colors outline-none ring-primary focus:ring-1">
                        <Plus className="w-4 h-4" />
                        NEW ENTRY
                    </button>
                </div>

                {/* Onboarding Checklist */}
                {!allComplete && (
                    <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-playfair font-bold text-lg">Getting Started</h3>
                            <span className="font-mono text-xs text-muted-foreground">
                                {[ndaSigned, onboarded, hasMentorMatch].filter(Boolean).length}/3 complete
                            </span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: "Sign your NDA", done: ndaSigned, href: "/dashboard/mentee" },
                                { label: "Complete onboarding interview", done: onboarded, href: "/dashboard/mentee" },
                                { label: "Get matched with a mentor", done: hasMentorMatch, href: "/dashboard/mentee" },
                            ].map((step) => (
                                <div key={step.label} className="flex items-center gap-3">
                                    {step.done
                                        ? <CheckCircle2 className="w-5 h-5 text-kenya-green shrink-0" />
                                        : <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                                    }
                                    <span className={`font-lato text-sm ${step.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <LearningPathwayTracker pathway={pathway} />
                <AiMentorMatches matches={matches} />
            </div>

            {/* Right Column — Mood Journal */}
            <div className="xl:col-span-1">
                <div className="bg-muted/30 rounded-xl p-6 border border-border/50 sticky top-4">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-playfair text-xl font-bold">My Journal</h3>
                    </div>

                    {journalEntries.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground font-mono">
                            No journal entries yet. <br />Start tracking your mood after sessions.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {journalEntries.map((entry) => {
                                const sentiment = entry.moodScore >= 4 ? "POSITIVE" : entry.moodScore <= 2 ? "LOW" : "NEUTRAL";
                                return (
                                    <div
                                        key={entry.id}
                                        className="bg-background p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {new Date(entry.recordedAt).toLocaleDateString()}
                                            </span>
                                            <span className={`font-mono text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shrink-0 ${
                                                sentiment === "POSITIVE"
                                                    ? "bg-kenya-green/10 text-kenya-green"
                                                    : "bg-muted text-muted-foreground"
                                            }`}>
                                                <Smile className="w-3 h-3" />
                                                AI: {sentiment}
                                            </span>
                                        </div>
                                        <p className="font-lato text-sm text-muted-foreground line-clamp-2">
                                            {entry.notes ?? "No notes"}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <button className="w-full py-3 text-center text-sm font-lato font-bold text-muted-foreground hover:text-primary transition-colors border border-dashed border-border rounded-lg mt-4 bg-transparent outline-none focus:ring-1 focus:ring-primary">
                        View All Entries
                    </button>
                </div>
            </div>
        </div>
    );
}
