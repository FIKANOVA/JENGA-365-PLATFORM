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
            <h2 className="text-headline text-foreground">Mentorship queue</h2>

            <div className="flex border-b border-border">
                <button
                    className="px-4 py-3 text-label font-medium border-b-2 relative"
                    style={{ borderColor: "var(--brand-green)", color: "var(--brand-green)" }}
                >
                    Pending requests ({pendingRequests.length})
                </button>
                <button className="px-4 py-3 text-label text-foreground-muted hover:text-foreground transition-colors border-b-2 border-transparent">
                    Past sessions
                </button>
            </div>

            {pendingRequests.length === 0 ? (
                <div
                    className="rounded-md border border-dashed border-border p-8 text-center text-body-sm text-foreground-muted"
                    style={{ background: "var(--surface-1)" }}
                >
                    No pending mentee requests right now.
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {pendingRequests.map((req) => (
                        <div
                            key={req.pairId}
                            className="rounded-md border border-border bg-background p-5 flex flex-col gap-4 hover:border-[color:var(--border-strong,#D4D4D8)] transition-colors"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border border-border shrink-0 text-foreground-muted"
                                        style={{ background: "var(--surface-2)" }}
                                    >
                                        {(req.mentee?.name ?? "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-headline text-foreground">
                                            {req.mentee?.name ?? "Unknown mentee"}
                                        </h3>
                                        <p className="text-eyebrow text-foreground-muted">
                                            {req.mentee?.locationRegion ?? "Location not set"}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-eyebrow text-foreground-muted shrink-0">
                                    {timeAgo(req.matchedAt)}
                                </span>
                            </div>

                            {req.matchScore && (
                                <div
                                    className="rounded-md p-3 border border-border"
                                    style={{ background: "var(--surface-1)" }}
                                >
                                    <span className="text-eyebrow text-foreground-muted mb-1 block">
                                        AI match score
                                    </span>
                                    <span className="text-body-sm text-foreground">
                                        {Math.round(Number(req.matchScore))}% compatibility
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                                {actioned.has(req.pairId) ? (
                                    <span className="text-label" style={{ color: "var(--brand-green)" }}>
                                        Actioned ✓
                                    </span>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleAction(req.pairId, "accept")}
                                            disabled={actioning === req.pairId}
                                            className="inline-flex items-center gap-2 h-9 rounded-md px-4 text-label font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                                            style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                                        >
                                            {actioning === req.pairId && <Loader2 className="w-3 h-3 animate-spin" />}
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.pairId, "decline")}
                                            disabled={actioning === req.pairId}
                                            className="inline-flex items-center h-9 rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)] disabled:opacity-50"
                                        >
                                            Decline
                                        </button>
                                    </>
                                )}
                                <button
                                    className="ml-auto text-label hover:underline"
                                    style={{ color: "var(--brand-green)" }}
                                >
                                    View full profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
