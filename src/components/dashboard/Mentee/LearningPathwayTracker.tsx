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
            <section className="bg-muted/30 rounded-xl p-6 border border-border/50">
                <h3 className="font-playfair text-xl font-bold mb-4">My Learning Pathway</h3>
                <div className="py-6 text-center text-sm text-muted-foreground font-mono border border-dashed border-border/50 rounded-lg">
                    Your learning pathway will appear once you&apos;re matched with a mentor.
                </div>
            </section>
        );
    }

    // Mark the current milestone based on progress
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
        <section className="bg-muted/30 rounded-xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-playfair text-xl font-bold">My Learning Pathway</h3>
                <span className="font-mono text-xs text-muted-foreground">{progress}% complete</span>
            </div>
            <div className="grid grid-cols-[40px_1fr] gap-x-4 mb-8">
                {enriched.map((node, index) => (
                    <React.Fragment key={node.id ?? index}>
                        {/* Node Icon */}
                        <div className="flex flex-col items-center">
                            {node.status === "Completed" ? (
                                <div className="w-8 h-8 rounded-full bg-kenya-green text-white flex items-center justify-center z-10 shadow-sm">
                                    <Check className="w-4 h-4" />
                                </div>
                            ) : node.isCurrent ? (
                                <div className="w-8 h-8 rounded-full border-2 border-kenya-red bg-background text-kenya-red flex items-center justify-center z-10 relative">
                                    <CircleDot className="w-4 h-4" />
                                    <div className="absolute inset-0 rounded-full border border-kenya-red animate-ping opacity-75" />
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center z-10">
                                    <Lock className="w-4 h-4" />
                                </div>
                            )}
                            {index < enriched.length - 1 && (
                                <div className={`w-[2px] h-12 my-1 ${node.status === "Completed" ? "bg-kenya-red" : "bg-muted-foreground/30"}`} />
                            )}
                        </div>

                        {/* Node Text */}
                        <div className="py-1">
                            <p className={`font-lato font-bold ${node.status === "Completed" || node.isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                                {node.title}
                            </p>
                            <p className={`font-lato text-sm ${node.isCurrent ? "text-kenya-red font-semibold" : "text-muted-foreground"}`}>
                                {node.status}
                            </p>
                        </div>
                    </React.Fragment>
                ))}
            </div>

            {nextStep && (
                <div className="bg-background rounded-lg p-4 flex items-center justify-between shadow-sm border border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <CalendarCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-lato font-bold text-foreground">Next: {nextStep.title}</p>
                            <p className="font-lato text-sm text-muted-foreground">{nextStep.status}</p>
                        </div>
                    </div>
                    <button className="bg-primary text-primary-foreground font-lato font-bold px-6 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors shadow">
                        Continue
                    </button>
                </div>
            )}
        </section>
    );
}
