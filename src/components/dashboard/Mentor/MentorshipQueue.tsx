"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { acceptMentorRequest, declineMentorRequest } from "@/lib/actions/mentorship";

interface PendingRequest {
    pairId: string;
    matchedAt: Date;
    matchScore: string | null;
    mentee: { id: string; name: string | null; image: string | null; locationRegion: string | null } | null;
}

interface MentorshipQueueProps {
    pendingRequests?: PendingRequest[];
}

export default function MentorshipQueue({ pendingRequests = [] }: MentorshipQueueProps) {
    const [actioning, setActioning] = useState<string | null>(null);
    const [actioned, setActioned] = useState<Set<string>>(new Set());

    async function handleAction(pairId: string, action: "accept" | "decline") {
        setActioning(pairId);
        try {
            if (action === "accept") await acceptMentorRequest(pairId);
            else await declineMentorRequest(pairId);
            setActioned(prev => new Set(prev).add(pairId));
        } catch (e) {
            console.error(e);
        } finally {
            setActioning(null);
        }
    }

    function timeAgo(date: Date): string {
        const diff = Date.now() - new Date(date).getTime();
        const hours = Math.floor(diff / 3_600_000);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    }

    return (
        <div className="flex flex-col gap-6">
            <h2 className="font-playfair text-foreground text-[22px] font-bold leading-tight">
                Mentorship Queue
            </h2>

            <div className="flex border-b border-border/50">
                <button className="px-4 py-3 text-primary text-sm font-bold border-b-2 border-primary relative">
                    Pending Requests ({pendingRequests.length})
                </button>
                <button className="px-4 py-3 text-muted-foreground text-sm font-medium hover:text-foreground transition-colors">
                    Past Sessions
                </button>
            </div>

            {pendingRequests.length === 0 ? (
                <div className="border border-dashed border-border/50 rounded-lg p-8 text-center text-sm text-muted-foreground font-mono">
                    No pending mentee requests right now.
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {pendingRequests.map((req) => (
                        <div
                            key={req.pairId}
                            className="rounded-lg border border-border/50 bg-card p-5 flex flex-col gap-4 shadow-sm hover:border-border transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground border border-border/50 shrink-0">
                                        {(req.mentee?.name ?? "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-playfair text-foreground text-lg font-bold">
                                            {req.mentee?.name ?? "Unknown Mentee"}
                                        </h3>
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider">
                                            {req.mentee?.locationRegion ?? "Location not set"}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-muted-foreground text-xs shrink-0">
                                    {timeAgo(req.matchedAt)}
                                </span>
                            </div>

                            {req.matchScore && (
                                <div className="bg-muted/30 rounded p-3 text-sm border border-border/50">
                                    <span className="font-bold text-foreground text-xs uppercase tracking-wider mb-1 block font-mono">
                                        AI Match Score:
                                    </span>
                                    <span className="text-foreground font-mono">{Math.round(Number(req.matchScore))}% compatibility</span>
                                </div>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                                {actioned.has(req.pairId) ? (
                                    <span className="text-sm font-mono text-kenya-green font-bold">Actioned ✓</span>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleAction(req.pairId, "accept")}
                                            disabled={actioning === req.pairId}
                                            className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {actioning === req.pairId && <Loader2 className="w-3 h-3 animate-spin" />}
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.pairId, "decline")}
                                            disabled={actioning === req.pairId}
                                            className="px-6 py-2 bg-transparent text-foreground text-sm font-bold rounded border border-border/50 hover:bg-muted transition-colors disabled:opacity-50"
                                        >
                                            Decline
                                        </button>
                                    </>
                                )}
                                <button className="px-4 py-2 text-primary text-sm font-bold hover:underline ml-auto">
                                    View Full Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
