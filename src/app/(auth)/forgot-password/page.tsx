"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { authClient } from "@/lib/auth/client";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await authClient.requestPasswordReset({
                email,
                redirectTo: "/reset-password",
            });
            setSubmitted(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-background">
            <div className="mb-10">
                <Logo variant="branding" theme="premium" height={32} priority />
            </div>

            <div className="w-full max-w-sm space-y-8">
                {submitted ? (
                    <div className="space-y-6 text-center">
                        <CheckCircle className="w-12 h-12 text-[#006600] mx-auto" />
                        <div className="space-y-2">
                            <h1 className="font-serif font-black text-2xl text-foreground uppercase tracking-tight">
                                Check your inbox
                            </h1>
                            <p className="font-sans font-light text-sm text-muted-foreground">
                                If an account exists for <span className="font-semibold text-foreground">{email}</span>, you&apos;ll receive a password reset link shortly.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
                        >
                            <ArrowLeft size={12} /> Back to sign in
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <h1 className="font-serif font-black text-3xl text-foreground uppercase tracking-tight">
                                Reset password
                            </h1>
                            <p className="font-sans font-light text-sm text-muted-foreground">
                                Enter your email and we&apos;ll send you a reset link.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs px-4 py-3">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold block">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className="jenga-input w-full"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full shadow-xl flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? "Sending…" : <><span>Send reset link</span> <ArrowRight size={14} /></>}
                            </button>
                        </form>

                        <div className="pt-6 border-t border-border text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft size={14} /> Back to sign in
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
