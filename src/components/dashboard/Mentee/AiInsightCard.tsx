"use client"

import { Cpu, Zap, Target } from "lucide-react";

interface AiInsightCardProps {
    profileMatch: number;
    deepSkillMatch: number;
    className?: string;
}

export default function AiInsightCard({ profileMatch, deepSkillMatch, className = "" }: AiInsightCardProps) {
    return (
        <div className={`mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500 ${className}`}>
            <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">AI Matching Insight</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                        <span>Profile Orbit</span>
                        <span>{profileMatch}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-1000 ease-out"
                            style={{ width: `${profileMatch}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                        <span>Deep Skill Match</span>
                        <span>{deepSkillMatch}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-amber-500/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 transition-all duration-1000 ease-out"
                            style={{ width: `${deepSkillMatch}%` }}
                        />
                    </div>
                </div>
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-black/5 dark:border-white/5 italic">
                {deepSkillMatch > 80
                    ? "Exceptional technical alignment found in professional experience chunks."
                    : "High-level career trajectory matches your current learning pathway goals."}
            </p>
        </div>
    );
}
