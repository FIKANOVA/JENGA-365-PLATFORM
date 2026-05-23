"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { authClient } from "@/lib/auth/client";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, Mail } from "lucide-react";

type Mode = "totp" | "otp";

function TwoFactorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

    const [mode, setMode] = useState<Mode>("totp");
    const [code, setCode] = useState("");
    const [trustDevice, setTrustDevice] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, [mode]);

    async function sendEmailCode() {
        setSending(true);
        setError(null);
        setInfo(null);
        try {
            const result = await authClient.twoFactor.sendOtp();
            if (result?.error) {
                setError("Failed to send code. Please try again.");
            } else {
                setInfo("A 6-digit code has been sent to your email address.");
                setCode("");
                inputRef.current?.focus();
            }
        } catch {
            setError("Failed to send code. Please try again.");
        } finally {
            setSending(false);
        }
    }

    async function switchToEmail() {
        setMode("otp");
        setCode("");
        setError(null);
        setInfo(null);
        await sendEmailCode();
    }

    function switchToTotp() {
        setMode("totp");
        setCode("");
        setError(null);
        setInfo(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (code.length !== 6) return;

        setError(null);
        setLoading(true);

        try {
            const result =
                mode === "totp"
                    ? await authClient.twoFactor.verifyTotp({ code, trustDevice })
                    : await authClient.twoFactor.verifyOtp({ code, trustDevice });

            if (result?.error) {
                const msg =
                    mode === "totp"
                        ? "Invalid code. Check your authenticator app and try again."
                        : "Invalid or expired code. Request a new one.";
                setError(msg);
                setCode("");
                inputRef.current?.focus();
            } else {
                router.push(callbackUrl);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
        setCode(val);
    }

    return (
        <div className="w-full max-w-sm space-y-8">
            <div className="space-y-3">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: "var(--surface-2)" }}
                >
                    {mode === "totp" ? (
                        <ShieldCheck className="h-5 w-5" style={{ color: "var(--brand-green)" }} />
                    ) : (
                        <Mail className="h-5 w-5" style={{ color: "var(--brand-green)" }} />
                    )}
                </div>
                <h1 className="text-display-sm text-foreground">Two-factor authentication</h1>
                <p className="text-body-sm text-foreground-muted">
                    {mode === "totp"
                        ? "Enter the 6-digit code from your authenticator app."
                        : "Enter the 6-digit code sent to your email address."}
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
                {info && (
                    <div
                        role="status"
                        className="rounded-md border border-border bg-[color:var(--surface-1)] px-3 py-2 text-body-sm text-foreground-muted"
                    >
                        {info}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label htmlFor="code" className="text-label text-foreground">
                        Authentication code
                    </label>
                    <input
                        ref={inputRef}
                        id="code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        className="h-12 w-full rounded-md border border-border bg-background px-4 text-center font-mono text-2xl tracking-[0.4em] text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none disabled:opacity-50"
                        placeholder="000000"
                        value={code}
                        onChange={handleCodeChange}
                        disabled={loading}
                    />
                </div>

                <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                        type="checkbox"
                        checked={trustDevice}
                        onChange={(e) => setTrustDevice(e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-[color:var(--brand-green)]"
                    />
                    <span className="text-body-sm text-foreground-muted">
                        Trust this device for 30 days
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: "var(--brand-green)" }}
                >
                    {loading ? "Verifying…" : "Verify"}
                </button>
            </form>

            <div className="border-t border-border pt-6 space-y-3 text-center">
                {mode === "totp" ? (
                    <button
                        type="button"
                        onClick={switchToEmail}
                        disabled={sending}
                        className="block w-full text-body-sm transition-colors hover:text-foreground disabled:opacity-60"
                        style={{ color: "var(--brand-green)" }}
                    >
                        {sending ? "Sending…" : "Can't access your app? Get a code by email"}
                    </button>
                ) : (
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={sendEmailCode}
                            disabled={sending}
                            className="block w-full text-body-sm transition-colors hover:text-foreground disabled:opacity-60"
                            style={{ color: "var(--brand-green)" }}
                        >
                            {sending ? "Sending…" : "Resend code"}
                        </button>
                        <button
                            type="button"
                            onClick={switchToTotp}
                            className="block w-full text-body-sm text-foreground-muted transition-colors hover:text-foreground"
                        >
                            Use authenticator app instead
                        </button>
                    </div>
                )}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-body-sm text-foreground-muted transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                </Link>
            </div>
        </div>
    );
}

export default function TwoFactorPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-16">
            <div className="mb-10">
                <Logo size="md" />
            </div>
            <Suspense
                fallback={
                    <div className="text-body-sm text-foreground-muted animate-pulse">Loading…</div>
                }
            >
                <TwoFactorForm />
            </Suspense>
        </div>
    );
}
