"use client"

import { CheckCircle2, Circle } from "lucide-react";

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
        <section className="jenga-card p-8">
            <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                    <span className="section-label">Learning Pathway</span>
                    <h2 className="font-playfair font-bold text-2xl text-foreground">
                        Milestone Progress
                    </h2>
                </div>
                <div className="text-right">
                    <div className="font-playfair font-black text-3xl text-foreground">
                        {pathway?.progress || 67}%
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                        of pathway complete
                    </p>
                </div>
            </div>

            <div className="relative space-y-12">
                {/* Vertical Spine */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#E8E4DC]" />

                {milestones.map((m: any, idx: number) => (
                    <div key={m.id} className={`relative pl-10 ${m.status === 'pending' ? 'opacity-50' : ''}`}>
                        {/* Node */}
                        <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center bg-white z-10 border-2 ${m.status === 'completed' ? 'border-[#006600] text-[#006600]' :
                                m.status === 'in_progress' ? 'border-[#BB0000] text-[#BB0000] animate-pulse-red' :
                                    'border-[#D0CBC0] text-[#D0CBC0]'
                            }`}>
                            {m.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5 fill-current" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-lato font-bold text-base text-foreground">
                                    {m.title}
                                </h4>
                                {m.status === 'in_progress' && (
                                    <span className="bg-[#FFF0F0] text-[#BB0000] px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-tighter">
                                        Active Milestone
                                    </span>
                                )}
                            </div>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">
                                {m.date}
                            </p>

                            {m.notes && (
                                <div className="space-y-2">
                                    <p className="font-lato italic text-[13px] text-[#4A4A4A] leading-relaxed max-w-lg">
                                        "{m.notes}"
                                    </p>
                                    <button className="font-mono text-[10px] text-primary uppercase tracking-widest hover:underline">
                                        View session notes →
                                    </button>
                                </div>
                            )}

                            {m.status === 'in_progress' && (
                                <div className="mt-4 w-full max-w-xs h-1 bg-[#E8E4DC] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#BB0000] to-[#006600] transition-all duration-1000"
                                        style={{ width: `${m.progress || 0}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
