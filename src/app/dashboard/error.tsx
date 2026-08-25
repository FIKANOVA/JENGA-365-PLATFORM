"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function DashboardErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[Dashboard Error Boundary Caught]:", error);
    }, [error]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh] text-center">
            <div className="max-w-md w-full p-8 rounded-lg border border-border bg-background space-y-6" style={{ boxShadow: "var(--shadow-sm)" }}>
                <div
                    className="mx-auto w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "var(--brand-red-soft)", color: "var(--brand-red)" }}
                >
                    <AlertCircle className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-display-xs text-foreground font-bold">
                        Dashboard temporarily unavailable
                    </h2>
                    <p className="text-body-sm text-foreground-muted">
                        We encountered an issue loading this section of your dashboard.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-5 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-green)" }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-5 rounded-md border border-border bg-background text-label text-foreground hover:bg-[color:var(--surface-2)] transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
