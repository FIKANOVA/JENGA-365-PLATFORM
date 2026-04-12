"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { Send, Bot } from "lucide-react";

interface AIInterviewerProps {
    readonly onComplete: (summary: string) => void;
}

/** Extract text content from a UIMessage v3 (parts-based). */
function getMessageText(message: { parts?: Array<{ type: string; text?: string }>; content?: string }): string {
    if (message.parts) {
        return message.parts
            .filter((p) => p.type === "text" && p.text)
            .map((p) => p.text!)
            .join("");
    }
    // Fallback for older format
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

    // Check for interview completion on message changes
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
        <div className="flex flex-col h-[500px] bg-white border border-[#E8E4DC] overflow-hidden" style={{ borderRadius: 2 }}>
            {/* Header */}
            <div className="p-4 border-b border-[#E8E4DC] bg-[#F7F5F0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#BB0000] flex items-center justify-center text-white" style={{ borderRadius: 2 }}>
                        <Bot size={18} />
                    </div>
                    <div>
                        <h3 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: 14 }}>Amani AI</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#006600]" />
                            <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 9, color: "#8A8A8A" }}>AGENTIC ONBOARDING ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: 11 }}>SAY &quot;HELLO&quot; TO START YOUR INTERVIEW</p>
                    </div>
                )}
                {messages.map((m) => {
                    const text = getMessageText(m);
                    return (
                        <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] p-4 ${m.role === "user" ? "bg-[#BB0000] text-white" : "bg-[#F5F5F5] text-[#1A1A1A] border border-[#E8E4DC]"}`} style={{ borderRadius: 2 }}>
                                <p className="text-sm leading-relaxed" style={{ fontFamily: m.role === "user" ? "var(--font-dm-mono)" : "var(--font-lato)" }}>
                                    {text.replace("COMPLETED_INTERVIEW", "")}
                                </p>
                                <span className="block mt-2 opacity-50 text-[8px] uppercase tracking-widest text-right" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                    {m.role === "user" ? "YOU" : "AMANI AI"}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-4 py-2 bg-[#F5F5F5] border border-[#E8E4DC] flex gap-1" style={{ borderRadius: 2 }}>
                            <div className="w-1 h-1 bg-[#BB0000] animate-bounce" />
                            <div className="w-1 h-1 bg-[#BB0000] animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1 h-1 bg-[#BB0000] animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleFormSubmit} className="p-4 bg-[#F7F5F0] border-t border-[#E8E4DC] flex gap-3">
                <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1 bg-white border border-[#E8E4DC] px-4 py-3 outline-none focus:border-[#BB0000] transition-colors"
                    style={{ borderRadius: 2, fontFamily: "var(--font-lato)", fontSize: 14 }}
                />
                <button
                    type="submit"
                    className="bg-[#BB0000] text-white px-5 flex items-center justify-center hover:opacity-90 disabled:opacity-50"
                    style={{ borderRadius: 2 }}
                    disabled={isLoading || !inputValue.trim()}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
