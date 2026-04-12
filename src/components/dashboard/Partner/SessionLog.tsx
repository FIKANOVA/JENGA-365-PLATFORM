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
        <section className="jenga-card p-8">
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-1">
                    <span className="section-label">Session History</span>
                </div>
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 font-mono text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" /> Log New Session
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border">
                            {["Date", "Duration", "Type", "Notes", "Rating", "Actions"].map(h => (
                                <th key={h} className="pb-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground font-normal">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {displaySessions.map((s: any) => (
                            <tr key={s.id} className="group hover:bg-muted/5 transition-colors">
                                <td className="py-4 font-lato text-sm text-foreground">
                                    {s.date}
                                </td>
                                <td className="py-4 font-lato text-sm text-[#4A4A4A]">
                                    {s.duration || `${s.durationMinutes} min`}
                                </td>
                                <td className="py-4">
                                    <span className="bg-muted px-2 py-0.5 rounded font-mono text-[9px] uppercase text-muted-foreground">
                                        {s.type || "Video Call"}
                                    </span>
                                </td>
                                <td className="py-4 font-lato text-sm text-[#4A4A4A] italic">
                                    {s.notes?.substring(0, 30)}...
                                </td>
                                <td className="py-4 text-primary text-xs">
                                    {"★".repeat(s.rating)}{"☆".repeat(5 - s.rating)}
                                </td>
                                <td className="py-4">
                                    <button className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-tighter text-muted-foreground group-hover:text-primary transition-colors">
                                        <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button className="w-full mt-6 py-4 border-t border-border font-mono text-[10px] text-primary uppercase tracking-[0.2em] hover:bg-accent/5 transition-colors">
                Load more sessions →
            </button>
        </section>
    );
}
