"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, ShieldCheck } from "lucide-react";

import { signNDA, getNDADocument } from "@/lib/actions/nda";
import { useSession } from "@/lib/auth/client";
import Logo from "@/components/shared/Logo";

export default function NDAPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const role = ((session?.user as any)?.role ?? "Mentee") as
        | "Mentee"
        | "Mentor"
        | "CorporatePartner"
        | "NGO";

    const [name, setName] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [docData, setDocData] = useState<{ version: string; hash: string; content: string } | null>(
        null,
    );

    useEffect(() => {
        if (role) {
            async function loadDoc() {
                const doc = await getNDADocument(role);
                setDocData(doc);
            }
            loadDoc();
        }
    }, [role]);

    const canSign = agreed && name.trim().length > 2;

    const handleSubmit = async () => {
        if (!canSign || !docData) return;
        setIsSubmitting(true);
        try {
            const res = await signNDA({
                signatureName: name,
                ndaVersion: docData.version,
                role: role as any,
                additionalDeclarations: [true],
                documentHash: docData.hash,
            });

            if (res.success) {
                toast.success("NDA signed");
                router.push(res.redirectTo);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to sign NDA");
            setIsSubmitting(false);
        }
    };

    const roleLabel = role === "CorporatePartner" ? "Corporate partner" : role === "NGO" ? "NGO partner" : role;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <Logo size="md" />
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-label text-foreground-muted hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                    </Link>
                </div>
            </header>

            <main className="flex-1 mx-auto w-full max-w-6xl px-6 lg:px-8 py-10 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Document */}
                    <article
                        className="lg:col-span-8 rounded-lg border border-border bg-background p-8 lg:p-12"
                        style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                        <header className="mb-8 space-y-2">
                            <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                                Confidentiality protocol · v{docData?.version ?? "1.0"}
                            </p>
                            <h1 className="text-display-sm text-foreground">
                                Non-Disclosure Agreement
                            </h1>
                            <p className="text-body-sm text-foreground-muted">
                                Effective {new Date().toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}{" "}
                                · For role: {roleLabel}
                            </p>
                        </header>

                        <div className="space-y-6 text-body text-foreground-muted">
                            <p>
                                This Non-Disclosure Agreement (the "Agreement") is entered
                                into by and between Jenga365 ("Disclosing Party") and the
                                individual accepting these terms ("Receiving Party").
                            </p>

                            <section className="space-y-2">
                                <h3 className="text-title text-foreground">
                                    1. Definition of Confidential Information
                                </h3>
                                <p>
                                    "Confidential Information" shall mean any and all technical
                                    and non-technical information provided by the Disclosing
                                    Party, including but not limited to trade secrets,
                                    proprietary information, ideas, techniques, sketches,
                                    drawings, works of authorship, models, inventions, know-how,
                                    processes, apparatuses, equipment, algorithms, software
                                    programs, software source documents, and formulae related
                                    to the current, future, and proposed products and services
                                    of the Disclosing Party.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h3 className="text-title text-foreground">
                                    2. Non-Disclosure and Non-Use Obligations
                                </h3>
                                <p>
                                    The Receiving Party agrees that it shall take reasonable
                                    measures to protect the secrecy of and avoid disclosure and
                                    unauthorized use of the Confidential Information of the
                                    Disclosing Party. Without limiting the foregoing, the
                                    Receiving Party shall take at least those measures that it
                                    takes to protect its own most highly confidential
                                    information.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h3 className="text-title text-foreground">3. Exceptions</h3>
                                <p>
                                    The obligations of the Receiving Party under Section 2 above
                                    shall not apply to any information that the Receiving Party
                                    can prove: a) was in the public domain at the time it was
                                    disclosed; b) entered the public domain after it was
                                    disclosed through no fault of the Receiving Party; c) was
                                    rightfully known to the Receiving Party, without
                                    restriction, at the time of disclosure.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h3 className="text-title text-foreground">4. Term</h3>
                                <p>
                                    The obligations of the Receiving Party shall survive for a
                                    period of five (5) years following the termination of the
                                    Receiving Party's account or relationship with Jenga365.
                                </p>
                            </section>

                            {docData?.content && docData.content !== "Standard NDA terms apply." && (
                                <section className="space-y-2 mt-8 pt-8 border-t border-border">
                                    <h3
                                        className="text-title"
                                        style={{ color: "var(--brand-green)" }}
                                    >
                                        5. Role-specific terms
                                    </h3>
                                    <p>{docData.content}</p>
                                </section>
                            )}
                        </div>
                    </article>

                    {/* Signing box */}
                    <aside className="lg:col-span-4">
                        <div
                            className="sticky top-24 rounded-lg border border-border bg-background p-6 lg:p-8 space-y-6"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <div className="space-y-1.5">
                                <h2 className="text-headline text-foreground">
                                    Acceptance of terms
                                </h2>
                                <p className="text-body-sm text-foreground-muted">
                                    Sign below to confirm you have read and accept the
                                    agreement.
                                </p>
                            </div>

                            <label className="block space-y-1.5">
                                <span className="text-label text-foreground">
                                    Full legal name
                                </span>
                                <input
                                    type="text"
                                    placeholder="Enter your full legal name"
                                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </label>

                            <label className="flex gap-3 cursor-pointer items-start">
                                <span
                                    className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-sm border transition-colors shrink-0 ${
                                        agreed
                                            ? "border-transparent"
                                            : "border-border bg-background"
                                    }`}
                                    style={
                                        agreed ? { background: "var(--brand-green)" } : undefined
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
                                        className="sr-only"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        disabled={isSubmitting}
                                    />
                                </span>
                                <span className="text-body-sm text-foreground-muted leading-relaxed">
                                    I have read and agree to the terms of the Non-Disclosure
                                    Agreement. I understand this is a legally binding document.
                                </span>
                            </label>

                            <button
                                onClick={handleSubmit}
                                disabled={!canSign || isSubmitting}
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: "var(--brand-green)" }}
                            >
                                {isSubmitting ? (
                                    "Processing…"
                                ) : (
                                    <>
                                        <span>Sign &amp; continue</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 pt-2 text-body-sm text-foreground-subtle">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>
                                    Doc hash: {docData?.hash?.substring(0, 12) ?? "loading…"}
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
