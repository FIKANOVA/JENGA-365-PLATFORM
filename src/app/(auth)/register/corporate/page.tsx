"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    ShieldCheck,
    Coins,
    Package,
    Users,
} from "lucide-react";

import { signUp } from "@/lib/auth/client";
import { signNDA } from "@/lib/actions/nda";
import { setUserRole, saveUserMetadata } from "@/lib/actions/auth";
import { sendCorporateRegistrationEmails } from "@/lib/actions/registration-emails";

import Logo from "@/components/shared/Logo";
import RegistrationNDAStep from "@/components/auth/RegistrationNDAStep";

const STEPS = [
    { id: 1, label: "Organisation" },
    { id: 2, label: "Contribution" },
    { id: 3, label: "Agreement" },
] as const;

const ORG_TYPES = [
    { id: "tech", label: "Tech" },
    { id: "finance", label: "Finance" },
    { id: "NGO", label: "NGO" },
    { id: "govt", label: "Government" },
    { id: "manufacturing", label: "Manufacturing" },
];

const CONTRIBUTION_MODELS = [
    {
        id: "Fin",
        label: "Financial pledges",
        description: "Milestone-tied funding",
        icon: Coins,
    },
    {
        id: "Hardware",
        label: "Hardware assets",
        description: "Equipment & infrastructure",
        icon: Package,
    },
    {
        id: "Expertise",
        label: "Human capital",
        description: "Volunteer expertise",
        icon: Users,
    },
] as const;

export default function CorporateRegisterPage() {
    return (
        <Suspense fallback={null}>
            <CorporateRegisterInner />
        </Suspense>
    );
}

function CorporateRegisterInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        orgName: "",
        orgType: "",
        contactName: "",
        contactTitle: "",
        email: "",
        password: "",
        contributionType: "Fin",
        agreedToProtocol: false,
    });

    // /register/ngo redirects here with ?type=ngo and we pre-fill orgType so
    // the form's NGO bypass (skip step 2) takes effect from the first click.
    useEffect(() => {
        if (searchParams.get("type") === "ngo" && !formData.orgType) {
            setFormData((p) => ({ ...p, orgType: "NGO" }));
        }
    }, [searchParams, formData.orgType]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
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
                name: formData.contactName,
                email: formData.email,
                password: formData.password,
            });

            if (result?.error) {
                setError(result.error.message || "Failed to create account");
                setLoading(false);
                return;
            }

            const partnerRole = formData.orgType === "NGO" ? "NGO" : "CorporatePartner";

            if (result?.data?.user?.id) {
                await setUserRole(result.data.user.id, partnerRole);
                await saveUserMetadata(result.data.user.id, {
                    orgType: formData.orgType,
                    contributionType: formData.contributionType,
                    contactTitle: formData.contactTitle || "",
                    orgName: formData.orgName || "",
                });
            }

            const ndaResult = await signNDA({
                signatureName: signatureData.name,
                ndaVersion: signatureData.version,
                role: partnerRole,
                additionalDeclarations: [true],
                documentHash: signatureData.hash,
            });

            if (ndaResult.success) {
                const submittedAt = new Date().toLocaleString();
                sendCorporateRegistrationEmails(
                    formData.email,
                    formData.contactName,
                    formData.orgName,
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
                                    Step 1 · Your organisation
                                </p>
                                <h1 className="text-display-sm text-foreground">
                                    Organisation details
                                </h1>
                                <p className="text-body text-foreground-muted">
                                    Tell us about your organisation to establish your
                                    partnership node in the Jenga365 network.
                                </p>
                            </header>

                            <div
                                className="rounded-lg border border-border bg-background p-6 lg:p-8 space-y-5"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Organisation name">
                                        <Input
                                            name="orgName"
                                            value={formData.orgName}
                                            onChange={handleInputChange}
                                            placeholder="Legal entity name"
                                        />
                                    </Field>
                                    <Field label="Industry">
                                        <Select
                                            name="orgType"
                                            value={formData.orgType}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select sector</option>
                                            {ORG_TYPES.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.label}
                                                </option>
                                            ))}
                                            <option value="other">Other</option>
                                        </Select>
                                    </Field>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Primary contact name">
                                        <Input
                                            name="contactName"
                                            value={formData.contactName}
                                            onChange={handleInputChange}
                                            placeholder="Full name"
                                        />
                                    </Field>
                                    <Field label="Contact title">
                                        <Input
                                            name="contactTitle"
                                            value={formData.contactTitle}
                                            onChange={handleInputChange}
                                            placeholder="Official title"
                                        />
                                    </Field>
                                </div>

                                <Field label="Email">
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="partner@organisation.com"
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

                                <PrimaryButton
                                    onClick={() => {
                                        if (
                                            formData.orgName &&
                                            formData.contactName &&
                                            formData.email &&
                                            formData.password
                                        ) {
                                            setError(null);
                                            // NGOs bypass the milestone-tied contribution step (CLAUDE.md §10.5).
                                            // Resource Exchange MOU is signed inside the NGO dashboard after sign-up.
                                            setStep(formData.orgType === "NGO" ? 3 : 2);
                                        } else {
                                            setError("Please fill in all required fields.");
                                        }
                                    }}
                                >
                                    Continue <ArrowRight className="h-4 w-4" />
                                </PrimaryButton>
                            </div>

                            <p className="text-center text-body-sm text-foreground-muted">
                                Already a partner?{" "}
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
                                    Step 2 · Contribution model
                                </p>
                                <h1 className="text-display-sm text-foreground">
                                    Performance-tied contribution
                                </h1>
                                <p className="text-body text-foreground-muted">
                                    Resources are tied to verifiable performance. Impact is
                                    only unlocked when agreed milestones are met.
                                </p>
                            </header>

                            <div
                                className="rounded-lg border border-border bg-background p-6 lg:p-8 space-y-6"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                <div className="space-y-3">
                                    <span className="text-label text-foreground">
                                        Primary contribution
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {CONTRIBUTION_MODELS.map((model) => {
                                            const Icon = model.icon;
                                            const selected =
                                                formData.contributionType === model.id;
                                            return (
                                                <button
                                                    key={model.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData((p) => ({
                                                            ...p,
                                                            contributionType: model.id,
                                                        }))
                                                    }
                                                    className={`flex flex-col items-start gap-1.5 rounded-md border p-4 text-left transition-colors ${
                                                        selected
                                                            ? "border-[color:var(--brand-green)] bg-[color:var(--brand-green-soft)]"
                                                            : "border-border bg-background hover:bg-[color:var(--surface-2)]"
                                                    }`}
                                                >
                                                    <Icon
                                                        className="h-4 w-4"
                                                        style={
                                                            selected
                                                                ? { color: "var(--brand-green)" }
                                                                : undefined
                                                        }
                                                    />
                                                    <span
                                                        className="text-label"
                                                        style={
                                                            selected
                                                                ? { color: "var(--brand-green)" }
                                                                : undefined
                                                        }
                                                    >
                                                        {model.label}
                                                    </span>
                                                    <span className="text-body-sm text-foreground-muted">
                                                        {model.description}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="border-t border-border pt-5">
                                    <CheckboxRow
                                        checked={formData.agreedToProtocol}
                                        onChange={(checked) =>
                                            setFormData((p) => ({
                                                ...p,
                                                agreedToProtocol: checked,
                                            }))
                                        }
                                        label="Our organisation commits to the milestone-based contribution protocol and performance-tied resource distribution."
                                    />
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-3">
                                    <SecondaryButton onClick={() => setStep(1)}>
                                        <ArrowLeft className="h-4 w-4" /> Back
                                    </SecondaryButton>
                                    <PrimaryButton
                                        onClick={() => {
                                            if (formData.agreedToProtocol) {
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
                                role={formData.orgType === "NGO" ? "NGO" : "CorporatePartner"}
                                onSignAndComplete={handleSignAndComplete}
                                isLoading={loading}
                                error={error}
                                onBack={() => setStep(formData.orgType === "NGO" ? 1 : 2)}
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
