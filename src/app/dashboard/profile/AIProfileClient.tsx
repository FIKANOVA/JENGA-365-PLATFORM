"use client";

import { useState, useCallback } from "react";
import { CheckCircle, Sparkles } from "lucide-react";
import AIInterviewer from "@/components/onboarding/AIInterviewerChat";
import { triggerAiProfileSynthesis } from "@/lib/actions/matching";

type State = "idle" | "interviewing" | "synthesizing" | "done" | "error";

export default function AIProfileClient() {
    const [state, setState] = useState<State>("idle");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleComplete = useCallback(async (summary: string) => {
        setState("synthesizing");
        try {
            await triggerAiProfileSynthesis();
            setState("done");
        } catch (e: any) {
            console.error("[AIProfile] Synthesis failed:", e);
            setErrorMsg(e?.message ?? "Profile synthesis failed. Your interview was saved.");
            setState("error");
        }
    }, []);

    if (state === "idle") {
        return (
            <div className="bg-card border border-border/50 rounded-lg p-10 text-center space-y-6 shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <div>
                    <h2 className="font-playfair text-2xl font-bold text-foreground mb-2">Ready when you are</h2>
                    <p className="text-muted-foreground font-mono text-sm">The interview takes about 5–10 minutes.</p>
                </div>
                <button
                    onClick={() => setState("interviewing")}
                    className="px-8 py-3 bg-primary text-primary-foreground font-mono font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-md"
                >
                    Start Interview
                </button>
            </div>
        );
    }

    if (state === "interviewing") {
        return <AIInterviewer onComplete={handleComplete} />;
    }

    if (state === "synthesizing") {
        return (
            <div className="bg-card border border-border/50 rounded-lg p-10 text-center space-y-4 shadow-sm">
                <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                </div>
                <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Synthesizing your profile…</p>
            </div>
        );
    }

    if (state === "done") {
        return (
            <div className="bg-card border border-border/50 rounded-lg p-10 text-center space-y-6 shadow-sm">
                <CheckCircle className="w-14 h-14 mx-auto text-green-500" />
                <div>
                    <h2 className="font-playfair text-2xl font-bold text-foreground mb-2">Profile Updated</h2>
                    <p className="text-muted-foreground font-mono text-sm">
                        Your profile embedding has been regenerated. Match recommendations will reflect your updated profile.
                    </p>
                </div>
                <button
                    onClick={() => setState("idle")}
                    className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                    Retake interview
                </button>
            </div>
        );
    }

    // error state
    return (
        <div className="bg-card border border-destructive/30 rounded-lg p-10 text-center space-y-4 shadow-sm">
            <p className="font-mono text-sm text-destructive uppercase tracking-widest">Synthesis incomplete</p>
            <p className="text-muted-foreground text-sm">{errorMsg}</p>
            <button
                onClick={() => setState("idle")}
                className="px-6 py-2 border border-border text-sm font-mono rounded-md hover:bg-muted transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
