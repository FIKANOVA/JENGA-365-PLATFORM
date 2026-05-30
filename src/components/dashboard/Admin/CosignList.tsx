"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export type CosignRow = {
    id: string;
    reason: string;
    strikeCount: number;
    expiresAt: string | null;
    targetName: string;
    requesterName: string;
};

export default function CosignList({ pending }: { pending: CosignRow[] }) {
    const router = useRouter();
    const [busyId, setBusyId] = useState<string | null>(null);

    async function cosign(id: string) {
        if (!confirm("Co-sign this permanent suspension? The account will be banned immediately.")) return;
        setBusyId(id);
        try {
            const res = await fetch(`/api/admin/suspensions/${id}/cosign`, { method: "POST" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(data.error ?? "Failed to co-sign");
                return;
            }
            toast.success("Suspension co-signed");
            router.refresh();
        } catch {
            toast.error("Network error");
        } finally {
            setBusyId(null);
        }
    }

    if (pending.length === 0) {
        return <p className="jenga-card p-6 text-body-sm text-foreground-muted">No suspensions awaiting co-sign.</p>;
    }

    return (
        <div className="space-y-3">
            {pending.map((row) => (
                <div key={row.id} className="jenga-card p-5 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" style={{ color: "var(--danger, #c0392b)" }} />
                            <span className="text-body font-medium text-foreground">{row.targetName}</span>
                            <span className="text-eyebrow text-foreground-subtle">{row.strikeCount} strikes</span>
                        </div>
                        <p className="text-body-sm text-foreground-muted mt-1">{row.reason}</p>
                        <p className="text-body-sm text-foreground-subtle mt-1">
                            Requested by {row.requesterName}
                            {row.expiresAt ? ` · expires ${new Date(row.expiresAt).toLocaleString()}` : ""}
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled={busyId === row.id}
                        className="btn-primary shrink-0"
                        onClick={() => cosign(row.id)}
                    >
                        {busyId === row.id ? "Co-signing…" : "Co-sign"}
                    </button>
                </div>
            ))}
        </div>
    );
}
