import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { ShieldCheck, Clock } from "lucide-react";

export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <Logo size="md" />
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-eyebrow"
                        style={{
                            background:
                                "color-mix(in srgb, var(--warning) 12%, transparent)",
                            color: "var(--warning)",
                        }}
                    >
                        <Clock className="h-3 w-3" /> Status · Under review
                    </span>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="max-w-2xl w-full text-center space-y-8">
                    <div className="space-y-3">
                        <h1 className="text-display-md text-foreground">
                            We&apos;re reviewing your application
                        </h1>
                        <p className="text-body-lg text-foreground-muted">
                            Our team is verifying your details to maintain Jenga365&apos;s safety
                            standards. This usually takes 2–4 hours — you&apos;ll receive an email
                            as soon as your account is active.
                        </p>
                    </div>

                    <div
                        className="inline-flex items-start gap-4 rounded-lg border border-border bg-background p-6 text-left"
                        style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                        <span
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                            style={{ background: "var(--brand-green-soft)" }}
                        >
                            <ShieldCheck
                                className="h-5 w-5"
                                style={{ color: "var(--brand-green)" }}
                            />
                        </span>
                        <div className="space-y-1">
                            <h3 className="text-title text-foreground">
                                High-trust verification
                            </h3>
                            <p className="text-body-sm text-foreground-muted">
                                Your data is encrypted and handled per our privacy policy.
                            </p>
                        </div>
                    </div>

                    <p className="text-body-sm text-foreground-muted">
                        Need help?{" "}
                        <Link
                            href="/contact"
                            className="font-medium hover:underline"
                            style={{ color: "var(--brand-green)" }}
                        >
                            Contact support
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
