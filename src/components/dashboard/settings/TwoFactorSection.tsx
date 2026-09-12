"use client";

import { useState } from "react";
import { Shield, Loader2, Check, X, Copy, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth/client";

interface TwoFactorSectionProps {
    twoFactorEnabled?: boolean;
}

type TwoFAStep = "idle" | "confirm-password" | "show-qr" | "verify-code" | "done" | "disable-confirm";

export default function TwoFactorSection({ twoFactorEnabled = false }: TwoFactorSectionProps) {
    const [is2FAEnabled, setIs2FAEnabled] = useState(twoFactorEnabled);
    const [twoFAStep, setTwoFAStep] = useState<TwoFAStep>("idle");
    const [twoFAPassword, setTwoFAPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [totpURI, setTotpURI] = useState<string | null>(null);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [verifyCode, setVerifyCode] = useState("");
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [twoFAError, setTwoFAError] = useState<string | null>(null);

    async function handleEnable2FA() {
        if (!twoFAPassword.trim()) {
            setTwoFAError("Password is required.");
            return;
        }
        setTwoFALoading(true);
        setTwoFAError(null);
        try {
            const result = await authClient.twoFactor.enable({ password: twoFAPassword });
            if (result.error) {
                setTwoFAError(result.error.message ?? "Failed to enable 2FA.");
                return;
            }
            setTotpURI((result.data as any)?.totpURI ?? null);
            setBackupCodes((result.data as any)?.backupCodes ?? []);
            setTwoFAPassword("");
            setTwoFAStep("show-qr");
        } catch (e: unknown) {
            setTwoFAError(e instanceof Error ? e.message : "Unexpected error.");
        } finally {
            setTwoFALoading(false);
        }
    }

    async function handleVerifyTotp() {
        if (verifyCode.length < 6) {
            setTwoFAError("Enter the 6-digit code from your authenticator app.");
            return;
        }
        setTwoFALoading(true);
        setTwoFAError(null);
        try {
            const result = await authClient.twoFactor.verifyTotp({ code: verifyCode });
            if (result.error) {
                setTwoFAError(result.error.message ?? "Invalid code. Please try again.");
                return;
            }
            setIs2FAEnabled(true);
            setTwoFAStep("done");
        } catch (e: unknown) {
            setTwoFAError(e instanceof Error ? e.message : "Verification failed.");
        } finally {
            setTwoFALoading(false);
        }
    }

    async function handleDisable2FA() {
        if (!twoFAPassword.trim()) {
            setTwoFAError("Password is required to disable 2FA.");
            return;
        }
        setTwoFALoading(true);
        setTwoFAError(null);
        try {
            const result = await authClient.twoFactor.disable({ password: twoFAPassword });
            if (result.error) {
                setTwoFAError(result.error.message ?? "Failed to disable 2FA.");
                return;
            }
            setIs2FAEnabled(false);
            setTwoFAPassword("");
            setTwoFAStep("idle");
        } catch (e: unknown) {
            setTwoFAError(e instanceof Error ? e.message : "Unexpected error.");
        } finally {
            setTwoFALoading(false);
        }
    }

    function resetTwoFA() {
        setTwoFAStep("idle");
        setTwoFAPassword("");
        setTotpURI(null);
        setBackupCodes([]);
        setVerifyCode("");
        setTwoFAError(null);
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).catch(() => {});
    }

    const totpSecret = totpURI
        ? new URLSearchParams(totpURI.split("?")[1] ?? "").get("secret")
        : null;

    return (
        <section className="border border-border/50 rounded-md bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" style={{ color: "var(--brand-green)" }} />
                    <h2 className="text-headline text-foreground">Two-factor authentication</h2>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    is2FAEnabled
                        ? "bg-green-500/10 text-green-600 border border-green-500/20"
                        : "bg-muted text-muted-foreground border border-border/50"
                }`}>
                    {is2FAEnabled ? "ENABLED" : "DISABLED"}
                </span>
            </div>

            {twoFAStep === "idle" && (
                <>
                    <p className="text-sm text-muted-foreground">
                        {is2FAEnabled
                            ? "TOTP-based 2FA is active. Use your authenticator app to log in."
                            : "Add an extra layer of security. Use any TOTP app (Google Authenticator, Authy, 1Password)."}
                    </p>
                    <button
                        onClick={() => { setTwoFAError(null); setTwoFAStep(is2FAEnabled ? "disable-confirm" : "confirm-password"); }}
                        className="text-sm font-bold text-primary hover:underline"
                    >
                        {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </button>
                </>
            )}

            {twoFAStep === "confirm-password" && (
                <div className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">Enter your current password to continue.</p>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={twoFAPassword}
                            onChange={(e) => setTwoFAPassword(e.target.value)}
                            placeholder="Current password"
                            className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm pr-10 outline-none focus:ring-1 focus:ring-primary transition-colors"
                            onKeyDown={(e) => e.key === "Enter" && handleEnable2FA()}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {twoFAError && <p className="text-xs text-destructive">{twoFAError}</p>}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleEnable2FA}
                            disabled={twoFALoading}
                            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {twoFALoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Continue
                        </button>
                        <button onClick={resetTwoFA} className="text-sm text-muted-foreground hover:text-foreground">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {twoFAStep === "show-qr" && totpURI && (
                <div className="space-y-5 pt-2">
                    <p className="text-sm text-muted-foreground">
                        Open your authenticator app and either scan the QR code or enter the secret key manually.
                    </p>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(totpURI)}`}
                        alt="TOTP QR Code"
                        width={180}
                        height={180}
                        className="border border-border rounded-md"
                    />

                    {totpSecret && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Manual entry key</p>
                            <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted px-3 py-2 rounded-md break-all">
                                    {totpSecret}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(totpSecret)}
                                    className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                                    title="Copy"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {backupCodes.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Backup codes — save these now</p>
                            <div className="grid grid-cols-2 gap-2 bg-muted p-4 rounded-md">
                                {backupCodes.map((code) => (
                                    <code key={code} className="text-xs">{code}</code>
                                ))}
                            </div>
                            <button
                                onClick={() => copyToClipboard(backupCodes.join("\n"))}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Copy className="w-3 h-3" /> Copy all backup codes
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => { setTwoFAStep("verify-code"); setTwoFAError(null); }}
                        className="px-6 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-md hover:bg-primary/90 transition-colors"
                    >
                        I've added it — Verify
                    </button>
                </div>
            )}

            {twoFAStep === "verify-code" && (
                <div className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code currently shown in your authenticator app to confirm setup.
                    </p>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        className="w-40 border border-input bg-background rounded-md px-3 py-2 text-sm text-center outline-none focus:ring-1 focus:ring-primary transition-colors"
                        onKeyDown={(e) => e.key === "Enter" && handleVerifyTotp()}
                    />
                    {twoFAError && <p className="text-xs text-destructive">{twoFAError}</p>}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleVerifyTotp}
                            disabled={twoFALoading || verifyCode.length < 6}
                            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {twoFALoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Confirm
                        </button>
                        <button onClick={() => setTwoFAStep("show-qr")} className="text-sm text-muted-foreground hover:text-foreground">
                            Back
                        </button>
                    </div>
                </div>
            )}

            {twoFAStep === "done" && (
                <div className="flex items-start gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-md">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-green-700">2FA is now active</p>
                        <p className="text-xs text-muted-foreground mt-1">You will need your authenticator app at each login.</p>
                    </div>
                </div>
            )}

            {twoFAStep === "disable-confirm" && (
                <div className="space-y-4 pt-2">
                    <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-md">
                        <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">Disabling 2FA reduces your account security. Enter your password to confirm.</p>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={twoFAPassword}
                            onChange={(e) => setTwoFAPassword(e.target.value)}
                            placeholder="Current password"
                            className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm pr-10 outline-none focus:ring-1 focus:ring-primary transition-colors"
                            onKeyDown={(e) => e.key === "Enter" && handleDisable2FA()}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {twoFAError && <p className="text-xs text-destructive">{twoFAError}</p>}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDisable2FA}
                            disabled={twoFALoading}
                            className="flex items-center gap-2 px-5 py-2 bg-destructive text-destructive-foreground font-bold text-sm rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
                        >
                            {twoFALoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Disable 2FA
                        </button>
                        <button onClick={resetTwoFA} className="text-sm text-muted-foreground hover:text-foreground">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
