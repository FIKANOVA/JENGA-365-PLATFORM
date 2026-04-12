"use client";

import AIInterviewerChat from "@/components/onboarding/AIInterviewerChat";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingClient() {
    const router = useRouter();
    const [isFinishing, setIsFinishing] = useState(false);

    const handleComplete = async (summary: string) => {
        setIsFinishing(true);
        try {
            const result = await completeOnboarding(summary);
            if (result.success) {
                router.push(result.redirectTo);
            }
        } catch (error) {
            console.error("Failed to complete onboarding:", error);
            setIsFinishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-4">
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-1 py-12">
                    <span className="font-mono text-[10px] text-[#006600] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)]" />
                        Phase 2 — Onboarding
                    </span>
                    <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mt-4 leading-tight uppercase tracking-tight">
                        Let&apos;s Build Your <span className="text-[#006600]">Impact</span> Profile.
                    </h1>
                    <p className="text-[#8A8A8A] font-body mt-6 leading-relaxed">
                        Jenga365 uses Agentic Onboarding to understand your goals more deeply than a standard form.
                    </p>

                    <div className="mt-12 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#006600] flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                            <span className="text-sm font-body text-[#1A1A1A]">Identity & Commitment</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#006600] flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                            <span className="text-sm font-body text-[#1A1A1A]">NDA Signed</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#006600] border-2 border-[#006600] flex items-center justify-center text-white text-[10px] font-bold">3</div>
                            <span className="text-sm font-body font-bold text-[#1A1A1A]">AI Growth Interview</span>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2">
                    {isFinishing ? (
                        <div className="h-[500px] flex flex-col items-center justify-center bg-white border border-[#E8E4DC] p-12 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--red)]/10" />
                            <div className="w-16 h-16 border-4 border-[#006600] border-t-[var(--red)] rounded-full animate-spin mb-6" />
                            <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] uppercase tracking-tight">Finalizing Your Profile...</h2>
                            <p className="text-[#8A8A8A] mt-2">Amani AI is synthesizing your impact roadmap.</p>
                        </div>
                    ) : (
                        <AIInterviewerChat onComplete={handleComplete} />
                    )}
                </div>
            </div>
        </div>
    );
}
