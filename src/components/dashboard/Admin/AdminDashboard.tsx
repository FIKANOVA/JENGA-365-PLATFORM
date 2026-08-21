"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
  Filter,
  MoreVertical,
  Plus,
  CheckCircle,
  XCircle,
  Ban,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase,
  ShoppingBag,
  Mail,
  Trash2,
  Eye,
  ExternalLink,
  ShieldCheck,
  FileText,
  UserCheck,
} from "lucide-react";
import { SCOPE_TIER_LABELS } from "@/lib/constants/moderator-scopes";
import { approveUser, rejectUser, suspendUser } from "@/lib/actions/moderation";
import { sendResetPasswordEmailAction, updateLegacyUserRoleAction, deleteUserByAdminAction } from "@/lib/actions/adminOps";
import { createModeratorInvite } from "@/lib/actions/auth";
import { toast } from "sonner";
import SyncStoreInventoryButton from "@/components/dashboard/shared/SyncStoreInventoryButton";
import {
  BentoCard,
  MetricTile,
  ROLE_ACCENT,
} from "@/components/dashboard/shared/BentoCard";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  isApproved: boolean;
  image?: string | null;
  locationRegion?: string | null;
  metadata?: Record<string, unknown> | null;
  moderationScope?: string | null;
  ndaSigned?: boolean | null;
  ndaSignedAt?: Date | null;
  emailVerified?: boolean | null;
  rejectionReason?: string | null;
  createdAt: Date;
}

interface StatItem {
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  change: string;
}

interface AdminDashboardProps {
  users?: UserRow[];
  stats?: StatItem[];
  currentUserId: string;
}

const DEFAULT_STATS: StatItem[] = [
  { label: "Total users", value: "—", trend: "neutral", change: "" },
  { label: "Pending approval", value: "—", trend: "neutral", change: "" },
  { label: "Active mentors", value: "—", trend: "up", change: "" },
  { label: "Active mentees", value: "—", trend: "up", change: "" },
];

// NGO is a first-class role. Legacy NGO accounts (pre-migration 0018) may still carry the
// CorporatePartner role with metadata.orgType === "NGO" — isNgo() catches both.
const ROLE_FILTERS: { value: string; label: string }[] = [
  { value: "All Roles", label: "All Roles" },
  { value: "SuperAdmin", label: "SuperAdmin" },
  { value: "Moderator", label: "Moderator" },
  { value: "CorporatePartner", label: "Corporate Partner" },
  { value: "NGO", label: "NGO Partner" },
  { value: "Mentor", label: "Mentor" },
  { value: "Mentee", label: "Mentee" },
];

const isNgo = (u: UserRow) =>
  u.role === "NGO" ||
  (u.role === "CorporatePartner" &&
    String(
      (u.metadata as Record<string, unknown> | null)?.orgType ?? "",
    ).toUpperCase() === "NGO");

const SCOPE_OPTIONS = [
  { value: "E", label: "Tier 1 — Senior Moderator (Full Access)" },
  { value: "A", label: "Tier 2 — Approvals Moderator (User Approvals)" },
  { value: "B", label: "Tier 3 — Content Moderator (Articles)" },
  { value: "C", label: "Tier 4 — Events & Community" },
  { value: "D", label: "Tier 4b — Community Manager" },
];

const INPUT_CLASS =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-[color:var(--border-strong,#D4D4D8)] focus:ring-2 focus:ring-[color:var(--brand-green-soft)]";

function ExpandableUserRow({
  user,
  onAction,
  onSelectUser,
}: {
  user: UserRow;
  onAction: () => void;
  onSelectUser: (user: UserRow) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = user.metadata ?? {};

  const profileFields = [
    meta.professionalTitle && { label: "Title", value: meta.professionalTitle },
    meta.orgName && { label: "Organisation", value: meta.orgName },
    meta.orgType && { label: "Industry", value: meta.orgType },
    meta.contactTitle && { label: "Contact Title", value: meta.contactTitle },
    meta.contributionType && {
      label: "Contribution",
      value: meta.contributionType,
    },
    meta.meetingPreference && {
      label: "Meeting Pref.",
      value: meta.meetingPreference,
    },
    user.locationRegion && { label: "Location", value: user.locationRegion },
    user.moderationScope && {
      label: "Mod. Scope",
      value: SCOPE_TIER_LABELS[user.moderationScope] ?? user.moderationScope,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  const statusPositive = user.isApproved;
  const statusStyle = statusPositive
    ? {
        background: "var(--brand-green-soft)",
        color: "var(--brand-green)",
        borderColor: "var(--brand-green)",
      }
    : {
        background: "var(--brand-red-soft)",
        color: "var(--brand-red)",
        borderColor: "var(--brand-red)",
      };

  return (
    <>
      <tr className="transition-colors hover:bg-[color:var(--surface-1)]">
        <td className="p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectUser(user)}
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 text-foreground-muted cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: "var(--surface-2)" }}
              title="View full profile"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user.name ?? user.email).charAt(0).toUpperCase()
              )}
            </button>
            <div>
              <button
                onClick={() => onSelectUser(user)}
                className="text-body-sm text-foreground font-medium flex items-center gap-2 text-left hover:underline cursor-pointer"
              >
                {user.name ?? "—"}
                {user.locationRegion && (
                  <span className="text-eyebrow text-foreground-muted flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {user.locationRegion}
                  </span>
                )}
              </button>
              <div className="text-body-sm text-foreground-muted">
                {user.email}
              </div>
              {meta.professionalTitle ? (
                <div className="text-body-sm text-foreground-muted flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {String(meta.professionalTitle)}
                  {meta.orgName ? ` · ${String(meta.orgName)}` : ""}
                </div>
              ) : null}
            </div>
          </div>
        </td>
        <td className="p-4 text-body-sm text-foreground-muted">
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full shrink-0"
              style={{
                background:
                  ROLE_ACCENT[isNgo(user) ? "NGO" : user.role] ??
                  "var(--foreground-muted)",
              }}
              aria-hidden
            />
            {isNgo(user)
              ? "NGO Partner"
              : user.role === "CorporatePartner"
                ? "Corporate Partner"
                : user.role}
          </span>
        </td>
        <td className="p-4">
          {!user.isApproved ? (
            <button
              onClick={() => onSelectUser(user)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors cursor-pointer"
              title="Click to review and approve user"
            >
              <Eye className="w-3 h-3" /> Review & Approve
            </button>
          ) : (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-eyebrow border"
              style={{ ...statusStyle, borderColor: `${statusStyle.color}33` }}
            >
              {user.status}
            </span>
          )}
        </td>
        <td className="p-4 text-body-sm text-foreground-muted">
          {new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td className="p-4 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => onSelectUser(user)}
              className="inline-flex items-center gap-1 h-9 px-2.5 rounded-md border border-border bg-background text-xs font-medium text-foreground hover:bg-[color:var(--surface-2)] transition-colors cursor-pointer"
              title="View full user details"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Details</span>
            </button>
            {profileFields.length > 0 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-md text-foreground-muted hover:text-foreground hover:bg-[color:var(--surface-2)] transition-colors focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)] cursor-pointer"
                title={expanded ? "Hide quick summary" : "Quick summary"}
                aria-label={expanded ? "Hide profile" : "View profile"}
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
            <UserActionMenu userId={user.id} onAction={onAction} email={user.email} userRole={user.role} />
          </div>
        </td>
      </tr>
      {expanded && profileFields.length > 0 && (
        <tr style={{ background: "var(--surface-1)" }}>
          <td colSpan={5} className="px-6 py-3 border-t border-border">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5">
              {profileFields.map((f) => (
                <div key={f.label}>
                  <dt className="text-eyebrow text-foreground-muted">
                    {f.label}
                  </dt>
                  <dd className="text-body-sm text-foreground font-medium truncate">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}

function UserActionMenu({
  userId,
  onAction,
  email,
  userRole,
}: {
  userId: string;
  onAction: () => void;
  email?: string;
  userRole?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const run = (action: () => Promise<{ success: boolean }>, label: string) => {
    startTransition(async () => {
      setOpen(false);
      const result = await action();
      if (result.success) {
        toast.success(`User ${label} successfully`);
        onAction();
      } else {
        toast.error(`Failed to ${label} user`);
      }
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        disabled={isPending}
        aria-label="User actions"
        className="inline-flex items-center justify-center h-11 w-11 rounded-md text-foreground-muted hover:text-foreground hover:bg-[color:var(--surface-2)] transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-12 z-20 bg-background border border-border/70 rounded-md w-48 p-1 text-body-sm"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <button
            onClick={() => run(() => approveUser(userId), "approved")}
            className="flex items-center gap-2 w-full min-h-11 px-3 rounded-md text-foreground text-left transition-colors hover:bg-[color:var(--brand-green-soft)] hover:text-[color:var(--brand-green)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
          >
            <CheckCircle className="w-4 h-4" /> Approve
          </button>
          <button
            onClick={() => run(() => rejectUser(userId), "rejected")}
            className="flex items-center gap-2 w-full min-h-11 px-3 rounded-md text-foreground text-left transition-colors hover:bg-[color:var(--brand-gold-soft)] hover:text-[color:var(--brand-gold-strong)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
          >
            <XCircle className="w-4 h-4" /> Reject
          </button>
          <div className="h-px bg-border my-1" />
          {email && (
            <button
              onClick={() => {
                startTransition(async () => {
                  setOpen(false);

                  const res = await sendResetPasswordEmailAction(email);
                  if (res.error) toast.error(res.error);
                  else toast.success("Reset password email sent");
                });
              }}
              className="flex items-center gap-2 w-full min-h-11 px-3 rounded-md text-foreground text-left transition-colors hover:bg-[color:var(--brand-green-soft)] hover:text-[color:var(--brand-green)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
            >
              <Mail className="w-4 h-4" /> Password reset
            </button>
          )}
          <div className="h-px bg-border my-1" />
          <div className="px-3 py-1 text-xs font-semibold text-foreground-muted">Change Role</div>
          {["SuperAdmin", "Moderator", "CorporatePartner", "NGO", "Mentor", "Mentee"].map(role => role !== userRole && (
            <button
              key={role}
              onClick={() => {
                startTransition(async () => {
                  setOpen(false);

                  const res = await updateLegacyUserRoleAction(email!, role as any);
                  if (res.error) toast.error(res.error);
                  else { toast.success(`Changed role to ${role}`); onAction(); }
                });
              }}
              className="flex items-center gap-2 w-full min-h-11 px-3 rounded-md text-foreground text-left transition-colors hover:bg-[color:var(--surface-2)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
            >
              {role}
            </button>
          ))}
          <div className="h-px bg-border my-1" />
          <button
            onClick={() => run(() => suspendUser(userId), "suspended")}
            className="flex items-center gap-2 w-full min-h-11 px-3 rounded-md text-foreground text-left transition-colors hover:bg-[color:var(--brand-red-soft)] hover:text-[color:var(--brand-red)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
          >
            <Ban className="w-4 h-4" /> Suspend
          </button>
          <div className="h-px bg-border my-1" />
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to permanently delete user ${email || userId}? This cannot be undone.`)) {
                startTransition(async () => {
                  setOpen(false);
                  const res = await deleteUserByAdminAction(userId);
                  if (res.error) toast.error(res.error);
                  else {
                    toast.success("User deleted successfully");
                    onAction();
                  }
                });
              }
            }}
            className="flex items-center gap-2 w-full min-h-11 px-3 rounded-md text-destructive text-left transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
          >
            <Trash2 className="w-4 h-4" /> Delete user
          </button>
        </div>
      )}
    </div>
  );
}

function UserDetailsModal({
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
        user.status = "pending";
        onAction();
        onClose();
      } else {
        toast.error("Failed to reject application");
      }
    });
  };

  const handleRoleChange = (newRole: string) => {
    startTransition(async () => {
      const res = await updateLegacyUserRoleAction(user.email, newRole as any);
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
                <button
                  onClick={handleReject}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-amber-500/40 bg-amber-500/10 text-xs font-semibold text-amber-500 hover:bg-amber-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> {showRejectInput ? "Confirm Reject" : "Reject Application"}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Approve User
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

function InviteModeratorModal({
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

export default function AdminDashboard({
  users = [],
  stats = DEFAULT_STATS,
  currentUserId,
}: AdminDashboardProps) {
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const handleAction = () => {}; // triggers re-render via toast feedback

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, search]);

  const filtered = users.filter((u) => {
    const matchesRole =
      roleFilter === "All Roles"
        ? true
        : roleFilter === "NGO"
          ? isNgo(u)
          : roleFilter === "CorporatePartner"
            ? u.role === "CorporatePartner" && !isNgo(u)
            : u.role === roleFilter;
    if (!matchesRole) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const org = String(
      (u.metadata as Record<string, unknown> | null)?.orgName ?? "",
    );
    return (
      (u.name ?? "").toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      org.toLowerCase().includes(q)
    );
  });

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="flex-1 bg-background h-full overflow-y-auto">
      <InviteModeratorModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        currentUserId={currentUserId}
      />

      <UserDetailsModal
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onAction={handleAction}
      />

      <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
        <header className="space-y-1 border-b border-border pb-6">
          <p className="text-eyebrow text-foreground-muted">
            SuperAdmin overview matrix
          </p>
          <h1 className="text-display-md text-foreground">System control</h1>
        </header>

        {/* System stats — bento metric grid; the lead metric is featured. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
          {stats.map((stat, i) => (
            <MetricTile
              key={i}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              change={stat.change}
              featured={i === 0}
              index={i}
              className={i === 0 ? "col-span-2 lg:row-span-2" : ""}
            />
          ))}
        </div>

        {/* Commerce & Editorial — sync store inventory */}
        <BentoCard className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
              style={{
                background: "var(--surface-2)",
                color: "var(--brand-green)",
              }}
            >
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-eyebrow text-foreground-muted">
                Commerce & Editorial
              </p>
              <h4 className="text-headline text-foreground">Store inventory</h4>
              <p className="text-body-sm text-foreground-muted max-w-xl mt-1">
                Refresh the Neon merchandise table from Sanity. Stock counts are
                preserved.
              </p>
            </div>
          </div>
          <SyncStoreInventoryButton />
        </BentoCard>

        {/* User Management Table */}
        <BentoCard className="flex flex-col p-0">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-headline text-foreground">User management</h2>
            <div className="flex items-center gap-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, org…"
                className="h-9 w-56 rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-[color:var(--border-strong,#D4D4D8)]"
              />
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle w-4 h-4" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-9 pr-8 py-1.5 h-9 rounded-md border border-border bg-background text-body-sm text-foreground appearance-none focus:outline-none focus:border-[color:var(--border-strong,#D4D4D8)]"
                >
                  {ROLE_FILTERS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="border-b border-border"
                  style={{ background: "var(--surface-2)" }}
                >
                  <th className="p-4 text-eyebrow text-foreground-muted">
                    User
                  </th>
                  <th className="p-4 text-eyebrow text-foreground-muted">
                    Role
                  </th>
                  <th className="p-4 text-eyebrow text-foreground-muted">
                    Status
                  </th>
                  <th className="p-4 text-eyebrow text-foreground-muted">
                    Joined
                  </th>
                  <th className="p-4 text-eyebrow text-foreground-muted text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-body-sm text-foreground-muted"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <ExpandableUserRow
                      key={user.id}
                      user={user}
                      onAction={handleAction}
                      onSelectUser={(u) => setSelectedUser(u)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border flex items-center justify-between text-body-sm text-foreground-muted">
            <div className="flex items-center gap-4">
              <span>
                Showing {filtered.length === 0 ? 0 : startIndex + 1}-{Math.min(filtered.length, startIndex + ITEMS_PER_PAGE)} of {filtered.length} users
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-3 rounded-md border border-border bg-background hover:bg-[color:var(--surface-2)] disabled:opacity-50 transition-colors"
                  >
                    Prev
                  </button>
                  <span className="text-foreground font-medium">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 rounded-md border border-border bg-background hover:bg-[color:var(--surface-2)] disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center gap-2 h-11 rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Invite moderator</span>
              <span className="sm:hidden">Invite</span>
            </button>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
