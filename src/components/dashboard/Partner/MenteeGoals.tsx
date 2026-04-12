"use client"

import { CheckCircle2, Clock } from "lucide-react";

interface Props {
    menteeId: string;
}

export default function MenteeGoals({ menteeId }: Props) {
    const goals = [
        { id: "1", title: "Sports Management Transition", status: "in_progress", date: "Dec 2026", notes: "Working on identifying lateral transferrable skills from current role." },
        { id: "2", title: "Public Speaking & Leadership", status: "done", date: "Feb 2026", notes: "Completed 3 Toastmasters sessions and led internal team meeting." },
        { id: "3", title: "Industry Networking Expansion", status: "in_progress", date: "Jun 2026", notes: "Targeting 5 new senior-level contacts in sports marketing." },
    ];

    return (
        <section className="space-y-4">
            <span className="section-label">Mentee Goals</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {goals.map(goal => (
                    <div key={goal.id} className="jenga-card p-6 flex flex-col h-full hover:border-primary group transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-playfair font-bold text-base leading-tight">
                                {goal.title}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-tighter ${goal.status === 'done' ? 'bg-[#F0FFF0] text-[#006600]' : 'bg-[#FFF8E8] text-[#996600]'
                                }`}>
                                {goal.status === 'done' ? 'Done' : 'In Progress'}
                            </span>
                        </div>
                        <p className="font-lato text-[13px] text-[#4A4A4A] mb-4 flex-1">
                            {goal.notes}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground uppercase">
                                <Clock className="w-3 h-3" /> {goal.date}
                            </div>
                            <button className="font-mono text-[10px] text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Update →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
