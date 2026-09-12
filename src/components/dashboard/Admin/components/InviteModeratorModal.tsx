import { useState } from "react";
import { X, Send } from "lucide-react";
import { toast } from "sonner";
import { createModeratorInvite } from "@/lib/actions/auth";
import { SCOPE_OPTIONS, INPUT_CLASS } from "../types";

export default function InviteModeratorModal({
  open,
  onClose,
  currentUserId,
}: {
  open: boolean;
  onClose: () => void;
  currentUserId: string;
}) {
  const [email, setEmail] = useState("");
  const [roleToAssign, setRoleToAssign] = useState<"Moderator" | "SuperAdmin">("Moderator");
  const [scope, setScope] = useState("all");
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  if (!open) return null;

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const result = await createModeratorInvite(currentUserId, email, scope, roleToAssign);
      if (result.success) {
        setInviteUrl(result.inviteUrl ?? null);
        toast.success(roleToAssign === "SuperAdmin" ? "SuperAdmin invite sent successfully" : "Moderator invite sent successfully");
      } else {
        toast.error("Failed to create invite");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRoleToAssign("Moderator");
    setScope("all");
    setInviteUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className="relative bg-background border border-border/70 rounded-md w-full max-w-md p-8 space-y-6"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-display-sm text-foreground">
            {roleToAssign === "SuperAdmin" ? "Invite SuperAdmin" : "Invite Moderator"}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="inline-flex items-center justify-center h-11 w-11 -mr-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-[color:var(--surface-2)] transition-colors focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!inviteUrl ? (
          <div className="space-y-5">
            <p className="text-body-sm text-foreground-muted">
              Enter the email address and select the administrative role. An invite
              link will be sent to their inbox.
            </p>

            <div className="space-y-1.5">
              <label className="text-eyebrow text-foreground-muted block">
                Role to assign
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRoleToAssign("Moderator")}
                  className={`h-10 px-3 rounded-md text-sm font-medium border transition-colors ${
                    roleToAssign === "Moderator"
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border text-foreground-muted hover:bg-surface-2"
                  }`}
                >
                  Moderator
                </button>
                <button
                  type="button"
                  onClick={() => setRoleToAssign("SuperAdmin")}
                  className={`h-10 px-3 rounded-md text-sm font-medium border transition-colors ${
                    roleToAssign === "SuperAdmin"
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border text-foreground-muted hover:bg-surface-2"
                  }`}
                >
                  SuperAdmin
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-eyebrow text-foreground-muted block">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASS}
                placeholder={roleToAssign === "SuperAdmin" ? "admin@example.com" : "moderator@example.com"}
              />
            </div>

            {roleToAssign === "Moderator" ? (
              <div className="space-y-1.5">
                <label className="text-eyebrow text-foreground-muted block">
                  Moderation scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className={INPUT_CLASS}
                >
                  {SCOPE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                ⚠️ SuperAdmin has unrestricted root permissions across the entire platform, revenue, user data, and settings.
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={!email || loading}
              className="w-full h-11 rounded-md text-label font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                background: "var(--brand-green)",
                color: "var(--brand-green-fg)",
              }}
            >
              {loading ? (
                "Sending…"
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send invite
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div
              className="rounded-md border p-4 space-y-2"
              style={{
                background: "var(--brand-green-soft)",
                borderColor: "var(--brand-green)",
              }}
            >
              <p
                className="text-eyebrow"
                style={{ color: "var(--brand-green)" }}
              >
                Invite sent
              </p>
              <p className="text-body-sm text-foreground-muted">
                An email was sent to{" "}
                <strong className="text-foreground">{email}</strong>. The invite
                expires in 7 days.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-eyebrow text-foreground-muted block">
                Invite link (backup)
              </label>
              <div className="flex gap-2">
                <input readOnly value={inviteUrl} className={INPUT_CLASS} />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteUrl);
                    toast.success("Copied!");
                  }}
                  className="h-11 px-4 rounded-md border border-border text-body-sm text-foreground hover:bg-[color:var(--surface-2)] transition-colors focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full h-11 rounded-md text-label font-medium transition-opacity hover:opacity-90"
              style={{
                background: "var(--brand-green)",
                color: "var(--brand-green-fg)",
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
