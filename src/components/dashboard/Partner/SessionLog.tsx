"use client"

import { Plus, Eye } from "lucide-react";

interface Props {
    sessions: any[];
    menteeId: string;
}

export default function SessionLog({ sessions, menteeId }: Props) {
    const displaySessions = sessions.length > 0 ? sessions : [
        { id: "1", date: "18 Feb 2026", duration: "60 min", type: "Video Call", notes: "Networking strategies", rating: 5 },
        { id: "2", date: "3 Feb 2026", duration: "45 min", type: "In-Person", notes: "CV workshop", rating: 4 },
        { id: "3", date: "20 Jan 2026", duration: "30 min", type: "Video Call", notes: "Goal setting", rating: 5 },
    ];

    return (
        <section
            className="rounded-lg border border-border bg-background p-8"
            style={{ boxShadow: "var(--shadow-sm)" }}
        >
            <div className="flex justify-between items-center mb-6">
                <span className="text-eyebrow text-foreground-muted">Session history</span>
                <button
                    className="inline-flex items-center gap-2 h-9 rounded-md px-3 text-label font-medium transition-opacity hover:opacity-90"
                    style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                >
                    <Plus className="w-4 h-4" /> Log new session
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border">
                            {["Date", "Duration", "Type", "Notes", "Rating", "Actions"].map(h => (
                                <th key={h} className="pb-4 text-eyebrow text-foreground-muted font-normal">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {displaySessions.map((s: any) => (
                            <tr key={s.id} className="group transition-colors hover:bg-[color:var(--surface-1)]">
                                <td className="py-4 text-body-sm text-foreground">{s.date}</td>
                                <td className="py-4 text-body-sm text-foreground-muted">
                                    {s.duration || `${s.durationMinutes} min`}
                                </td>
                                <td className="py-4">
                                    <span
                                        className="px-2 py-0.5 rounded text-eyebrow text-foreground-muted"
                                        style={{ background: "var(--surface-2)" }}
                                    >
                                        {s.type || "Video Call"}
                                    </span>
                                </td>
                                <td className="py-4 text-body-sm text-foreground-muted italic">
                                    {s.notes?.substring(0, 30)}…
                                </td>
                                <td className="py-4 text-body-sm" style={{ color: "var(--brand-green)" }}>
                                    {"★".repeat(s.rating)}{"☆".repeat(5 - s.rating)}
                                </td>
                                <td className="py-4">
                                    <button className="inline-flex items-center gap-1.5 text-eyebrow text-foreground-muted group-hover:text-foreground transition-colors">
                                        <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                className="w-full mt-6 py-4 border-t border-border text-eyebrow transition-colors hover:bg-[color:var(--surface-1)]"
                style={{ color: "var(--brand-green)" }}
            >
                Load more sessions →
            </button>
        </section>
    );
}
