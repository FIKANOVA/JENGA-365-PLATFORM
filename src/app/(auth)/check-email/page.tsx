"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { authClient } from "@/lib/auth/client";
import { Mail, ArrowRight } from "lucide-react";

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
                callbackURL: "/onboarding",
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
            {/* Icon */}
            <div className="flex justify-center">
                <div className="w-20 h-20 bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Mail className="w-9 h-9 text-primary" />
                </div>
            </div>

            {/* Heading */}
            <div className="space-y-3">
                <h1 className="font-serif font-black text-4xl text-foreground uppercase tracking-tighter leading-none">
                    Check Your<br />
                    <span className="text-primary italic">Email.</span>
                </h1>
                <p className="font-sans font-light text-muted-foreground text-sm leading-relaxed">
                    We sent a verification link to{" "}
                    {email
                        ? <strong className="text-foreground">{email}</strong>
                        : "your email address"
                    }.
                    <br />Click the link to activate your Jenga365 account.
                </p>
            </div>

            {/* Steps */}
            <div className="jenga-card p-6 text-left space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                {[
                    "Open your email inbox",
                    "Find the email from Jenga365",
                    "Click the verification link",
                    "You'll be taken to your onboarding",
                ].map((step, i) => (
                    <div key={step} className="flex gap-4 items-start">
                        <span className="font-mono text-[9px] font-bold text-primary mt-0.5 w-4 shrink-0">{i + 1}.</span>
                        <span className="font-sans font-light text-sm text-muted-foreground">{step}</span>
                    </div>
                ))}
            </div>

            {/* Resend */}
            <div className="space-y-3">
                {resent ? (
                    <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                        New link sent — check your inbox.
                    </p>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={resending || !email}
                        className="w-full h-12 bg-foreground text-background font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {resending ? "Sending…" : <><ArrowRight size={14} /> Resend verification email</>}
                    </button>
                )}
                <p className="text-xs text-muted-foreground font-sans">
                    Wrong email?{" "}
                    <Link href="/register" className="text-primary font-bold hover:underline">
                        Start over
                    </Link>
                    {" "}·{" "}
                    <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
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
            <header className="w-full border-b border-border py-5 px-8 flex justify-center bg-background/95 backdrop-blur-md sticky top-0 z-50">
                <Link href="/">
                    <Logo variant="premium" height={38} priority />
                </Link>
            </header>
            <div className="flex-1 flex items-center justify-center px-6 py-20">
                <Suspense fallback={<div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground animate-pulse">Loading…</div>}>
                    <CheckEmailContent />
                </Suspense>
            </div>
        </div>
    );
}
