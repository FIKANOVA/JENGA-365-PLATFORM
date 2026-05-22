"use client"

import { Clock } from "lucide-react";

interface Props {
    menteeId: string;
}

export default function MenteeGoals({ menteeId }: Props) {
    const goals = [
        { id: "1", title: "Sports Management transition", status: "in_progress", date: "Dec 2026", notes: "Working on identifying lateral transferrable skills from current role." },
        { id: "2", title: "Public speaking & leadership", status: "done", date: "Feb 2026", notes: "Completed 3 Toastmasters sessions and led internal team meeting." },
        { id: "3", title: "Industry networking expansion", status: "in_progress", date: "Jun 2026", notes: "Targeting 5 new senior-level contacts in sports marketing." },
    ];

    return (
        <section className="space-y-4">
            <span className="text-eyebrow text-foreground-muted">Mentee goals</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {goals.map(goal => {
                    const done = goal.status === "done";
                    const badgeStyle = done
                        ? { background: "var(--brand-green-soft)", color: "var(--brand-green)" }
                        : { background: "#FFF8E8", color: "#996600" };
                    return (
                        <div
                            key={goal.id}
                            className="group rounded-lg border border-border bg-background p-6 flex flex-col h-full hover:border-[color:var(--border-strong,#D4D4D8)] transition-colors"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-headline text-foreground leading-tight">
                                    {goal.title}
                                </h4>
                                <span
                                    className="px-2 py-0.5 rounded-full text-eyebrow"
                                    style={badgeStyle}
                                >
                                    {done ? "Done" : "In progress"}
                                </span>
                            </div>
                            <p className="text-body-sm text-foreground-muted mb-4 flex-1">
                                {goal.notes}
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-1.5 text-eyebrow text-foreground-muted">
                                    <Clock className="w-3 h-3" /> {goal.date}
                                </div>
                                <button
                                    className="text-eyebrow opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ color: "var(--brand-green)" }}
                                >
                                    Update →
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
