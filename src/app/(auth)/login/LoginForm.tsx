"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
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
        <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2">
                <h1 className="text-display-sm text-foreground">Welcome back</h1>
                <p className="text-body-sm text-foreground-muted">
                    Sign in to your Jenga365 account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "var(--brand-green)" }}
                >
                    {loading ? "Signing in…" : (<><span>Sign in</span><ArrowRight className="h-4 w-4" /></>)}
                </button>
            </form>

            <div className="border-t border-border pt-6 text-center">
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
