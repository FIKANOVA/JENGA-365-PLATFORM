"use client";

import { useState, useEffect } from "react";
import { getNDADocument } from "@/lib/actions/nda";
import { Check, ArrowRight } from "lucide-react";

interface RegistrationNDAStepProps {
    role: "Mentee" | "Mentor" | "CorporatePartner";
    onSignAndComplete: (signatureData: { name: string; version: string; hash: string }) => void;
    isLoading: boolean;
    error?: string | null;
    onBack: () => void;
}

export default function RegistrationNDAStep({ role, onSignAndComplete, isLoading, error, onBack }: RegistrationNDAStepProps) {
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
            hash: docData.hash
        });
    };

    return (
        <div className="w-full max-w-5xl jenga-card shadow-2xl relative overflow-hidden p-0 border-0 flex flex-col">
            {/* Top Identity Stripe */}
            <div className="h-1 w-full bg-primary" />

            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] flex-1">
                {/* DOC CONTENT - The "Protocol" side */}
                <div className="lg:col-span-7 p-10 md:p-16 border-b lg:border-b-0 lg:border-r border-border bg-accent/30">
                    <div className="mb-12 space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-[9px] text-primary font-bold uppercase tracking-[0.5em]">Protocol v{docData?.version || '1.0'}</span>
                            <div className="h-px flex-1 bg-primary/20" />
                        </div>
                        <h2 className="text-4xl font-serif font-bold text-foreground uppercase tracking-tighter leading-none">
                            Confidentiality <br />
                            <span className="text-primary italic">Protocol.</span>
                        </h2>
                        <div className="flex items-center gap-6 pt-2">
                             <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest">
                                Status: UNEXECUTED
                            </p>
                            <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest">
                                Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 font-light text-base leading-relaxed text-muted-foreground h-[450px] overflow-y-auto pr-8 scrollbar-thin scrollbar-thumb-foreground/10">
                        <p className="font-serif italic font-bold text-foreground">
                            This Non-Disclosure & Community Integrity Agreement ("Agreement") governs your access to the Jenga365 Growth Ecosystem.
                        </p>

                        <div className="space-y-4">
                            <h3 className="section-label text-foreground">01. Information Gating</h3>
                            <p className="text-sm">
                                You acknowledge that all technical templates, mentorship methodologies, AI protocols, and partner datasets shared within Jenga365 are strictly confidential and proprietary.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="section-label text-foreground">02. Integrity Clause</h3>
                            <p className="text-sm">
                                Unauthorized redistribution, scraping, or external deployment of Jenga365 internal protocols is a violation of community trust and legal commitment.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="section-label text-foreground">03. Sustainable Protection</h3>
                            <p className="text-sm">
                                Obligations under this protocol remain active for five (5) orbital years following session termination to ensure long-term ecosystem security.
                            </p>
                        </div>

                        {docData?.content && docData.content !== "Standard NDA terms apply." && (
                            <div className="space-y-4 pt-6 border-t border-border mt-8">
                                <h3 className="section-label text-primary">04. Role-Specific Directives ({role})</h3>
                                <p className="font-serif italic text-primary text-sm leading-relaxed">{docData.content}</p>
                            </div>
                        )}
                        
                        <div className="pt-10">
                            <p className="font-mono text-[8px] text-muted-foreground/50 uppercase tracking-[0.4em]">Integrated Legal Framework. Nairobi, Kenya.</p>
                        </div>
                    </div>
                </div>

                {/* SIGNING BOX - The "Execution" side */}
                <div className="lg:col-span-5 p-10 md:p-16 flex flex-col bg-background relative">
                    <div className="flex-1 space-y-12 relative z-10">
                        <div className="space-y-2">
                            <h3 className="font-serif font-bold text-2xl text-foreground uppercase tracking-tight">Execution</h3>
                            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Sign to authenticate your membership</p>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-4 relative group">
                                <label className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em] group-focus-within:text-primary transition-colors">Full Legal Signature</label>
                                <input
                                    type="text"
                                    placeholder="TYPE YOUR FULL NAME"
                                    className="w-full bg-transparent border-b border-border py-4 font-mono text-sm tracking-[0.2em] text-foreground focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30"
                                    value={name}
                                    onChange={(e) => setName(e.target.value.toUpperCase())}
                                    disabled={isLoading}
                                />
                            </div>

                            <label className="flex gap-4 cursor-pointer items-start group">
                                <div className={`mt-1 w-5 h-5 border transition-all duration-500 relative flex items-center justify-center shrink-0 ${agreed ? 'bg-primary border-primary' : 'bg-background border-border group-hover:border-foreground'}`}>
                                    {agreed && <Check className="w-3 h-3 text-background" strokeWidth={4} />}
                                    <input
                                        type="checkbox"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                                    I certify that I have read the Confidentiality Protocol and accept absolute legal responsibility for ecosystem integrity.
                                </span>
                            </label>

                            {error && (
                                <div className="p-4 bg-primary/5 border-l-2 border-primary text-primary font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                                    <span className="font-bold">Error:</span> {error}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-16 space-y-6 relative z-10">
                        <button
                            onClick={handleSubmit}
                            disabled={!canSign || isLoading}
                            className="w-full h-14 bg-foreground text-background font-mono font-bold text-[10px] uppercase tracking-[0.5em] hover:bg-primary border border-transparent hover:border-secondary transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <span className="relative z-10">{isLoading ? "PROCESSING AUTHENTICATION..." : "EXECUTE PROTOCOL"}</span>
                            {!isLoading && <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform relative z-10" />}
                        </button>

                        <button
                            onClick={onBack}
                            disabled={isLoading}
                            className="w-full text-center font-mono text-[9px] text-muted-foreground font-bold tracking-[0.4em] uppercase hover:text-foreground transition-all"
                        >
                            ← Back to commitment
                        </button>

                        <div className="text-center pt-8">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent/50 border border-border">
                                <span className="w-1 h-1 bg-primary animate-pulse" />
                                <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.4em]">
                                    SECURE NODE: {docData?.hash?.substring(0, 12) || "PENDING"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
