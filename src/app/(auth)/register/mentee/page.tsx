"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, ShieldCheck } from "lucide-react";

import { signUp, signIn } from "@/lib/auth/client";
import { signNDA } from "@/lib/actions/nda";
import { setUserRoleAndApprove, saveUserMetadata } from "@/lib/actions/auth";
import { sendMenteeRegistrationEmail } from "@/lib/actions/registration-emails";

import Logo from "@/components/shared/Logo";
import RegistrationNDAStep from "@/components/auth/RegistrationNDAStep";
import Turnstile from "@/components/shared/Turnstile";

const STEPS = [
    { id: 1, label: "Account" },
    { id: 2, label: "Pledge" },
    { id: 3, label: "Agreement" },
] as const;

export default function MenteeRegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        currentLevel: "",
        educationGoal: "",
        profession: "",
        linkedIn: "",
        x: "",
        instagram: "",
        youtube: "",
        tiktok: "",
        website: "",
        email: "",
        password: "",
        agreedToTerms: false,
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGoogleSignUp = async () => {
        setError(null);
        setSocialLoading(true);
        try {
            await signIn.social({
                provider: "google",
                callbackURL: "/onboarding",
            });
        } catch {
            setError("Failed to sign up with Google. Please try again.");
            setSocialLoading(false);
        }
    };

    const handleSignAndComplete = async (signatureData: {
        name: string;
        version: string;
        hash: string;
    }) => {
        setLoading(true);
        setError(null);

        try {
            const result = await signUp.email({
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: formData.password,
            });

            if (result?.error) {
                setError(result.error.message || "Failed to create account");
                setLoading(false);
                return;
            }

            if (result?.data?.user?.id) {
                await setUserRoleAndApprove(result.data.user.id, "Mentee");
                await saveUserMetadata(result.data.user.id, {
                    currentLevel: formData.currentLevel,
                    profession: formData.profession || "",
                    linkedIn: formData.linkedIn || "",
                    x: formData.x || "",
                    instagram: formData.instagram || "",
                    youtube: formData.youtube || "",
                    tiktok: formData.tiktok || "",
                    website: formData.website || "",
                });
            }

            const ndaResult = await signNDA({
                signatureName: signatureData.name,
                ndaVersion: signatureData.version,
                role: "Mentee",
                additionalDeclarations: [true],
                documentHash: signatureData.hash,
            });

            if (ndaResult.success) {
                sendMenteeRegistrationEmail(
                    formData.email,
                    formData.firstName,
                    formData.lastName,
                    signatureData.hash,
                    "NDA-" + Math.random().toString(36).substring(7).toUpperCase(),
                );

                import("@/lib/auth/client").then(({ authClient }) => {
                    authClient
                        .sendVerificationEmail({
                            email: formData.email,
                            callbackURL: "/onboarding/intake",
                        })
                        .catch(() => {});
                });

                router.push(
                    `${ndaResult.redirectTo}?email=${encodeURIComponent(formData.email)}`,
                );
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <RegistrationHeader step={step} />

            <main className="flex-1 mx-auto w-full max-w-3xl px-6 lg:px-8 py-10 lg:py-16">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.section
                            key="step1"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-8"
                        >
                            <header className="space-y-2 text-center">
                                <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                                    Step 1 · Your details
                                </p>
                                <h1 className="text-display-sm text-foreground">
                                    Create your account
                                </h1>
                                <p className="text-body text-foreground-muted">
                                    A few details to get you matched with the right mentor.
                                </p>
                            </header>

                            <div
                                className="rounded-md border border-border bg-background p-6 lg:p-8 space-y-5"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                {/* Google Sign Up */}
                                <button
                                    type="button"
                                    onClick={handleGoogleSignUp}
                                    disabled={socialLoading || loading}
                                    className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-md border border-border bg-background px-4 text-label font-medium text-foreground transition-colors hover:bg-[color:var(--surface-2)] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    <span>{socialLoading ? "Connecting to Google…" : "Continue with Google"}</span>
                                </button>

                                <div className="relative flex items-center justify-center">
                                    <div className="w-full border-t border-border" />
                                    <span className="absolute bg-background px-3 text-xs uppercase tracking-wider text-foreground-subtle">
                                        Or register with email
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="First name">
                                        <Input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="Given name"
                                        />
                                    </Field>
                                    <Field label="Last name">
                                        <Input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Surname"
                                        />
                                    </Field>
                                </div>

                                <Field label="Email">
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                    />
                                </Field>

                                <Field label="Password">
                                    <Input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Min. 8 characters"
                                        autoComplete="new-password"
                                    />
                                </Field>

                                <Field label="Current academic level">
                                    <Select
                                        name="currentLevel"
                                        value={formData.currentLevel}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select level</option>
                                        <option value="High School">High school</option>
                                        <option value="Undergraduate">Undergraduate</option>
                                        <option value="Postgraduate">Postgraduate</option>
                                        <option value="Early Career">Early career</option>
                                    </Select>
                                </Field>

                                <Field
                                    label={
                                        <>
                                            Aspiration / Career Goal{" "}
                                            <span className="text-foreground-subtle font-normal">
                                                (optional)
                                            </span>
                                        </>
                                    }
                                >
                                    <Input
                                        name="profession"
                                        value={formData.profession}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Aspiring Software Developer, Rugby Athlete"
                                    />
                                </Field>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field
                                        label={
                                            <>
                                                LinkedIn{" "}
                                                <span className="text-foreground-subtle font-normal">
                                                    (optional)
                                                </span>
                                            </>
                                        }
                                    >
                                        <Input
                                            name="linkedIn"
                                            value={formData.linkedIn}
                                            onChange={handleInputChange}
                                            placeholder="linkedin.com/in/you"
                                        />
                                    </Field>
                                    <Field
                                        label={
                                            <>
                                                X (Twitter){" "}
                                                <span className="text-foreground-subtle font-normal">
                                                    (optional)
                                                </span>
                                            </>
                                        }
                                    >
                                        <Input
                                            name="x"
                                            value={formData.x}
                                            onChange={handleInputChange}
                                            placeholder="@handle"
                                        />
                                    </Field>
                                    <Field
                                        label={
                                            <>
                                                Instagram{" "}
                                                <span className="text-foreground-subtle font-normal">
                                                    (optional)
                                                </span>
                                            </>
                                        }
                                    >
                                        <Input
                                            name="instagram"
                                            value={formData.instagram}
                                            onChange={handleInputChange}
                                            placeholder="@username"
                                        />
                                    </Field>
                                    <Field
                                        label={
                                            <>
                                                YouTube / TikTok{" "}
                                                <span className="text-foreground-subtle font-normal">
                                                    (optional)
                                                </span>
                                            </>
                                        }
                                    >
                                        <Input
                                            name="youtube"
                                            value={formData.youtube}
                                            onChange={handleInputChange}
                                            placeholder="@channel"
                                        />
                                    </Field>
                                </div>

                                <Field
                                    label={
                                        <>
                                            Portfolio / Website{" "}
                                            <span className="text-foreground-subtle font-normal">
                                                (optional)
                                            </span>
                                        </>
                                    }
                                >
                                    <Input
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        placeholder="https://yourportfolio.com"
                                    />
                                </Field>

                                {/* Turnstile */}
                                <div className="pt-2 flex justify-center">
                                    <Turnstile
                                        action="register_mentee"
                                        onSuccess={(token) => {
                                            setTurnstileToken(token);
                                            setError(null);
                                        }}
                                        onError={() => setTurnstileToken(null)}
                                        onExpire={() => setTurnstileToken(null)}
                                    />
                                </div>

                                <PrimaryButton
                                    onClick={() => {
                                        if (!turnstileToken) {
                                            setError("Please complete the spam check before continuing.");
                                            return;
                                        }
                                        if (
                                            formData.firstName &&
                                            formData.lastName &&
                                            formData.email &&
                                            formData.password
                                        ) {
                                            setError(null);
                                            setStep(2);
                                        } else {
                                            setError("Please fill in all required fields.");
                                        }
                                    }}
                                >
                                    Continue <ArrowRight className="h-4 w-4" />
                                </PrimaryButton>
                            </div>

                            <p className="text-center text-body-sm text-foreground-muted">
                                Already a member?{" "}
                                <Link
                                    href="/login"
                                    className="font-medium hover:underline"
                                    style={{ color: "var(--brand-green)" }}
                                >
                                    Sign in
                                </Link>
                            </p>
                        </motion.section>
                    )}


                    {step === 2 && (
                        <motion.section
                            key="step2"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-8"
                        >
                            <header className="space-y-2 text-center">
                                <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                                    Step 2 · Community pledge
                                </p>
                                <h1 className="text-display-sm text-foreground">
                                    Sweat equity, before access
                                </h1>
                                <p className="text-body text-foreground-muted">
                                    Premium mentorship is earned through verified community
                                    contribution.
                                </p>
                            </header>

                            <div
                                className="rounded-md border border-border bg-background p-6 lg:p-8 space-y-6"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                <ul className="space-y-3">
                                    {[
                                        "Minimum one community activity per quarter.",
                                        "Activities include tree planting, clean-ups, book drives.",
                                        "Participation is verified through Jenga365 and KoBoToolbox field forms.",
                                        "A three-strikes protocol resets platform access for missed contributions.",
                                    ].map((text) => (
                                        <li key={text} className="flex gap-2.5 items-start">
                                            <Check
                                                className="h-4 w-4 mt-0.5 shrink-0"
                                                style={{ color: "var(--brand-green)" }}
                                            />
                                            <span className="text-body-sm text-foreground-muted">
                                                {text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-t border-border pt-5">
                                    <CheckboxRow
                                        checked={formData.agreedToTerms}
                                        onChange={(checked) =>
                                            setFormData((p) => ({ ...p, agreedToTerms: checked }))
                                        }
                                        label="I agree to complete at least one community impact activity per quarter as a condition of my Jenga365 membership."
                                    />
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-3">
                                    <SecondaryButton onClick={() => setStep(1)}>
                                        <ArrowLeft className="h-4 w-4" /> Back
                                    </SecondaryButton>
                                    <PrimaryButton
                                        onClick={() => {
                                            if (formData.agreedToTerms) {
                                                setError(null);
                                                setStep(3);
                                            } else {
                                                setError(
                                                    "Please accept the community terms to continue.",
                                                );
                                            }
                                        }}
                                    >
                                        Continue to agreement <ArrowRight className="h-4 w-4" />
                                    </PrimaryButton>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {step === 3 && (
                        <motion.section
                            key="step3"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            className="flex justify-center"
                        >
                            <RegistrationNDAStep
                                role="Mentee"
                                onSignAndComplete={handleSignAndComplete}
                                isLoading={loading}
                                error={error}
                                onBack={() => setStep(2)}
                            />
                        </motion.section>
                    )}
                </AnimatePresence>
            </main>

            {error && (
                <div
                    role="alert"
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-body-sm"
                    style={{
                        background: "var(--brand-red-soft)",
                        borderColor: "var(--brand-red-soft)",
                        color: "var(--brand-red)",
                        boxShadow: "var(--shadow)",
                    }}
                >
                    <ShieldCheck className="h-4 w-4" />
                    {error}
                </div>
            )}
        </div>
    );
}

/* ─── Local UI primitives (page-scoped to avoid premature abstraction) ─── */

function RegistrationHeader({ step }: { step: 1 | 2 | 3 }) {
    return (
        <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                <Logo size="md" />
                <nav
                    aria-label="Registration progress"
                    className="hidden sm:flex items-center gap-3 text-eyebrow text-foreground-muted"
                >
                    {STEPS.map((s, i) => (
                        <span key={s.id} className="flex items-center gap-3">
                            <span
                                className={
                                    s.id === step
                                        ? "text-foreground"
                                        : s.id < step
                                          ? "text-foreground-muted"
                                          : "text-foreground-subtle"
                                }
                            >
                                {s.id}. {s.label}
                            </span>
                            {i < STEPS.length - 1 && (
                                <span className="h-px w-6 bg-border" />
                            )}
                        </span>
                    ))}
                </nav>
                <span className="sm:hidden text-eyebrow text-foreground-muted">
                    Step {step} of 3
                </span>
            </div>
        </header>
    );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
    return (
        <label className="block space-y-1.5">
            <span className="text-label text-foreground">{label}</span>
            {children}
        </label>
    );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none"
        />
    );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
    const { children, ...rest } = props;
    return (
        <select
            {...rest}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground transition-colors focus:border-[color:var(--brand-green)] focus:outline-none"
        >
            {children}
        </select>
    );
}

function PrimaryButton({
    children,
    onClick,
}: {
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex h-11 w-full sm:flex-1 items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--brand-green)" }}
        >
            {children}
        </button>
    );
}

function SecondaryButton({
    children,
    onClick,
}: {
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex h-11 w-full sm:w-auto sm:px-5 items-center justify-center gap-2 rounded-md border border-border bg-background text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
        >
            {children}
        </button>
    );
}

function CheckboxRow({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
}) {
    return (
        <label className="flex gap-3 cursor-pointer items-start">
            <span
                className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border transition-colors shrink-0 ${
                    checked ? "border-transparent" : "border-border bg-background"
                }`}
                style={checked ? { background: "var(--brand-green)" } : undefined}
            >
                {checked && (
                    <Check
                        className="h-3.5 w-3.5"
                        strokeWidth={3}
                        style={{ color: "var(--brand-green-fg)" }}
                    />
                )}
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
            </span>
            <span className="text-body-sm text-foreground-muted leading-relaxed">
                {label}
            </span>
        </label>
    );
}
