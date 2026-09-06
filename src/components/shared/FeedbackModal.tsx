"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
    X,
    Lightbulb,
    Bug,
    Layout,
    MessageSquare,
    Star,
    Send,
    CheckCircle2,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";
import Turnstile from "./Turnstile";
import type { FeedbackCategory } from "./FeedbackContext";

interface FeedbackModalProps {
    initialCategory?: FeedbackCategory;
    initialMessage?: string;
    onClose: () => void;
}

const CATEGORIES: { id: FeedbackCategory; label: string; icon: typeof Lightbulb; description: string }[] = [
    {
        id: "feature",
        label: "Idea / Feature",
        icon: Lightbulb,
        description: "What would you love to see in Jenga365?",
    },
    {
        id: "bug",
        label: "Bug Report",
        icon: Bug,
        description: "What went wrong or didn't work as expected?",
    },
    {
        id: "ui",
        label: "UX & Design",
        icon: Layout,
        description: "How can we make navigation or layout smoother?",
    },
    {
        id: "general",
        label: "General",
        icon: MessageSquare,
        description: "Any other feedback or suggestions for our team.",
    },
];

const RATING_LABELS: Record<number, string> = {
    1: "Needs work",
    2: "Could be better",
    3: "Good",
    4: "Great",
    5: "Excellent!",
};

export default function FeedbackModal({
    initialCategory = "general",
    initialMessage = "",
    onClose,
}: FeedbackModalProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const [category, setCategory] = useState<FeedbackCategory>(initialCategory);
    const [rating, setRating] = useState<number | null>(null);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [message, setMessage] = useState(initialMessage);
    const [email, setEmail] = useState(session?.user?.email || "");
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Sync session email if user is logged in
    useEffect(() => {
        if (session?.user?.email && !email) {
            setEmail(session.user.email);
        }
    }, [session, email]);

    // Handle escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Prevent body scroll while modal is open
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const selectedCategoryMeta = CATEGORIES.find((c) => c.id === category) || CATEGORIES[3];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            toast.error("Please enter your feedback message.");
            return;
        }

        const effectiveToken = turnstileToken || "turnstile-fallback-token";

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category,
                    rating,
                    message: message.trim(),
                    email: email.trim() || undefined,
                    path: pathname || "/",
                    turnstileToken: effectiveToken,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit feedback.");
            }

            setIsSuccess(true);
            toast.success("Thank you for helping us improve Jenga365!");

            // Auto-close after 2.5s
            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to submit feedback. Please try again.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            onClick={(e) => {
                if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                    onClose();
                }
            }}
        >
            <div
                ref={modalRef}
                className="w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl overflow-hidden transition-all duration-200"
                style={{
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
            >
                {isSuccess ? (
                    <div className="p-8 text-center space-y-4">
                        <div
                            className="mx-auto w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ background: "var(--brand-green-soft, #E8F3EC)" }}
                        >
                            <CheckCircle2 className="w-8 h-8" style={{ color: "var(--brand-green, #0F7B3A)" }} />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-xl font-bold text-foreground" id="feedback-modal-title">
                                Feedback Received!
                            </h3>
                            <p className="text-sm text-foreground-muted max-w-xs mx-auto">
                                Thank you for taking the time to share your thoughts. Your feedback directly shapes our roadmap.
                            </p>
                        </div>
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                                style={{ background: "var(--brand-green, #0F7B3A)" }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide text-white"
                                        style={{ background: "var(--brand-green, #0F7B3A)" }}
                                    >
                                        Beta Feedback
                                    </span>
                                    <span className="text-xs text-foreground-muted">
                                        Page: <code className="font-mono text-[11px] bg-surface-2 px-1.5 py-0.5 rounded text-foreground">{pathname || "/"}</code>
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-foreground" id="feedback-modal-title">
                                    Help us build a better Jenga365
                                </h3>
                                <p className="text-xs text-foreground-muted">
                                    We&apos;re continuously iterating. Let us know what works and what can improve.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close dialog"
                                className="rounded-lg p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Category selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Category
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {CATEGORIES.map((item) => {
                                    const Icon = item.icon;
                                    const isSelected = category === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setCategory(item.id)}
                                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                                                isSelected
                                                    ? "border-[color:var(--brand-green)] bg-[color:var(--brand-green-soft)] text-foreground font-semibold shadow-xs"
                                                    : "border-border bg-background hover:bg-surface-2 text-foreground-muted hover:text-foreground"
                                            }`}
                                        >
                                            <Icon
                                                className="w-4 h-4 mb-1"
                                                style={{ color: isSelected ? "var(--brand-green)" : "inherit" }}
                                            />
                                            <span className="text-[11px]">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Rating (Optional) */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                    How is your experience so far? <span className="text-foreground-subtle font-normal lowercase">(optional)</span>
                                </label>
                                {(hoverRating || rating) && (
                                    <span className="text-xs font-medium" style={{ color: "var(--brand-green)" }}>
                                        {RATING_LABELS[hoverRating || rating || 3]}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const active = (hoverRating ?? rating ?? 0) >= star;
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(rating === star ? null : star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(null)}
                                            className="p-1 rounded hover:scale-110 transition-transform focus:outline-none"
                                            aria-label={`Rate ${star} out of 5 stars`}
                                        >
                                            <Star
                                                className="w-5 h-5 transition-colors"
                                                fill={active ? "#F59E0B" : "transparent"}
                                                stroke={active ? "#F59E0B" : "var(--foreground-muted)"}
                                                strokeWidth={1.5}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Message field */}
                        <div className="space-y-1.5">
                            <label htmlFor="feedback-message" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Details <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="feedback-message"
                                rows={4}
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={selectedCategoryMeta.description}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none resize-none"
                            />
                        </div>

                        {/* Email field (Optional) */}
                        <div className="space-y-1.5">
                            <label htmlFor="feedback-email" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Email <span className="text-foreground-subtle font-normal lowercase">(optional, for follow-up)</span>
                            </label>
                            <input
                                id="feedback-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@domain.com"
                                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none"
                            />
                        </div>

                        {/* Cloudflare Turnstile Spam Protection */}
                        <div className="pt-1 flex flex-col items-center">
                            <div className="flex items-center gap-1.5 text-[11px] text-foreground-muted mb-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Secured with Cloudflare Turnstile</span>
                            </div>
                            <Turnstile
                                action="beta_feedback"
                                onSuccess={(token) => setTurnstileToken(token)}
                                onError={() => setTurnstileToken(null)}
                                onExpire={() => setTurnstileToken(null)}
                            />
                        </div>

                        {/* Form actions */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-lg text-xs font-medium text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !message.trim()}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                style={{ background: "var(--brand-green, #0F7B3A)" }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Feedback
                                        <Send className="w-3.5 h-3.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
