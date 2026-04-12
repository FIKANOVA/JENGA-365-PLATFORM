"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "assistant" | "user";
    content: string;
}

interface AIChatInterfaceProps {
    readonly initialMessage: string;
    readonly onComplete: (summary: string) => void;
    readonly agentName?: string;
    readonly agentRole?: string;
}

export default function AIChatInterface({
    initialMessage,
    onComplete,
    agentName = "Amani",
    agentRole = "AI ONBOARDING SPECIALIST"
}: AIChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "assistant", content: initialMessage }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Real integration would happen here via useChat or server action
        // Simulating AI response for the onboarding flow prototype
        setTimeout(() => {
            setIsTyping(false);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "That's very insightsful. How do you see yourself contributing to the community in the next 6 months?"
            };
            setMessages(prev => [...prev, aiMsg]);

            // Auto-complete simulation after 3 exchanges
            if (messages.length >= 4) {
                setTimeout(() => onComplete("Interview completed successfully"), 1500);
            }
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[600px] max-w-4xl mx-auto bg-white border border-[#E8E4DC] rounded-sm shadow-xl overflow-hidden">
            {/* Agent Header */}
            <div className="bg-[#FBFBF9] border-b border-[#E8E4DC] p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative size-12 bg-[#BB0000] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#BB0000]/20">
                        <span className="material-symbols-outlined text-[28px]">smart_toy</span>
                        <div className="absolute -bottom-1 -right-1 size-4 bg-[#006600] rounded-full border-2 border-white" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-serif font-black text-lg text-[#1A1A1A] leading-none mb-1">{agentName}</h3>
                        <span className="font-mono text-[9px] font-bold text-[#8A8A8A] tracking-widest uppercase">{agentRole}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="size-2 bg-[#006600] rounded-full animate-pulse" />
                    <span className="font-mono text-[10px] text-[#4A4A4A] font-bold tracking-tighter uppercase">Live Session</span>
                </div>
            </div>

            {/* Chat Body */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
            >
                <AnimatePresence initial={false}>
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`relative max-w-[80%] p-5 rounded shadow-sm ${m.role === "user"
                                    ? "bg-[#BB0000] text-white rounded-br-none"
                                    : "bg-[#F5F5F3] text-[#1A1A1A] border border-[#E8E4DC] rounded-bl-none"
                                }`}>
                                <p className={`text-base leading-relaxed ${m.role === "user" ? "font-mono font-medium" : "font-body"}`}>
                                    {m.content}
                                </p>
                                <span className={`absolute -bottom-6 font-mono text-[9px] font-bold uppercase tracking-widest ${m.role === "user" ? "right-0 text-[#BB0000]" : "left-0 text-[#8A8A8A]"
                                    }`}>
                                    {m.role === "user" ? "CONFIRMED" : agentName.toUpperCase()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-[#F5F5F3] border border-[#E8E4DC] p-4 rounded-sm flex gap-1.5 items-center">
                            <div className="size-1.5 bg-[#BB0000] rounded-full animate-bounce [animation-duration:0.6s]" />
                            <div className="size-1.5 bg-[#BB0000] rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]" />
                            <div className="size-1.5 bg-[#BB0000] rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]" />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-6 bg-[#FBFBF9] border-t border-[#E8E4DC] flex gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response here..."
                    className="flex-1 bg-white border border-[#E8E4DC] px-6 py-4 rounded-sm text-lg font-body focus:outline-none focus:border-[#BB0000] focus:ring-1 focus:ring-[#BB0000] transition-all shadow-inner"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="bg-[#BB0000] text-white px-8 h-14 rounded-sm flex items-center justify-center hover:bg-[#8B0000] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-[#BB0000]/20"
                >
                    <span className="material-symbols-outlined text-[24px]">send</span>
                </button>
            </form>
        </div>
    );
}
