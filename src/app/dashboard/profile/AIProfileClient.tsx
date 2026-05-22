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
            <div
                className="rounded-lg border border-border bg-background p-10 text-center space-y-6"
                style={{ boxShadow: "var(--shadow-sm)" }}
            >
                <div
                    className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
                    style={{ background: "var(--brand-green-soft)" }}
                >
                    <Sparkles className="w-7 h-7" style={{ color: "var(--brand-green)" }} />
                </div>
                <div>
                    <h2 className="text-display-sm text-foreground mb-2">Ready when you are</h2>
                    <p className="text-body-sm text-foreground-muted">The interview takes about 5–10 minutes.</p>
                </div>
                <button
                    onClick={() => setState("interviewing")}
                    className="inline-flex items-center h-11 rounded-md px-6 text-label font-medium transition-opacity hover:opacity-90"
                    style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                >
                    Start interview
                </button>
            </div>
        );
    }

    if (state === "interviewing") {
        return <AIInterviewer onComplete={handleComplete} />;
    }

    if (state === "synthesizing") {
        return (
            <div
                className="rounded-lg border border-border bg-background p-10 text-center space-y-4"
                style={{ boxShadow: "var(--shadow-sm)" }}
            >
                <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--brand-green)" }} />
                    <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]" style={{ background: "var(--brand-green)" }} />
                    <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s]" style={{ background: "var(--brand-green)" }} />
                </div>
                <p className="text-label text-foreground-muted">Synthesizing your profile…</p>
            </div>
        );
    }

    if (state === "done") {
        return (
            <div
                className="rounded-lg border border-border bg-background p-10 text-center space-y-6"
                style={{ boxShadow: "var(--shadow-sm)" }}
            >
                <CheckCircle className="w-14 h-14 mx-auto" style={{ color: "var(--brand-green)" }} />
                <div>
                    <h2 className="text-display-sm text-foreground mb-2">Profile updated</h2>
                    <p className="text-body-sm text-foreground-muted">
                        Your profile embedding has been regenerated. Match recommendations will reflect your updated profile.
                    </p>
                </div>
                <button
                    onClick={() => setState("idle")}
                    className="text-body-sm text-foreground-muted hover:text-foreground transition-colors underline underline-offset-4"
                >
                    Retake interview
                </button>
            </div>
        );
    }

    // error state
    return (
        <div
            className="rounded-lg border bg-background p-10 text-center space-y-4"
            style={{ borderColor: "var(--brand-red)", boxShadow: "var(--shadow-sm)" }}
        >
            <p className="text-label" style={{ color: "var(--brand-red)" }}>Synthesis incomplete</p>
            <p className="text-body-sm text-foreground-muted">{errorMsg}</p>
            <button
                onClick={() => setState("idle")}
                className="inline-flex items-center h-9 rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
            >
                Try again
            </button>
        </div>
    );
}
