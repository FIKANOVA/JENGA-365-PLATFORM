"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
import Logo from "@/components/shared/Logo";

export default function VerifyEmailPage() {
    const params = useParams();
    const token = params.token as string;

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<string | null>(null);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setError("Missing verification token.");
            return;
        }

        async function verify() {
            try {
                const res = await authClient.verifyEmail({ query: { token } });

                if (res.error) {
                    setStatus("error");
                    setError(res.error.message || "Invalid or expired token.");
                } else {
                    setStatus("success");
                    toast.success("Email verified");
                }
            } catch {
                setStatus("error");
                setError("An unexpected error occurred.");
            }
        }

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center">
                    <Logo size="md" />
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="max-w-md w-full text-center space-y-8">
                    {status === "loading" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-5"
                        >
                            <Loader2
                                className="h-10 w-10 animate-spin"
                                style={{ color: "var(--brand-green)" }}
                            />
                            <div className="space-y-2">
                                <h1 className="text-display-sm text-foreground">
                                    Verifying your email…
                                </h1>
                                <p className="text-body-sm text-foreground-muted">
                                    Please wait while we confirm your identity.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {status === "success" && (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.18 }}
                            className="flex flex-col items-center gap-5"
                        >
                            <div
                                className="inline-flex h-14 w-14 items-center justify-center rounded-full"
                                style={{ background: "var(--brand-green-soft)" }}
                            >
                                <Check
                                    className="h-7 w-7"
                                    strokeWidth={3}
                                    style={{ color: "var(--brand-green)" }}
                                />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-display-sm text-foreground">
                                    Email verified
                                </h1>
                                <p className="text-body-sm text-foreground-muted">
                                    Your email has been confirmed. Let&apos;s set up your mentorship profile.
                                </p>
                            </div>
                            <Link href="/onboarding/intake" className="w-full">
                                <button
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    Continue to onboarding <ArrowRight className="h-4 w-4" />
                                </button>
                            </Link>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.18 }}
                            className="flex flex-col items-center gap-5"
                        >
                            <div
                                className="inline-flex h-14 w-14 items-center justify-center rounded-full"
                                style={{ background: "var(--brand-red-soft)" }}
                            >
                                <X
                                    className="h-7 w-7"
                                    style={{ color: "var(--brand-red)" }}
                                />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-display-sm text-foreground">
                                    Link expired
                                </h1>
                                <p className="text-body-sm text-foreground-muted">
                                    {error || "This verification link has expired or already been used."}
                                </p>
                            </div>
                            <div className="flex w-full flex-col gap-3">
                                <button
                                    disabled={resending}
                                    onClick={async () => {
                                        setResending(true);
                                        try {
                                            await authClient.sendVerificationEmail({
                                                email: "",
                                                callbackURL: "/onboarding/intake",
                                            });
                                            toast.success(
                                                "New verification link sent — check your inbox.",
                                            );
                                        } catch {
                                            toast.error(
                                                "Could not resend — please contact support.",
                                            );
                                        } finally {
                                            setResending(false);
                                        }
                                    }}
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    {resending ? "Sending…" : "Send a new link"}
                                </button>
                                <Link
                                    href="/contact"
                                    className="text-body-sm text-foreground-muted hover:text-foreground transition-colors"
                                >
                                    Contact support
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
