"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, Shield, Loader2 } from "lucide-react";
import { signUp } from "@/lib/auth/client";
import { signNDA } from "@/lib/actions/nda";
import {
    finishAdminInvite,
    validateAdminInvite,
    setUserRole,
    setModeratorScope,
} from "@/lib/actions/auth";
import { toast } from "sonner";
import Logo from "@/components/shared/Logo";
import Turnstile from "@/components/shared/Turnstile";

const INPUT_CLASS =
    "h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none";

const SCOPE_DUTIES: Record<string, string[]> = {
    mentor_applications: [
        "Review mentor applications",
        "Approve or reject mentor profiles",
        "Enforce welfare and safeguarding standards",
    ],
    corporate: [
        "Review corporate partner applications",
        "Audit Engine B milestones and unlocks",
        "Coordinate with M&E team on ESG data",
    ],
    content: [
        "Moderate community discussions",
        "Publish or unpublish articles and resources",
        "Manage merchandise and editorial copy",
    ],
    all: [
        "Full SuperAdmin authority across all scopes",
        "Issue moderator invites and access shadow view",
        "Approve sensitive policy actions",
    ],
};

function dutiesFor(scope: string | null): string[] {
    if (scope && SCOPE_DUTIES[scope]) return SCOPE_DUTIES[scope];
    return [
        "Monitor community discussions",
        "Approve or reject user profiles",
        "Enforce Jenga365 safety standards",
    ];
}

export default function ModeratorInvitePage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [validating, setValidating] = useState(true);
    const [inviteError, setInviteError] = useState<string | null>(null);


    const [inviteeEmail, setInviteeEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<string>("Moderator");
    const [moderationScope, setModerationScopeValue] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [signature, setSignature] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function validate() {
            try {
                const result = await validateAdminInvite(token);
                if (!result.success || !result.data) {
                    setInviteError(result.error ?? "Invalid invite link.");
                } else {
                    setInviteeEmail(result.data.email);
                    setModerationScopeValue(result.data.moderationScope ?? null);
                    if (result.data.role) {
                        setInviteRole(result.data.role);
                    }
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
                const roleToSet = (inviteRole as "Moderator" | "SuperAdmin") || "Moderator";
                await setUserRole(result.data.user.id, roleToSet);
                if (moderationScope && roleToSet === "Moderator") {
                    await setModeratorScope(result.data.user.id, moderationScope);
                }
            }

            const ndaResult = await signNDA({
                signatureName: signature,
                ndaVersion: "MOD-2025-V1",
                role: inviteRole === "SuperAdmin" ? "SuperAdmin" : "Moderator",
                additionalDeclarations: [true],
                documentHash: "5d993e7646468b440ed9f4ed1408b34963bff3ebb1fc978e7ded013dd65d0b33",
            });

            await finishAdminInvite(token);

            if (ndaResult.success) {
                toast.success("Welcome to the Jenga365 moderation team");
                router.push(ndaResult.redirectTo);
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3 text-foreground-muted">
                    <Loader2 className="h-7 w-7 animate-spin" />
                    <p className="text-body-sm">Validating invite…</p>
                </div>
            </div>
        );
    }

    if (inviteError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-6 text-center">
                <Logo size="md" />
                <div className="space-y-2">
                    <h1 className="text-display-sm text-foreground">Invalid link</h1>
                    <p className="text-body-sm text-foreground-muted max-w-sm">
                        {inviteError}
                    </p>
                </div>
                <a
                    href="/login"
                    className="text-label font-medium hover:underline"
                    style={{ color: "var(--brand-green)" }}
                >
                    Back to login
                </a>
            </div>
        );
    }

    const scopeLabel = moderationScope
        ? moderationScope === "mentor_applications"
            ? "Mentor applications"
            : moderationScope === "corporate"
              ? "Corporate partners"
              : moderationScope === "content"
                ? "Content & editorial"
                : moderationScope === "all"
                  ? "SuperAdmin"
                  : moderationScope
        : "Community moderation";

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <Logo size="md" />
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-eyebrow"
                        style={{
                            background: "var(--brand-green-soft)",
                            color: "var(--brand-green)",
                        }}
                    >
                        <Shield className="h-3 w-3" /> Moderator invitation
                    </span>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
                    {/* Left — info */}
                    <section className="space-y-6">
                        <div className="space-y-3">
                            <p
                                className="text-eyebrow"
                                style={{ color: "var(--brand-green)" }}
                            >
                                Invitation
                            </p>
                            <h1 className="text-display-sm text-foreground">
                                Join the governance team
                            </h1>
                            <p className="text-body text-foreground-muted">
                                You&apos;ve been invited to serve as a moderator on Jenga365. Your
                                role is critical in maintaining the safety and integrity of our
                                community.
                            </p>
                        </div>

                        <div
                            className="rounded-md border border-border bg-background p-6 space-y-3"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <div className="flex items-center gap-2">
                                <Shield
                                    className="h-4 w-4"
                                    style={{ color: "var(--brand-green)" }}
                                />
                                <span className="text-eyebrow text-foreground-muted">
                                    Assigned scope
                                </span>
                            </div>
                            <p className="text-title text-foreground">{scopeLabel}</p>
                            <ul className="space-y-2 pt-1">
                                {dutiesFor(moderationScope).map((item) => (
                                    <li key={item} className="flex gap-2.5 items-start">
                                        <Check
                                            className="h-4 w-4 mt-0.5 shrink-0"
                                            style={{ color: "var(--brand-green)" }}
                                        />
                                        <span className="text-body-sm text-foreground-muted">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div
                            className="rounded-md border border-border px-4 py-3 text-body-sm text-foreground-muted"
                            style={{ background: "var(--surface-1)" }}
                        >
                            Invited to:{" "}
                            <span className="font-medium text-foreground">{inviteeEmail}</span>
                        </div>
                    </section>

                    {/* Right — form */}
                    <section
                        className="rounded-md border border-border bg-background p-6 lg:p-8 space-y-6"
                        style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                        {step === 1 ? (
                            <>
                                <header className="space-y-1">
                                    <h2 className="text-headline text-foreground">
                                        Set up your account
                                    </h2>
                                    <p className="text-body-sm text-foreground-muted">
                                        Create credentials for your moderator account.
                                    </p>
                                </header>

                                <div className="space-y-4">
                                    <label className="block space-y-1.5">
                                        <span className="text-label text-foreground">Full name</span>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className={INPUT_CLASS}
                                            placeholder="Your full name"
                                        />
                                    </label>

                                    <label className="block space-y-1.5">
                                        <span className="text-label text-foreground">Email</span>
                                        <input
                                            type="email"
                                            value={inviteeEmail}
                                            readOnly
                                            className={`${INPUT_CLASS} cursor-not-allowed opacity-70`}
                                        />
                                    </label>

                                    <label className="block space-y-1.5">
                                        <span className="text-label text-foreground">Password</span>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={INPUT_CLASS}
                                            placeholder="Min. 8 characters"
                                            autoComplete="new-password"
                                        />
                                    </label>
                                </div>

                                {error && (
                                    <p
                                        role="alert"
                                        className="rounded-md border px-3 py-2 text-body-sm"
                                        style={{
                                            background: "var(--brand-red-soft)",
                                            borderColor: "var(--brand-red-soft)",
                                            color: "var(--brand-red)",
                                        }}
                                    >
                                        {error}
                                    </p>
                                )}

                                {/* Turnstile Bot Protection */}
                                <div className="pt-2 flex justify-center">
                                    <Turnstile
                                        action="moderator_setup"
                                        onSuccess={(token) => {
                                            setTurnstileToken(token);
                                            setError(null);
                                        }}
                                        onError={() => setTurnstileToken(null)}
                                        onExpire={() => setTurnstileToken(null)}
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        if (!turnstileToken) {
                                            setError("Please complete the spam check before continuing.");
                                            return;
                                        }
                                        if (!name || !password) {
                                            setError("Please complete all fields.");
                                            return;
                                        }
                                        setError(null);
                                        setStep(2);
                                    }}
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    Continue to agreement <ArrowRight className="h-4 w-4" />
                                </button>

                            </>
                        ) : (
                            <>
                                <header className="space-y-1">
                                    <h2 className="text-headline text-foreground">
                                        Moderator agreement
                                    </h2>
                                    <p className="text-body-sm text-foreground-muted">
                                        Review and sign the moderator code of conduct.
                                    </p>
                                </header>

                                <div
                                    className="max-h-40 overflow-y-auto rounded-md border border-border px-4 py-3 text-body-sm text-foreground-muted leading-relaxed"
                                    style={{ background: "var(--surface-1)" }}
                                >
                                    As a moderator, you will have access to private user data,
                                    including contact information and mentorship records. You
                                    agree to never disclose this information, export data for
                                    personal gain, or abuse your moderation privileges. Your
                                    account activities are monitored by the SuperAdmin team.
                                </div>

                                <label className="flex gap-3 cursor-pointer items-start">
                                    <span
                                        className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border transition-colors shrink-0 ${
                                            agreed
                                                ? "border-transparent"
                                                : "border-border bg-background"
                                        }`}
                                        style={
                                            agreed
                                                ? { background: "var(--brand-green)" }
                                                : undefined
                                        }
                                    >
                                        {agreed && (
                                            <Check
                                                className="h-3.5 w-3.5"
                                                strokeWidth={3}
                                                style={{ color: "var(--brand-green-fg)" }}
                                            />
                                        )}
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="sr-only"
                                        />
                                    </span>
                                    <span className="text-body-sm text-foreground-muted leading-relaxed">
                                        I agree to the Moderator Code of Conduct and
                                        Confidentiality Terms.
                                    </span>
                                </label>

                                <label className="block space-y-1.5">
                                    <span className="text-label text-foreground">
                                        Digital signature
                                    </span>
                                    <input
                                        type="text"
                                        value={signature}
                                        onChange={(e) => setSignature(e.target.value)}
                                        className={INPUT_CLASS}
                                        placeholder="Type your full name to sign"
                                    />
                                </label>

                                {error && (
                                    <p
                                        role="alert"
                                        className="rounded-md border px-3 py-2 text-body-sm"
                                        style={{
                                            background: "var(--brand-red-soft)",
                                            borderColor: "var(--brand-red-soft)",
                                            color: "var(--brand-red)",
                                        }}
                                    >
                                        {error}
                                    </p>
                                )}

                                <div className="flex flex-col-reverse sm:flex-row gap-3">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="inline-flex h-11 w-full sm:w-auto sm:px-5 items-center justify-center gap-2 rounded-md border border-border bg-background text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Back
                                    </button>
                                    <button
                                        onClick={handleAccept}
                                        disabled={!agreed || !signature || loading}
                                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                        style={{ background: "var(--brand-green)" }}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                Accept role <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
