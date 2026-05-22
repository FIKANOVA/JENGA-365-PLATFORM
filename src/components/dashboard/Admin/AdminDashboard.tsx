"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { TrendingUp, Minus, AlertTriangle, Filter, MoreVertical, Plus, CheckCircle, XCircle, Ban, X, Send, ChevronDown, ChevronUp, MapPin, Briefcase } from "lucide-react";
import { SCOPE_TIER_LABELS } from "@/lib/constants/moderator-scopes";
import { approveUser, rejectUser, suspendUser } from "@/lib/actions/moderation";
import { createModeratorInvite } from "@/lib/actions/auth";
import { toast } from "sonner";

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

const ROLES = ["All Roles", "SuperAdmin", "Moderator", "CorporatePartner", "Mentor", "Mentee"];

const SCOPE_OPTIONS = [
    { value: "E", label: "Tier 1 — Senior Moderator (Full Access)" },
    { value: "A", label: "Tier 2 — Approvals Moderator (User Approvals)" },
    { value: "B", label: "Tier 3 — Content Moderator (Articles)" },
    { value: "C", label: "Tier 4 — Events & Community" },
    { value: "D", label: "Tier 4b — Community Manager" },
];

const INPUT_CLASS =
    "h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-[color:var(--border-strong,#D4D4D8)] focus:ring-2 focus:ring-[color:var(--brand-green-soft)]";

function ExpandableUserRow({ user, onAction }: { user: UserRow; onAction: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const meta = user.metadata ?? {};

    const profileFields = [
        meta.professionalTitle && { label: "Title", value: meta.professionalTitle },
        meta.orgName && { label: "Organisation", value: meta.orgName },
        meta.orgType && { label: "Industry", value: meta.orgType },
        meta.contactTitle && { label: "Contact Title", value: meta.contactTitle },
        meta.contributionType && { label: "Contribution", value: meta.contributionType },
        meta.meetingPreference && { label: "Meeting Pref.", value: meta.meetingPreference },
        user.locationRegion && { label: "Location", value: user.locationRegion },
        user.moderationScope && { label: "Mod. Scope", value: SCOPE_TIER_LABELS[user.moderationScope] ?? user.moderationScope },
    ].filter(Boolean) as { label: string; value: string }[];

    const statusPositive = user.isApproved;
    const statusStyle = statusPositive
        ? { background: "var(--brand-green-soft)", color: "var(--brand-green)", borderColor: "var(--brand-green)" }
        : { background: "var(--brand-red-soft)", color: "var(--brand-red)", borderColor: "var(--brand-red)" };

    return (
        <>
            <tr className="transition-colors hover:bg-[color:var(--surface-1)]">
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 text-foreground-muted"
                            style={{ background: "var(--surface-2)" }}
                        >
                            {user.image
                                ? <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" />
                                : (user.name ?? user.email).charAt(0).toUpperCase()
                            }
                        </div>
                        <div>
                            <div className="text-body-sm text-foreground font-medium flex items-center gap-2">
                                {user.name ?? "—"}
                                {user.locationRegion && (
                                    <span className="text-eyebrow text-foreground-muted flex items-center gap-0.5">
                                        <MapPin className="w-3 h-3" />{user.locationRegion}
                                    </span>
                                )}
                            </div>
                            <div className="text-body-sm text-foreground-muted">{user.email}</div>
                            {meta.professionalTitle ? (
                                <div className="text-body-sm text-foreground-muted flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />{String(meta.professionalTitle)}{meta.orgName ? ` · ${String(meta.orgName)}` : ""}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </td>
                <td className="p-4 text-body-sm text-foreground-muted">{user.role}</td>
                <td className="p-4">
                    <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-eyebrow border"
                        style={{ ...statusStyle, borderColor: `${statusStyle.color}33` }}
                    >
                        {user.isApproved ? user.status : "pending"}
                    </span>
                </td>
                <td className="p-4 text-body-sm text-foreground-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                        {profileFields.length > 0 && (
                            <button
                                onClick={() => setExpanded(v => !v)}
                                className="text-foreground-muted hover:text-foreground transition-colors p-1"
                                title="View profile"
                            >
                                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        )}
                        <UserActionMenu userId={user.id} onAction={onAction} />
                    </div>
                </td>
            </tr>
            {expanded && profileFields.length > 0 && (
                <tr style={{ background: "var(--surface-1)" }}>
                    <td colSpan={5} className="px-6 py-3 border-t border-border">
                        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5">
                            {profileFields.map(f => (
                                <div key={f.label}>
                                    <dt className="text-eyebrow text-foreground-muted">{f.label}</dt>
                                    <dd className="text-body-sm text-foreground font-medium truncate">{f.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </td>
                </tr>
            )}
        </>
    );
}

function UserActionMenu({ userId, onAction }: { userId: string; onAction: () => void }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
                onClick={() => setOpen(prev => !prev)}
                disabled={isPending}
                className="text-foreground-muted hover:text-foreground transition-colors p-1 disabled:opacity-40"
            >
                <MoreVertical className="w-4 h-4" />
            </button>
            {open && (
                <div
                    className="absolute right-0 top-8 z-20 bg-background border border-border rounded-md w-44 py-1 text-body-sm"
                    style={{ boxShadow: "var(--shadow-lg)" }}
                >
                    <button
                        onClick={() => run(() => approveUser(userId), "approved")}
                        className="flex items-center gap-2 w-full px-4 py-2 text-foreground text-left transition-colors hover:bg-[color:var(--brand-green-soft)] hover:text-[color:var(--brand-green)]"
                    >
                        <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                        onClick={() => run(() => rejectUser(userId), "rejected")}
                        className="flex items-center gap-2 w-full px-4 py-2 text-foreground text-left transition-colors hover:bg-yellow-500/10 hover:text-yellow-600"
                    >
                        <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <div className="h-px bg-border my-1" />
                    <button
                        onClick={() => run(() => suspendUser(userId), "suspended")}
                        className="flex items-center gap-2 w-full px-4 py-2 text-foreground text-left transition-colors hover:bg-[color:var(--brand-red-soft)] hover:text-[color:var(--brand-red)]"
                    >
                        <Ban className="w-4 h-4" /> Suspend
                    </button>
                </div>
            )}
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
    const [scope, setScope] = useState("E");
    const [loading, setLoading] = useState(false);
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);

    if (!open) return null;

    const handleSend = async () => {
        if (!email) return;
        setLoading(true);
        try {
            const result = await createModeratorInvite(currentUserId, email, scope);
            if (result.success) {
                setInviteUrl(result.inviteUrl ?? null);
                toast.success("Moderator invite sent successfully");
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
        setScope("A");
        setInviteUrl(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
            <div
                className="relative bg-background border border-border rounded-lg w-full max-w-md p-8 space-y-6"
                style={{ boxShadow: "var(--shadow-lg)" }}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-display-sm text-foreground">Invite moderator</h2>
                    <button onClick={handleClose} className="text-foreground-muted hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!inviteUrl ? (
                    <div className="space-y-5">
                        <p className="text-body-sm text-foreground-muted">
                            Enter the email address and assign a moderation scope. An invite link will be sent to their inbox.
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-eyebrow text-foreground-muted block">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={INPUT_CLASS}
                                placeholder="moderator@example.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-eyebrow text-foreground-muted block">Moderation scope</label>
                            <select
                                value={scope}
                                onChange={(e) => setScope(e.target.value)}
                                className={INPUT_CLASS}
                            >
                                {SCOPE_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={!email || loading}
                            className="w-full h-11 rounded-md text-label font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                        >
                            {loading ? "Sending…" : <><Send className="w-4 h-4" /> Send invite</>}
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
                            <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>Invite sent</p>
                            <p className="text-body-sm text-foreground-muted">
                                An email was sent to <strong className="text-foreground">{email}</strong>. The invite expires in 7 days.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-eyebrow text-foreground-muted block">Invite link (backup)</label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={inviteUrl}
                                    className={INPUT_CLASS}
                                />
                                <button
                                    onClick={() => { navigator.clipboard.writeText(inviteUrl); toast.success("Copied!"); }}
                                    className="px-3 rounded-md border border-border text-body-sm text-foreground hover:bg-[color:var(--surface-2)] transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-full h-11 rounded-md text-label font-medium transition-opacity hover:opacity-90"
                            style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
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
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const handleAction = () => {}; // triggers re-render via toast feedback

    const filtered = roleFilter === "All Roles"
        ? users
        : users.filter((u) => u.role === roleFilter);

    return (
        <div className="flex-1 bg-background h-full overflow-y-auto">
            <InviteModeratorModal
                open={inviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                currentUserId={currentUserId}
            />

            <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
                <header className="space-y-1 border-b border-border pb-6">
                    <p className="text-eyebrow text-foreground-muted">SuperAdmin overview matrix</p>
                    <h1 className="text-display-md text-foreground">System control</h1>
                </header>

                {/* System Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => {
                        const trendColor =
                            stat.trend === "up"
                                ? "var(--brand-green)"
                                : stat.trend === "down"
                                  ? "var(--brand-red)"
                                  : "var(--foreground-muted)";
                        return (
                            <div
                                key={i}
                                className="rounded-lg border border-border bg-background p-6 flex flex-col gap-2 transition-colors hover:border-[color:var(--border-strong,#D4D4D8)]"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                <span className="text-eyebrow text-foreground-muted">{stat.label}</span>
                                <span className="text-display-sm text-foreground">{stat.value}</span>
                                <div className="flex items-center text-body-sm mt-1" style={{ color: trendColor }}>
                                    {stat.trend === "up" && <TrendingUp className="w-4 h-4 mr-1" />}
                                    {stat.trend === "down" && <AlertTriangle className="w-4 h-4 mr-1" />}
                                    {stat.trend === "neutral" && <Minus className="w-4 h-4 mr-1" />}
                                    <span>{stat.change}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* User Management Table */}
                <div className="rounded-lg border border-border bg-background flex flex-col" style={{ boxShadow: "var(--shadow-sm)" }}>
                    <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-headline text-foreground">User management</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle w-4 h-4" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="pl-9 pr-8 py-1.5 h-9 rounded-md border border-border bg-background text-body-sm text-foreground appearance-none focus:outline-none focus:border-[color:var(--border-strong,#D4D4D8)]"
                                >
                                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border" style={{ background: "var(--surface-1)" }}>
                                    <th className="p-4 text-eyebrow text-foreground-muted">User</th>
                                    <th className="p-4 text-eyebrow text-foreground-muted">Role</th>
                                    <th className="p-4 text-eyebrow text-foreground-muted">Status</th>
                                    <th className="p-4 text-eyebrow text-foreground-muted">Joined</th>
                                    <th className="p-4 text-eyebrow text-foreground-muted text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-body-sm text-foreground-muted">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((user) => (
                                        <ExpandableUserRow key={user.id} user={user} onAction={handleAction} />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-border flex items-center justify-between text-body-sm text-foreground-muted">
                        <span>Showing {filtered.length} of {users.length} users</span>
                        <button
                            onClick={() => setInviteModalOpen(true)}
                            className="inline-flex items-center gap-2 h-9 rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                        >
                            <Plus className="w-4 h-4" />
                            Invite moderator
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
