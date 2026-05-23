"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import {
    upsertMerchandiseStock,
    type MerchandiseSyncResult,
} from "@/lib/actions/merchandise";

interface SyncStoreInventoryButtonProps {
    readonly variant?: "primary" | "ghost";
}

export default function SyncStoreInventoryButton({
    variant = "primary",
}: SyncStoreInventoryButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [lastResult, setLastResult] = useState<MerchandiseSyncResult | null>(null);

    const handleSync = () => {
        startTransition(async () => {
            try {
                const result = await upsertMerchandiseStock();
                setLastResult(result);
                const summary = `${result.inserted} added · ${result.updated} updated`;
                if (result.skipped > 0 || result.errors.length > 0) {
                    toast.warning(`Synced with ${result.skipped} skipped — ${summary}`);
                    for (const err of result.errors.slice(0, 3)) console.warn("[merchandise sync]", err);
                } else {
                    toast.success(`Inventory synced — ${summary}`);
                }
            } catch (err) {
                const msg = (err as Error).message;
                if (msg.startsWith("FORBIDDEN")) {
                    toast.error("You don't have permission to sync inventory");
                } else if (msg === "UNAUTHORIZED") {
                    toast.error("Sign in required");
                } else {
                    toast.error(`Sync failed: ${msg}`);
                }
            }
        });
    };

    const baseClasses =
        "inline-flex items-center gap-2 h-10 rounded-md px-4 text-label font-medium transition-opacity disabled:opacity-60 hover:opacity-90";
    const variantStyle =
        variant === "primary"
            ? { background: "var(--brand-green)", color: "var(--brand-green-fg)" }
            : { background: "var(--surface-2)", color: "var(--foreground)" };

    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                onClick={handleSync}
                disabled={isPending}
                className={baseClasses}
                style={variantStyle}
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Syncing…
                    </>
                ) : (
                    <>
                        <RefreshCw className="w-4 h-4" /> Sync store inventory
                    </>
                )}
            </button>

            {lastResult && (
                <div className="flex items-center gap-1.5 text-eyebrow text-foreground-muted">
                    <CheckCircle2 className="w-3 h-3" style={{ color: "var(--brand-green)" }} />
                    Last sync: {new Date(lastResult.syncedAt).toLocaleTimeString()} ·{" "}
                    {lastResult.productsProcessed} from Sanity · {lastResult.inserted} added ·{" "}
                    {lastResult.updated} updated
                    {lastResult.skipped > 0 ? ` · ${lastResult.skipped} skipped` : ""}
                </div>
            )}
        </div>
    );
}
