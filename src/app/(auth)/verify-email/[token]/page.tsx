"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

export default function VerifyEmailPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<string | null>(null);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setError("Missing verification token.");
            return;
        }

        async function verify() {
            try {
                const res = await authClient.verifyEmail({
                    query: { token },
                });

                if (res.error) {
                    setStatus("error");
                    setError(res.error.message || "Invalid or expired token.");
                } else {
                    setStatus("success");
                    toast.success("Email verified!");
                }
            } catch (err: any) {
                setStatus("error");
                setError("An unexpected error occurred.");
            }
        }

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <header className="fixed top-0 left-0 right-0 p-8 flex justify-center border-b border-border bg-white z-50">
                <Image
                    src="/assets/logos/jenga365-premium.png"
                    alt="Jenga365"
                    width={150}
                    height={40}
                    className="h-10 w-auto object-contain"
                    priority
                />
            </header>
            <div className="max-w-[480px] w-full text-center space-y-8">
                {status === "loading" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                        <Loader2 className="w-12 h-12 text-[#BB0000] animate-spin" />
                        <h1 className="text-3xl font-black font-playfair">Verifying your email...</h1>
                        <p className="text-muted-foreground font-lato">Please wait while we confirm your identity.</p>
                    </motion.div>
                )}

                {status === "success" && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-[#006600]/10 rounded-full flex items-center justify-center relative">
                            <motion.svg
                                viewBox="0 0 52 52"
                                className="w-12 h-12 text-[#006600]"
                                initial="hidden"
                                animate="visible"
                            >
                                <motion.path
                                    d="M14 27l7 7 16-16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    variants={{
                                        hidden: { pathLength: 0 },
                                        visible: { pathLength: 1, transition: { duration: 0.5, ease: "easeInOut" } }
                                    }}
                                />
                            </motion.svg>
                        </div>
                        <h1 className="text-3xl font-black font-playfair">Email Verified!</h1>
                        <p className="text-muted-foreground font-lato">
                            Your email has been confirmed. Let's set up your platform agreement.
                        </p>
                        <Link href="/legal/nda" className="w-full">
                            <button className="w-full py-4 bg-[#BB0000] text-white font-mono text-xs uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                Continue to Agreement <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </motion.div>
                )}

                {status === "error" && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-[#BB0000]/10 rounded-full flex items-center justify-center">
                            <X className="w-10 h-10 text-[#BB0000]" />
                        </div>
                        <h1 className="text-3xl font-black font-playfair">Link Expired</h1>
                        <p className="text-muted-foreground font-lato">
                            {error || "This verification link has expired or already been used."}
                        </p>
                        <div className="flex flex-col w-full gap-4">
                            <button
                                disabled={resending}
                                onClick={async () => {
                                    setResending(true);
                                    try {
                                        await authClient.sendVerificationEmail({
                                            email: "",
                                            callbackURL: "/legal/nda",
                                        });
                                        toast.success("New verification link sent — check your inbox.");
                                    } catch {
                                        toast.error("Could not resend — please contact support.");
                                    } finally {
                                        setResending(false);
                                    }
                                }}
                                className="w-full py-4 bg-[#BB0000] text-white font-mono text-xs uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {resending ? "Sending..." : "Send a new link"}
                            </button>
                            <Link href="/contact" className="text-xs font-mono text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors">
                                Contact Support
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
