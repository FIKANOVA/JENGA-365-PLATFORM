"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-background">
            <div className="max-w-md w-full text-center space-y-6">
                <div
                    className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: "var(--brand-red-soft)" }}
                >
                    <AlertTriangle
                        className="h-7 w-7"
                        style={{ color: "var(--brand-red)" }}
                    />
                </div>
                <div className="space-y-2">
                    <h1 className="text-display-sm text-foreground">
                        Something went wrong
                    </h1>
                    <p className="text-body text-foreground-muted">
                        An unexpected error occurred. Our team has been notified.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="inline-flex h-11 items-center justify-center rounded-md px-5 text-label font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-green)" }}
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                    >
                        Return home
                    </Link>
                </div>
            </div>
        </div>
    );
}
