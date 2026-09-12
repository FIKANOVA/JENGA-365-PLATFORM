import { useState, useRef, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical, CheckCircle, XCircle, Mail, Ban, Trash2 } from "lucide-react";
import { approveUser, rejectUser, suspendUser } from "@/lib/actions/moderation";
import { sendResetPasswordEmailAction, updateLegacyUserRoleAction, deleteUserByAdminAction } from "@/lib/actions/adminOps";

export default function UserActionMenu({
  userId,
  onAction,
  email,
  userRole,
  isApproved,
  userStatus,
}: {
  userId: string;
  onAction: () => void;
  email?: string;
  userRole?: string;
  isApproved?: boolean;
  userStatus?: string;
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
      try {
        const result = await action();
        if (result.success) {
          toast.success(`User ${label} successfully`);
          onAction();
        } else {
          toast.error(`Failed to ${label} user`);
        }
      } catch {
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
          {userStatus === "rejected" ? (
            <button
              onClick={() => run(() => approveUser(userId), "approved")}
              className="flex items-center gap-2 w-full min-h-11 px-3 rounded-md text-foreground text-left transition-colors hover:bg-[color:var(--brand-green-soft)] hover:text-[color:var(--brand-green)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
            >
              <CheckCircle className="w-4 h-4" /> Reconsider & Approve
            </button>
          ) : !isApproved ? (
            <>
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
            </>
          ) : (
            <button
              onClick={() => run(() => rejectUser(userId), "rejected")}
              className="flex items-center gap-2 w-full min-h-11 px-3 rounded-md text-foreground text-left transition-colors hover:bg-[color:var(--brand-gold-soft)] hover:text-[color:var(--brand-gold-strong)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
            >
              <XCircle className="w-4 h-4" /> Reject / Revoke
            </button>
          )}
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

                  const res = await updateLegacyUserRoleAction(email!, role as "SuperAdmin" | "Moderator" | "CorporatePartner" | "NGO" | "Mentor" | "Mentee");
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
