"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    Lock,
    Key,
    Check,
    Loader2,
    AlertTriangle,
} from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { signNDA } from "@/lib/actions/nda";
import { validateAdminInvite, finishAdminInvite } from "@/lib/actions/auth";
import { bootstrapAdminSetPassword } from "@/lib/actions/adminBootstrap";
import { toast } from "sonner";
import Logo from "@/components/shared/Logo";

const INPUT_CLASS =
    "h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none";

export default function AdminSetupPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [twoFactorToken, setTwoFactorToken] = useState("");
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);

    const [ndaAgreed, setNdaAgreed] = useState(false);
    const [digitalSignature, setDigitalSignature] = useState("");

    const steps = [
        { id: 1, label: "Account", icon: Lock },
        { id: 2, label: "2FA", icon: Key },
        { id: 3, label: "Admin NDA", icon: Shield },
    ] as const;

    useEffect(() => {
        const checkToken = async () => {
            if (!token) return;
            try {
                const res = await validateAdminInvite(token);
                if (res.success && res.data) {
                    setEmail(res.data.email);
                    setName(res.data.name || "");
                    setIsValidating(false);
                } else {
                    setError(res.error || "Invalid invitation link.");
                    setIsValidating(false);
                }
            } catch (err: any) {
                setError(err.message || "Failed to validate invite.");
                setIsValidating(false);
            }
        };
        checkToken();
    }, [token]);

    const handleAccountSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) return toast.error("Password must be at least 8 characters");
        if (password !== confirmPassword) return toast.error("Passwords do not match");

        setIsLoading(true);
        try {
            await bootstrapAdminSetPassword(email, password);
            await finishAdminInvite(token);

            const twoFactorRes = await authClient.twoFactor.enable({ password });

            if (twoFactorRes.data) {
                setQrCode(twoFactorRes.data.totpURI);
                const secretMatch = twoFactorRes.data.totpURI.match(/secret=([^&]+)/);
                if (secretMatch) setTwoFactorSecret(secretMatch[1]);
                setStep(2);
                toast.success("Account initialized. Please set up 2FA.");
            } else {
                throw new Error("Failed to initialize 2FA security.");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to set up account");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTwoFactorVerify = async () => {
        setIsLoading(true);
        try {
            const res = await authClient.twoFactor.verifyTotp({ code: twoFactorToken });
            if (res.error) throw new Error(res.error.message || "Invalid code");
            setStep(3);
            toast.success("2FA verified");
        } catch (err: any) {
            toast.error(err.message || "Invalid verification code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNDASign = async () => {
        setIsLoading(true);
        try {
            const res = await signNDA({
                signatureName: digitalSignature,
                ndaVersion: "ADMIN-2025-V1",
                role: "SuperAdmin",
                additionalDeclarations: [true],
                documentHash: "f4b8a0f249c98c013ace7ef4f0da3a5050cfb2a3900b7866dce9aff2c0e7f3ac",
            });
            if (res.success) {
                toast.success("SuperAdmin setup complete");
                router.push("/dashboard/admin");
            } else {
                throw new Error("NDA signing failed");
            }
        } catch (err: any) {
            toast.error(err.message || "NDA signing failed");
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidating) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-foreground-muted">
                    <Loader2
                        className="h-8 w-8 animate-spin"
                        style={{ color: "var(--brand-green)" }}
                    />
                    <p className="text-body-sm">Verifying invitation…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
                <div
                    className="max-w-md w-full rounded-md border border-border bg-background p-10 text-center space-y-5"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                >
                    <AlertTriangle
                        className="h-10 w-10 mx-auto"
                        style={{ color: "var(--brand-red)" }}
                    />
                    <div className="space-y-2">
                        <h1 className="text-display-sm text-foreground">Invitation error</h1>
                        <p className="text-body-sm text-foreground-muted">{error}</p>
                    </div>
                    <button
                        onClick={() => router.push("/")}
                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-foreground text-background text-label font-medium transition-opacity hover:opacity-90"
                    >
                        Return home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <Logo size="md" />
                    <nav
                        aria-label="Setup progress"
                        className="hidden sm:flex items-center gap-4"
                    >
                        {steps.map((s) => {
                            const Icon = s.icon;
                            const done = s.id < step;
                            const active = s.id === step;
                            const palette = done
                                ? {
                                      background: "var(--brand-green)",
                                      color: "var(--brand-green-fg)",
                                  }
                                : active
                                  ? {
                                        background: "var(--brand-green-soft)",
                                        color: "var(--brand-green)",
                                    }
                                  : {
                                        background: "var(--surface-2)",
                                        color: "var(--foreground-subtle)",
                                    };
                            return (
                                <span key={s.id} className="flex items-center gap-2">
                                    <span
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                                        style={palette}
                                    >
                                        {done ? (
                                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                        ) : (
                                            <Icon className="h-3.5 w-3.5" />
                                        )}
                                    </span>
                                    <span
                                        className={`text-eyebrow ${
                                            active
                                                ? "text-foreground"
                                                : "text-foreground-muted"
                                        }`}
                                    >
                                        {s.label}
                                    </span>
                                </span>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
                <div
                    className="max-w-xl w-full rounded-md border border-border bg-background p-8 lg:p-12 space-y-8"
                    style={{ boxShadow: "var(--shadow-lg)" }}
                >
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-6"
                            >
                                <header className="space-y-2">
                                    <p
                                        className="text-eyebrow"
                                        style={{ color: "var(--brand-green)" }}
                                    >
                                        Step 1 · Account setup
                                    </p>
                                    <h1 className="text-display-sm text-foreground">
                                        Initialise SuperAdmin
                                    </h1>
                                    <p className="text-body-sm text-foreground-muted">
                                        Welcome,{" "}
                                        <span className="font-medium text-foreground">
                                            {name}
                                        </span>
                                        . Set your administrative credentials for{" "}
                                        <span className="font-medium text-foreground">
                                            {email}
                                        </span>
                                        .
                                    </p>
                                </header>

                                <form onSubmit={handleAccountSetup} className="space-y-4">
                                    <label className="block space-y-1.5">
                                        <span className="text-label text-foreground">
                                            Master password
                                        </span>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className={INPUT_CLASS}
                                            placeholder="Minimum 8 characters"
                                            autoComplete="new-password"
                                        />
                                    </label>
                                    <label className="block space-y-1.5">
                                        <span className="text-label text-foreground">
                                            Confirm master password
                                        </span>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className={INPUT_CLASS}
                                            autoComplete="new-password"
                                        />
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                        style={{ background: "var(--brand-green)" }}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Next phase"
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-6"
                            >
                                <header className="space-y-2 text-center">
                                    <p
                                        className="text-eyebrow"
                                        style={{ color: "var(--brand-green)" }}
                                    >
                                        Step 2 · Two-factor authentication
                                    </p>
                                    <h1 className="text-display-sm text-foreground">
                                        Secure your access
                                    </h1>
                                    <p className="text-body-sm text-foreground-muted">
                                        SuperAdmin accounts require mandatory 2FA.
                                    </p>
                                </header>

                                <div
                                    className="rounded-md border border-border p-5 flex flex-col items-center gap-4"
                                    style={{ background: "var(--surface-1)" }}
                                >
                                    {qrCode ? (
                                        <div className="rounded-md bg-white p-2">
                                            <img
                                                src={`https://chart.googleapis.com/chart?chs=240x240&cht=qr&chl=${encodeURIComponent(qrCode)}&choe=UTF-8`}
                                                alt="2FA QR"
                                                className="h-44 w-44"
                                                onError={(e) => {
                                                    e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrCode)}`;
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="h-44 w-44 animate-pulse rounded-md flex items-center justify-center text-body-sm text-foreground-subtle"
                                            style={{ background: "var(--surface-2)" }}
                                        >
                                            Loading QR…
                                        </div>
                                    )}
                                    <div className="text-center space-y-2">
                                        <p className="text-body-sm text-foreground-muted">
                                            Scan with Google Authenticator or Authy
                                        </p>

                                        {twoFactorSecret && (
                                            <details className="cursor-pointer">
                                                <summary
                                                    className="text-eyebrow hover:underline"
                                                    style={{ color: "var(--brand-green)" }}
                                                >
                                                    Can&apos;t scan? View manual key
                                                </summary>
                                                <div
                                                    className="mt-2 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs break-all select-all text-foreground"
                                                >
                                                    {twoFactorSecret}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                </div>

                                <label className="block space-y-1.5">
                                    <span className="text-label text-foreground">
                                        Verification code
                                    </span>
                                    <input
                                        type="text"
                                        value={twoFactorToken}
                                        onChange={(e) => setTwoFactorToken(e.target.value)}
                                        placeholder="000000"
                                        className="h-12 w-full rounded-md border border-border bg-background px-3 text-center text-xl tracking-[0.5em] text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none"
                                        maxLength={6}
                                    />
                                </label>

                                <button
                                    onClick={handleTwoFactorVerify}
                                    disabled={isLoading || twoFactorToken.length < 6}
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Verify security"
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-6"
                            >
                                <div
                                    className="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-eyebrow"
                                    style={{
                                        background: "var(--brand-green-soft)",
                                        color: "var(--brand-green)",
                                    }}
                                >
                                    <Shield className="h-3 w-3" /> Admin NDA · ADMIN.2025.A
                                </div>
                                <h1 className="text-display-sm text-foreground">
                                    Final safeguard
                                </h1>
                                <div
                                    className="max-h-48 overflow-y-auto rounded-md border border-border px-4 py-3 text-body-sm text-foreground-muted leading-relaxed"
                                    style={{ background: "var(--surface-1)" }}
                                >
                                    As a SuperAdmin, you will have unrestricted access to all
                                    platform data, user sessions, and financial records. You
                                    solemnly swear to uphold the Jenga365 Charter of Ethics,
                                    maintain total confidentiality, and never export platform
                                    data for unauthorized use. Your actions are logged and
                                    audit-trailed in real-time.
                                </div>
                                <label className="flex gap-3 cursor-pointer items-start">
                                    <span
                                        className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border transition-colors shrink-0 ${
                                            ndaAgreed
                                                ? "border-transparent"
                                                : "border-border bg-background"
                                        }`}
                                        style={
                                            ndaAgreed
                                                ? { background: "var(--brand-green)" }
                                                : undefined
                                        }
                                    >
                                        {ndaAgreed && (
                                            <Check
                                                className="h-3.5 w-3.5"
                                                strokeWidth={3}
                                                style={{ color: "var(--brand-green-fg)" }}
                                            />
                                        )}
                                        <input
                                            type="checkbox"
                                            checked={ndaAgreed}
                                            onChange={(e) => setNdaAgreed(e.target.checked)}
                                            className="sr-only"
                                        />
                                    </span>
                                    <span className="text-body-sm text-foreground-muted leading-relaxed">
                                        I accept full legal responsibility for my actions as a
                                        SuperAdmin.
                                    </span>
                                </label>
                                <label className="block space-y-1.5">
                                    <span className="text-label text-foreground">
                                        Administrative signature
                                    </span>
                                    <input
                                        type="text"
                                        value={digitalSignature}
                                        onChange={(e) => setDigitalSignature(e.target.value)}
                                        placeholder="Type your full legal name"
                                        className={INPUT_CLASS}
                                    />
                                </label>
                                <button
                                    onClick={handleNDASign}
                                    disabled={isLoading || !ndaAgreed || !digitalSignature}
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Authorise & enter"
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
