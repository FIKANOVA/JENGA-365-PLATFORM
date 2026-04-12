"use client"

import { CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
    menteeId: string;
}

export default function FlagsAlertsCard({ menteeId }: Props) {
    const hasFlags = false; // Mocking empty state

    return (
        <section className="jenga-card p-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <span className="section-label mb-6">Flags & Alerts</span>

            {!hasFlags ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#F0FFF0] flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-6 h-6 text-[#006600]" />
                    </div>
                    <p className="font-mono text-[11px] text-[#006600] uppercase tracking-widest">
                        No active flags
                    </p>
                </div>
            ) : (
                <div className="bg-[#FFF0F0] border-l-4 border-l-[#BB0000] p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-[#BB0000]" />
                        <h4 className="font-lato font-bold text-sm text-[#BB0000]">
                            2 consecutive missed sessions
                        </h4>
                    </div>
                    <p className="font-lato text-xs text-[#4A4A4A] mb-4">
                        Mentee has not attended or cancelled the last two scheduled sessions.
                    </p>
                    <div className="flex gap-3">
                        <button className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest hover:text-foreground">
                            Dismiss
                        </button>
                        <button className="font-mono text-[9px] text-[#BB0000] uppercase tracking-widest hover:underline">
                            Escalate
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
