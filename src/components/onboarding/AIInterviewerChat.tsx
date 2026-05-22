"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { Send, Bot } from "lucide-react";

interface AIInterviewerProps {
    readonly onComplete: (summary: string) => void;
}

function getMessageText(message: { parts?: Array<{ type: string; text?: string }>; content?: string }): string {
    if (message.parts) {
        return message.parts
            .filter((p) => p.type === "text" && p.text)
            .map((p) => p.text!)
            .join("");
    }
    return typeof message.content === "string" ? message.content : "";
}

export default function AIInterviewer({ onComplete }: AIInterviewerProps) {
    const [inputValue, setInputValue] = useState("");
    const { messages, sendMessage, status } = useChat();
    const scrollRef = useRef<HTMLDivElement>(null);
    const isLoading = status === "streaming" || status === "submitted";

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
        }
    }, [messages]);

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

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        sendMessage({ parts: [{ type: "text" as const, text: inputValue.trim() }] });
        setInputValue("");
    };

    return (
        <div
            className="flex flex-col h-[500px] rounded-lg border border-border bg-background overflow-hidden"
            style={{ boxShadow: "var(--shadow-sm)" }}
        >
            {/* Header */}
            <div
                className="p-4 border-b border-border flex items-center justify-between"
                style={{ background: "var(--surface-1)" }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 flex items-center justify-center rounded-md"
                        style={{ background: "var(--brand-red)", color: "var(--brand-red-fg)" }}
                    >
                        <Bot size={18} />
                    </div>
                    <div>
                        <h3 className="text-label text-foreground">Amani AI</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--brand-green)" }} />
                            <span className="text-eyebrow text-foreground-muted">Agentic onboarding active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="text-center py-10 text-foreground-subtle">
                        <p className="text-eyebrow">Say &ldquo;hello&rdquo; to start your interview</p>
                    </div>
                )}
                {messages.map((m) => {
                    const text = getMessageText(m);
                    const isUser = m.role === "user";
                    return (
                        <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                            <div
                                className="max-w-[85%] p-4 rounded-md"
                                style={
                                    isUser
                                        ? { background: "var(--brand-red)", color: "var(--brand-red-fg)" }
                                        : { background: "var(--surface-1)", border: "1px solid var(--border)", color: "var(--foreground)" }
                                }
                            >
                                <p className="text-body-sm leading-relaxed">
                                    {text.replace("COMPLETED_INTERVIEW", "")}
                                </p>
                                <span className="block mt-2 opacity-60 text-eyebrow text-right">
                                    {isUser ? "You" : "Amani AI"}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {isLoading && (
                    <div className="flex justify-start">
                        <div
                            className="px-4 py-2 rounded-md border border-border flex gap-1"
                            style={{ background: "var(--surface-1)" }}
                        >
                            <div className="w-1 h-1 rounded-full animate-bounce" style={{ background: "var(--brand-red)" }} />
                            <div className="w-1 h-1 rounded-full animate-bounce [animation-delay:0.2s]" style={{ background: "var(--brand-red)" }} />
                            <div className="w-1 h-1 rounded-full animate-bounce [animation-delay:0.4s]" style={{ background: "var(--brand-red)" }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form
                onSubmit={handleFormSubmit}
                className="p-4 border-t border-border flex gap-3"
                style={{ background: "var(--surface-1)" }}
            >
                <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your response…"
                    className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-body-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-[color:var(--border-strong,#D4D4D8)] focus:ring-2 focus:ring-[color:var(--brand-green-soft)] transition-all"
                />
                <button
                    type="submit"
                    className="h-10 px-5 rounded-md flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--brand-red)", color: "var(--brand-red-fg)" }}
                    disabled={isLoading || !inputValue.trim()}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
