"use client";

interface MentorMatch {
    id: string;
    name: string | null;
    locationRegion: string | null;
    matchPercentage: number;
    insights: { profileMatch: number; deepSkillMatch: number };
}

interface AiMentorMatchesProps {
    matches?: MentorMatch[];
}

export default function AiMentorMatches({ matches = [] }: AiMentorMatchesProps) {
    return (
        <section>
            <h3 className="font-playfair text-xl font-bold mb-4 text-foreground">
                AI Mentor Matches
            </h3>

            {matches.length === 0 ? (
                <div className="border border-dashed border-border/50 rounded-xl p-8 text-center text-sm text-muted-foreground font-mono">
                    Complete your AI interview to see personalised mentor matches.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {matches.map((mentor) => (
                        <div
                            key={mentor.id}
                            className="bg-card border border-border/50 rounded-xl p-4 flex flex-col hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground border border-border/50 shrink-0">
                                    {(mentor.name ?? "?").charAt(0).toUpperCase()}
                                </div>
                                <span className="bg-kenya-red text-white text-[10px] font-mono font-bold px-2 py-1 rounded">
                                    {mentor.matchPercentage}% MATCH
                                </span>
                            </div>
                            <h4 className="font-lato font-bold text-lg mb-1">{mentor.name ?? "Mentor"}</h4>
                            <p className="font-lato text-sm text-muted-foreground mb-3">
                                {mentor.locationRegion ?? "Location not set"}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-auto text-xs font-mono text-muted-foreground">
                                <span className="bg-muted px-2 py-1 rounded-md border border-border/20">
                                    Profile {mentor.insights.profileMatch}%
                                </span>
                                <span className="bg-muted px-2 py-1 rounded-md border border-border/20">
                                    Skills {mentor.insights.deepSkillMatch}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
