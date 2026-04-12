"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { signUp } from "@/lib/auth/client";
import { signNDA } from "@/lib/actions/nda";
import { setUserRole, saveUserMetadata } from "@/lib/actions/auth";
import { sendCorporateRegistrationEmails } from "@/lib/actions/registration-emails";
import Header from "@/components/shared/Header";
import RegistrationNDAStep from "@/components/auth/RegistrationNDAStep";
import { motion, AnimatePresence } from "framer-motion";

const ORG_TYPES = [
    { id: "tech", label: "Tech" },
    { id: "finance", label: "Finance" },
    { id: "NGO", label: "NGO" },
    { id: "govt", label: "Government" },
    { id: "manufacturing", label: "Manufacturing" },
];

export default function CorporateRegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignAndComplete = async (signatureData: { name: string; version: string; hash: string }) => {
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

            if (result?.data?.user?.id) {
                await setUserRole(result.data.user.id, "CorporatePartner");
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
                role: "CorporatePartner",
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
                    window.location.origin
                );

                router.push(ndaResult.redirectTo);
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans relative overflow-hidden">
            {/* Background watermark */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none flex items-center justify-between">
                <span className="font-serif font-bold text-[20vw] text-foreground/[0.02] leading-none tracking-tighter uppercase whitespace-nowrap transform -translate-x-[10%]">
                    CORPORATE
                </span>
                <span className="font-serif font-bold text-[20vw] text-foreground/[0.02] leading-none tracking-tighter uppercase whitespace-nowrap transform translate-x-[10%] mt-[20vh]">
                    PROTOCOL
                </span>
            </div>

            <Header minimalProps={{ currentStep: step, totalSteps: 3 }} />

            <main className="flex-1 container mx-auto px-6 py-24 flex flex-col items-center relative z-10">
                <AnimatePresence mode="wait">
                    {/* STEP 1: Organisation Details */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full max-w-4xl space-y-12"
                        >
                            <div className="text-center space-y-4">
                                <div className="flex items-center justify-center gap-4">
                                    <span className="h-px w-8 bg-foreground" />
                                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground font-bold">Step 1 of 3 — Your Organisation</span>
                                    <span className="h-px w-8 bg-foreground" />
                                </div>
                                <h1 className="font-serif font-black text-5xl text-foreground uppercase tracking-tighter leading-none">
                                    Organisation<br />
                                    <span className="italic text-primary">Details.</span>
                                </h1>
                                <p className="font-sans font-light text-lg text-muted-foreground max-w-2xl mx-auto">
                                    Tell us about your organisation to establish your partnership node in the Jenga365 network.
                                </p>
                            </div>

                            <div className="jenga-card p-10 space-y-8 max-w-2xl mx-auto shadow-xl relative overflow-hidden group border-foreground/20 hover:border-foreground">
                                <div className="absolute top-0 left-0 w-full h-1 bg-foreground group-hover:h-2 transition-all duration-500" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="jenga-label">Organisation Name</label>
                                        <input
                                            type="text"
                                            name="orgName"
                                            value={formData.orgName}
                                            onChange={handleInputChange}
                                            className="jenga-input w-full"
                                            placeholder="Legal entity name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="jenga-label">Industry</label>
                                        <select
                                            name="orgType"
                                            value={formData.orgType}
                                            onChange={handleInputChange}
                                            className="jenga-input w-full bg-background"
                                        >
                                            <option value="">Select sector</option>
                                            {ORG_TYPES.map(type => (
                                                <option key={type.id} value={type.id}>{type.label}</option>
                                            ))}
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="jenga-label">Primary Contact Name</label>
                                        <input
                                            type="text"
                                            name="contactName"
                                            value={formData.contactName}
                                            onChange={handleInputChange}
                                            className="jenga-input w-full"
                                            placeholder="Full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="jenga-label">Contact Title</label>
                                        <input
                                            type="text"
                                            name="contactTitle"
                                            value={formData.contactTitle}
                                            onChange={handleInputChange}
                                            className="jenga-input w-full"
                                            placeholder="Official title"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="jenga-label">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="jenga-input w-full"
                                        placeholder="partner@organisation.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="jenga-label">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="jenga-input w-full"
                                        placeholder="Min. 8 characters"
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        if (formData.orgName && formData.contactName && formData.email && formData.password) {
                                            setError(null);
                                            setStep(2);
                                        } else {
                                            setError("Please fill in all required fields.");
                                        }
                                    }}
                                    className="w-full h-14 bg-foreground text-background font-mono font-bold text-[10px] uppercase tracking-[0.5em] hover:bg-primary border border-transparent hover:border-secondary transition-all flex items-center justify-center gap-4 shadow-xl"
                                >
                                    Continue <ArrowRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Contribution Model */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full max-w-5xl jenga-card shadow-2xl relative overflow-hidden flex flex-col lg:flex-row p-0 border-0"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-foreground" />

                            {/* Left — info */}
                            <div className="p-12 md:p-16 space-y-10 bg-accent/30 border-b lg:border-b-0 lg:border-r border-border flex-1">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono text-[9px] text-foreground font-bold uppercase tracking-[0.5em]">Step 2 of 3</span>
                                        <div className="h-px flex-1 bg-foreground/10" />
                                    </div>
                                    <h1 className="font-serif font-black text-4xl text-foreground uppercase tracking-tighter leading-none">
                                        Your Contribution<br />
                                        <span className="italic text-primary">Model.</span>
                                    </h1>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-8 bg-foreground text-background space-y-4 shadow-xl">
                                        <h3 className="section-label text-muted">How it works</h3>
                                        <p className="font-sans font-light text-sm leading-relaxed opacity-80">
                                            Resources are tied to verifiable performance. Impact is only unlocked when agreed milestones are met.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { id: "Fin", label: "Financial Pledges", icon: "payments" },
                                            { id: "Hardware", label: "Hardware Assets", icon: "inventory_2" },
                                            { id: "Expertise", label: "Human Capital", icon: "psychology" },
                                        ].map((model) => (
                                            <button
                                                key={model.id}
                                                onClick={() => setFormData(p => ({ ...p, contributionType: model.id }))}
                                                className={`h-20 px-8 flex items-center justify-between border transition-all duration-500 ${formData.contributionType === model.id
                                                    ? "bg-foreground border-foreground text-background"
                                                    : "bg-background border-border text-muted-foreground hover:border-foreground"
                                                }`}
                                            >
                                                <span className="font-mono text-[9px] font-bold uppercase tracking-widest">{model.label}</span>
                                                <span className="material-symbols-outlined text-sm">{model.icon}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right — accept */}
                            <div className="p-12 md:p-16 flex flex-col justify-center space-y-12 flex-1 relative">
                                <div className="space-y-6 relative z-10">
                                    <h3 className="font-serif font-black text-2xl text-foreground uppercase tracking-tight leading-snug">
                                        Do you commit to our<br />
                                        performance-based<br />
                                        partnership model?
                                    </h3>

                                    <label className="flex gap-4 cursor-pointer items-start group">
                                        <div className={`mt-1 w-6 h-6 border transition-all duration-500 relative flex items-center justify-center shrink-0 ${formData.agreedToProtocol ? "bg-primary border-primary" : "bg-background border-border group-hover:border-foreground"}`}>
                                            {formData.agreedToProtocol && <Check className="w-4 h-4 text-background" strokeWidth={4} />}
                                            <input
                                                type="checkbox"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                checked={formData.agreedToProtocol}
                                                onChange={(e) => setFormData(p => ({ ...p, agreedToProtocol: e.target.checked }))}
                                            />
                                        </div>
                                        <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                                            Our organisation commits to the milestone-based contribution protocol and performance-tied resource distribution.
                                        </span>
                                    </label>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <button
                                        onClick={() => {
                                            if (formData.agreedToProtocol) {
                                                setError(null);
                                                setStep(3);
                                            } else {
                                                setError("Please confirm your commitment to continue.");
                                            }
                                        }}
                                        className="w-full h-14 bg-foreground text-background font-mono font-bold text-[10px] uppercase tracking-[0.5em] hover:bg-primary border border-transparent hover:border-secondary transition-all flex items-center justify-center gap-4 shadow-xl"
                                    >
                                        Continue to Agreement <ArrowRight size={16} />
                                    </button>

                                    <button
                                        onClick={() => setStep(1)}
                                        className="w-full py-4 text-center font-mono text-[9px] text-muted-foreground font-black tracking-[0.4em] uppercase hover:text-foreground transition-all"
                                    >
                                        ← Go Back
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: NDA Signing */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="w-full flex justify-center"
                        >
                            <RegistrationNDAStep
                                role="CorporatePartner"
                                onSignAndComplete={handleSignAndComplete}
                                isLoading={loading}
                                error={error}
                                onBack={() => setStep(2)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {error && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 px-8 py-4 bg-primary text-background font-mono text-[10px] uppercase tracking-widest font-black shadow-2xl z-[200] flex items-center gap-4 border border-secondary">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                </div>
            )}
        </div>
    );
}
