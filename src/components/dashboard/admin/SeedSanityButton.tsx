"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Key } from "lucide-react";
import { toast } from "sonner";

export default function SeedSanityButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [showTokenInput, setShowTokenInput] = useState(false);
    const [token, setToken] = useState("");

    async function handleSeed(overrideToken?: string) {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/seed-sanity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: overrideToken || token || undefined }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                if (data.error?.includes("Token") || data.error?.includes("Unauthorized") || data.error?.includes("missing")) {
                    setShowTokenInput(true);
                }
                throw new Error(data.error || "Failed to seed Sanity CMS");
            }

            toast.success(data.message || `Seeded ${data.seededCount} items to Sanity Studio!`);
            setShowTokenInput(false);
            setToken("");
        } catch (err: any) {
            toast.error(err.message || "Seeding failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {showTokenInput && (
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-subtle" />
                        <input
                            type="password"
                            placeholder="Paste Sanity 'sk...' token"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="h-9 pl-8 pr-3 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary w-52 sm:w-64"
                        />
                    </div>
                </div>
            )}

            <button
                onClick={() => handleSeed()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-md text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--brand-green)" }}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Seeding Sanity...
                    </>
                ) : (
                    <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Sync / Seed Starter Content
                    </>
                )}
            </button>
        </div>
    );
}
