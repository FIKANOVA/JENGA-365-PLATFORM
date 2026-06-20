"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMouAgreement } from "@/lib/actions/ngoWorkflow";
import { ArrowRight, FileText, Check } from "lucide-react";

const RESOURCE_TYPES = [
    { id: "seedlings", label: "Indigenous seedlings" },
    { id: "equipment", label: "Equipment / hardware" },
    { id: "expertise", label: "Technical expertise" },
    { id: "land", label: "Land / venue access" },
    { id: "funding", label: "Project funding" },
    { id: "volunteers", label: "Volunteer workforce" },
];

interface NgoMouFormProps {
    partnerCorporateId: string | null;
    orgName: string;
}

export default function NgoMouForm({ partnerCorporateId, orgName }: NgoMouFormProps) {
    const router = useRouter();
    const [selectedResources, setSelectedResources] = useState<string[]>([]);
    const [mouUrl, setMouUrl] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [error, setError] = useState("");

    function toggleResource(id: string) {
        setSelectedResources((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!agreedToTerms) {
            setError("Please confirm your agreement to the Resource Exchange terms.");
            return;
        }
        if (selectedResources.length === 0) {
            setError("Please select at least one resource type your organisation will contribute.");
            return;
        }
        if (!partnerCorporateId) {
            setError("Your account is not yet linked to a partner entity. Please contact support.");
            return;
        }

        setStatus("submitting");
        setError("");

        try {
            await createMouAgreement({
                partnerCorporateId,
                mouDocumentUrl: mouUrl || undefined,
                resourceTypes: selectedResources,
            });
            setStatus("success");
            setTimeout(() => router.push("/dashboard/ngo"), 1800);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Submission failed.";
            setError(
                msg === "NGO_ONLY"
                    ? "Your account is not registered as an NGO partner. Please contact support."
                    : "Submission failed. Please try again."
            );
            setStatus("error");
        }
    }

    if (status === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="text-center space-y-6 max-w-md">
                    <div
                        className="w-16 h-16 flex items-center justify-center mx-auto rounded-full"
                        style={{ background: "var(--brand-green)" }}
                    >
                        <Check className="w-8 h-8" strokeWidth={3} style={{ color: "var(--brand-green-fg)" }} />
                    </div>
                    <h2 className="text-display-md text-foreground">MOU recorded</h2>
                    <p className="text-body-lg text-foreground-muted">
                        Your Resource Exchange agreement has been submitted. The Jenga365 team will review it shortly.
                        Redirecting to your dashboard…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 lg:p-12 max-w-3xl mx-auto space-y-10">
            {/* Header */}
            <div className="space-y-3">
                <p className="text-eyebrow text-foreground-muted">Resource Exchange Agreement</p>
                <h1 className="text-display-md text-foreground">
                    Sign your MOU.
                </h1>
                <p className="text-body-sm text-foreground-muted max-w-lg">
                    As a Partner NGO, {orgName} provides resources or expertise.
                    Jenga365 provides the volunteer workforce and programme infrastructure.
                    This MOU formalises that exchange.
                </p>
            </div>

            {/* Exchange Model Summary */}
            <div
                className="rounded-md border p-8 space-y-4"
                style={{ background: "#0a0a0a", borderColor: "#0a0a0a", color: "#ffffff" }}
            >
                <p className="text-eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>
                    The exchange model
                </p>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-eyebrow font-medium mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                            You provide
                        </p>
                        <ul className="space-y-1 text-body-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                            <li>Resources / hardware / expertise</li>
                            <li>Technical guidance</li>
                            <li>Local knowledge &amp; networks</li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-eyebrow font-medium mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                            Jenga365 provides
                        </p>
                        <ul className="space-y-1 text-body-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                            <li>Volunteer workforce</li>
                            <li>Programme infrastructure</li>
                            <li>Impact tracking &amp; reporting</li>
                        </ul>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Resource Types */}
                <div className="space-y-4">
                    <label className="text-eyebrow text-foreground-muted">
                        Resources your organisation will contribute
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {RESOURCE_TYPES.map((r) => {
                            const selected = selectedResources.includes(r.id);
                            return (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => toggleResource(r.id)}
                                    className="h-12 px-4 flex items-center justify-between rounded-md border transition-colors text-left text-label"
                                    style={
                                        selected
                                            ? { background: "var(--brand-green)", borderColor: "var(--brand-green)", color: "var(--brand-green-fg)" }
                                            : { background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground-muted)" }
                                    }
                                >
                                    <span>{r.label}</span>
                                    {selected && <Check className="w-4 h-4 shrink-0" strokeWidth={3} />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Optional MOU Document URL */}
                <div className="space-y-2">
                    <label className="text-eyebrow text-foreground-muted">
                        MOU document URL{" "}
                        <span className="text-foreground-subtle normal-case tracking-normal">
                            (optional — upload to your storage first)
                        </span>
                    </label>
                    <input
                        type="url"
                        value={mouUrl}
                        onChange={(e) => setMouUrl(e.target.value)}
                        placeholder="https://docs.example.com/resource-exchange-mou.pdf"
                        className="w-full h-11 px-3 rounded-md border border-border bg-background text-body-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-[color:var(--border-strong,#D4D4D8)] focus:ring-2 focus:ring-[color:var(--brand-green-soft)] transition-all"
                    />
                </div>

                {/* Agreement Checkbox */}
                <label className="flex gap-3 cursor-pointer items-start group">
                    <div
                        className="mt-1 w-5 h-5 rounded border transition-colors relative flex items-center justify-center shrink-0"
                        style={
                            agreedToTerms
                                ? { background: "var(--brand-green)", borderColor: "var(--brand-green)" }
                                : { background: "var(--background)", borderColor: "var(--border)" }
                        }
                    >
                        {agreedToTerms && <Check className="w-3 h-3" strokeWidth={4} style={{ color: "var(--brand-green-fg)" }} />}
                        <input
                            type="checkbox"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                        />
                    </div>
                    <span className="text-body-sm text-foreground-muted group-hover:text-foreground transition-colors leading-relaxed">
                        {orgName} agrees to the Jenga365 Resource Exchange model and commits to contributing the selected resources in alignment with verified community milestones.
                    </span>
                </label>

                {error && (
                    <p className="text-body-sm" style={{ color: "var(--brand-red)" }}>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full h-12 rounded-md inline-flex items-center justify-center gap-3 text-label font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                >
                    {status === "submitting" ? (
                        "Submitting…"
                    ) : (
                        <>
                            <FileText size={14} />
                            Sign &amp; submit MOU
                            <ArrowRight size={14} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
