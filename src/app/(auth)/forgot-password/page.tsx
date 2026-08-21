"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Turnstile from "@/components/shared/Turnstile";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!turnstileToken) {
            setError("Please complete the spam verification check before continuing.");
            return;
        }

        setLoading(true);

        try {
            const res = await requestPasswordResetAction(email);
            if (res.success) {
                setSubmitted(true);
            } else {
                setError(res.error || "Failed to send reset link. Please try again.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-16">
            <div className="mb-10">
                <Logo size="md" />
            </div>

            <div className="w-full max-w-sm space-y-8">
                {submitted ? (
                    <div className="space-y-6 text-center">
                        <CheckCircle2
                            className="h-10 w-10 mx-auto"
                            style={{ color: "var(--brand-green)" }}
                        />
                        <div className="space-y-2">
                            <h1 className="text-display-sm text-foreground">Check your inbox</h1>
                            <p className="text-body-sm text-foreground-muted">
                                If an account exists for{" "}
                                <span className="font-medium text-foreground">{email}</span>, you&apos;ll
                                receive a password reset link shortly.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-label hover:underline"
                            style={{ color: "var(--brand-green)" }}
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <h1 className="text-display-sm text-foreground">Reset password</h1>
                            <p className="text-body-sm text-foreground-muted">
                                Enter your email and we&apos;ll send you a reset link.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-md border px-3 py-2 text-body-sm"
                                    style={{
                                        background: "var(--brand-red-soft)",
                                        borderColor: "var(--brand-red-soft)",
                                        color: "var(--brand-red)",
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-label text-foreground">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            {/* Cloudflare Turnstile */}
                            <div className="pt-1 flex justify-center">
                                <Turnstile
                                    action="forgot_password"
                                    onSuccess={(token) => {
                                        setTurnstileToken(token);
                                        setError(null);
                                    }}
                                    onError={() => setTurnstileToken(null)}
                                    onExpire={() => setTurnstileToken(null)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !turnstileToken}
                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                                style={{ background: "var(--brand-green)" }}
                            >
                                {loading ? (
                                    "Sending…"
                                ) : (
                                    <>
                                        <span>Send reset link</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>


                        <div className="pt-6 border-t border-border text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 text-body-sm text-foreground-muted hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
