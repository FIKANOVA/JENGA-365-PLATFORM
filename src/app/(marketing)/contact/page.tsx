"use client";

import { useState } from "react";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";
import PageHero from "@/components/shared/PageHero";
import { toast } from "sonner";

const FAQ_ITEMS = [
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

export default function ContactPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Unknown error");
            setSubmitted(true);
            toast.success("Message sent! We'll get back to you shortly.");
        } catch (err: any) {
            toast.error(err.message ?? "Failed to send message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <main>
                <PageHero
                    eyebrow="Get In Touch"
                    eyebrowColor="var(--red)"
                    heading={<>Connect <span className="italic text-primary">With Us.</span></>}
                    description="Have questions about our mentorship programs, corporate partnerships, or rugby development initiatives? We're here to help you build the future."
                    bgImage="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop"
                    bgFallback="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1920&auto=format&fit=crop"
                />

                {/* ── Contact Info + Form ── */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                            {/* Left Column: Contact Info */}
                            <div className="space-y-16">
                                <div className="space-y-4">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--primary-green)] block font-bold">
                                        Reach Out
                                    </span>
                                    <h2 className="font-serif font-bold text-4xl md:text-5xl text-black uppercase tracking-tighter">
                                        Let&apos;s Start A <span className="italic text-[var(--primary-green)]">Conversation.</span>
                                    </h2>
                                    <p className="text-[var(--text-secondary)] text-lg font-light leading-relaxed max-w-md pt-2">
                                        Whether you&apos;re a corporate partner looking to fund impact, a prospective mentor, or a youth seeking growth — our doors are open.
                                    </p>
                                </div>

                                {/* Info Cards */}
                                <div className="space-y-10">
                                    <div className="space-y-3 group">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[var(--primary-green)] text-xl">location_on</span>
                                            <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/60 font-bold">Headquarters</h3>
                                        </div>
                                        <p className="font-light text-lg text-black pl-9">
                                            Nairobi Mentorship Hub<br />
                                            Westlands, Nairobi, Kenya
                                        </p>
                                    </div>

                                    <div className="h-px bg-[var(--border)]" />

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[var(--primary-green)] text-xl">mail</span>
                                            <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/60 font-bold">General Inquiries</h3>
                                        </div>
                                        <div className="pl-9 space-y-1">
                                            <a href="mailto:hello@jenga365.org" className="block font-light text-lg text-black hover:text-[var(--primary-green)] transition-colors">
                                                hello@jenga365.org
                                            </a>
                                            <a href="tel:+254700365365" className="block font-light text-lg text-black hover:text-[var(--primary-green)] transition-colors">
                                                +254 (0) 700 365 365
                                            </a>
                                        </div>
                                    </div>

                                    <div className="h-px bg-[var(--border)]" />

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[var(--primary-green)] text-xl">schedule</span>
                                            <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/60 font-bold">Office Hours</h3>
                                        </div>
                                        <p className="font-light text-lg text-black pl-9">
                                            Monday — Friday<br />
                                            8:00 AM — 6:00 PM EAT
                                        </p>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="space-y-6">
                                    <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/60 font-bold">Follow Us</h3>
                                    <div className="flex items-center gap-4">
                                        {[
                                            { icon: "public", label: "Website" },
                                            { icon: "alternate_email", label: "Twitter/X" },
                                            { icon: "photo_camera", label: "Instagram" },
                                        ].map((social) => (
                                            <a
                                                key={social.icon}
                                                href="/"
                                                aria-label={social.label}
                                                className="w-14 h-14 bg-[var(--off-white)] border border-[var(--border)] flex items-center justify-center text-black/40 hover:bg-[var(--primary-green)] hover:text-white hover:border-[var(--primary-green)] transition-all duration-500"
                                            >
                                                <span className="material-symbols-outlined text-xl">{social.icon}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Contact Form */}
                            <div className="bg-[var(--off-white)] p-10 md:p-12 border border-[var(--border)] self-start">
                                <div className="space-y-2 mb-10">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--primary-green)] block font-bold">
                                        Send a Message
                                    </span>
                                    <h3 className="font-serif font-bold text-2xl text-black uppercase tracking-tight">
                                        We&apos;ll Get Back to You.
                                    </h3>
                                </div>

                                {submitted ? (
                                    <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
                                        <span className="material-symbols-outlined text-6xl text-[var(--primary-green)]">mark_email_read</span>
                                        <div className="space-y-2">
                                            <h3 className="font-serif font-bold text-2xl uppercase tracking-tighter">Message Sent!</h3>
                                            <p className="text-[var(--text-secondary)] font-light">We&apos;ve received your message and will respond within 1–2 business days.</p>
                                        </div>
                                        <button
                                            onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "General Inquiry", message: "" }); }}
                                            className="font-mono text-[10px] uppercase tracking-widest text-[var(--primary-green)] hover:underline font-bold"
                                        >
                                            Send Another Message
                                        </button>
                                    </div>
                                ) : (
                                <form className="space-y-8" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/60 font-bold block">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white border border-[var(--border)] p-4 outline-none focus:border-[var(--primary-green)] transition-colors text-black"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/60 font-bold block">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white border border-[var(--border)] p-4 outline-none focus:border-[var(--primary-green)] transition-colors text-black"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/60 font-bold block">
                                            Subject
                                        </label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-white border border-[var(--border)] p-4 outline-none focus:border-[var(--primary-green)] transition-colors text-black appearance-none cursor-pointer"
                                        >
                                            {SUBJECT_OPTIONS.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/60 font-bold block">
                                            Message
                                        </label>
                                        <textarea
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-white border border-[var(--border)] p-4 outline-none focus:border-[var(--primary-green)] transition-colors text-black resize-none"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-5 bg-[var(--primary-green)] text-white font-mono text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-all duration-500 border border-transparent hover:border-[var(--red)] disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "SENDING..." : "Send Message"}
                                        {!isSubmitting && <span className="material-symbols-outlined ml-2 align-middle text-sm">send</span>}
                                    </button>
                                </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Map Section ── */}
                <section className="bg-[var(--off-white)] py-24 border-y border-[var(--border)]">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--primary-green)] block font-bold">
                                    Our Location
                                </span>
                                <h2 className="font-serif font-bold text-3xl text-black uppercase tracking-tighter">
                                    Nairobi Mentorship Hub
                                </h2>
                            </div>
                            <div className="aspect-[21/9] bg-[var(--surface-container)] border border-[var(--border)] overflow-hidden relative group">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.17022526987!2d36.80277!3d-1.26389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173c0a1f9de7%3A0xad2c84df45a4e52c!2sWestlands%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                                    title="Jenga365 Nairobi Mentorship Hub Location"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FAQ Section ── */}
                <section className="py-24">
                    <div className="max-w-4xl mx-auto px-6 md:px-12">
                        <div className="text-center space-y-4 mb-16">
                            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--primary-green)] block font-bold">
                                Common Questions
                            </span>
                            <h2 className="font-serif font-bold text-4xl md:text-5xl text-black uppercase tracking-tighter">
                                Frequently Asked <span className="italic text-[var(--primary-green)]">Questions.</span>
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {FAQ_ITEMS.map((item, index) => (
                                <div
                                    key={index}
                                    className={`border transition-all duration-300 ${
                                        openFaq === index
                                            ? "border-[var(--primary-green)] bg-[var(--off-white)]"
                                            : "border-[var(--border)] bg-white hover:border-black/20"
                                    }`}
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
                                    >
                                        <span className="font-serif font-bold text-lg md:text-xl text-black pr-8 group-hover:text-[var(--primary-green)] transition-colors">
                                            {item.question}
                                        </span>
                                        <span
                                            className={`material-symbols-outlined text-2xl flex-shrink-0 transition-transform duration-300 ${
                                                openFaq === index ? "rotate-45 text-[var(--red)]" : "text-black/30"
                                            }`}
                                        >
                                            add
                                        </span>
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${
                                            openFaq === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                        }`}
                                    >
                                        <div className="px-6 md:px-8 pb-8">
                                            <div className="h-px bg-[var(--border)] mb-6" />
                                            <p className="font-light text-[var(--text-secondary)] leading-relaxed text-lg">
                                                {item.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ── */}
                <FinalCTAStrip />
            </main>
        </div>
    );
}
