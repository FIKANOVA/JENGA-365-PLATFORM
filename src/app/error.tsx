"use client";

import { useEffect } from "react";
import Link from "next/link";

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
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-white">
            <h1 className="font-playfair font-black text-4xl md:text-5xl text-foreground mb-4">
                Something went wrong
            </h1>
            <p className="font-lato text-muted-foreground max-w-md mb-8">
                An unexpected error occurred. Our team has been notified and we're working to fix it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => reset()}
                    className="bg-primary text-white font-mono uppercase tracking-widest px-8 py-3 hover:opacity-90 transition-opacity"
                >
                    Try again
                </button>
                <Link
                    href="/"
                    className="border border-input text-foreground font-mono uppercase tracking-widest px-8 py-3 hover:border-primary transition-colors"
                >
                    Go to Homepage
                </Link>
            </div>
        </div>
    );
}
