"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CheckCircle, Sparkles, Eye, PenSquare, BrainCircuit, ExternalLink, ShieldCheck } from "lucide-react";
import AIInterviewer from "@/components/onboarding/AIInterviewerChat";
import RenderedProfileView from "@/components/profile/RenderedProfileView";
import { triggerAiProfileSynthesis } from "@/lib/actions/matching";
import { PublicProfile } from "@/lib/db/queries/users";
import { ROLE_ACCENT } from "@/components/dashboard/shared/BentoCard";

type State = "idle" | "interviewing" | "synthesizing" | "done" | "error";
type ActiveTab = "interview" | "preview";

interface AIProfileClientProps {
    profile: PublicProfile | null;
    userId: string;
}

export default function AIProfileClient({ profile, userId }: AIProfileClientProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>("interview");
    const [state, setState] = useState<State>("idle");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleComplete = useCallback(async (summary: string) => {
        setState("synthesizing");
        try {
            await triggerAiProfileSynthesis();
            setState("done");
        } catch (e: unknown) {
            console.error("[AIProfile] Synthesis failed:", e);
            setErrorMsg(e instanceof Error ? e.message : "Profile synthesis failed. Your interview was saved.");
            setState("error");
        }
    }, []);

    const roleColor = profile ? (ROLE_ACCENT[profile.role] || "var(--brand-green)") : "var(--brand-green)";

    return (
        <div className="space-y-6">
            {/* Top Profile Summary & View Rendered Profile CTA */}
            {profile && (
                <div
                    className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4 min-w-0">
                        <div
                            className="w-14 h-14 rounded-xl overflow-hidden border-2 border-border bg-surface-2 flex items-center justify-center font-bold text-lg text-foreground-muted shrink-0"
                        >
                            {profile.image ? (
                                <img
                                    src={profile.image}
                                    alt={profile.name || "Avatar"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{(profile.name || "U")[0].toUpperCase()}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-headline text-foreground font-semibold truncate">
                                    {profile.name || "Community Member"}
                                </h2>
                                <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold"
                                    style={{
                                        backgroundColor: `${roleColor}1a`,
                                        color: roleColor,
                                    }}
                                >
                                    <ShieldCheck className="w-3 h-3" />
                                    {profile.role}
                                </span>
                            </div>
                            <p className="text-body-sm text-foreground-muted truncate">
                                {profile.profession}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                        <Link
                            href={`/profile/${userId}`}
                            target="_blank"
                            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-xs flex-1 sm:flex-initial"
                            style={{ background: "var(--brand-green)" }}
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Rendered Profile</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                        </Link>
                        <Link
                            href="/dashboard/settings"
                            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-md text-xs font-semibold border border-border bg-background hover:bg-[color:var(--surface-2)] text-foreground transition-colors"
                        >
                            <PenSquare className="w-3.5 h-3.5 text-foreground-muted" />
                            <span>Edit</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-border gap-2">
                <button
                    type="button"
                    onClick={() => setActiveTab("interview")}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === "interview"
                            ? "border-[var(--brand-green)] text-[var(--brand-green)]"
                            : "border-transparent text-foreground-muted hover:text-foreground"
                    }`}
                >
                    <BrainCircuit className="w-4 h-4" />
                    AI Profile Interview
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === "preview"
                            ? "border-[var(--brand-green)] text-[var(--brand-green)]"
                            : "border-transparent text-foreground-muted hover:text-foreground"
                    }`}
                >
                    <Eye className="w-4 h-4" />
                    Rendered Profile Preview
                </button>
            </div>

            {/* Tab 1: AI Interview */}
            {activeTab === "interview" && (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-display-md text-foreground mb-1">AI profile interview</h1>
                        <p className="text-body-sm text-foreground-muted">
                            Chat with Amani AI to refine your profile. A stronger profile improves your match quality.
                            This is optional — you have full platform access regardless.
                        </p>
                    </div>

                    <div
                        className="rounded-md border border-border bg-background p-5 space-y-2"
                        style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                        <p className="text-eyebrow text-foreground-muted uppercase tracking-wider font-semibold">What happens</p>
                        <ul className="text-body-sm text-foreground space-y-1 list-disc list-inside">
                            <li>Amani guides you through a short 5-phase structured conversation</li>
                            <li>Your responses generate an updated profile embedding stored securely</li>
                            <li>The embedding dynamically surfaces higher-quality mentor/mentee matches</li>
                            <li>You can retake the interview whenever your goals or experience evolve</li>
                        </ul>
                    </div>

                    {state === "idle" && (
                        <div
                            className="rounded-md border border-border bg-background p-10 text-center space-y-6"
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
                    )}

                    {state === "interviewing" && (
                        <AIInterviewer onComplete={handleComplete} />
                    )}

                    {state === "synthesizing" && (
                        <div
                            className="rounded-md border border-border bg-background p-10 text-center space-y-4"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--brand-green)" }} />
                                <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]" style={{ background: "var(--brand-green)" }} />
                                <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s]" style={{ background: "var(--brand-green)" }} />
                            </div>
                            <p className="text-label text-foreground-muted">Synthesizing your profile…</p>
                        </div>
                    )}

                    {state === "done" && (
                        <div
                            className="rounded-md border border-border bg-background p-10 text-center space-y-6"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <CheckCircle className="w-14 h-14 mx-auto" style={{ color: "var(--brand-green)" }} />
                            <div>
                                <h2 className="text-display-sm text-foreground mb-2">Profile updated</h2>
                                <p className="text-body-sm text-foreground-muted">
                                    Your profile embedding has been regenerated. Match recommendations will reflect your updated profile.
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setState("idle")}
                                    className="text-body-sm text-foreground-muted hover:text-foreground transition-colors underline underline-offset-4"
                                >
                                    Retake interview
                                </button>
                                <button
                                    onClick={() => setActiveTab("preview")}
                                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-semibold text-white"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    View Rendered Profile
                                </button>
                            </div>
                        </div>
                    )}

                    {state === "error" && (
                        <div
                            className="rounded-md border bg-background p-10 text-center space-y-4"
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
                    )}
                </div>
            )}

            {/* Tab 2: Rendered Profile Live Preview */}
            {activeTab === "preview" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-headline text-foreground font-semibold">Rendered Profile Preview</h2>
                            <p className="text-body-sm text-foreground-muted">
                                This is exactly how your profile card and page appear across Jenga365 to other members.
                            </p>
                        </div>
                        <Link
                            href={`/profile/${userId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                            style={{ color: "var(--brand-green)" }}
                        >
                            Open full page <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {profile ? (
                        <RenderedProfileView profile={profile} isOwner={true} backHref="/dashboard/profile" backLabel="Back to Interview" />
                    ) : (
                        <div className="p-8 text-center text-foreground-muted border border-dashed rounded-xl">
                            Loading profile details...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
