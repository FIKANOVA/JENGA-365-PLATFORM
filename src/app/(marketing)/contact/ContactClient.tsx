"use client";

import { useState } from "react";
import { MapPin, Mail, Clock, Globe, AtSign, Camera, Plus, Send, MailCheck } from "lucide-react";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";
import PageHero from "@/components/shared/PageHero";
import { toast } from "sonner";
import Turnstile from "@/components/shared/Turnstile";

export interface FaqItem {
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
        answer: "Corporate partnerships start with a simple inquiry through this form. Our partnerships team will guide you through alignment assessment, NDA signing, and onboarding your team.",
    },
    {
        question: "Is there a cost to join Jenga365?",
        answer: "Mentee registration is free. Corporate partnerships and premium mentor features have structured pricing tiers. Contact us for a detailed breakdown.",
    },
    {
        question: "What regions does Jenga365 currently operate in?",
        answer: "We are currently active across Kenya with hubs in Nairobi, Mombasa, and Kisumu. We are scaling to other East African markets in 2026.",
    },
];

const SUBJECT_OPTIONS = [
    "General Inquiry",
    "Partnership",
    "Mentorship",
    "Corporate",
    "Media & Press",
];

interface ContactClientProps {
    faqItems?: FaqItem[];
}

export default function ContactClient({ faqItems = [] }: ContactClientProps) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: "",
    });
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const displayFaqs = faqItems && faqItems.length > 0 ? faqItems : DEFAULT_FAQ_ITEMS;

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }
        if (!turnstileToken) {
            toast.error("Please complete the spam check before sending your message.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    turnstileToken,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Unknown error");
            setSubmitted(true);
            toast.success("Message sent! We'll get back to you shortly.");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to send message. Please try again.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen bg-background">
            <main>
                <PageHero
                    eyebrow="Get in touch"
                    heading={<>Connect with us.</>}
                    description="Have questions about our mentorship programs, corporate partnerships, or rugby development initiatives? We're here to help you build the future."
                />

                <section className="py-12 md:py-20 lg:py-12 md:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                            {/* Left: contact info */}
                            <div className="space-y-12">
                                <div className="space-y-3">
                                    <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Reach out</p>
                                    <h2 className="text-display-md text-foreground">Let&apos;s start a conversation.</h2>
                                    <p className="text-body-lg text-foreground-muted max-w-md">
                                        Whether you&apos;re a corporate partner looking to fund impact, a prospective mentor, or a youth seeking growth, our doors are open.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <ContactItem
                                        Icon={MapPin}
                                        label="Headquarters"
                                        lines={["Nairobi Mentorship Hub", "Westlands, Nairobi, Kenya"]}
                                    />
                                    <div className="h-px bg-border" />
                                    <ContactItem
                                        Icon={Mail}
                                        label="General inquiries"
                                        links={[
                                            { label: "hello@jenga365.org", href: "mailto:hello@jenga365.org" },
                                            { label: "+254 (0) 700 365 365", href: "tel:+254700365365" },
                                        ]}
                                    />
                                    <div className="h-px bg-border" />
                                    <ContactItem
                                        Icon={Clock}
                                        label="Office hours"
                                        lines={["Monday-Friday", "8:00 AM-6:00 PM EAT"]}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <p className="text-eyebrow text-foreground-muted">Follow us</p>
                                    <div className="flex items-center gap-2">
                                        {[
                                            { Icon: Globe,  label: "Website",   href: "/" },
                                            { Icon: AtSign, label: "Twitter/X", href: "/" },
                                            { Icon: Camera, label: "Instagram", href: "/" },
                                        ].map(({ Icon, label, href }) => (
                                            <a
                                                key={label}
                                                href={href}
                                                aria-label={label}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-foreground-muted transition-colors hover:text-foreground hover:bg-[color:var(--surface-2)]"
                                            >
                                                <Icon className="h-4 w-4" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: form */}
                            <div
                                className="rounded-md border border-border bg-background p-6 lg:p-8 self-start"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                <div className="space-y-2 mb-6">
                                    <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Send a message</p>
                                    <h3 className="text-headline text-foreground">We&apos;ll get back to you.</h3>
                                </div>

                                {submitted ? (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                                        <MailCheck className="h-10 w-10" style={{ color: "var(--brand-green)" }} />
                                        <div className="space-y-1">
                                            <h3 className="text-headline text-foreground">Message sent</h3>
                                            <p className="text-body-sm text-foreground-muted">
                                                We&apos;ve received your message and will respond within 1-2 business days.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "General Inquiry", message: "" }); }}
                                            className="text-label font-medium transition-colors"
                                            style={{ color: "var(--brand-green)" }}
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <form className="space-y-4" onSubmit={handleSubmit}>
                                        <Field label="Full name">
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Enter your full name"
                                            />
                                        </Field>
                                        <Field label="Email address">
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="your@email.com"
                                            />
                                        </Field>
                                        <Field label="Subject">
                                            <select
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground transition-colors focus:border-[color:var(--brand-green)] focus:outline-none"
                                            >
                                                {SUBJECT_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field label="Message">
                                            <textarea
                                                rows={5}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="How can we help?"
                                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-body-sm text-foreground transition-colors focus:border-[color:var(--brand-green)] focus:outline-none resize-none"
                                            />
                                        </Field>
                                        <div className="py-1 flex justify-center">
                                            <Turnstile
                                                action="contact"
                                                onSuccess={(token) => setTurnstileToken(token)}
                                                onError={() => setTurnstileToken(null)}
                                                onExpire={() => setTurnstileToken(null)}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !turnstileToken}
                                            className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                                            style={{ background: "var(--brand-green)" }}
                                        >
                                            {isSubmitting ? "Sending…" : <>Send message <Send className="h-4 w-4" /></>}
                                        </button>
                                    </form>

                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 md:py-20 lg:py-12 md:py-24 border-y border-border" style={{ background: "var(--surface-1)" }}>
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-8">
                        <div className="space-y-2">
                            <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Our location</p>
                            <h2 className="text-display-sm text-foreground">Nairobi Mentorship Hub</h2>
                        </div>
                        <div className="aspect-[21/9] rounded-md border border-border overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.17022526987!2d36.80277!3d-1.26389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173c0a1f9de7%3A0xad2c84df45a4e52c!2sWestlands%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Jenga365 Nairobi Mentorship Hub Location"
                            />
                        </div>
                    </div>
                </section>

                <section className="py-12 md:py-20 lg:py-12 md:py-24">
                    <div className="mx-auto max-w-3xl px-6 lg:px-8">
                        <div className="text-center space-y-3 mb-10">
                            <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Common questions</p>
                            <h2 className="text-display-md text-foreground">Frequently asked.</h2>
                        </div>

                        <div className="space-y-3">
                            {displayFaqs.map((item, index) => {
                                const open = openFaq === index;
                                return (
                                    <div
                                        key={index}
                                        className="rounded-md border border-border bg-background overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleFaq(index)}
                                            className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-[color:var(--surface-1)]"
                                        >
                                            <span className="text-body font-medium text-foreground pr-6">{item.question}</span>
                                            <Plus
                                                className="h-4 w-4 shrink-0 transition-transform"
                                                style={{
                                                    transform: open ? "rotate(45deg)" : "rotate(0deg)",
                                                    color: open ? "var(--brand-red)" : "var(--foreground-muted)",
                                                }}
                                            />
                                        </button>
                                        {open && (
                                            <div className="px-5 pb-5">
                                                <div className="h-px bg-border mb-4" />
                                                <p className="text-body-sm text-foreground-muted">{item.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <FinalCTAStrip />
            </main>
        </div>
    );
}

/* ─── Local primitives ─── */

function ContactItem({
    Icon,
    label,
    lines,
    links,
}: {
    Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    label: string;
    lines?: string[];
    links?: { label: string; href: string }[];
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" style={{ color: "var(--brand-green)" }} />
                <p className="text-eyebrow text-foreground-muted">{label}</p>
            </div>
            <div className="pl-6 space-y-1">
                {lines?.map((line) => (
                    <p key={line} className="text-body text-foreground">{line}</p>
                ))}
                {links?.map((link) => (
                    <a
                        key={link.href}
                        href={link.href}
                        className="block text-body text-foreground transition-colors hover:text-[color:var(--brand-green)]"
                    >
                        {link.label}
                    </a>
                ))}
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1.5">
            <span className="text-label text-foreground">{label}</span>
            {children}
        </label>
    );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none"
        />
    );
}
