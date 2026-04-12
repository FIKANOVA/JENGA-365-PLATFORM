"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Key, Check, Loader2, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { signNDA } from "@/lib/actions/nda";
import { validateAdminInvite, finishAdminInvite } from "@/lib/actions/auth";
import { toast } from "sonner";

// This is the temporary bootstrap password from the seed script
const BOOTSTRAP_PASS = "TempPass123!@#";

export default function AdminSetupPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // User info from token
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    // Form state (The new password chosen by the admin)
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // 2FA state
    const [twoFactorToken, setTwoFactorToken] = useState("");
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);

    // NDA state
    const [ndaAgreed, setNdaAgreed] = useState(false);
    const [digitalSignature, setDigitalSignature] = useState("");

    const steps = [
        { id: 1, label: "Account Setup", icon: <Lock className="w-4 h-4" /> },
        { id: 2, label: "2FA Security", icon: <Key className="w-4 h-4" /> },
        { id: 3, label: "Admin NDA", icon: <Shield className="w-4 h-4" /> }
    ];

    // Validate token on mount
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
            // 1. Sign in with the temporary bootstrap password to get a session
            const signInRes = await authClient.signIn.email({
                email: email,
                password: BOOTSTRAP_PASS,
            });

            if (signInRes.error) {
                throw new Error("Bootstrap authentication failed. Contact developer.");
            }

            // 2. Change the password from bootstrap to the admin's chosen password
            const changePassRes = await authClient.changePassword({
                newPassword: password,
                currentPassword: BOOTSTRAP_PASS,
                revokeOtherSessions: true,
            });

            if (changePassRes.error) {
                throw new Error(changePassRes.error.message || "Password change failed.");
            }

            // 3. Mark the invite as completed/used on the server
            await finishAdminInvite(token);

            // 4. Trigger 2FA setup (now that we have a secure session)
            const twoFactorRes = await authClient.twoFactor.enable({
                password: password
            });

            if (twoFactorRes.data) {
                setQrCode(twoFactorRes.data.totpURI);
                // Extract secret from totpURI if possible as a fallback
                const secretMatch = twoFactorRes.data.totpURI.match(/secret=([^&]+)/);
                if (secretMatch) setTwoFactorSecret(secretMatch[1]);
                
                setStep(2);
                toast.success("Account initialized. Please set up 2FA.");
            } else {
                throw new Error("Failed to initialize 2FA security.");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to setup account");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTwoFactorVerify = async () => {
        setIsLoading(true);
        try {
            const res = await authClient.twoFactor.verifyTotp({
                code: twoFactorToken
            });
            if (res.error) throw new Error(res.error.message || "Invalid code");
            setStep(3);
            toast.success("2FA Verified");
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
                documentHash: "admin-hash-placeholder",
            });
            if (res.success) {
                toast.success("SuperAdmin Setup Complete");
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
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#006600] mx-auto" />
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Verifying Invitation...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white border border-border p-12 text-center space-y-6">
                    <AlertCircle className="w-16 h-16 text-[#BB0000] mx-auto" />
                    <h1 className="text-3xl font-black font-playfair">Invitation Error</h1>
                    <p className="text-muted-foreground">{error}</p>
                    <button onClick={() => router.push("/")} className="w-full py-4 bg-[#1A1A1A] text-white font-mono text-xs uppercase tracking-widest">
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex flex-col font-lato">
            <header className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center border-b border-border bg-white z-50">
                <div className="text-2xl font-black font-playfair tracking-tighter">
                    JENGA<span className="text-[#006600]">365</span> <span className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground ml-4">ADMIN PROMPT</span>
                </div>
                <div className="flex gap-4">
                    {steps.map(s => (
                        <div key={s.id} className={`flex items-center gap-2 ${s.id === step ? "text-[#006600]" : "text-[#D0CBC0]"}`}>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                                ${s.id < step ? "bg-[#006600] border-[#006600] text-white" : s.id === step ? "border-[#006600]" : "border-[#D0CBC0]"}`}>
                                {s.id < step ? <Check className="w-4 h-4" /> : s.icon}
                            </div>
                            <span className="text-[10px] uppercase font-mono tracking-widest hidden md:block">{s.label}</span>
                        </div>
                    ))}
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 pt-32">
                <div className="max-w-xl w-full bg-white border border-border shadow-xl p-12 space-y-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h1 className="text-4xl font-black font-playfair">Initialise SuperAdmin</h1>
                                <p className="text-muted-foreground">Welcome, <span className="text-[#006600] font-bold">{name}</span>. Please set your administrative credentials to begin setup for <span className="font-bold underline">{email}</span>.</p>
                                <form onSubmit={handleAccountSetup} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="font-mono text-[10px] uppercase">Master Password</label>
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#FAFAF8] border border-border p-4 outline-none focus:border-[#006600]" placeholder="Minimum 8 characters" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-mono text-[10px] uppercase">Confirm Master Password</label>
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-[#FAFAF8] border border-border p-4 outline-none focus:border-[#006600]" />
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#006600] text-white font-mono text-xs uppercase tracking-[0.2em] font-bold mt-4 disabled:opacity-50">
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Next Phase"}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center">
                                <h1 className="text-4xl font-black font-playfair">Secure Your Access</h1>
                                <p className="text-muted-foreground">SuperAdmin accounts require mandatory Two-Factor Authentication.</p>
                                <div className="bg-[#FAFAF8] p-6 border border-dashed border-border flex flex-col items-center gap-4">
                                    {qrCode ? (
                                        <div className="bg-white p-2">
                                            {/* Using Google Charts as it's more stable for TOTP URIs */}
                                            <img 
                                                src={`https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(qrCode)}&choe=UTF-8`} 
                                                alt="2FA QR" 
                                                className="w-48 h-48" 
                                                onError={(e) => {
                                                    // Fallback to qrserver if google fails
                                                    e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`;
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-48 h-48 bg-gray-200 animate-pulse flex items-center justify-center text-[10px] font-mono text-gray-400">LOADING QR...</div>
                                    )}
                                    <div className="text-center space-y-2">
                                        <p className="text-[10px] font-mono text-[#8A8A8A]">Scan this with Google Authenticator or Authy</p>
                                        
                                        {twoFactorSecret && (
                                            <details className="cursor-pointer">
                                                <summary className="text-[9px] font-mono text-[#BB0000] uppercase hover:underline">Can&apos;t scan? View Manual Key</summary>
                                                <div className="mt-2 p-2 bg-white border border-border font-mono text-xs break-all select-all">
                                                    {twoFactorSecret}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="font-mono text-[10px] uppercase">Verification Code</label>
                                    <input type="text" value={twoFactorToken} onChange={e => setTwoFactorToken(e.target.value)} placeholder="000000" className="w-full bg-[#FAFAF8] border border-border p-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-[#006600]" maxLength={6} />
                                </div>
                                <button onClick={handleTwoFactorVerify} disabled={isLoading || twoFactorToken.length < 6} className="w-full py-4 bg-[#006600] text-white font-mono text-xs uppercase tracking-[0.2em] font-bold disabled:opacity-50">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Verify Security"}
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="bg-[#F0FFF4] text-[#006600] font-mono text-[10px] p-4 flex items-center gap-3">
                                    <Shield className="w-4 h-4" /> MANDATORY ADMINISTRATIVE NDA — VERSION ADMIN.2025.A
                                </div>
                                <h1 className="text-4xl font-black font-playfair">Final Safeguard</h1>
                                <div className="h-48 overflow-y-scroll bg-[#FAFAF8] border border-border p-4 text-xs italic text-muted-foreground leading-relaxed">
                                    As a SuperAdmin, you will have unrestricted access to all platform data, user sessions, and financial records. You solemnly swear to uphold the Jenga365 Charter of Ethics, maintain total confidentiality, and never export platform data for unauthorized use. Your actions are logged and audit-trailed in real-time.
                                </div>
                                <label className="flex gap-4 cursor-pointer">
                                    <input type="checkbox" checked={ndaAgreed} onChange={e => setNdaAgreed(e.target.checked)} className="mt-1" />
                                    <span className="text-[11px]">I accept full legal responsibility for my actions as a SuperAdmin.</span>
                                </label>
                                <div className="space-y-2">
                                    <label className="font-mono text-[10px] uppercase">Administrative Signature</label>
                                    <input type="text" value={digitalSignature} onChange={e => setDigitalSignature(e.target.value)} placeholder="Type Master Signature" className="w-full bg-[#FAFAF8] border border-border p-4 outline-none focus:border-[#006600] font-mono uppercase" />
                                </div>
                                <button onClick={handleNDASign} disabled={isLoading || !ndaAgreed || !digitalSignature} className="w-full py-4 bg-[#006600] text-white font-mono text-xs uppercase tracking-[0.2em] font-bold disabled:opacity-50">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Authorise & Enter"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
