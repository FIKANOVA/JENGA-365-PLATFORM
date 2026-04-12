"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signNDA, getNDADocument } from "@/lib/actions/nda";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NDAPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || "Mentee";

    const [name, setName] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [docData, setDocData] = useState<{ version: string; hash: string; content: string } | null>(null);

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
                toast.success("NDA Signed Successfully");
                router.push(res.redirectTo);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to sign NDA");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBFBF9] flex flex-col font-sans">
            {/* Minimal Header */}
            <header className="border-b border-[#E8E4DC] bg-white">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#BB0000] rounded-sm flex items-center justify-center">
                            <span className="text-white font-serif font-bold text-xs">J</span>
                        </div>
                        <span className="font-serif font-black text-xl tracking-tight text-[#1A1A1A]">Jenga365</span>
                    </Link>
                    <Link href="/" className="font-mono text-[10px] font-black uppercase tracking-widest hover:text-[#BB0000] transition-colors">
                        Return to Platform
                    </Link>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-6 py-12 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* DOC CONTENT */}
                    <div className="lg:col-span-8 bg-white p-12 border border-[#E8E4DC] shadow-sm">
                        <div className="mb-10">
                            <h1 className="text-3xl font-serif font-black text-[#1A1A1A] mb-2">Non-Disclosure Agreement</h1>
                            <p className="text-[#8A8A8A] font-mono text-[10px] uppercase tracking-widest">
                                Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        <div className="space-y-8 font-body text-[15px] leading-relaxed text-[#4A4A4A]">
                            <p>
                                This Non-Disclosure Agreement (the "Agreement") is entered into by and between Jenga365 ("Disclosing Party") and the individual accepting these terms ("Receiving Party").
                            </p>

                            <section className="space-y-3">
                                <h3 className="font-serif font-bold text-[#1A1A1A]">1. Definition of Confidential Information</h3>
                                <p>
                                    "Confidential Information" shall mean any and all technical and non-technical information provided by the Disclosing Party, including but not limited to trade secrets, proprietary information, ideas, techniques, sketches, drawings, works of authorship, models, inventions, know-how, processes, apparatuses, equipment, algorithms, software programs, software source documents, and formulae related to the current, future, and proposed products and services of the Disclosing Party.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="font-serif font-bold text-[#1A1A1A]">2. Non-Disclosure and Non-Use Obligations</h3>
                                <p>
                                    The Receiving Party agrees that it shall take reasonable measures to protect the secrecy of and avoid disclosure and unauthorized use of the Confidential Information of the Disclosing Party. Without limiting the foregoing, the Receiving Party shall take at least those measures that it takes to protect its own most highly confidential information.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="font-serif font-bold text-[#1A1A1A]">3. Exceptions</h3>
                                <p>
                                    The obligations of the Receiving Party under Section 2 above shall not apply to any information that the Receiving Party can prove: a) was in the public domain at the time it was disclosed; b) entered the public domain after it was disclosed through no fault of the Receiving Party; c) was rightfully known to the Receiving Party, without restriction, at the time of disclosure.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="font-serif font-bold text-[#1A1A1A]">4. Term</h3>
                                <p>
                                    The obligations of the Receiving Party shall survive for a period of five (5) years following the termination of the Receiving Party's account or relationship with Jenga365.
                                </p>
                            </section>

                            {/* Injected conditional text from DB if applicable */}
                            {docData?.content && docData.content !== "Standard NDA terms apply." && (
                                <section className="space-y-3 mt-8 pt-8 border-t border-[#E8E4DC]">
                                    <h3 className="font-serif font-bold text-[#1A1A1A]">5. Role-Specific Terms</h3>
                                    <p className="italic">{docData.content}</p>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* SIGNING BOX */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-8 bg-[#FBFBF9] border border-[#E8E4DC] p-8 shadow-sm">
                            <h2 className="font-serif font-bold text-xl text-[#1A1A1A] mb-8 text-center border-b border-[#E8E4DC] pb-4">
                                <span className="text-[#D0CBC0] mr-2">✍️</span> Acceptance of Terms
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="font-mono text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest block">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full legal name"
                                        className="w-full h-12 bg-white border border-[#E8E4DC] px-4 font-body text-sm focus:outline-none focus:border-[#BB0000] transition-all"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <label className="flex gap-3 cursor-pointer items-start">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-4 h-4 text-[#BB0000] border-gray-300 rounded focus:ring-[#BB0000]"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        disabled={isSubmitting}
                                    />
                                    <span className="text-xs font-body text-[#4A4A4A] leading-relaxed">
                                        I have read and agree to the terms of the Non-Disclosure Agreement. I understand this is a legally binding document.
                                    </span>
                                </label>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!canSign || isSubmitting}
                                    className="w-full h-12 bg-[#BB0000] text-white font-mono font-bold text-[10px] uppercase tracking-widest hover:bg-[#8B0000] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                >
                                    {isSubmitting ? "PROCESSING..." : (
                                        <>SIGN & CONTINUE <ArrowRight size={14} /></>
                                    )}
                                </button>

                                <div className="text-center pt-4">
                                    <p className="text-[9px] font-mono text-[#8A8A8A] uppercase tracking-widest">
                                        Doc ID: {docData?.version || "Loading..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
