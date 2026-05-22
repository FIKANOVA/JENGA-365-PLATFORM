"use client";

import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";

export default function Forbidden() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-16">
            <div className="max-w-md w-full text-center space-y-6">
                <div
                    className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: "var(--surface-2)" }}
                >
                    <Lock className="h-7 w-7 text-foreground" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-display-sm text-foreground">Access denied</h1>
                    <p className="text-body text-foreground-muted">
                        You don&apos;t have permission to view this page. Contact support if
                        you believe this is an error.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-5 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Go back
                    </button>
                    <Link
                        href="/contact"
                        className="inline-flex h-11 items-center justify-center rounded-md px-5 text-label font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-green)" }}
                    >
                        Contact support
                    </Link>
                </div>
            </div>
        </div>
    );
}
