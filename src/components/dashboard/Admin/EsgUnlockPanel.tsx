"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Unlock, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { setPartnerLooker } from "@/lib/actions/adminOps";

export type MilestoneRow = {
    id: string;
    milestoneType: string;
    thresholdValue: number;
    currentValue: number;
    status: string;
    partnerName: string;
};

export type PartnerLookerRow = {
    id: string;
    orgName: string;
    lookerReportId: string;
    lookerShareUrl: string;
};

export default function EsgUnlockPanel({
    milestones,
    partners,
}: {
    milestones: MilestoneRow[];
    partners: PartnerLookerRow[];
}) {
    const router = useRouter();
    const [busyId, setBusyId] = useState<string | null>(null);

    async function unlock(id: string) {
        const notes = prompt("Optional note for this manual unlock (audit trail):") ?? undefined;
        setBusyId(id);
        try {
            const res = await fetch(`/api/admin/esg-unlock/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(data.error ?? "Failed to unlock");
                return;
            }
            toast.success("Milestone unlocked");
            router.refresh();
        } catch {
            toast.error("Network error");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <div className="space-y-10">
            {/* Milestones */}
            <section className="space-y-3">
                <h2 className="text-body font-medium text-foreground flex items-center gap-2">
                    <Unlock className="w-4 h-4" /> Milestones
                </h2>
                {milestones.length === 0 ? (
                    <p className="jenga-card p-6 text-body-sm text-foreground-muted">No milestones configured.</p>
                ) : (
                    milestones.map((m) => (
                        <div key={m.id} className="jenga-card p-5 flex items-center justify-between gap-4">
                            <div>
                                <span className="text-body font-medium text-foreground">{m.milestoneType}</span>
                                <span className="text-eyebrow text-foreground-subtle ml-2">{m.partnerName}</span>
                                <p className="text-body-sm text-foreground-muted mt-1">
                                    {m.currentValue} / {m.thresholdValue} · {m.status}
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={busyId === m.id || m.status === "UNLOCKED"}
                                className="btn-primary shrink-0"
                                onClick={() => unlock(m.id)}
                            >
                                {m.status === "UNLOCKED" ? "Unlocked" : busyId === m.id ? "Unlocking…" : "Unlock"}
                            </button>
                        </div>
                    ))
                )}
            </section>

            {/* Looker per-partner config */}
            <section className="space-y-3">
                <h2 className="text-body font-medium text-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Looker Studio dashboards (per partner)
                </h2>
                <p className="text-body-sm text-foreground-subtle">
                    Set each partner&apos;s Looker report ID and login-free share URL. These render the
                    embedded ESG dashboard at <code>/dashboard/partner</code>.
                </p>
                {partners.length === 0 ? (
                    <p className="jenga-card p-6 text-body-sm text-foreground-muted">No corporate partners yet.</p>
                ) : (
                    partners.map((p) => <PartnerLookerForm key={p.id} partner={p} />)
                )}
            </section>
        </div>
    );
}

function PartnerLookerForm({ partner }: { partner: PartnerLookerRow }) {
    const router = useRouter();
    const [reportId, setReportId] = useState(partner.lookerReportId);
    const [shareUrl, setShareUrl] = useState(partner.lookerShareUrl);
    const [saving, setSaving] = useState(false);

    async function save() {
        setSaving(true);
        const result = await setPartnerLooker(partner.id, reportId, shareUrl);
        setSaving(false);
        if ("error" in result) {
            toast.error(result.error);
            return;
        }
        toast.success(`Saved ${partner.orgName}`);
        router.refresh();
    }

    return (
        <div className="jenga-card p-5 space-y-3">
            <p className="text-body font-medium text-foreground">{partner.orgName}</p>
            <div className="grid sm:grid-cols-2 gap-3">
                <div>
                    <label className="jenga-label">Looker report ID</label>
                    <input className="jenga-input" value={reportId} onChange={(e) => setReportId(e.target.value)} placeholder="abcd-1234-…" />
                </div>
                <div>
                    <label className="jenga-label">Share URL (login-free)</label>
                    <input className="jenga-input" value={shareUrl} onChange={(e) => setShareUrl(e.target.value)} placeholder="https://lookerstudio.google.com/reporting/…" />
                </div>
            </div>
            <button type="button" disabled={saving} className="btn-secondary" onClick={save}>
                {saving ? "Saving…" : "Save"}
            </button>
        </div>
    );
}
