"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMouAgreement } from "@/lib/actions/ngoWorkflow";
import { ArrowRight, FileText, Check } from "lucide-react";

const RESOURCE_TYPES = [
    { id: "seedlings", label: "Indigenous Seedlings" },
    { id: "equipment", label: "Equipment / Hardware" },
    { id: "expertise", label: "Technical Expertise" },
    { id: "land", label: "Land / Venue Access" },
    { id: "funding", label: "Project Funding" },
    { id: "volunteers", label: "Volunteer Workforce" },
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
                    <div className="w-16 h-16 bg-foreground flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-background" strokeWidth={3} />
                    </div>
                    <h2 className="font-serif font-black text-3xl uppercase tracking-tighter">
                        MOU Recorded
                    </h2>
                    <p className="text-muted-foreground font-light">
                        Your Resource Exchange agreement has been submitted. The Jenga365 team will review it shortly.
                        Redirecting to your dashboard…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 lg:p-12 max-w-3xl mx-auto space-y-12">
            {/* Header */}
            <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                    Resource Exchange Agreement
                </p>
                <h1 className="font-serif font-black text-4xl uppercase tracking-tighter leading-none">
                    Sign Your<br />
                    <span className="italic text-primary">MOU.</span>
                </h1>
                <p className="text-sm text-muted-foreground font-light max-w-lg">
                    As a Partner NGO, {orgName} provides resources or expertise.
                    Jenga365 provides the volunteer workforce and programme infrastructure.
                    This MOU formalises that exchange.
                </p>
            </div>

            {/* Exchange Model Summary */}
            <div className="border border-foreground p-8 space-y-4 bg-foreground text-background">
                <p className="font-mono text-[9px] uppercase tracking-[0.4em] opacity-60">The Exchange Model</p>
                <div className="grid grid-cols-2 gap-8 text-sm">
                    <div>
                        <p className="font-mono font-bold text-[10px] uppercase tracking-widest mb-2 opacity-60">
                            You Provide
                        </p>
                        <ul className="space-y-1 opacity-90 font-light">
                            <li>Resources / hardware / expertise</li>
                            <li>Technical guidance</li>
                            <li>Local knowledge &amp; networks</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-mono font-bold text-[10px] uppercase tracking-widest mb-2 opacity-60">
                            Jenga365 Provides
                        </p>
                        <ul className="space-y-1 opacity-90 font-light">
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
                    <label className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground font-bold">
                        Resources Your Organisation Will Contribute
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {RESOURCE_TYPES.map((r) => {
                            const selected = selectedResources.includes(r.id);
                            return (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => toggleResource(r.id)}
                                    className={`h-14 px-4 flex items-center justify-between border transition-all duration-300 text-left ${
                                        selected
                                            ? "bg-foreground border-foreground text-background"
                                            : "bg-background border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                                    }`}
                                >
                                    <span className="font-mono text-[9px] uppercase tracking-widest font-bold">
                                        {r.label}
                                    </span>
                                    {selected && <Check className="w-3 h-3 shrink-0" strokeWidth={3} />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Optional MOU Document URL */}
                <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground font-bold">
                        MOU Document URL{" "}
                        <span className="text-muted-foreground font-normal normal-case tracking-normal">
                            (optional — upload to your storage first)
                        </span>
                    </label>
                    <input
                        type="url"
                        value={mouUrl}
                        onChange={(e) => setMouUrl(e.target.value)}
                        placeholder="https://docs.example.com/resource-exchange-mou.pdf"
                        className="jenga-input w-full"
                    />
                </div>

                {/* Agreement Checkbox */}
                <label className="flex gap-4 cursor-pointer items-start group">
                    <div
                        className={`mt-1 w-5 h-5 border transition-all duration-300 relative flex items-center justify-center shrink-0 ${
                            agreedToTerms
                                ? "bg-primary border-primary"
                                : "bg-background border-border group-hover:border-foreground"
                        }`}
                    >
                        {agreedToTerms && <Check className="w-3 h-3 text-background" strokeWidth={4} />}
                        <input
                            type="checkbox"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                        />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                        {orgName} agrees to the Jenga365 Resource Exchange model and commits to contributing the selected resources in alignment with verified community milestones.
                    </span>
                </label>

                {error && (
                    <p className="font-mono text-[10px] uppercase tracking-widest text-primary">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full h-14 bg-foreground text-background font-mono font-bold text-[10px] uppercase tracking-[0.5em] hover:bg-primary border border-transparent hover:border-secondary transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-50"
                >
                    {status === "submitting" ? (
                        "Submitting…"
                    ) : (
                        <>
                            <FileText size={14} />
                            Sign &amp; Submit MOU
                            <ArrowRight size={14} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
