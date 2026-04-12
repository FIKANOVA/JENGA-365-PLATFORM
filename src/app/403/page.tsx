"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function Forbidden() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-white">
            <div className="mb-6 p-6 bg-accent rounded-full animate-bounce-in">
                <Lock className="w-16 h-16 text-primary" />
            </div>
            <h1 className="font-playfair font-black text-4xl md:text-5xl text-foreground mb-4">
                Access Denied
            </h1>
            <p className="font-lato text-muted-foreground max-w-sm mb-8">
                You don't have permission to view this page. Please contact support if you believe this is an error.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="border border-input text-foreground font-mono uppercase tracking-widest px-8 py-3 hover:border-primary transition-colors"
                >
                    ← Go Back
                </button>
                <Link
                    href="/contact"
                    className="border border-input text-foreground font-mono uppercase tracking-widest px-8 py-3 hover:border-primary transition-colors"
                >
                    Contact Support
                </Link>
            </div>
        </div>
    );
}
