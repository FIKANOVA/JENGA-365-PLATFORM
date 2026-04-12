"use client";

import { useState } from "react";
import { Save, Download, Shield, User, Loader2, Check, X, Copy, Eye, EyeOff } from "lucide-react";
import { updateProfile, requestDataExport } from "@/lib/actions/settings";
import { authClient } from "@/lib/auth/client";

interface SettingsPageProps {
    initialName?: string;
    initialEmail?: string;
    twoFactorEnabled?: boolean;
}

// ── 2FA setup states ─────────────────────────────────────────────────────────
type TwoFAStep = "idle" | "confirm-password" | "show-qr" | "verify-code" | "done" | "disable-confirm";

export default function SettingsPage({
    initialName = "",
    initialEmail = "",
    twoFactorEnabled = false,
}: SettingsPageProps) {
    // Profile
    const [name, setName] = useState(initialName);
    const [locationRegion, setLocationRegion] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [exporting, setExporting] = useState(false);

    // 2FA
    const [is2FAEnabled, setIs2FAEnabled] = useState(twoFactorEnabled);
    const [twoFAStep, setTwoFAStep] = useState<TwoFAStep>("idle");
    const [twoFAPassword, setTwoFAPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [totpURI, setTotpURI] = useState<string | null>(null);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [verifyCode, setVerifyCode] = useState("");
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [twoFAError, setTwoFAError] = useState<string | null>(null);

    async function handleSaveProfile(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile({ name, locationRegion: locationRegion || undefined });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    async function handleExport() {
        setExporting(true);
        try {
            const data = await requestDataExport();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `jenga365-data-export-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        } finally {
            setExporting(false);
        }
    }

    // ── 2FA enable flow ───────────────────────────────────────────────────────

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
        } catch (e: any) {
            setTwoFAError(e?.message ?? "Unexpected error.");
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
        } catch (e: any) {
            setTwoFAError(e?.message ?? "Verification failed.");
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
        } catch (e: any) {
            setTwoFAError(e?.message ?? "Unexpected error.");
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

    // Extract the TOTP secret from the URI for manual entry
    const totpSecret = totpURI
        ? new URLSearchParams(totpURI.split("?")[1] ?? "").get("secret")
        : null;

    return (
        <div className="flex-1 bg-background h-full overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6 md:p-10 space-y-10">
                <div>
                    <h1 className="font-playfair text-3xl font-black text-foreground mb-1">Account Settings</h1>
                    <p className="text-muted-foreground font-mono text-sm">Manage your profile and security preferences.</p>
                </div>

                {/* ── Profile ──────────────────────────────────────────────── */}
                <section className="border border-border/50 rounded-lg bg-card p-6 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-primary" />
                        <h2 className="font-playfair text-xl font-bold text-foreground">Profile</h2>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div>
                            <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={initialEmail}
                                disabled
                                className="w-full border border-input bg-muted rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground font-mono mt-1">Email cannot be changed here.</p>
                        </div>

                        <div>
                            <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                Location / Region
                            </label>
                            <input
                                type="text"
                                value={locationRegion}
                                onChange={(e) => setLocationRegion(e.target.value)}
                                placeholder="e.g. Nairobi, Kenya"
                                className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {saved ? "Saved!" : "Save Changes"}
                        </button>
                    </form>
                </section>

                {/* ── 2FA ──────────────────────────────────────────────────── */}
                <section className="border border-border/50 rounded-lg bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-primary" />
                            <h2 className="font-playfair text-xl font-bold text-foreground">Two-Factor Authentication</h2>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold ${
                            is2FAEnabled
                                ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                : "bg-muted text-muted-foreground border border-border/50"
                        }`}>
                            {is2FAEnabled ? "ENABLED" : "DISABLED"}
                        </span>
                    </div>

                    {/* idle — show enable/disable trigger */}
                    {twoFAStep === "idle" && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                {is2FAEnabled
                                    ? "TOTP-based 2FA is active. Use your authenticator app to log in."
                                    : "Add an extra layer of security. Use any TOTP app (Google Authenticator, Authy, 1Password)."}
                            </p>
                            <button
                                onClick={() => { setTwoFAError(null); setTwoFAStep(is2FAEnabled ? "disable-confirm" : "confirm-password"); }}
                                className="text-sm font-bold text-primary hover:underline font-mono"
                            >
                                {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                            </button>
                        </>
                    )}

                    {/* confirm-password — enter password to start setup */}
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
                            {twoFAError && <p className="text-xs text-destructive font-mono">{twoFAError}</p>}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleEnable2FA}
                                    disabled={twoFALoading}
                                    className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {twoFALoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Continue
                                </button>
                                <button onClick={resetTwoFA} className="text-sm font-mono text-muted-foreground hover:text-foreground">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* show-qr — display TOTP URI for scanning */}
                    {twoFAStep === "show-qr" && totpURI && (
                        <div className="space-y-5 pt-2">
                            <p className="text-sm text-muted-foreground">
                                Open your authenticator app and either scan the QR code or enter the secret key manually.
                            </p>

                            {/* QR code via Google Charts API — no package required */}
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
                                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Manual entry key</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs bg-muted px-3 py-2 rounded-md font-mono tracking-widest break-all">
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
                                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Backup codes — save these now</p>
                                    <div className="grid grid-cols-2 gap-2 bg-muted p-4 rounded-md">
                                        {backupCodes.map((code) => (
                                            <code key={code} className="text-xs font-mono tracking-widest">{code}</code>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(backupCodes.join("\n"))}
                                        className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
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

                    {/* verify-code — confirm the user scanned correctly */}
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
                                className="w-40 border border-input bg-background rounded-md px-3 py-2 text-sm text-center font-mono tracking-[0.4em] outline-none focus:ring-1 focus:ring-primary transition-colors"
                                onKeyDown={(e) => e.key === "Enter" && handleVerifyTotp()}
                            />
                            {twoFAError && <p className="text-xs text-destructive font-mono">{twoFAError}</p>}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleVerifyTotp}
                                    disabled={twoFALoading || verifyCode.length < 6}
                                    className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {twoFALoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Confirm
                                </button>
                                <button onClick={() => setTwoFAStep("show-qr")} className="text-sm font-mono text-muted-foreground hover:text-foreground">
                                    Back
                                </button>
                            </div>
                        </div>
                    )}

                    {/* done */}
                    {twoFAStep === "done" && (
                        <div className="flex items-start gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-md">
                            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-green-700">2FA is now active</p>
                                <p className="text-xs text-muted-foreground mt-1">You will need your authenticator app at each login.</p>
                            </div>
                        </div>
                    )}

                    {/* disable-confirm */}
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
                            {twoFAError && <p className="text-xs text-destructive font-mono">{twoFAError}</p>}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDisable2FA}
                                    disabled={twoFALoading}
                                    className="flex items-center gap-2 px-5 py-2 bg-destructive text-destructive-foreground font-bold text-sm rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
                                >
                                    {twoFALoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Disable 2FA
                                </button>
                                <button onClick={resetTwoFA} className="text-sm font-mono text-muted-foreground hover:text-foreground">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* ── GDPR Data Export ─────────────────────────────────────── */}
                <section className="border border-border/50 rounded-lg bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Download className="w-5 h-5 text-primary" />
                        <h2 className="font-playfair text-xl font-bold text-foreground">Data Export (GDPR)</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Download a full copy of all data Jenga365 holds about your account.
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-6 py-2 border border-border/50 text-foreground font-bold text-sm rounded-md hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {exporting ? "Preparing export…" : "Download My Data"}
                    </button>
                </section>
            </div>
        </div>
    );
}
