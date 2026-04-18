"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { signIn } from "@/lib/auth/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginForm() {
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
            const result = await signIn.email({
                email,
                password,
                callbackURL: callbackUrl,
            });

            if (result?.error) {
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
                <h1 className="font-serif font-black text-3xl text-foreground uppercase tracking-tight">
                    Welcome back
                </h1>
                <p className="font-sans font-light text-sm text-muted-foreground">
                    Sign in to your Jenga365 account.
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

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold block">
                            Password
                        </label>
                        <Link href="/forgot-password" className="font-mono text-[10px] uppercase tracking-widest text-primary hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="jenga-input w-full pr-12"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
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

                <button
                    type="submit"
                    className="btn-primary w-full shadow-xl flex items-center justify-center gap-2"
                    disabled={loading}
                >
                    {loading ? "Signing in…" : <><span>Sign In</span> <ArrowRight size={14} /></>}
                </button>
            </form>

            <div className="pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-bold text-primary hover:underline transition-colors">
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex">
            {/* Left panel — brand image */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-black flex-col justify-between p-16">
                <img
                    src="https://jenga365.com/wp-content/uploads/2025/07/Fanaka-Studios-SportPesa-Cheza-Dimba-Northrift-66-of-429-scaled.jpg"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=1920&auto=format&fit=crop";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

                {/* Logo */}
                <div className="relative z-10">
                    <Logo variant="branding" theme="light" height={36} priority />
                </div>

                {/* Brand statement */}
                <div className="relative z-10 space-y-6">
                    <blockquote className="font-serif font-black text-4xl xl:text-5xl text-white leading-[1.05] uppercase">
                        Building the{" "}
                        <span className="text-primary italic">Total Athlete.</span>
                        <br />365 days a year.
                    </blockquote>
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-primary" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                            Kenya&apos;s Mentorship &amp; Rugby Platform
                        </span>
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-background">
                <div className="lg:hidden mb-12">
                    <Logo variant="branding" theme="premium" height={32} priority />
                </div>
                <Suspense
                    fallback={
                        <div className="animate-pulse font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Loading…
                        </div>
                    }
                >
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
