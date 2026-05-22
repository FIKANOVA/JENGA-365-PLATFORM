"use client"

interface Props {
    sessions: any[];
}

export default function AttendanceCard({ sessions }: Props) {
    return (
        <section
            className="rounded-lg border border-border bg-background p-6 animate-fade-up"
            style={{ animationDelay: "200ms", boxShadow: "var(--shadow-sm)" }}
        >
            <span className="text-eyebrow text-foreground-muted mb-6 block">Attendance rate</span>

            <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-display-md" style={{ color: "var(--brand-green)" }}>92%</h3>
                <p className="text-eyebrow text-foreground-muted">Overall</p>
            </div>

            <p className="text-body-sm text-foreground-muted mb-8">
                11 of 12 scheduled sessions attended
            </p>

            {/* Mini Bar Chart Mock */}
            <div className="flex items-end gap-2 h-16 mb-6">
                {[80, 100, 90, 100, 85, 95].map((h, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-t-sm relative group"
                        style={{ background: "var(--brand-green-soft)" }}
                    >
                        <div
                            className="absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-700"
                            style={{ height: `${h}%`, background: "var(--brand-green)" }}
                        />
                        {i === 2 && (
                            <div
                                className="absolute top-[-4px] left-0 right-0 h-1"
                                style={{ background: "var(--brand-red)" }}
                                title="1 missed session"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-eyebrow text-foreground-muted">
                    <span className="w-2 h-2 rounded-full" style={{ background: "var(--brand-green)" }} /> 11 Attended
                </div>
                <div className="flex items-center gap-2 text-eyebrow text-foreground-muted">
                    <span className="w-2 h-2 rounded-full" style={{ background: "var(--brand-red)" }} /> 1 Missed
                </div>
                <div className="flex items-center gap-2 text-eyebrow text-foreground-muted">
                    <span className="w-2 h-2 rounded-full bg-border" /> 0 Cancelled
                </div>
            </div>

            <button
                className="w-full mt-8 pt-4 border-t border-border text-eyebrow hover:underline text-left"
                style={{ color: "var(--brand-red)" }}
            >
                View attendance history →
            </button>
        </section>
    );
}
