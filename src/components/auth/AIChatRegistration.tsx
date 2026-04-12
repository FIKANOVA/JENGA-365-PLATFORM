"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
    id: string;
    role: "assistant" | "user";
    content: string;
    timestamp: Date;
}

interface AIChatRegistrationProps {
    onComplete: (data: any) => void;
    onUpdateData: (data: Partial<any>) => void;
    roleName: string;
}

export default function AIChatRegistration({ onComplete, onUpdateData, roleName }: AIChatRegistrationProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: `Initialize Mentee Protocol. I am Jenga Intelligence. I will guide your integration into the ${roleName} pathway. State your full legal name to begin.`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const steps = [
        { field: "name", question: "Understood. Now, what is your current professional or academic level? (e.g. Student, Early Professional, Founder)" },
        { field: "goal", question: "Scanning objectives... What is your primary growth goal for the next 12 months?" },
        { field: "email", question: "Finalizing data node. Enter your secure email address for protocol verification." },
        { field: "done", question: "Identity verified. I am ready to hand over to the Commitment Interface. Proceed?" }
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setIsTyping(true);

        // Update parent data based on step
        if (currentStep === 0) {
             const names = currentInput.split(" ");
             onUpdateData({ firstName: names[0] || "", lastName: names.slice(1).join(" ") || "" });
        } else if (currentStep === 1) {
            onUpdateData({ currentLevel: currentInput });
        } else if (currentStep === 2) {
            onUpdateData({ educationGoal: currentInput });
        } else if (currentStep === 3) {
            onUpdateData({ email: currentInput });
        }

        // Simulate AI thinking
        setTimeout(() => {
            setIsTyping(false);
            if (currentStep < steps.length) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: steps[currentStep].question,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
                setCurrentStep(prev => prev + 1);
                
                if (steps[currentStep].field === 'done') {
                    // Chat ends after a brief delay
                }
            } else {
                onComplete({});
            }
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[500px] border border-black/5 bg-white relative overflow-hidden group">
            {/* Header */}
            <div className="p-4 border-b border-black/5 bg-[var(--off-white)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 bg-black flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--green)] border-2 border-white rounded-full" />
                    </div>
                    <div>
                        <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-black">Jenga Intelligence</p>
                        <p className="font-mono text-[7px] uppercase tracking-widest text-[var(--green)]">Processing Node: Active</p>
                    </div>
                </div>
                <Sparkles size={14} className="text-black/10" />
            </div>

            {/* Messages */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-none"
            >
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`p-4 ${
                                    msg.role === 'user' 
                                    ? 'bg-black text-white' 
                                    : 'bg-[var(--off-white)] text-black'
                                } border border-black/5`}>
                                    <p className="font-mono text-[11px] leading-relaxed tracking-tight">{msg.content}</p>
                                </div>
                                <p className="font-mono text-[7px] text-black/20 uppercase tracking-widest">
                                    {msg.role === 'user' ? 'User' : 'Jenga AI'} — {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                             <div className="bg-[var(--off-white)] p-4 border border-black/5">
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-black/20 animate-bounce" />
                                    <div className="w-1 h-1 bg-black/20 animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1 h-1 bg-black/20 animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-black/5">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={currentStep < steps.length ? "TYPE YOUR RESPONSE..." : "PROTOCOL COMPLETE"}
                        className="flex-1 bg-[var(--off-white)] border-b border-black/10 px-4 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black transition-all"
                        disabled={isTyping || currentStep >= steps.length + 1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isTyping || !input.trim() || currentStep >= steps.length + 1}
                        className="w-12 h-12 bg-black text-white flex items-center justify-center hover:bg-[var(--red)] transition-all disabled:opacity-20"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            {/* Action Bar when done */}
            {currentStep >= steps.length && !isTyping && (
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center space-y-8 z-20"
                >
                    <div className="w-16 h-16 bg-[var(--green)] flex items-center justify-center">
                        <Sparkles size={32} className="text-white" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-serif font-bold text-3xl text-white uppercase tracking-tighter">Protocol Finalized</h4>
                        <p className="font-mono text-[9px] text-white/50 uppercase tracking-[0.4em]">All identity nodes captured and verified.</p>
                    </div>
                    <button
                        onClick={() => onComplete({})}
                        className="px-12 py-5 bg-white text-black font-mono font-bold text-[10px] uppercase tracking-[0.4em] hover:bg-black hover:text-white border border-transparent hover:border-[var(--red)] transition-all shadow-2xl"
                    >
                        Initialize Commitment →
                    </button>
                </motion.div>
            )}
        </div>
    );
}
