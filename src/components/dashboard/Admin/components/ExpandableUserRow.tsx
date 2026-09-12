import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Briefcase, Eye, XCircle } from "lucide-react";
import { ROLE_ACCENT } from "@/components/dashboard/shared/BentoCard";
import { SCOPE_TIER_LABELS } from "@/lib/constants/moderator-scopes";
import { UserRow, isNgo } from "../types";
import UserActionMenu from "./UserActionMenu";

export default function ExpandableUserRow({
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
          {!user.isApproved && user.status === "pending" ? (
            <button
              onClick={() => onSelectUser(user)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors cursor-pointer"
              title="Click to review and approve user"
            >
              <Eye className="w-3 h-3" /> Review & Approve
            </button>
          ) : user.status === "rejected" ? (
            <button
              onClick={() => onSelectUser(user)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
              title={user.rejectionReason ? `Rejected: ${user.rejectionReason}` : "Application rejected. Click to review or reconsider."}
            >
              <XCircle className="w-3 h-3" /> Rejected
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
            <UserActionMenu
              userId={user.id}
              onAction={onAction}
              email={user.email}
              userRole={user.role}
              isApproved={user.isApproved}
              userStatus={user.status}
            />
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
