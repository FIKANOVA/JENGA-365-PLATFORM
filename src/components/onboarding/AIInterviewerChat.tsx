"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import {
    Send,
    Bot,
    Sparkles,
    RefreshCw,
    AlertCircle,
    Compass,
    Target,
    Zap,
    Users,
    ChevronRight,
    MessageSquare,
    UserCircle2,
    CheckCircle2,
} from "lucide-react";

interface AIInterviewerProps {
    readonly onComplete: (summary: string) => void;
    readonly role?: string;
    readonly userName?: string;
}

function getMessageText(message: { parts?: Array<{ type: string; text?: string }>; content?: string }): string {
    if (message.parts && Array.isArray(message.parts)) {
        return message.parts
            .filter((p) => p.type === "text" && p.text)
            .map((p) => p.text!)
            .join("");
    }
    return typeof message.content === "string" ? message.content : "";
}

const PHASES = [
    { id: 1, label: "Intro" },
    { id: 2, label: "Goals" },
    { id: 3, label: "Challenges" },
    { id: 4, label: "Style" },
    { id: 5, label: "Synthesis" },
];

export default function AIInterviewer({ onComplete, role = "Mentee", userName }: AIInterviewerProps) {
    const [inputValue, setInputValue] = useState("");
    const { messages, sendMessage, status, error, regenerate, setMessages } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
    });
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isLoading = status === "streaming" || status === "submitted";

    // Approximate interview phase based on conversation message count
    const assistantCount = messages.filter((m) => m.role === "assistant").length;
    const currentPhase = Math.min(5, Math.max(1, Math.ceil(assistantCount || 1)));

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, isLoading]);

    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === "assistant") {
                const text = getMessageText(lastMsg);
                if (text.includes("COMPLETED_INTERVIEW")) {
                    onComplete(text);
                }
            }
        }
    }, [messages, onComplete]);

    const handleFormSubmit = (e?: FormEvent) => {
        if (e) e.preventDefault();
        const text = inputValue.trim();
        if (!text || isLoading) return;
        sendMessage({ text });
        setInputValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleFormSubmit();
        }
    };

    const handleQuickAction = (starterPrompt: string) => {
        if (isLoading) return;
        sendMessage({ text: starterPrompt });
    };

    const handleRestart = () => {
        if (isLoading) return;
        if (confirm("Are you sure you want to restart the interview? Your current conversation will be cleared.")) {
            setMessages([]);
            setInputValue("");
        }
    };

    // Contextual starter cards based on role
    const isMentor = role === "Mentor";
    const starterCards = isMentor
        ? [
              {
                  icon: Sparkles,
                  title: "Start Mentor Profile Interview",
                  description: "Introduce your expertise, industry background, and ideal mentee profile.",
                  prompt: `Hello Jenga AI! I am ${userName || "a mentor"} ready to start my mentor onboarding interview. I want to share my background and mentorship goals.`,
                  badge: "Recommended",
                  accent: "var(--brand-green)",
              },
              {
                  icon: Target,
                  title: "Focus on Leadership & Areas of Expertise",
                  description: "Share the specific problems and career challenges you want to help young talent navigate.",
                  prompt: "Hi Jenga AI! I'd like to focus on my leadership experience and the technical/business areas where I can provide high-impact mentorship.",
                  badge: "Expertise",
                  accent: "var(--brand-red)",
              },
              {
                  icon: Users,
                  title: "Mentorship Style & Availability",
                  description: "Specify how you prefer to work with mentees (1-on-1, async, structured milestones).",
                  prompt: "Hello Jenga AI, I want to set up my mentorship style and communication preferences for prospective mentees.",
                  badge: "Preferences",
                  accent: "#0284c7",
              },
          ]
        : [
              {
                  icon: Sparkles,
                  title: "Start Comprehensive Profile Intake",
                  description: "Full guided 5-phase interview to uncover your aspirations, goals, and matching profile.",
                  prompt: `Hello Jenga AI! I am ${userName || "a mentee"} ready to start my profile interview. Let's build my profile together.`,
                  badge: "Recommended",
                  accent: "var(--brand-green)",
              },
              {
                  icon: Target,
                  title: "Career & Study Aspirations",
                  description: "Tell Jenga AI where you want to be in 3–5 years and the industries you're passionate about.",
                  prompt: "Hi Jenga AI, I'm looking for structured mentorship to accelerate my career and academic goals. Let's discuss my 3-year vision.",
                  badge: "Aspirations",
                  accent: "var(--brand-red)",
              },
              {
                  icon: Compass,
                  title: "Solve Current Challenges",
                  description: "Focus on specific hurdles you're facing right now and find mentors with direct solutions.",
                  prompt: "Hello Jenga AI! I have specific career and skill roadblocks I need help overcoming. Can we focus on finding the right mentor for my challenges?",
                  badge: "Focused",
                  accent: "#0284c7",
              },
          ];

    // Quick reply chips based on current phase
    const getQuickReplies = () => {
        if (isLoading || messages.length === 0) return [];
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role !== "assistant") return [];
        const text = getMessageText(lastMsg).toLowerCase();

        if (text.includes("sound like an accurate") || text.includes("accurate picture") || text.includes("confirm")) {
            return [
                "Yes, that summary is 100% accurate!",
                "Looks great! Please finalize my profile.",
                "Let me clarify a small detail first.",
            ];
        }
        if (text.includes("learning style") || text.includes("structured") || text.includes("exploratory")) {
            return [
                "I prefer structured learning with clear frameworks and milestones.",
                "I am self-directed and learn best through real-world projects and trial-and-error.",
                "A hybrid approach works best for me.",
            ];
        }
        if (text.includes("one-on-one") || text.includes("group")) {
            return [
                "I prefer focused 1-on-1 mentorship sessions.",
                "I thrive in collaborative group settings and cohort clinics.",
                "Both formats work well for me.",
            ];
        }
        return [];
    };

    const quickReplies = getQuickReplies();

    return (
        <div
            className="flex flex-col h-[600px] rounded-2xl border border-border bg-card overflow-hidden shadow-lg"
            style={{ boxShadow: "var(--shadow-md)" }}
        >
            {/* Header with Glassmorphism, Status, & Phase Stepper */}
            <div className="p-4 sm:px-6 border-b border-border bg-surface-1/90 backdrop-blur-md flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 flex items-center justify-center rounded-xl shadow-xs shrink-0"
                            style={{ background: "var(--brand-green)", color: "#ffffff" }}
                        >
                            <Bot size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-label font-bold text-foreground">Jenga AI</h3>
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[color:var(--brand-green-soft)] text-[var(--brand-green)] font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-green)] animate-pulse" />
                                    Online
                                </span>
                            </div>
                            <p className="text-eyebrow text-foreground-muted">
                                Guided Profile Synthesis &amp; AI Matching Specialist
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {messages.length > 0 && (
                            <button
                                type="button"
                                onClick={handleRestart}
                                disabled={isLoading}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-[color:var(--surface-2)] text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
                                title="Restart Interview"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Restart</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 5-Phase Interactive Progress Bar */}
                <div className="pt-1 flex items-center gap-1.5">
                    {PHASES.map((phase) => {
                        const isDone = phase.id < currentPhase;
                        const isCurrent = phase.id === currentPhase;
                        return (
                            <div key={phase.id} className="flex-1 flex flex-col gap-1">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        isDone
                                            ? "bg-[var(--brand-green)]"
                                            : isCurrent
                                            ? "bg-[var(--brand-green)] animate-pulse"
                                            : "bg-border"
                                    }`}
                                />
                                <span
                                    className={`text-[10px] truncate hidden sm:block ${
                                        isCurrent
                                            ? "text-[var(--brand-green)] font-semibold"
                                            : isDone
                                            ? "text-foreground-muted font-medium"
                                            : "text-foreground-subtle"
                                    }`}
                                >
                                    {phase.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Body & Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-background">
                {/* Getting Started Interactive Screen */}
                {messages.length === 0 && (
                    <div className="max-w-2xl mx-auto py-4 space-y-6">
                        <div className="text-center space-y-2">
                            <div
                                className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center shadow-xs"
                                style={{ background: "var(--brand-green-soft)", color: "var(--brand-green)" }}
                            >
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h4 className="text-display-xs text-foreground font-bold">
                                Ready to build your profile, {userName || "friend"}?
                            </h4>
                            <p className="text-body-sm text-foreground-muted max-w-md mx-auto">
                                Choose an option below to start your conversation with Jenga AI. We will generate your verified profile and match you with precision.
                            </p>
                        </div>

                        {/* Interactive Getting Started Action Cards */}
                        <div className="grid grid-cols-1 gap-3">
                            {starterCards.map((card, i) => {
                                const Icon = card.icon;
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleQuickAction(card.prompt)}
                                        disabled={isLoading}
                                        className="group relative flex items-start gap-4 p-4 rounded-xl border border-border bg-surface-1 hover:border-[var(--brand-green)] hover:bg-surface-2 text-left transition-all duration-200 shadow-xs hover:shadow-sm"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                                            style={{ backgroundColor: `${card.accent}15`, color: card.accent }}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-label font-bold text-foreground group-hover:text-[var(--brand-green)] transition-colors">
                                                    {card.title}
                                                </span>
                                                <span
                                                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                                    style={{ backgroundColor: `${card.accent}20`, color: card.accent }}
                                                >
                                                    {card.badge}
                                                </span>
                                            </div>
                                            <p className="text-body-sm text-foreground-muted leading-relaxed">
                                                {card.description}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-foreground-subtle group-hover:text-[var(--brand-green)] group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Message Stream */}
                {messages.map((m) => {
                    const text = getMessageText(m);
                    const isUser = m.role === "user";
                    const isCompleted = text.includes("COMPLETED_INTERVIEW");

                    return (
                        <div
                            key={m.id}
                            className={`flex gap-3 items-start ${
                                isUser ? "justify-end" : "justify-start"
                            } animate-fade-in`}
                        >
                            {!isUser && (
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-xs"
                                    style={{ background: "var(--brand-green)", color: "#ffffff" }}
                                >
                                    <Bot className="w-4 h-4" />
                                </div>
                            )}

                            <div className="max-w-[85%] sm:max-w-[78%] space-y-1.5">
                                <div
                                    className={`p-4 rounded-2xl text-body-sm leading-relaxed shadow-xs ${
                                        isUser
                                            ? "bg-[var(--brand-green)] text-white rounded-tr-none font-medium"
                                            : "bg-surface-1 text-foreground border border-border/80 rounded-tl-none"
                                    }`}
                                >
                                    <div className="whitespace-pre-wrap">
                                        {text.replace("COMPLETED_INTERVIEW", "").trim()}
                                    </div>

                                    {isCompleted && (
                                        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs font-semibold text-[var(--brand-green)]">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Interview Completed &amp; Profile Synthesized</span>
                                        </div>
                                    )}
                                </div>

                                <div
                                    className={`flex items-center gap-1.5 text-[10px] text-foreground-subtle px-1 ${
                                        isUser ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <span>{isUser ? "You" : "Jenga AI"}</span>
                                </div>
                            </div>

                            {isUser && (
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-xs bg-surface-2 text-foreground-muted border border-border"
                                >
                                    <UserCircle2 className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Animated Typing Indicator */}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start animate-fade-in">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                            style={{ background: "var(--brand-green)", color: "#ffffff" }}
                        >
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl rounded-tl-none border border-border bg-surface-1 flex items-center gap-2 shadow-xs">
                            <span className="text-xs font-medium text-foreground-muted">Jenga AI is typing</span>
                            <div className="flex gap-1">
                                <div
                                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                                    style={{ background: "var(--brand-green)" }}
                                />
                                <div
                                    className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s]"
                                    style={{ background: "var(--brand-green)" }}
                                />
                                <div
                                    className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s]"
                                    style={{ background: "var(--brand-green)" }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Connection issue: {error.message || "Failed to communicate with Jenga AI"}</span>
                        </div>
                        {regenerate && (
                            <button
                                type="button"
                                onClick={() => regenerate()}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors shrink-0 shadow-xs"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Retry</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Suggestions Strip during active conversation */}
            {quickReplies.length > 0 && !isLoading && (
                <div className="px-4 py-2 border-t border-border/70 bg-surface-1/70 flex items-center gap-2 overflow-x-auto">
                    <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Suggestions:
                    </span>
                    {quickReplies.map((reply, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleQuickAction(reply)}
                            className="text-xs px-3 py-1 rounded-full border border-border bg-background hover:bg-[color:var(--surface-2)] hover:border-[var(--brand-green)] text-foreground transition-colors shrink-0 truncate max-w-xs shadow-2xs"
                        >
                            {reply}
                        </button>
                    ))}
                </div>
            )}

            {/* Modern Input Bar */}
            <form
                onSubmit={handleFormSubmit}
                className="p-3 sm:p-4 border-t border-border bg-surface-1 flex items-center gap-2.5"
            >
                <div className="relative flex-1">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            messages.length === 0
                                ? "Click a starter card above or type a response…"
                                : "Type your response to Jenga AI (Enter to send, Shift+Enter for newline)…"
                        }
                        disabled={isLoading}
                        className="w-full resize-none py-2.5 pl-3.5 pr-10 rounded-xl border border-border bg-background text-body-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-[var(--brand-green)] focus:ring-2 focus:ring-[color:var(--brand-green-soft)] transition-all shadow-inner max-h-32"
                    />
                </div>

                <button
                    type="submit"
                    className="h-10 w-10 sm:w-auto sm:px-5 rounded-xl flex items-center justify-center gap-2 text-white font-semibold text-xs transition-all hover:opacity-90 disabled:opacity-40 shadow-xs shrink-0"
                    style={{ background: "var(--brand-green)" }}
                    disabled={isLoading || !inputValue.trim()}
                    aria-label="Send response to Jenga AI"
                >
                    <Send size={16} />
                    <span className="hidden sm:inline">Send</span>
                </button>
            </form>
        </div>
    );
}

