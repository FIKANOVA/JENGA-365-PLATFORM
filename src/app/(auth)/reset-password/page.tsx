"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { authClient } from "@/lib/auth/client";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

const INPUT_CLASS =
    "h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!token) {
        return (
            <div className="space-y-6 text-center">
                <AlertTriangle
                    className="h-10 w-10 mx-auto"
                    style={{ color: "var(--brand-red)" }}
                />
                <div className="space-y-2">
                    <h1 className="text-display-sm text-foreground">Invalid link</h1>
                    <p className="text-body-sm text-foreground-muted">
                        This password reset link is missing or malformed.
                    </p>
                </div>
                <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center h-10 px-4 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90"
                    style={{ background: "var(--brand-green)" }}
                >
                    Request a new link
                </Link>
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            return setError("Password must be at least 8 characters.");
        }
        if (password !== confirmPassword) {
            return setError("Passwords do not match.");
        }

        setLoading(true);
        try {
            const result = await authClient.resetPassword({
                newPassword: password,
                token,
            });

            if (result?.error) {
                setError(result.error.message ?? "Reset failed. The link may have expired.");
            } else {
                setSuccess(true);
                setTimeout(() => router.push("/login"), 3000);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="space-y-6 text-center">
                <CheckCircle2
                    className="h-10 w-10 mx-auto"
                    style={{ color: "var(--brand-green)" }}
                />
                <div className="space-y-2">
                    <h1 className="text-display-sm text-foreground">Password updated</h1>
                    <p className="text-body-sm text-foreground-muted">
                        Redirecting you to sign in…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-2">
                <h1 className="text-display-sm text-foreground">New password</h1>
                <p className="text-body-sm text-foreground-muted">
                    Choose a strong password for your account.
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
                    <label htmlFor="password" className="text-label text-foreground">
                        New password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className={`${INPUT_CLASS} pr-10`}
                            placeholder="Minimum 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-label text-foreground">
                        Confirm password
                    </label>
                    <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        className={INPUT_CLASS}
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: "var(--brand-green)" }}
                >
                    {loading ? (
                        "Updating…"
                    ) : (
                        <>
                            <span>Set new password</span>
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-16">
            <div className="mb-10">
                <Logo size="md" />
            </div>
            <div className="w-full max-w-sm space-y-8">
                <Suspense
                    fallback={
                        <div className="text-body-sm text-foreground-muted animate-pulse text-center">
                            Loading…
                        </div>
                    }
                >
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
