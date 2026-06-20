"use client";

import { Video, Calendar } from "lucide-react";

interface SessionEntry {
    id: string;
    sessionDate: Date;
    durationMinutes: number;
    notes: string | null;
    menteeName?: string;
}

interface UpcomingSessionsProps {
    sessions?: SessionEntry[];
}

export default function UpcomingSessions({ sessions = [] }: UpcomingSessionsProps) {
    const now = new Date();

    return (
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
            <h2 className="text-headline text-foreground">Upcoming sessions</h2>

            {sessions.length === 0 ? (
                <div
                    className="rounded-md border border-dashed border-border p-8 text-center text-body-sm text-foreground-muted"
                    style={{ background: "var(--surface-1)" }}
                >
                    No upcoming sessions scheduled.
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {sessions.map((session) => {
                        const sessionDate = new Date(session.sessionDate);
                        const isUpcoming = sessionDate > now;
                        const diffMs = sessionDate.getTime() - now.getTime();
                        const diffHours = Math.round(diffMs / 3_600_000);
                        const startsIn = diffHours < 24 ? `${diffHours}h` : null;
                        const cardStyle = isUpcoming
                            ? { borderColor: "var(--brand-green)", background: "var(--brand-green-soft)" }
                            : { background: "var(--background)" };

                        return (
                            <div
                                key={session.id}
                                className={`rounded-md p-5 flex flex-col gap-4 relative overflow-hidden border ${isUpcoming ? "" : "border-border"}`}
                                style={{ ...cardStyle, boxShadow: "var(--shadow-sm)" }}
                            >
                                {isUpcoming && (
                                    <div
                                        className="absolute top-0 left-0 w-1 h-full"
                                        style={{ background: "var(--brand-green)" }}
                                    />
                                )}
                                <div className="flex items-center justify-between">
                                    <div
                                        className="text-eyebrow flex items-center gap-2"
                                        style={{ color: isUpcoming ? "var(--brand-green)" : "var(--foreground-muted)" }}
                                    >
                                        {isUpcoming && (
                                            <span
                                                className="w-2 h-2 rounded-full animate-pulse"
                                                style={{ background: "var(--brand-green)" }}
                                            />
                                        )}
                                        {startsIn ? `Starts in ${startsIn}` : sessionDate.toLocaleDateString()}
                                    </div>
                                    <span className="text-body-sm text-foreground font-medium">
                                        {sessionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-headline text-foreground">
                                        {session.durationMinutes}min session
                                    </h4>
                                    <p className="text-body-sm text-foreground-muted mt-1">
                                        with {session.menteeName ?? "Mentee"}
                                    </p>
                                </div>
                                {isUpcoming ? (
                                    <button
                                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md text-label font-medium transition-opacity hover:opacity-90 mt-2"
                                        style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                                    >
                                        <Video className="w-4 h-4" />
                                        Join room
                                    </button>
                                ) : (
                                    <button className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md border border-border bg-background text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)] mt-2">
                                        <Calendar className="w-4 h-4" />
                                        View notes
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    <button className="text-body-sm text-foreground-muted hover:text-foreground transition-colors text-center py-2">
                        View full calendar
                    </button>
                </div>
            )}
        </div>
    );
}
