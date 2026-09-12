import { useState, useTransition } from "react";
import { MapPin, Briefcase, FileText, ShieldCheck, X, Mail, Trash2, XCircle, CheckCircle, Ban, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ROLE_ACCENT } from "@/components/dashboard/shared/BentoCard";
import { SCOPE_TIER_LABELS } from "@/lib/constants/moderator-scopes";
import { approveUser, rejectUser, suspendUser } from "@/lib/actions/moderation";
import { sendResetPasswordEmailAction, updateLegacyUserRoleAction, deleteUserByAdminAction } from "@/lib/actions/adminOps";
import { UserRow, isNgo } from "../types";

export default function UserDetailsModal({
  user,
  open,
  onClose,
  onAction,
}: {
  user: UserRow | null;
  open: boolean;
  onClose: () => void;
  onAction: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!open || !user) return null;

  const meta = (user.metadata ?? {}) as Record<string, unknown>;

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveUser(user.id);
      if (res.success) {
        toast.success(`Approved ${user.name || user.email}`);
        user.isApproved = true;
        user.status = "active";
        onAction();
        onClose();
      } else {
        toast.error("Failed to approve user");
      }
    });
  };

  const handleReject = () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    startTransition(async () => {
      const res = await rejectUser(user.id, rejectReason || undefined);
      if (res.success) {
        toast.success(`Application rejected for ${user.name || user.email}`);
        user.isApproved = false;
        user.status = "rejected";
        onAction();
        onClose();
      } else {
        toast.error("Failed to reject application");
      }
    });
  };

  const handleRoleChange = (newRole: string) => {
    startTransition(async () => {
      const res = await updateLegacyUserRoleAction(user.email, newRole as "SuperAdmin" | "Moderator" | "CorporatePartner" | "NGO" | "Mentor" | "Mentee");
      if (res.error) toast.error(res.error);
      else {
        toast.success(`Role updated to ${newRole}`);
        user.role = newRole;
        onAction();
        onClose();
      }
    });
  };

  const handlePasswordReset = () => {
    startTransition(async () => {
      const res = await sendResetPasswordEmailAction(user.email);
      if (res.error) toast.error(res.error);
      else toast.success("Password reset email sent to " + user.email);
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete ${user.name || user.email}? This action cannot be undone.`)) {
      startTransition(async () => {
        const res = await deleteUserByAdminAction(user.id);
        if (res.error) toast.error(res.error);
        else {
          toast.success("User deleted successfully");
          onAction();
          onClose();
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-background border border-border/80 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-start justify-between bg-surface-1">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 bg-surface-2 text-foreground-muted border border-border"
            >
              {user.image ? (
                <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" />
              ) : (
                (user.name ?? user.email).charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-foreground">{user.name ?? "Unnamed User"}</h3>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${ROLE_ACCENT[isNgo(user) ? "NGO" : user.role] || "#10B981"}20`,
                    color: ROLE_ACCENT[isNgo(user) ? "NGO" : user.role] || "#10B981",
                  }}
                >
                  {isNgo(user) ? "NGO Partner" : user.role === "CorporatePartner" ? "Corporate Partner" : user.role}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    user.isApproved
                      ? "bg-green-500/10 text-green-500 border-green-500/30"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                  }`}
                >
                  {user.isApproved ? "Approved" : "Pending Approval"}
                </span>
              </div>
              <p className="text-sm text-foreground-muted mt-1 flex items-center gap-3">
                <span>{user.email}</span>
                {user.locationRegion && (
                  <span className="flex items-center gap-1 text-xs text-foreground-muted">
                    <MapPin className="w-3.5 h-3.5" />
                    {user.locationRegion}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable Details */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Professional & Application Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-primary" /> Application & Profile Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-1 p-4 rounded-lg border border-border">
              <div>
                <span className="text-xs text-foreground-muted block">Job / Professional Title</span>
                <span className="font-medium text-foreground">{String(meta.professionalTitle || meta.title || "—")}</span>
              </div>
              <div>
                <span className="text-xs text-foreground-muted block">Organisation / Entity</span>
                <span className="font-medium text-foreground">{String(meta.orgName || meta.company || "—")}</span>
              </div>
              <div>
                <span className="text-xs text-foreground-muted block">Industry / Sector</span>
                <span className="font-medium text-foreground">{String(meta.orgType || meta.industry || "—")}</span>
              </div>
              <div>
                <span className="text-xs text-foreground-muted block">Contribution / Support Type</span>
                <span className="font-medium text-foreground">{String(meta.contributionType || "—")}</span>
              </div>
              <div>
                <span className="text-xs text-foreground-muted block">Meeting / Mentorship Preference</span>
                <span className="font-medium text-foreground">{String(meta.meetingPreference || "—")}</span>
              </div>
              <div>
                <span className="text-xs text-foreground-muted block">Contact Phone / Details</span>
                <span className="font-medium text-foreground">{String(meta.phone || meta.contactPhone || "—")}</span>
              </div>
              {meta.linkedIn ? (
                <div className="col-span-1 sm:col-span-2">
                  <span className="text-xs text-foreground-muted block">LinkedIn Profile</span>
                  <a
                    href={String(meta.linkedIn).startsWith("http") ? String(meta.linkedIn) : `https://${meta.linkedIn}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 mt-0.5 font-medium"
                  >
                    {String(meta.linkedIn)} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          {/* Bio / Motivation / Statement */}
          {Boolean(meta.bio || meta.motivation || meta.notes || meta.partnershipGoal) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" /> Application Statement / Bio
              </h4>
              <div className="bg-surface-1 p-4 rounded-lg border border-border text-foreground leading-relaxed whitespace-pre-wrap text-sm">
                {String(meta.bio || meta.motivation || meta.notes || meta.partnershipGoal)}
              </div>
            </div>
          )}

          {/* Compliance & Verification Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" /> Account & Compliance Status
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface-1 p-4 rounded-lg border border-border">
              <div>
                <span className="text-xs text-foreground-muted block">Registered On</span>
                <span className="font-medium text-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-xs text-foreground-muted block">NDA Status</span>
                <span className={`font-medium ${user.ndaSigned ? "text-green-500" : "text-amber-500"}`}>
                  {user.ndaSigned ? "✓ Signed" : "Pending Signature"}
                </span>
              </div>
              <div>
                <span className="text-xs text-foreground-muted block">Email Verified</span>
                <span className={`font-medium ${user.emailVerified ? "text-green-500" : "text-foreground-muted"}`}>
                  {user.emailVerified ? "✓ Verified" : "Unverified"}
                </span>
              </div>
              {user.moderationScope && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-xs text-foreground-muted block">Moderation Scope</span>
                  <span className="font-medium text-foreground">{SCOPE_TIER_LABELS[user.moderationScope] ?? user.moderationScope}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted block">Change Assigned Role:</span>
            <div className="flex flex-wrap gap-1.5">
              {["SuperAdmin", "Moderator", "CorporatePartner", "NGO", "Mentor", "Mentee"].map((r) => (
                <button
                  key={r}
                  disabled={isPending || user.role === r}
                  onClick={() => handleRoleChange(r)}
                  className={`px-3 py-1 text-xs rounded-md border transition-all cursor-pointer ${
                    user.role === r
                      ? "bg-primary/20 border-primary text-foreground font-bold"
                      : "bg-surface-1 border-border text-foreground-muted hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Rejection Note Input if toggled */}
          {showRejectInput && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
              <label className="text-xs font-semibold text-amber-400 block">Feedback / Reason for Rejection (sent via email):</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why the application cannot be approved or what changes are needed..."
                className="w-full h-20 p-2.5 rounded border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        {/* Modal Footer - Approval & Actions */}
        <div className="p-5 border-t border-border bg-surface-1 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePasswordReset}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-background text-xs font-medium text-foreground hover:bg-surface-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" /> Password Reset
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-destructive/30 bg-destructive/10 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete User
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!user.isApproved ? (
              <>
                {user.status !== "rejected" && (
                  <button
                    onClick={handleReject}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-amber-500/40 bg-amber-500/10 text-xs font-semibold text-amber-500 hover:bg-amber-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> {showRejectInput ? "Confirm Reject" : "Reject Application"}
                  </button>
                )}
                <button
                  onClick={handleApprove}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> {user.status === "rejected" ? "Reconsider & Approve" : "Approve User"}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  startTransition(async () => {
                    const res = await suspendUser(user.id);
                    if (res.success) {
                      toast.success(`User suspended`);
                      user.isApproved = false;
                      user.status = "suspended";
                      onAction();
                      onClose();
                    } else toast.error("Failed to suspend user");
                  });
                }}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Ban className="w-4 h-4" /> Suspend
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
