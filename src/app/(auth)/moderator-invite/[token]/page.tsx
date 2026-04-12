"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Check, Shield, Loader2 } from "lucide-react";
import { signUp } from "@/lib/auth/client";
import { signNDA } from "@/lib/actions/nda";
import { finishAdminInvite, validateAdminInvite, setUserRole, setModeratorScope } from "@/lib/actions/auth";
import { toast } from "sonner";
import Logo from "@/components/shared/Logo";

export default function ModeratorInvitePage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [inviteError, setInviteError] = useState<string | null>(null);

    const [inviteeEmail, setInviteeEmail] = useState("");
    const [moderationScope, setModerationScope] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [signature, setSignature] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Validate the token on load
    useEffect(() => {
        async function validate() {
            try {
                const result = await validateAdminInvite(token);
                if (!result.success || !result.data) {
                    setInviteError(result.error ?? "Invalid invite link.");
                } else {
                    setInviteeEmail(result.data.email);
                    setModerationScope(result.data.moderationScope ?? null);
                }
            } catch {
                setInviteError("Could not validate invite link.");
            } finally {
                setValidating(false);
            }
        }
        validate();
    }, [token]);

    const handleAccept = async () => {
        if (!agreed || !signature || !name || !password) {
            setError("Please complete all fields.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            // 1. Create the moderator account
            const result = await signUp.email({
                name,
                email: inviteeEmail,
                password,
            });

            if (result?.error) {
                setError(result.error.message || "Failed to create account.");
                setLoading(false);
                return;
            }

            if (result?.data?.user?.id) {
                await setUserRole(result.data.user.id, "Moderator");
                if (moderationScope) {
                    await setModeratorScope(result.data.user.id, moderationScope);
                }
            }

            // 2. Sign NDA (requires active session from signUp above)
            const ndaResult = await signNDA({
                signatureName: signature,
                ndaVersion: "MOD-2025-V1",
                role: "Moderator",
                additionalDeclarations: [true],
                documentHash: "sha256-moderator-v2025-v1-placeholder",
            });

            // 3. Mark invite as used
            await finishAdminInvite(token);

            if (ndaResult.success) {
                toast.success("Welcome to the Jenga365 moderation team!");
                router.push(ndaResult.redirectTo);
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    // Loading state while validating token
    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="font-mono text-[10px] uppercase tracking-widest">Validating invite…</p>
                </div>
            </div>
        );
    }

    // Invalid token
    if (inviteError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-6 text-center">
                <Logo variant="premium" height={40} priority />
                <div className="space-y-2">
                    <h1 className="font-serif font-black text-3xl text-foreground uppercase">Invalid Link</h1>
                    <p className="text-muted-foreground text-sm max-w-sm">{inviteError}</p>
                </div>
                <a href="/login" className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold hover:underline">
                    Back to Login
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Header */}
            <header className="w-full border-b border-border py-5 px-8 flex items-center justify-between bg-background/95 backdrop-blur-md sticky top-0 z-50">
                <Logo variant="premium" height={36} priority />
                <span className="font-mono text-[8px] uppercase tracking-widest text-primary font-bold border border-primary/30 px-3 py-1">
                    Moderator Invitation
                </span>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-20">
                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Info */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-8 bg-primary" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Invitation</span>
                            </div>
                            <h1 className="font-serif font-black text-4xl text-foreground uppercase tracking-tighter leading-none">
                                Join the<br />
                                <span className="text-primary italic">Governance Team.</span>
                            </h1>
                        </div>

                        <p className="font-sans font-light text-muted-foreground leading-relaxed">
                            You have been invited to serve as a Moderator on the Jenga365 platform. Your role is critical in maintaining the safety and integrity of our community.
                        </p>

                        <div className="jenga-card p-6 space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                            <h3 className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Assigned Scope
                            </h3>
                            <p className="font-serif font-bold text-foreground">
                                {moderationScope ? `Scope ${moderationScope}` : "Community Moderation"}
                            </p>
                            <ul className="space-y-2">
                                {[
                                    "Monitor community discussions",
                                    "Approve or reject user profiles",
                                    "Enforce Jenga365 safety standards",
                                ].map((item) => (
                                    <li key={item} className="flex gap-3 items-start">
                                        <span className="material-symbols-outlined text-sm text-primary mt-0.5">adjust</span>
                                        <span className="font-sans font-light text-sm text-muted-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-4 border border-border/50 bg-muted/30 text-sm text-muted-foreground font-mono">
                            Invited to: <span className="text-foreground font-bold">{inviteeEmail}</span>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="jenga-card p-8 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

                        {step === 1 ? (
                            <div className="space-y-6">
                                <h2 className="font-serif font-black text-2xl text-foreground uppercase tracking-tight">
                                    Set Up Your Account
                                </h2>

                                <div className="space-y-2">
                                    <label className="jenga-label">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="jenga-input w-full"
                                        placeholder="Your full name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="jenga-label">Email Address</label>
                                    <input
                                        type="email"
                                        value={inviteeEmail}
                                        readOnly
                                        className="jenga-input w-full opacity-60 cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="jenga-label">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="jenga-input w-full"
                                        placeholder="Min. 8 characters"
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        if (!name || !password) { setError("Please complete all fields."); return; }
                                        setError(null);
                                        setStep(2);
                                    }}
                                    className="w-full h-12 bg-foreground text-background font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-primary transition-all flex items-center justify-center gap-2"
                                >
                                    Continue to Agreement <ArrowRight size={14} />
                                </button>
                                {error && <p className="text-destructive text-xs font-mono">{error}</p>}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h2 className="font-serif font-black text-2xl text-foreground uppercase tracking-tight">
                                    Moderator Agreement
                                </h2>

                                <div className="h-32 overflow-y-auto bg-muted/30 border border-border p-4 text-xs text-muted-foreground leading-relaxed font-sans italic">
                                    As a Moderator, you will have access to private user data, including contact information and mentorship records. You agree to never disclose this information, export data for personal gain, or abuse your moderation privileges. Your account activities are monitored by the SuperAdmin team.
                                </div>

                                <label className="flex gap-4 cursor-pointer items-start group">
                                    <div className={`mt-1 w-5 h-5 border flex items-center justify-center shrink-0 transition-colors ${agreed ? "bg-primary border-primary" : "border-border group-hover:border-foreground"}`}>
                                        {agreed && <Check className="w-3 h-3 text-background" strokeWidth={4} />}
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="absolute opacity-0 w-0 h-0"
                                        />
                                    </div>
                                    <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                                        I agree to the Moderator Code of Conduct and Confidentiality Terms.
                                    </span>
                                </label>

                                <div className="space-y-1.5">
                                    <label className="jenga-label">Digital Signature</label>
                                    <input
                                        type="text"
                                        value={signature}
                                        onChange={(e) => setSignature(e.target.value)}
                                        className="jenga-input w-full"
                                        placeholder="Type your full name to sign"
                                    />
                                </div>

                                {error && <p className="text-destructive text-xs font-mono">{error}</p>}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-5 h-12 border border-border font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-muted transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleAccept}
                                        disabled={!agreed || !signature || loading}
                                        className="flex-1 h-12 bg-primary text-background font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-foreground transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Accept Role <ArrowRight size={14} /></>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
