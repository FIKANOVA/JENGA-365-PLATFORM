"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    ShieldCheck,
    Video,
    Users,
} from "lucide-react";

import { signUp } from "@/lib/auth/client";
import { signNDA } from "@/lib/actions/nda";
import { setUserRole, saveUserMetadata } from "@/lib/actions/auth";
import { sendMentorRegistrationEmails } from "@/lib/actions/registration-emails";

import Logo from "@/components/shared/Logo";
import RegistrationNDAStep from "@/components/auth/RegistrationNDAStep";

const STEPS = [
    { id: 1, label: "Profile" },
    { id: 2, label: "Commitment" },
    { id: 3, label: "Agreement" },
] as const;

const MEETING_PREFERENCES = [
    { id: "Video Call", label: "Video call", icon: Video },
    { id: "In-person", label: "In person", icon: Users },
] as const;

export default function MentorRegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        professionalTitle: "",
        linkedIn: "",
        email: "",
        password: "",
        hoursPerMonth: "0",
        meetingPreference: "Video Call",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                await setUserRole(result.data.user.id, "Mentor");
                await saveUserMetadata(result.data.user.id, {
                    meetingPreference: formData.meetingPreference,
                    professionalTitle: formData.professionalTitle,
                    linkedIn: formData.linkedIn || "",
                });
            }

            const ndaResult = await signNDA({
                signatureName: signatureData.name,
                ndaVersion: signatureData.version,
                role: "Mentor",
                additionalDeclarations: [true],
                documentHash: signatureData.hash,
            });

            if (ndaResult.success) {
                const submittedAt = new Date().toLocaleString();
                sendMentorRegistrationEmails(
                    formData.email,
                    formData.firstName,
                    formData.lastName,
                    formData.professionalTitle,
                    signatureData.hash,
                    "NDA-" + Math.random().toString(36).substring(7).toUpperCase(),
                    submittedAt,
                    window.location.origin,
                );

                router.push(ndaResult.redirectTo);
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
                                    Step 1 · Your profile
                                </p>
                                <h1 className="text-display-sm text-foreground">
                                    Your professional profile
                                </h1>
                                <p className="text-body text-foreground-muted">
                                    Tell us about your expertise so we can match you with the
                                    right mentees.
                                </p>
                            </header>

                            <div
                                className="rounded-lg border border-border bg-background p-6 lg:p-8 space-y-5"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Professional title">
                                        <Input
                                            name="professionalTitle"
                                            value={formData.professionalTitle}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Senior Engineer"
                                        />
                                    </Field>
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
                                            type="url"
                                            name="linkedIn"
                                            value={formData.linkedIn}
                                            onChange={handleInputChange}
                                            placeholder="linkedin.com/in/you"
                                        />
                                    </Field>
                                </div>

                                <PrimaryButton
                                    onClick={() => {
                                        if (
                                            formData.firstName &&
                                            formData.lastName &&
                                            formData.email &&
                                            formData.password &&
                                            formData.professionalTitle
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
                                    Step 2 · Mentorship commitment
                                </p>
                                <h1 className="text-display-sm text-foreground">
                                    One focused hour per month
                                </h1>
                                <p className="text-body text-foreground-muted">
                                    To prevent volunteer fatigue we cap commitment at one
                                    high-impact hour per month, on your schedule.
                                </p>
                            </header>

                            <div
                                className="rounded-lg border border-border bg-background p-6 lg:p-8 space-y-6"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                <div className="space-y-3">
                                    <span className="text-label text-foreground">
                                        Preferred meeting format
                                    </span>
                                    <div className="grid grid-cols-2 gap-3">
                                        {MEETING_PREFERENCES.map((pref) => {
                                            const Icon = pref.icon;
                                            const selected =
                                                formData.meetingPreference === pref.id;
                                            return (
                                                <button
                                                    key={pref.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData((p) => ({
                                                            ...p,
                                                            meetingPreference: pref.id,
                                                        }))
                                                    }
                                                    className={`flex items-center justify-center gap-2 h-12 rounded-md border text-label transition-colors ${
                                                        selected
                                                            ? "border-[color:var(--brand-green)] bg-[color:var(--brand-green-soft)]"
                                                            : "border-border bg-background text-foreground-muted hover:bg-[color:var(--surface-2)]"
                                                    }`}
                                                    style={
                                                        selected
                                                            ? { color: "var(--brand-green)" }
                                                            : undefined
                                                    }
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    <span>{pref.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="border-t border-border pt-5">
                                    <CheckboxRow
                                        checked={formData.hoursPerMonth === "agreed"}
                                        onChange={(checked) =>
                                            setFormData((p) => ({
                                                ...p,
                                                hoursPerMonth: checked ? "agreed" : "0",
                                            }))
                                        }
                                        label="I can dedicate at least one focused hour per month to support the next generation of leaders."
                                    />
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-3">
                                    <SecondaryButton onClick={() => setStep(1)}>
                                        <ArrowLeft className="h-4 w-4" /> Back
                                    </SecondaryButton>
                                    <PrimaryButton
                                        onClick={() => {
                                            if (formData.hoursPerMonth === "agreed") {
                                                setError(null);
                                                setStep(3);
                                            } else {
                                                setError(
                                                    "Please confirm your commitment to continue.",
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
                                role="Mentor"
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

/* ─── Local UI primitives ─── */

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
                className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-sm border transition-colors shrink-0 ${
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
