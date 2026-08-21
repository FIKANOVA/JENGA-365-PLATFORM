"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";
import { X } from "lucide-react";

const PRESETS = [500, 1000, 2500, 5000] as const;
const CAUSES = [
    { id: "RUGBY", label: "Rugby Development" },
    { id: "ECO", label: "Jenga Green Initiative" },
    { id: "EDU", label: "Jenga365" },
] as const;

type DonateCtx = { openDonate: () => void };

const Ctx = createContext<DonateCtx | null>(null);

export function useDonate(): DonateCtx {
    const ctx = useContext(Ctx);
    if (!ctx) {
        // Safe no-op if a DonateButton lives outside the provider — shouldn't
        // happen in practice since the provider wraps the whole app.
        return { openDonate: () => {} };
    }
    return ctx;
}

/**
 * Renders a single donate modal at app root. All DonateButton instances
 * trigger this shared modal via context, so the modal lifecycle is
 * independent of where it's triggered from (e.g., inside a dropdown
 * that unmounts when closed).
 */
export function DonateProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const value = useMemo<DonateCtx>(() => ({ openDonate: () => setOpen(true) }), []);

    const handleClose = useCallback(() => setOpen(false), []);

    return (
        <Ctx.Provider value={value}>
            {children}
            {open && <DonateModal onClose={handleClose} />}
        </Ctx.Provider>
    );
}

function DonateModal({ onClose }: { onClose: () => void }) {
    const { data: session } = useSession();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
    const [customAmount, setCustomAmount] = useState("");
    const [email, setEmail] = useState("");
    const [cause, setCause] = useState<typeof CAUSES[number]["id"]>("RUGBY");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    async function handleDonate() {
        const amount = customAmount ? Number(customAmount) : selectedAmount;
        if (!amount || amount < 100) {
            toast.error("Minimum donation is KES 100");
            return;
        }
        const donorEmail = session?.user?.email || email;
        if (!donorEmail) {
            toast.error("Please enter an email for your receipt");
            return;
        }
        const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        if (!key) {
            toast.error("Payments are not configured. Please contact support.");
            return;
        }

        setProcessing(true);
        try {
            const { default: PaystackPop } = await import("@paystack/inline-js");
            const paystack = new PaystackPop();
            paystack.newTransaction({
                key,
                email: donorEmail,
                amount: amount * 100,
                currency: "KES",
                metadata: {
                    userId: session?.user?.id ?? null,
                    type: "donation",
                    custom_fields: [
                        { display_name: "Donation Cause", variable_name: "donation_cause", value: cause },
                    ],
                },
                onSuccess: (tx: { reference: string }) => {
                    setProcessing(false);
                    onClose();
                    toast.success(`Thank you! Reference: ${tx.reference}`);
                },
                onCancel: () => {
                    setProcessing(false);
                    toast.error("Donation cancelled");
                },
            });
        } catch {
            setProcessing(false);
            toast.error("Could not open Paystack. Please try again.");
        }
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Donate to Jenga365"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div
                className="relative w-full max-w-md rounded-md border border-border p-6 space-y-5"
                style={{ background: "var(--background)", boxShadow: "var(--shadow-lg)" }}
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Fuel impact</p>
                        <h2 className="text-display-sm text-foreground">Donate</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-foreground-muted hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-2">
                    <span className="text-label text-foreground">Cause</span>
                    <div className="grid grid-cols-3 gap-2">
                        {CAUSES.map((c) => {
                            const selected = cause === c.id;
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setCause(c.id)}
                                    className="rounded-md border px-3 py-2 text-body-sm transition-colors"
                                    style={{
                                        background: selected ? "var(--brand-green-soft)" : "var(--background)",
                                        borderColor: selected ? "var(--brand-green)" : "var(--border)",
                                        color: selected ? "var(--brand-green)" : "var(--foreground)",
                                    }}
                                >
                                    {c.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <span className="text-label text-foreground">Amount (KES)</span>
                    <div className="grid grid-cols-4 gap-2">
                        {PRESETS.map((amt) => {
                            const active = selectedAmount === amt && !customAmount;
                            return (
                                <button
                                    key={amt}
                                    type="button"
                                    onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                                    className="rounded-md border py-2 text-body-sm font-medium transition-colors"
                                    style={{
                                        background: active ? "var(--brand-green)" : "var(--background)",
                                        color: active ? "var(--brand-green-fg)" : "var(--foreground)",
                                        borderColor: active ? "var(--brand-green)" : "var(--border)",
                                    }}
                                >
                                    {amt.toLocaleString()}
                                </button>
                            );
                        })}
                    </div>
                    <input
                        type="number"
                        inputMode="numeric"
                        min={100}
                        placeholder="Custom amount (min 100)"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                        className="h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground"
                    />
                </div>

                {!session?.user && (
                    <div className="space-y-2">
                        <span className="text-label text-foreground">Email (for receipt)</span>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            className="h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground"
                        />
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleDonate}
                    disabled={processing}
                    className="w-full h-11 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--brand-green)" }}
                >
                    {processing ? "Opening Paystack…" : "Continue to Paystack"}
                </button>

                <p className="text-body-sm text-foreground-muted text-center">
                    Secure payment via Paystack.
                </p>
            </div>
        </div>
    );
}
