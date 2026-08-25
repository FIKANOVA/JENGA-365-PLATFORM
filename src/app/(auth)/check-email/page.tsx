"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { authClient } from "@/lib/auth/client";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

function CheckEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") ?? "";
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);

    const handleResend = async () => {
        if (!email) return;
        setResending(true);
        try {
            await authClient.sendVerificationEmail({
                email,
                callbackURL: "/onboarding/intake",
            });
            setResent(true);
        } catch {
            // silent — user can try again
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="w-full max-w-md text-center space-y-8">
            <div
                className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-md"
                style={{ background: "var(--brand-green-soft)" }}
            >
                <Mail className="h-6 w-6" style={{ color: "var(--brand-green)" }} />
            </div>

            <div className="space-y-2">
                <h1 className="text-display-sm text-foreground">Check your email</h1>
                <p className="text-body text-foreground-muted">
                    We sent a verification link to{" "}
                    {email ? (
                        <span className="font-medium text-foreground">{email}</span>
                    ) : (
                        "your email address"
                    )}
                    . Click the link to activate your account.
                </p>
            </div>

            <div
                className="rounded-md border border-border bg-background p-5 text-left space-y-3"
                style={{ boxShadow: "var(--shadow-sm)" }}
            >
                {[
                    "Open your email inbox",
                    "Find the email from Jenga365",
                    "Click the verification link",
                    "You'll be taken to your onboarding",
                ].map((step, i) => (
                    <div key={step} className="flex gap-3 items-start">
                        <span
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
                            style={{
                                background: "var(--brand-green-soft)",
                                color: "var(--brand-green)",
                            }}
                        >
                            {i + 1}
                        </span>
                        <span className="text-body-sm text-foreground-muted">{step}</span>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                {resent ? (
                    <p
                        className="inline-flex items-center gap-1.5 text-body-sm font-medium"
                        style={{ color: "var(--brand-green)" }}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        New link sent — check your inbox.
                    </p>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={resending || !email}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-background text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)] disabled:opacity-50"
                    >
                        {resending ? (
                            "Sending…"
                        ) : (
                            <>
                                <ArrowRight className="h-4 w-4" />
                                <span>Resend verification email</span>
                            </>
                        )}
                    </button>
                )}
                <p className="text-body-sm text-foreground-muted">
                    Wrong email?{" "}
                    <Link
                        href="/register"
                        className="font-medium hover:underline"
                        style={{ color: "var(--brand-green)" }}
                    >
                        Start over
                    </Link>{" "}
                    ·{" "}
                    <Link
                        href="/login"
                        className="text-foreground-muted hover:text-foreground transition-colors"
                    >
                        Sign in instead
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function CheckEmailPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center">
                    <Logo size="md" />
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center px-6 py-16">
                <Suspense
                    fallback={
                        <div className="text-body-sm text-foreground-muted animate-pulse">
                            Loading…
                        </div>
                    }
                >
                    <CheckEmailContent />
                </Suspense>
            </main>
        </div>
    );
}
