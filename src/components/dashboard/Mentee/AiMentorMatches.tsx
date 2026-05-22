"use client";

interface MentorMatch {
    id: string;
    name: string | null;
    locationRegion: string | null;
    matchPercentage: number;
    insights: { profileMatch: number; deepSkillMatch?: number; goalAlignment?: number };
}

interface AiMentorMatchesProps {
    matches?: MentorMatch[];
}

export default function AiMentorMatches({ matches = [] }: AiMentorMatchesProps) {
    return (
        <section>
            <h3 className="text-headline text-foreground mb-4">AI mentor matches</h3>

            {matches.length === 0 ? (
                <div
                    className="rounded-md border border-dashed border-border p-8 text-center text-body-sm text-foreground-muted"
                    style={{ background: "var(--surface-1)" }}
                >
                    Complete your AI interview to see personalised mentor matches.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {matches.map((mentor) => (
                        <div
                            key={mentor.id}
                            className="rounded-lg border border-border bg-background p-4 flex flex-col transition-colors hover:border-[color:var(--border-strong,#D4D4D8)]"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border border-border shrink-0 text-foreground-muted"
                                    style={{ background: "var(--surface-2)" }}
                                >
                                    {(mentor.name ?? "?").charAt(0).toUpperCase()}
                                </div>
                                <span
                                    className="px-2 py-1 rounded text-eyebrow"
                                    style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                                >
                                    {mentor.matchPercentage}% match
                                </span>
                            </div>
                            <h4 className="text-headline text-foreground mb-1">{mentor.name ?? "Mentor"}</h4>
                            <p className="text-body-sm text-foreground-muted mb-3">
                                {mentor.locationRegion ?? "Location not set"}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-auto">
                                <span
                                    className="px-2 py-1 rounded-md border border-border text-eyebrow text-foreground-muted"
                                    style={{ background: "var(--surface-1)" }}
                                >
                                    Profile {mentor.insights.profileMatch}%
                                </span>
                                {mentor.insights.deepSkillMatch !== undefined && (
                                    <span
                                        className="px-2 py-1 rounded-md border border-border text-eyebrow text-foreground-muted"
                                        style={{ background: "var(--surface-1)" }}
                                    >
                                        Skills {mentor.insights.deepSkillMatch}%
                                    </span>
                                )}
                                {mentor.insights.goalAlignment !== undefined && (
                                    <span
                                        className="px-2 py-1 rounded-md border border-border text-eyebrow text-foreground-muted"
                                        style={{ background: "var(--surface-1)" }}
                                    >
                                        Goal {mentor.insights.goalAlignment}%
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
