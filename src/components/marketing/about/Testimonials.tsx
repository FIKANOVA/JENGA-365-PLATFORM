"use client";

import { motion } from "framer-motion";
import { useSession } from "@/lib/auth/client";

const testimonials = [
    {
        quote: "Jenga365 didn't just give me a place to play; they gave me a roadmap for my entire future.",
        name: "David Omondi",
        role: "PRO ATHLETE / SCHOLARSHIP RECIPIENT",
        cardClass: "jenga-card-mentorship"
    },
    {
        quote: "Seeing the economic shift in our village since the hub opened has been nothing short of a miracle.",
        name: "Sarah Wanjiku",
        role: "COMMUNITY PARTNER",
        cardClass: "jenga-card-featured"
    },
];

export default function Testimonials() {
    return (
        <section className="py-40 bg-accent relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center gap-4">
                            <span className="h-px w-8 bg-primary" />
                            <span className="section-label">Success Parameters</span>
                        </div>
                        <h2 className="font-serif font-bold text-6xl md:text-7xl text-foreground uppercase leading-[0.9] tracking-tighter">
                            Community <br /><span className="italic text-primary">Voices.</span>
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                    {testimonials.map((t, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className={`jenga-card ${t.cardClass} bg-background p-12 md:p-20 relative flex flex-col justify-between min-h-[450px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:border-r hover:border-r-secondary transition-all duration-500 group`}
                        >
                            <div className="relative">
                                {/* Large Quote Mark mark */}
                                <span className="absolute -top-12 -left-6 font-serif text-8xl text-foreground opacity-[0.05]">"</span>
                                
                                <blockquote className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl text-foreground italic tracking-tighter leading-[1.1] relative z-10 group-hover:text-primary transition-all duration-500">
                                    "{t.quote}"
                                </blockquote>
                            </div>

                            <div className="flex items-center gap-6 mt-20 pt-10 border-t border-border">
                                <div className="w-16 h-16 bg-muted rounded-full shrink-0 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.05] to-transparent" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-serif font-bold text-xl text-foreground uppercase tracking-tight">{t.name}</h4>
                                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
