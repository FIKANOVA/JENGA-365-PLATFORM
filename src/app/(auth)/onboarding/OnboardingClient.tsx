"use client";

import AIInterviewerChat from "@/components/onboarding/AIInterviewerChat";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

type Step = { id: number; label: string; done: boolean; active?: boolean };

const STEPS: readonly Step[] = [
    { id: 1, label: "Identity & commitment", done: true },
    { id: 2, label: "NDA signed", done: true },
    { id: 3, label: "AI growth interview", done: false, active: true },
];

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
        <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
            <div className="mx-auto w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
                {/* Sidebar */}
                <aside className="md:col-span-1 py-6 md:py-12 space-y-8">
                    <div className="space-y-3">
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                            Phase 2 · Onboarding
                        </p>
                        <h1 className="text-display-sm text-foreground">
                            Build your impact profile
                        </h1>
                        <p className="text-body text-foreground-muted">
                            Jenga365 uses an agentic onboarding interview to understand your
                            goals more deeply than a standard form.
                        </p>
                    </div>

                    <ul className="space-y-3">
                        {STEPS.map((step) => {
                            const palette = step.done
                                ? {
                                      background: "var(--brand-green)",
                                      color: "var(--brand-green-fg)",
                                  }
                                : step.active
                                  ? {
                                        background: "var(--brand-green-soft)",
                                        color: "var(--brand-green)",
                                    }
                                  : {
                                        background: "var(--surface-2)",
                                        color: "var(--foreground-subtle)",
                                    };
                            return (
                                <li key={step.id} className="flex items-center gap-3">
                                    <span
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-label font-medium"
                                        style={palette}
                                    >
                                        {step.done ? (
                                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                        ) : (
                                            step.id
                                        )}
                                    </span>
                                    <span
                                        className={`text-body-sm ${
                                            step.active
                                                ? "font-medium text-foreground"
                                                : step.done
                                                  ? "text-foreground"
                                                  : "text-foreground-muted"
                                        }`}
                                    >
                                        {step.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </aside>

                {/* Main */}
                <main className="md:col-span-2">
                    {isFinishing ? (
                        <div
                            className="h-[500px] flex flex-col items-center justify-center rounded-md border border-border bg-background p-10 text-center"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <Loader2
                                className="h-10 w-10 animate-spin mb-5"
                                style={{ color: "var(--brand-green)" }}
                            />
                            <h2 className="text-headline text-foreground">
                                Finalizing your profile…
                            </h2>
                            <p className="mt-2 text-body-sm text-foreground-muted">
                                Amani AI is synthesizing your impact roadmap.
                            </p>
                        </div>
                    ) : (
                        <AIInterviewerChat onComplete={handleComplete} />
                    )}
                </main>
            </div>
        </div>
    );
}
