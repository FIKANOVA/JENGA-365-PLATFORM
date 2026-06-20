"use client";

import React from "react";
import { Check, CircleDot, Lock, CalendarCheck } from "lucide-react";

interface Milestone {
    id?: string;
    title: string;
    status: string;
    isCurrent?: boolean;
}

interface PathwayData {
    milestones: unknown;
    progress: number;
}

interface LearningPathwayTrackerProps {
    pathway?: PathwayData | null;
}

function parseMilestones(raw: unknown): Milestone[] {
    if (!Array.isArray(raw)) return [];
    return raw as Milestone[];
}

export default function LearningPathwayTracker({ pathway }: LearningPathwayTrackerProps) {
    const milestones = pathway ? parseMilestones(pathway.milestones) : [];
    const progress = pathway?.progress ?? 0;

    if (milestones.length === 0) {
        return (
            <section
                className="rounded-md border border-border p-6"
                style={{ background: "var(--surface-1)" }}
            >
                <h3 className="text-headline text-foreground mb-4">My learning pathway</h3>
                <div className="py-6 text-center text-body-sm text-foreground-muted border border-dashed border-border rounded-md">
                    Your learning pathway will appear once you&apos;re matched with a mentor.
                </div>
            </section>
        );
    }

    const currentIndex = Math.min(
        Math.floor((progress / 100) * milestones.length),
        milestones.length - 1
    );

    const enriched = milestones.map((m, i) => ({
        ...m,
        isCurrent: i === currentIndex && m.status !== "Completed",
    }));

    const nextStep = enriched.find((m) => m.isCurrent || m.status === "Active");

    return (
        <section
            className="rounded-md border border-border p-6"
            style={{ background: "var(--surface-1)" }}
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-headline text-foreground">My learning pathway</h3>
                <span className="text-eyebrow text-foreground-muted">{progress}% complete</span>
            </div>
            <div className="grid grid-cols-[40px_1fr] gap-x-4 mb-8">
                {enriched.map((node, index) => {
                    const completed = node.status === "Completed";
                    return (
                        <React.Fragment key={node.id ?? index}>
                            <div className="flex flex-col items-center">
                                {completed ? (
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center z-10"
                                        style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                                    >
                                        <Check className="w-4 h-4" />
                                    </div>
                                ) : node.isCurrent ? (
                                    <div
                                        className="w-8 h-8 rounded-full border-2 bg-background flex items-center justify-center z-10 relative"
                                        style={{ borderColor: "var(--brand-green)", color: "var(--brand-green)" }}
                                    >
                                        <CircleDot className="w-4 h-4" />
                                        <div
                                            className="absolute inset-0 rounded-full border animate-ping opacity-75"
                                            style={{ borderColor: "var(--brand-green)" }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center z-10 text-foreground-subtle"
                                        style={{ background: "var(--surface-2)" }}
                                    >
                                        <Lock className="w-4 h-4" />
                                    </div>
                                )}
                                {index < enriched.length - 1 && (
                                    <div
                                        className="w-[2px] h-12 my-1"
                                        style={{ background: completed ? "var(--brand-green)" : "var(--border)" }}
                                    />
                                )}
                            </div>

                            <div className="py-1">
                                <p
                                    className={`text-label ${completed || node.isCurrent ? "text-foreground" : "text-foreground-muted"}`}
                                >
                                    {node.title}
                                </p>
                                <p
                                    className="text-body-sm"
                                    style={
                                        node.isCurrent
                                            ? { color: "var(--brand-green)", fontWeight: 500 }
                                            : { color: "var(--foreground-muted)" }
                                    }
                                >
                                    {node.status}
                                </p>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {nextStep && (
                <div
                    className="rounded-md p-4 flex items-center justify-between border border-border bg-background"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: "var(--brand-green-soft)", color: "var(--brand-green)" }}
                        >
                            <CalendarCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-label text-foreground">Next: {nextStep.title}</p>
                            <p className="text-body-sm text-foreground-muted">{nextStep.status}</p>
                        </div>
                    </div>
                    <button
                        className="inline-flex items-center h-10 rounded-md px-5 text-label font-medium transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                    >
                        Continue
                    </button>
                </div>
            )}
        </section>
    );
}
