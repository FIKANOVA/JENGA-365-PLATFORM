"use client";

import { useState, useEffect } from "react";
import { getNDADocument } from "@/lib/actions/nda";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";

interface RegistrationNDAStepProps {
    role: "Mentee" | "Mentor" | "CorporatePartner" | "NGO";
    onSignAndComplete: (signatureData: { name: string; version: string; hash: string }) => void;
    isLoading: boolean;
    error?: string | null;
    onBack: () => void;
}

export default function RegistrationNDAStep({
    role,
    onSignAndComplete,
    isLoading,
    error,
    onBack,
}: RegistrationNDAStepProps) {
    const [name, setName] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [docData, setDocData] = useState<{ version: string; hash: string; content: string } | null>(null);

    useEffect(() => {
        async function loadDoc() {
            const doc = await getNDADocument(role);
            setDocData(doc);
        }
        loadDoc();
    }, [role]);

    const canSign = agreed && name.trim().length > 2;

    const handleSubmit = () => {
        if (!canSign || !docData) return;
        onSignAndComplete({
            name,
            version: docData.version,
            hash: docData.hash,
        });
    };

    const roleLabel =
        role === "CorporatePartner" ? "Corporate partner" : role === "NGO" ? "NGO partner" : role;

    return (
        <div
            className="w-full max-w-5xl rounded-md border border-border bg-background overflow-hidden"
            style={{ boxShadow: "var(--shadow-lg)" }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* DOC CONTENT */}
                <div
                    className="lg:col-span-7 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-border"
                    style={{ background: "var(--surface-1)" }}
                >
                    <div className="mb-8 space-y-3">
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                            Confidentiality protocol · v{docData?.version || "1.0"}
                        </p>
                        <h2 className="text-display-sm text-foreground">
                            Non-Disclosure Agreement
                        </h2>
                        <p className="text-body-sm text-foreground-muted">
                            Effective {new Date().toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}{" "}
                            · For role: {roleLabel}
                        </p>
                    </div>

                    <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2 text-body-sm text-foreground-muted">
                        <p className="text-body text-foreground">
                            This Agreement governs your access to the Jenga365 Growth
                            Ecosystem, including all proprietary mentorship methodologies,
                            AI protocols, and partner data.
                        </p>

                        <section className="space-y-2">
                            <h3 className="text-title text-foreground">01. Information Gating</h3>
                            <p>
                                All technical templates, mentorship methodologies, AI
                                protocols, and partner datasets shared within Jenga365 are
                                strictly confidential and proprietary.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-title text-foreground">02. Integrity Clause</h3>
                            <p>
                                Unauthorized redistribution, scraping, or external deployment
                                of Jenga365 internal protocols is a violation of community
                                trust and legal commitment.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-title text-foreground">03. Term</h3>
                            <p>
                                Obligations under this protocol remain active for five (5)
                                years following session termination to ensure long-term
                                ecosystem security.
                            </p>
                        </section>

                        {docData?.content && docData.content !== "Standard NDA terms apply." && (
                            <section className="space-y-2 pt-4 border-t border-border">
                                <h3
                                    className="text-title"
                                    style={{ color: "var(--brand-green)" }}
                                >
                                    04. Role-specific directives ({roleLabel})
                                </h3>
                                <p>{docData.content}</p>
                            </section>
                        )}

                        <div className="pt-4">
                            <p className="text-eyebrow text-foreground-subtle">
                                Nairobi, Kenya · Integrated Legal Framework
                            </p>
                        </div>
                    </div>
                </div>

                {/* SIGNING BOX */}
                <div className="lg:col-span-5 p-8 lg:p-12 bg-background flex flex-col">
                    <div className="flex-1 space-y-8">
                        <div className="space-y-1.5">
                            <h3 className="text-headline text-foreground">Acceptance</h3>
                            <p className="text-body-sm text-foreground-muted">
                                Sign below to confirm you have read and accept the terms.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="nda-signature"
                                    className="text-label text-foreground"
                                >
                                    Full legal name
                                </label>
                                <input
                                    id="nda-signature"
                                    type="text"
                                    placeholder="Type your full name"
                                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isLoading}
                                />
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
                                            ? {
                                                  background: "var(--brand-green)",
                                              }
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
                                        className="sr-only"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        disabled={isLoading}
                                    />
                                </span>
                                <span className="text-body-sm text-foreground-muted leading-relaxed">
                                    I have read and agree to the Confidentiality Protocol. I
                                    understand this is a legally binding agreement.
                                </span>
                            </label>

                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-md border px-3 py-2 text-body-sm"
                                    style={{
                                        background: "var(--brand-red-soft)",
                                        borderColor: "var(--brand-red-soft)",
                                        color: "var(--brand-red)",
                                    }}
                                >
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-8 space-y-3">
                        <button
                            onClick={handleSubmit}
                            disabled={!canSign || isLoading}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: "var(--brand-green)" }}
                        >
                            {isLoading ? (
                                "Processing…"
                            ) : (
                                <>
                                    <span>Sign &amp; continue</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>

                        <button
                            onClick={onBack}
                            disabled={isLoading}
                            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-background text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)] disabled:opacity-50"
                        >
                            Back
                        </button>

                        <div className="pt-2 flex items-center justify-center gap-2 text-body-sm text-foreground-subtle">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>
                                Doc hash: {docData?.hash?.substring(0, 12) ?? "loading…"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
