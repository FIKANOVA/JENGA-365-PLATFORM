"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface FaqItem {
    question: string;
    answer: string;
}

const DEFAULT_FAQ_ITEMS: FaqItem[] = [
    {
        question: "How do I register as a mentor or mentee?",
        answer: "Visit our registration page and select your role. Mentors go through a verification process including an AI interview, while mentees complete a matching questionnaire to find the right mentor.",
    },
    {
        question: "What is the AI-powered mentor matching process?",
        answer: "Our proprietary AI system analyzes career goals, personality traits, and skillset requirements to pair mentees with the most suitable mentors, ensuring optimal growth outcomes.",
    },
    {
        question: "How can my company become a corporate partner?",
        answer: "Corporate partnerships start with a simple inquiry through our Contact page. Our partnerships team will guide you through alignment assessment, NDA signing, and onboarding your team.",
    },
    {
        question: "Is there a cost to join Jenga365?",
        answer: "Mentee registration is free. Corporate partnerships and premium mentor features have structured pricing tiers. Contact us for a detailed breakdown.",
    },
    {
        question: "How does the rugby training integrate with mentorship?",
        answer: "Our 'Total Athlete' model uses rugby to teach discipline, teamwork, and resilience. These on-pitch sessions are paired with off-pitch career counseling and financial literacy programs.",
    },
];

interface FAQSectionProps {
    readonly items?: readonly FaqItem[] | null;
}

export default function FAQSection({ items }: FAQSectionProps) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const FAQ_ITEMS = items && items.length > 0 ? items : DEFAULT_FAQ_ITEMS;

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <section className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-6 md:px-12">
                <div className="text-center space-y-4 mb-16">
                    <span className="font-mono text-eyebrow tracking-[0.4em] text-[var(--brand-green)] block font-bold">
                        Common Questions
                    </span>
                    <h2 className="text-display-lg text-foreground">
                        Frequently asked <span className="italic" style={{ color: "var(--brand-green)" }}>questions.</span>
                    </h2>
                </div>

                <div className="space-y-4">
                    {FAQ_ITEMS.map((item, index) => (
                        <div
                            key={index}
                            className={`border transition-all duration-300 rounded-md ${
                                openFaq === index
                                    ? "border-[var(--brand-green)] bg-[var(--surface-1)]"
                                    : "border-border bg-white hover:border-foreground/20"
                            }`}
                        >
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
                            >
                                <span className="text-headline text-foreground pr-8 group-hover:text-[var(--brand-green)] transition-colors">
                                    {item.question}
                                </span>
                                <Plus
                                    className="h-4 w-4 shrink-0 transition-transform"
                                    style={{
                                        transform: openFaq === index ? "rotate(45deg)" : "rotate(0deg)",
                                        color: openFaq === index ? "var(--brand-red)" : "var(--foreground-muted)",
                                    }}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${
                                    openFaq === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                }`}
                            >
                                <div className="px-6 md:px-8 pb-8">
                                    <div className="h-px bg-[var(--border)] mb-6" />
                                    <p className="font-light text-[var(--foreground-muted)] leading-relaxed text-lg">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
