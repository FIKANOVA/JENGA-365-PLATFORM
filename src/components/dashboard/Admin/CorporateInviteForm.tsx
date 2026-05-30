"use client";

import { useState } from "react";
import { Send, Copy } from "lucide-react";
import { toast } from "sonner";

export default function CorporateInviteForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/admin/corporate-invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() || undefined }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error ?? "Failed to generate invite");
                return;
            }
            setToken(data.token);
            setExpiresAt(data.expiresAt ?? null);
            toast.success("Invite generated");
        } catch {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    }

    const inviteUrl = token
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?invite=${token}`
        : null;

    return (
        <div className="jenga-card p-6">
            {!token ? (
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="jenga-label">Invitee email (optional)</label>
                        <input
                            type="email"
                            className="jenga-input"
                            placeholder="partner@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <p className="text-body-sm text-foreground-subtle mt-1">
                            Bind the invite to an email, or leave blank for an open link.
                        </p>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">
                        {loading ? "Generating…" : <><Send className="w-4 h-4" /> Generate invite</>}
                    </button>
                </form>
            ) : (
                <div className="space-y-4">
                    <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Invite ready</p>
                    {expiresAt && (
                        <p className="text-body-sm text-foreground-muted">
                            Expires {new Date(expiresAt).toLocaleString()}.
                        </p>
                    )}
                    <div>
                        <label className="jenga-label">Invite link</label>
                        <div className="flex gap-2">
                            <input readOnly className="jenga-input flex-1" value={inviteUrl ?? ""} />
                            <button
                                type="button"
                                className="btn-secondary inline-flex items-center gap-1"
                                onClick={() => { navigator.clipboard.writeText(inviteUrl ?? ""); toast.success("Copied!"); }}
                            >
                                <Copy className="w-4 h-4" /> Copy
                            </button>
                        </div>
                    </div>
                    <button type="button" className="btn-ghost" onClick={() => { setToken(null); setEmail(""); }}>
                        Generate another
                    </button>
                </div>
            )}
        </div>
    );
}
