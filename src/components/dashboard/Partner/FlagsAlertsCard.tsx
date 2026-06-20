"use client"

import { CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
    menteeId: string;
}

export default function FlagsAlertsCard({ menteeId }: Props) {
    const hasFlags = false; // Mocking empty state

    return (
        <section
            className="rounded-md border border-border bg-background p-6 animate-fade-up"
            style={{ animationDelay: "100ms", boxShadow: "var(--shadow-sm)" }}
        >
            <span className="text-eyebrow text-foreground-muted mb-6 block">Flags & alerts</span>

            {!hasFlags ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                        style={{ background: "var(--brand-green-soft)" }}
                    >
                        <CheckCircle2 className="w-6 h-6" style={{ color: "var(--brand-green)" }} />
                    </div>
                    <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                        No active flags
                    </p>
                </div>
            ) : (
                <div
                    className="border-l-4 p-4 rounded-md"
                    style={{ background: "var(--brand-red-soft)", borderLeftColor: "var(--brand-red)" }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" style={{ color: "var(--brand-red)" }} />
                        <h4 className="text-label" style={{ color: "var(--brand-red)" }}>
                            2 consecutive missed sessions
                        </h4>
                    </div>
                    <p className="text-body-sm text-foreground-muted mb-4">
                        Mentee has not attended or cancelled the last two scheduled sessions.
                    </p>
                    <div className="flex gap-3">
                        <button className="text-eyebrow text-foreground-muted hover:text-foreground">
                            Dismiss
                        </button>
                        <button className="text-eyebrow hover:underline" style={{ color: "var(--brand-red)" }}>
                            Escalate
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
