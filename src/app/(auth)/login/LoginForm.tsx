"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, ShieldAlert } from "lucide-react";
import Turnstile from "@/components/shared/Turnstile";


export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
    const reason = searchParams.get("reason");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);


    async function handleGoogleSignIn() {
        setError(null);
        setSocialLoading(true);
        try {
            await signIn.social({
                provider: "google",
                callbackURL: callbackUrl,
            });
        } catch {
            setError("Failed to sign in with Google. Please try again.");
            setSocialLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!turnstileToken) {
            setError("Please complete the spam verification check before signing in.");
            return;
        }

        setLoading(true);

        try {
            const result = await signIn.email({ email, password });

            if ((result?.data as Record<string, unknown>)?.twoFactorRedirect) {
                router.push(`/two-factor?callbackUrl=${encodeURIComponent(callbackUrl)}`);
            } else if (result?.error) {
                setError("Invalid email or password. Please try again.");
            } else {
                router.push(callbackUrl);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-sm space-y-7">
            <div className="space-y-2">
                <h1 className="text-display-sm text-foreground">Welcome back</h1>
                <p className="text-body-sm text-foreground-muted">
                    Sign in to your Jenga365 account.
                </p>
            </div>

            {/* Google Social Sign-In */}
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={socialLoading || loading}
                className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-md border border-border bg-background px-4 text-label font-medium text-foreground transition-colors hover:bg-[color:var(--surface-2)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                    />
                </svg>
                <span>{socialLoading ? "Connecting to Google…" : "Continue with Google"}</span>
            </button>

            <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-border" />
                <span className="absolute bg-background px-3 text-xs uppercase tracking-wider text-foreground-subtle">
                    Or continue with email
                </span>
            </div>

            {/* Idle Timeout Security Banner */}
            {reason === "idle_timeout" && !error && (
                <div
                    role="alert"
                    className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-body-sm text-amber-900 dark:text-amber-200 flex items-center gap-2.5"
                >
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>You were signed out due to inactivity for your security.</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div
                        role="alert"
                        className="rounded-md border border-[color:var(--brand-red-soft)] bg-[color:var(--brand-red-soft)] px-3 py-2 text-body-sm"
                        style={{ color: "var(--brand-red)" }}
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

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-label text-foreground">
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-label hover:underline"
                            style={{ color: "var(--brand-green)" }}
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="h-10 w-full rounded-md border border-border bg-background px-3 pr-10 text-body-sm text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
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

                {/* Cloudflare Turnstile Bot Protection */}
                <div className="pt-2 flex justify-center">
                    <Turnstile
                        action="login"
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
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{ background: "var(--brand-green)" }}
                >
                    {loading ? "Signing in…" : (<><span>Sign in</span><ArrowRight className="h-4 w-4" /></>)}
                </button>
            </form>

            <div className="border-t border-border pt-5 text-center">
                <p className="text-body-sm text-foreground-muted">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-medium hover:underline"
                        style={{ color: "var(--brand-green)" }}
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

