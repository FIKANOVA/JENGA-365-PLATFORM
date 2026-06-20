"use client"

import { CheckCircle2 } from "lucide-react";

interface Props {
    pathway: any;
}

export default function LearningPathway({ pathway }: Props) {
    const milestones = pathway?.milestones || [
        { id: "1", title: "Initial goal-setting session", status: "completed", date: "20 Jan 2026", notes: "Identified 3 key career goals. Strong focus on sports management transition." },
        { id: "2", title: "CV review and professional profile", status: "completed", date: "3 Feb 2026", notes: "Updated resume with recent project experience." },
        { id: "3", title: "Industry networking introduction", status: "completed", date: "18 Feb 2026", notes: "Introduced to two industry contacts." },
        { id: "4", title: "Informational interview preparation", status: "in_progress", date: "Started 1 Mar 2026", notes: "Preparing questions for the first interview.", progress: 40 },
        { id: "5", title: "First informational interview", status: "pending", date: "Est. Apr 2026" },
        { id: "6", title: "Employment or programme placement", status: "pending", date: "Est. Jun 2026" },
    ];

    return (
        <section
            className="rounded-md border border-border bg-background p-8"
            style={{ boxShadow: "var(--shadow-sm)" }}
        >
            <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                    <span className="text-eyebrow text-foreground-muted">Learning pathway</span>
                    <h2 className="text-display-sm text-foreground">Milestone progress</h2>
                </div>
                <div className="text-right">
                    <div className="text-display-md text-foreground">
                        {pathway?.progress || 67}%
                    </div>
                    <p className="text-eyebrow text-foreground-muted">of pathway complete</p>
                </div>
            </div>

            <div className="relative space-y-12">
                {/* Vertical Spine */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

                {milestones.map((m: any) => {
                    const nodeStyle =
                        m.status === "completed"
                            ? { borderColor: "var(--brand-green)", color: "var(--brand-green)" }
                            : m.status === "in_progress"
                              ? { borderColor: "var(--brand-red)", color: "var(--brand-red)" }
                              : { borderColor: "var(--border)", color: "var(--foreground-subtle)" };
                    return (
                        <div
                            key={m.id}
                            className={`relative pl-10 ${m.status === "pending" ? "opacity-50" : ""}`}
                        >
                            <div
                                className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center bg-background z-10 border-2 ${
                                    m.status === "in_progress" ? "animate-pulse" : ""
                                }`}
                                style={nodeStyle}
                            >
                                {m.status === "completed" ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-current" />
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-headline text-foreground">{m.title}</h4>
                                    {m.status === "in_progress" && (
                                        <span
                                            className="px-2 py-0.5 rounded-full text-eyebrow"
                                            style={{
                                                background: "var(--brand-red-soft)",
                                                color: "var(--brand-red)",
                                            }}
                                        >
                                            Active milestone
                                        </span>
                                    )}
                                </div>
                                <p className="text-eyebrow text-foreground-muted mb-2">{m.date}</p>

                                {m.notes && (
                                    <div className="space-y-2">
                                        <p className="text-body-sm text-foreground-muted italic leading-relaxed max-w-lg">
                                            “{m.notes}”
                                        </p>
                                        <button
                                            className="text-eyebrow hover:underline"
                                            style={{ color: "var(--brand-green)" }}
                                        >
                                            View session notes →
                                        </button>
                                    </div>
                                )}

                                {m.status === "in_progress" && (
                                    <div className="mt-4 w-full max-w-xs h-1 bg-border rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-1000"
                                            style={{
                                                width: `${m.progress || 0}%`,
                                                background: "var(--brand-green)",
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
