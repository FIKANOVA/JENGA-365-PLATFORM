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
            <h2 className="font-playfair text-foreground text-[22px] font-bold leading-tight">
                Upcoming Sessions
            </h2>

            {sessions.length === 0 ? (
                <div className="border border-dashed border-border/50 rounded-lg p-8 text-center text-sm text-muted-foreground font-mono">
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

                        return (
                            <div
                                key={session.id}
                                className={`rounded-lg p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden border ${
                                    isUpcoming
                                        ? "border-kenya-green/30 bg-kenya-green/5"
                                        : "border-border/50 bg-card"
                                }`}
                            >
                                {isUpcoming && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-kenya-green" />
                                )}
                                <div className="flex items-center justify-between">
                                    <div className={`font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${isUpcoming ? "text-kenya-green" : "text-muted-foreground"}`}>
                                        {isUpcoming && <span className="w-2 h-2 rounded-full bg-kenya-green animate-pulse" />}
                                        {startsIn ? `Starts in ${startsIn}` : sessionDate.toLocaleDateString()}
                                    </div>
                                    <span className="text-muted-foreground text-sm font-bold">
                                        {sessionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-playfair font-bold text-lg">
                                        {session.durationMinutes}min Session
                                    </h4>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        with {session.menteeName ?? "Mentee"}
                                    </p>
                                </div>
                                {isUpcoming ? (
                                    <button className="w-full py-2.5 bg-kenya-green text-white text-sm font-bold rounded hover:bg-kenya-green/90 transition-colors flex items-center justify-center gap-2 mt-2 outline-none">
                                        <Video className="w-4 h-4" />
                                        JOIN ROOM
                                    </button>
                                ) : (
                                    <button className="w-full py-2.5 bg-transparent border border-border/50 text-foreground text-sm font-bold rounded hover:bg-muted transition-colors flex items-center justify-center gap-2 mt-2 outline-none">
                                        <Calendar className="w-4 h-4" />
                                        View Notes
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    <button className="text-muted-foreground text-sm font-bold hover:text-primary transition-colors text-center py-2">
                        View Full Calendar
                    </button>
                </div>
            )}
        </div>
    );
}
