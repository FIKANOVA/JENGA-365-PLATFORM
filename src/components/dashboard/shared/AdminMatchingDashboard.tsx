"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAiMentorMatchesForUser } from "@/lib/actions/matching";
import { assignMentor } from "@/lib/actions/menteeManagement";
import AiInsightCard from "../Mentee/AiInsightCard";
import { Loader2, Sparkles, MapPin, CheckCircle2, UserPlus, Search } from "lucide-react";

interface AdminMatchingDashboardProps {
    menteeId: string;
    menteeName: string;
    currentMentor?: {
        name: string;
        id: string;
    } | null;
}

export default function AdminMatchingDashboard({ menteeId, menteeName, currentMentor }: AdminMatchingDashboardProps) {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const data = await getAiMentorMatchesForUser(menteeId);
                setRecommendations(data);
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
                alert("Failed to load AI recommendations");
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [menteeId]);

    const handleAssign = async (mentorId: string, matchPercentage: number) => {
        setAssigningId(mentorId);
        try {
            const res = await assignMentor({
                menteeId,
                mentorId,
                matchScore: matchPercentage
            });
            if (res.success) {
                alert("Mentor assigned successfully!");
                // Optionally refresh or redirect
                window.location.reload();
            }
        } catch (error) {
            console.error("Assignment failed:", error);
            alert("Failed to assign mentor");
        } finally {
            setAssigningId(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-40 bg-muted/50 rounded-3xl animate-pulse flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Current Mentor Section */}
            <Card className="border-none bg-primary/5 shadow-none rounded-3xl overflow-hidden">
                <CardHeader className="pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Current Assignment</p>
                    <CardTitle className="text-xl font-outfit">
                        {currentMentor ? `Matched with ${currentMentor.name}` : "Waiting for Match"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!currentMentor && (
                        <p className="text-sm text-muted-foreground italic">
                            {menteeName} is currently exploring the platform without a dedicated mentor.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* AI Recommendations */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <h2 className="text-2xl font-bold font-outfit">AI Matching Engine</h2>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        Vector Semantic Search
                    </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                    Top 5 mentors whose professional synthesis and experience chunks align with {menteeName}'s profile.
                </p>

                <div className="grid grid-cols-1 gap-6">
                    {recommendations.length === 0 ? (
                        <div className="p-12 text-center border-2 border-dashed rounded-3xl">
                            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-muted-foreground italic">No high-confidence matches found. Ensure the mentee has uploaded a CV.</p>
                        </div>
                    ) : (
                        recommendations.map((mentor) => (
                            <div
                                key={mentor.id}
                                className={`group p-6 bg-white border rounded-3xl transition-all duration-300 ${currentMentor?.id === mentor.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50 hover:shadow-xl"
                                    }`}
                            >
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                                    <div className="flex items-start space-x-6 w-full lg:w-3/4">
                                        <Avatar className="w-14 h-14 border-2 border-primary/10 shrink-0 mt-1">
                                            <AvatarFallback className="font-bold bg-primary/5">{mentor.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold font-outfit">{mentor.name}</h3>
                                                {currentMentor?.id === mentor.id && (
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 flex gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Active
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground pb-2">
                                                <MapPin className="w-3 h-3" />
                                                <span>{mentor.locationRegion || "Global"}</span>
                                            </div>

                                            <AiInsightCard
                                                profileMatch={mentor.insights.profileMatch}
                                                deepSkillMatch={mentor.insights.deepSkillMatch}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center lg:items-end w-full lg:w-auto shrink-0 space-y-4">
                                        <div className="text-center lg:text-right">
                                            <div className="text-4xl font-black text-primary font-outfit leading-none mb-1">
                                                {mentor.matchPercentage}%
                                            </div>
                                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-mono">
                                                Confidence Score
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => handleAssign(mentor.id, mentor.matchPercentage)}
                                            disabled={assigningId !== null || currentMentor?.id === mentor.id}
                                            variant={currentMentor?.id === mentor.id ? "secondary" : "default"}
                                            className="w-full lg:w-48 rounded-full font-bold group"
                                        >
                                            {assigningId === mentor.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : currentMentor?.id === mentor.id ? (
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                            ) : (
                                                <UserPlus className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                                            )}
                                            {currentMentor?.id === mentor.id ? "Already Assigned" : "Assign Mentor"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
