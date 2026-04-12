import { useState } from "react";
import AdminMatchingDashboard from "../shared/AdminMatchingDashboard";
import { UserPlus, Settings2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    pair: any;
    menteeId: string;
    menteeName: string;
}

export default function AssignedMentorCard({ pair, menteeId, menteeName }: Props) {
    const [isMatching, setIsMatching] = useState(false);

    // If no pair exists, we start in a "Matching Recommendation" state or prompt to find one
    const mentor = pair?.mentor;

    if (isMatching || !mentor) {
        return (
            <section className="bg-white border border-border rounded-3xl p-8 animate-fade-up shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold font-outfit">Mentor Matching</h3>
                        <p className="text-sm text-muted-foreground">Select the best mentor for {menteeName}</p>
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
        <section className="bg-[#FAFAF8] border border-border rounded-[2px] p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
                <span className="section-label">Assigned Mentor</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/5 text-muted-foreground hover:text-primary"
                    onClick={() => setIsMatching(true)}
                >
                    <Settings2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-muted border border-border overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center font-playfair font-black text-[#BB0000]">
                        {mentor.name?.substring(0, 1)}
                    </div>
                </div>
                <div>
                    <h4 className="font-playfair font-bold text-lg text-foreground">
                        {mentor.name}
                    </h4>
                    <span className="bg-[#FFF0F0] text-[#BB0000] px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-tighter">
                        MENTOR
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {(mentor.expertise || []).map((exp: string) => (
                    <span key={exp} className="bg-white border border-border px-3 py-1 rounded-full font-mono text-[9px] text-[#4A4A4A] uppercase tracking-tighter">
                        {exp}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="space-y-1">
                    <p className="font-playfair font-black text-2xl text-[#BB0000]">
                        {pair.matchScore || "90"}%
                    </p>
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                        Match Score
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="font-playfair font-black text-2xl text-foreground">
                        {mentor.sessionsTogether || 0}
                    </p>
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                        Sessions
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <button className="w-full font-mono text-[11px] text-[#BB0000] uppercase tracking-widest hover:underline py-2">
                    View Mentor Profile →
                </button>
                <button
                    className="w-full font-mono text-[11px] text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors py-2 border border-transparent hover:border-border"
                    onClick={() => setIsMatching(true)}
                >
                    Reassign Mentor
                </button>
            </div>
        </section>
    );
}

