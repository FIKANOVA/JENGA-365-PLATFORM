"use client";

import { useState } from "react";
import AdminMatchingDashboard from "../shared/AdminMatchingDashboard";
import { Settings2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MentorshipPairData {
    matchScore?: string | number | null;
    mentor?: {
        id: string;
        name: string;
        expertise?: string[];
        sessionsTogether?: number;
    } | null;
}

interface Props {
    pair: MentorshipPairData;
    menteeId: string;
    menteeName: string;
}


export default function AssignedMentorCard({ pair, menteeId, menteeName }: Props) {
    const [isMatching, setIsMatching] = useState(false);

    const mentor = pair?.mentor;

    if (isMatching || !mentor) {
        return (
            <section
                className="rounded-lg border border-border bg-background p-8 animate-fade-up"
                style={{ boxShadow: "var(--shadow-sm)" }}
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <h3 className="text-display-sm text-foreground">Mentor matching</h3>
                        <p className="text-body-sm text-foreground-muted">
                            Select the best mentor for {menteeName}
                        </p>
                    </div>
                    {mentor && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMatching(false)}
                            className="rounded-full"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    )}
                </div>

                <AdminMatchingDashboard
                    menteeId={menteeId}
                    menteeName={menteeName}
                    currentMentor={mentor ? { id: mentor.id, name: mentor.name } : null}
                />
            </section>
        );
    }

    return (
        <section
            className="rounded-lg border border-border p-6 animate-fade-up"
            style={{ background: "var(--surface-1)" }}
        >
            <div className="flex items-center justify-between mb-6">
                <span className="text-eyebrow text-foreground-muted">Assigned mentor</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground-muted"
                    onClick={() => setIsMatching(true)}
                >
                    <Settings2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div
                    className="w-12 h-12 rounded-full border border-border overflow-hidden flex items-center justify-center text-display-sm"
                    style={{ background: "var(--background)", color: "var(--brand-red)" }}
                >
                    {mentor.name?.substring(0, 1)}
                </div>
                <div>
                    <h4 className="text-headline text-foreground">{mentor.name}</h4>
                    <span
                        className="px-2 py-0.5 rounded-full text-eyebrow"
                        style={{ background: "var(--brand-red-soft)", color: "var(--brand-red)" }}
                    >
                        Mentor
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {(mentor.expertise || []).map((exp: string) => (
                    <span
                        key={exp}
                        className="bg-background border border-border px-3 py-1 rounded-full text-eyebrow text-foreground-muted"
                    >
                        {exp}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="space-y-1">
                    <p className="text-display-sm" style={{ color: "var(--brand-red)" }}>
                        {pair.matchScore || "90"}%
                    </p>
                    <p className="text-eyebrow text-foreground-muted">Match score</p>
                </div>
                <div className="space-y-1">
                    <p className="text-display-sm text-foreground">
                        {mentor.sessionsTogether || 0}
                    </p>
                    <p className="text-eyebrow text-foreground-muted">Sessions</p>
                </div>
            </div>

            <div className="space-y-3">
                <button
                    className="w-full text-eyebrow hover:underline py-2 text-left"
                    style={{ color: "var(--brand-red)" }}
                >
                    View mentor profile →
                </button>
                <button
                    className="w-full text-eyebrow text-foreground-muted hover:text-foreground transition-colors py-2 border border-transparent hover:border-border rounded-md"
                    onClick={() => setIsMatching(true)}
                >
                    Reassign mentor
                </button>
            </div>
        </section>
    );
}
