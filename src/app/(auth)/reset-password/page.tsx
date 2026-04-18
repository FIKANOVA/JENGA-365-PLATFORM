"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { authClient } from "@/lib/auth/client";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

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
                <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                <div className="space-y-2">
                    <h1 className="font-serif font-black text-2xl text-foreground uppercase tracking-tight">
                        Invalid link
                    </h1>
                    <p className="font-sans font-light text-sm text-muted-foreground">
                        This password reset link is missing or malformed.
                    </p>
                </div>
                <Link href="/forgot-password" className="btn-primary inline-flex items-center gap-2 text-sm">
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
                <CheckCircle className="w-12 h-12 text-[#006600] mx-auto" />
                <div className="space-y-2">
                    <h1 className="font-serif font-black text-2xl text-foreground uppercase tracking-tight">
                        Password updated
                    </h1>
                    <p className="font-sans font-light text-sm text-muted-foreground">
                        Your password has been reset. Redirecting you to sign in…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-2">
                <h1 className="font-serif font-black text-3xl text-foreground uppercase tracking-tight">
                    New password
                </h1>
                <p className="font-sans font-light text-sm text-muted-foreground">
                    Choose a strong password for your account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs px-4 py-3">
                        {error}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold block">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="jenga-input w-full pr-12"
                            placeholder="Minimum 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold block">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        className="jenga-input w-full"
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary w-full shadow-xl flex items-center justify-center gap-2"
                    disabled={loading}
                >
                    {loading ? "Updating…" : <><span>Set new password</span> <ArrowRight size={14} /></>}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-background">
            <div className="mb-10">
                <Logo variant="branding" theme="premium" height={32} priority />
            </div>
            <div className="w-full max-w-sm space-y-8">
                <Suspense
                    fallback={
                        <div className="animate-pulse font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">
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
