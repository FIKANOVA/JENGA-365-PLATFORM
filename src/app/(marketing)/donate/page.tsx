"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";
import PageHero from "@/components/shared/PageHero";

const PRESETS = [500, 1000, 2500, 5000];
const CAUSES = [
    {
        id: "RUGBY",
        title: "Rugby Development",
        desc: "Funding grassroots clinics and equipment for underprivileged schools.",
        icon: "sports_rugby",
        color: "var(--primary-green)"
    },
    {
        id: "ECO",
        title: "Jenga Green Initiative",
        desc: "Supporting our reforestation projects across East Africa.",
        icon: "forest",
        color: "var(--green)"
    },
    {
        id: "EDU",
        title: "Jenga AI Lab",
        desc: "Providing solar-powered AI laptops and connectivity to rural hubs.",
        icon: "terminal",
        color: "black"
    }
];

export default function DonationPage() {
    const { data: session } = useSession();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
    const [customAmount, setCustomAmount] = useState("");
    const [selectedCause, setSelectedCause] = useState("RUGBY");
    const [email, setEmail] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDonation = async () => {
        const amountToCharge = customAmount ? Number(customAmount) : selectedAmount;
        if (!amountToCharge || amountToCharge < 100) {
            toast.error("Please enter a valid amount (Minimum KES 100)");
            return;
        }
        
        const donorEmail = session?.user?.email || email;
        if (!donorEmail) {
            toast.error("Please provide an email address for your receipt");
            return;
        }

        setIsProcessing(true);

        const { default: PaystackPop } = await import("@paystack/inline-js");
        const paystack = new PaystackPop();
        paystack.newTransaction({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_dummy", // Provide your public key here
            email: donorEmail,
            amount: amountToCharge * 100, // Paystack uses kobo/cents
            currency: "KES",
            metadata: {
                userId: session?.user?.id || null,
                type: "donation",
                custom_fields: [
                    {
                        display_name: "Donation Cause",
                        variable_name: "donation_cause",
                        value: selectedCause
                    }
                ]
            },
            onSuccess: (transaction: any) => {
                setIsProcessing(false);
                toast.success(`Donation successful! Reference: ${transaction.reference}`);
                setCustomAmount("");
                setSelectedAmount(1000);
                setEmail("");
            },
            onCancel: () => {
                setIsProcessing(false);
                toast.error("Donation cancelled");
            }
        });
    };

    return (
        <div className="min-h-screen bg-white">
            <main>
                <PageHero
                    eyebrow="Impact Funding"
                    heading={<>Fueling <span className="italic text-primary">Futures.</span></>}
                    description="Your contribution directly scales our mentorship, sports development, and environmental programs across the continent."
                    bgImage="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1920&auto=format&fit=crop"
                    bgFallback="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1920&auto=format&fit=crop"
                    overlayOpacity={70}
                />

                {/* ── Donation Interface ── */}
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                        
                        {/* Allocation Selection */}
                        <div className="lg:col-span-7 space-y-12">
                            <div className="space-y-4">
                                <h2 className="font-serif font-bold text-3xl text-black uppercase tracking-tight">Select your impact path</h2>
                                <p className="text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-[0.2em] font-bold">Where should your funds go?</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {CAUSES.map((cause) => (
                                    <button
                                        key={cause.id}
                                        onClick={() => setSelectedCause(cause.id)}
                                        className={`group relative flex items-center gap-8 p-8 border text-left transition-all duration-500 rounded-sm ${selectedCause === cause.id ? 'border-black bg-black text-white shadow-2xl scale-[1.02]' : 'border-[var(--border)] hover:border-black bg-white'}`}
                                    >
                                        <div className={`size-16 flex items-center justify-center rounded-sm transition-colors duration-500 ${selectedCause === cause.id ? 'bg-white/10' : 'bg-[var(--off-white)]'}`}>
                                            <span className="material-symbols-outlined text-4xl" style={{ color: selectedCause === cause.id ? cause.color : 'inherit' }}>{cause.icon}</span>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h3 className="font-serif font-bold text-xl uppercase tracking-tight">{cause.title}</h3>
                                            <p className={`text-sm font-light ${selectedCause === cause.id ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>{cause.desc}</p>
                                        </div>
                                        {selectedCause === cause.id && (
                                            <div className="absolute top-4 right-4 animate-pulse">
                                                <span className="material-symbols-outlined text-[var(--primary-green)]">verified</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Card */}
                        <div className="lg:col-span-5">
                            <Card className="border-[var(--border)] rounded-sm shadow-2xl overflow-hidden sticky top-32">
                                <div className="bg-black p-10 text-center">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--primary-green)] font-bold mb-2 block">Donation Amount</span>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="font-serif text-2xl text-white opacity-40">KES</span>
                                        <span className="font-serif font-bold text-6xl text-white tracking-tighter">
                                            {customAmount || (selectedAmount?.toLocaleString() || "0")}
                                        </span>
                                    </div>
                                </div>
                                <CardContent className="p-10 space-y-10">
                                    <div className="grid grid-cols-2 gap-4">
                                        {PRESETS.map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() => {
                                                    setSelectedAmount(amt);
                                                    setCustomAmount("");
                                                }}
                                                className={`py-4 font-mono font-bold text-[11px] border transition-all rounded-sm ${selectedAmount === amt && !customAmount ? 'bg-[var(--primary-green)] border-[var(--primary-green)] text-white shadow-xl px-0' : 'bg-white border-[var(--border)] text-black hover:border-black'}`}
                                            >
                                                KES {amt.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <label className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold">Custom Amount</label>
                                            <span className="font-mono text-[9px] text-[var(--primary-green)]">MIN KES 100</span>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-[var(--text-muted)] font-serif italic text-lg opacity-40">
                                                KES
                                            </div>
                                            <Input
                                                type="number"
                                                placeholder="Enter amount"
                                                value={customAmount}
                                                onChange={(e) => {
                                                    setCustomAmount(e.target.value);
                                                    setSelectedAmount(null);
                                                }}
                                                className="h-16 pl-16 pr-8 border-[var(--border)] rounded-sm focus:border-black focus:ring-0 text-xl font-serif font-bold transition-all bg-[var(--off-white)] group-hover:bg-white"
                                            />
                                        </div>
                                    </div>

                                    {!session?.user && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <label className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold">Your Email</label>
                                            </div>
                                            <div className="relative group">
                                                <Input
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="h-16 px-6 border-[var(--border)] rounded-sm focus:border-black focus:ring-0 text-xl font-sans transition-all bg-[var(--off-white)] group-hover:bg-white"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <Button 
                                            onClick={handleDonation}
                                            disabled={isProcessing}
                                            className="w-full h-16 bg-black text-white font-mono text-[11px] uppercase tracking-widest font-bold hover:bg-[var(--primary-green)] transition-all rounded-sm shadow-2xl flex gap-3 border border-transparent hover:border-[var(--red)] disabled:opacity-70"
                                        >
                                            {isProcessing ? "PROCESSING..." : "PROCESS CONTRIBUTION"}
                                            <span className="material-symbols-outlined text-[18px]">
                                                {isProcessing ? "hourglass_empty" : "lock"}
                                            </span>
                                        </Button>
                                        <p className="text-[9px] text-center text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold">
                                            Secure end-to-end encryption via Paystack
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>

                {/* ── Final CTA Section ── */}
                <section className="mt-20">
                    <FinalCTAStrip />
                </section>
            </main>
        </div>
    );
}
