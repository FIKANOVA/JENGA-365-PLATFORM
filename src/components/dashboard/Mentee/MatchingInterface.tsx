"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAiMentorMatches } from "@/lib/actions/matching";
import { requestMentor } from "@/lib/actions/mentorship";
import AiInsightCard from "./AiInsightCard";
import { Loader2, Sparkles, MapPin, UserCheck } from "lucide-react";

export default function MatchingInterface() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState<string | null>(null);
    const [requested, setRequested] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const data = await getAiMentorMatches();
                setMatches(data);
            } catch (error) {
                console.error("Failed to fetch matches:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    if (loading) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="px-0 py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">Calculating semantic matches...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <CardTitle className="text-2xl font-outfit">AI Recommended Mentors</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Based on your professional synthesis and experience chunks.</p>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
                {matches.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed rounded-3xl opacity-60">
                        <UserCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-bold font-outfit">No matches yet</h3>
                        <p className="text-sm text-muted-foreground">Complete your profile or upload a CV to trigger matching.</p>
                    </div>
                ) : (
                    matches.map((mentor) => (
                        <div key={mentor.id} className="group p-6 bg-background border rounded-3xl hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center space-x-6 w-full">
                                    <Avatar className="w-16 h-16 border-2 border-primary/20 group-hover:border-primary/50 transition-colors shrink-0">
                                        <AvatarFallback className="text-xl font-bold bg-primary/5">{mentor.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold font-outfit">{mentor.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>{mentor.locationRegion || "Global"}</span>
                                        </div>

                                        <AiInsightCard
                                            profileMatch={mentor.insights.profileMatch}
                                            deepSkillMatch={mentor.insights.deepSkillMatch}
                                        />
                                    </div>
                                </div>
                                <div className="text-center md:text-right w-full md:w-auto mt-4 md:mt-0 shrink-0">
                                    <div className="text-4xl font-black text-primary font-outfit mb-1">{mentor.matchPercentage}%</div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-6">Total Match Score</p>
                                    <Button
                                        onClick={async () => {
                                            setRequesting(mentor.id);
                                            try {
                                                await requestMentor(mentor.id);
                                                setRequested(prev => new Set(prev).add(mentor.id));
                                            } catch (e) {
                                                console.error(e);
                                            } finally {
                                                setRequesting(null);
                                            }
                                        }}
                                        disabled={requesting === mentor.id || requested.has(mentor.id)}
                                        className="w-full md:w-auto px-8 rounded-full font-bold shadow-lg shadow-primary/20"
                                    >
                                        {requesting === mentor.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : requested.has(mentor.id) ? (
                                            "Requested ✓"
                                        ) : (
                                            "Request Mentor"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
