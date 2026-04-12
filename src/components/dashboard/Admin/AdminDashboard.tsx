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
    metadata?: Record<string, string> | null;
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
    { label: "Total Users", value: "—", trend: "neutral", change: "" },
    { label: "Pending Approval", value: "—", trend: "neutral", change: "" },
    { label: "Active Mentors", value: "—", trend: "up", change: "" },
    { label: "Active Mentees", value: "—", trend: "up", change: "" },
];

const ROLES = ["All Roles", "SuperAdmin", "Moderator", "CorporatePartner", "Mentor", "Mentee"];

const SCOPE_OPTIONS = [
    { value: "E", label: "Tier 1 — Senior Moderator (Full Access)" },
    { value: "A", label: "Tier 2 — Approvals Moderator (User Approvals)" },
    { value: "B", label: "Tier 3 — Content Moderator (Articles)" },
    { value: "C", label: "Tier 4 — Events & Community" },
    { value: "D", label: "Tier 4b — Community Manager" },
];

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

    return (
        <>
            <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-xs overflow-hidden shrink-0">
                            {user.image
                                ? <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" />
                                : (user.name ?? user.email).charAt(0).toUpperCase()
                            }
                        </div>
                        <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                                {user.name ?? "—"}
                                {user.locationRegion && (
                                    <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-0.5">
                                        <MapPin className="w-3 h-3" />{user.locationRegion}
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">{user.email}</div>
                            {meta.professionalTitle && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />{meta.professionalTitle}{meta.orgName ? ` · ${meta.orgName}` : ""}
                                </div>
                            )}
                        </div>
                    </div>
                </td>
                <td className="p-4 text-muted-foreground font-mono">{user.role}</td>
                <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                        user.isApproved
                            ? "bg-kenya-green/10 text-kenya-green border border-kenya-green/20"
                            : "bg-kenya-red/10 text-kenya-red border border-kenya-red/20"
                    }`}>
                        {user.isApproved ? user.status : "pending"}
                    </span>
                </td>
                <td className="p-4 text-muted-foreground font-mono">
                    {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                        {profileFields.length > 0 && (
                            <button
                                onClick={() => setExpanded(v => !v)}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
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
                <tr className="bg-muted/20">
                    <td colSpan={5} className="px-6 py-3 border-t border-border/30">
                        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5">
                            {profileFields.map(f => (
                                <div key={f.label}>
                                    <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</dt>
                                    <dd className="text-sm text-foreground font-medium truncate">{f.value}</dd>
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
                className="text-muted-foreground hover:text-foreground transition-colors p-1 disabled:opacity-40"
            >
                <MoreVertical className="w-4 h-4" />
            </button>
            {open && (
                <div className="absolute right-0 top-8 z-20 bg-background border border-border/50 rounded-lg shadow-xl w-44 py-1 text-sm font-mono">
                    <button
                        onClick={() => run(() => approveUser(userId), "approved")}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-kenya-green/10 hover:text-kenya-green transition-colors text-left"
                    >
                        <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                        onClick={() => run(() => rejectUser(userId), "rejected")}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-yellow-500/10 hover:text-yellow-600 transition-colors text-left"
                    >
                        <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <div className="h-px bg-border/50 my-1" />
                    <button
                        onClick={() => run(() => suspendUser(userId), "suspended")}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-kenya-red/10 hover:text-kenya-red transition-colors text-left"
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
            <div className="relative bg-background border border-border shadow-2xl w-full max-w-md p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-playfair font-black text-xl text-foreground uppercase tracking-tight">
                        Invite Moderator
                    </h2>
                    <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!inviteUrl ? (
                    <div className="space-y-5">
                        <p className="text-sm text-muted-foreground font-sans">
                            Enter the email address and assign a moderation scope. An invite link will be sent to their inbox.
                        </p>

                        <div className="space-y-1.5">
                            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold block">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="jenga-input w-full"
                                placeholder="moderator@example.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold block">
                                Moderation Scope
                            </label>
                            <select
                                value={scope}
                                onChange={(e) => setScope(e.target.value)}
                                className="jenga-input w-full bg-background"
                            >
                                {SCOPE_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={!email || loading}
                            className="w-full h-12 bg-foreground text-background font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Sending…" : <><Send className="w-4 h-4" /> Send Invite</>}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="bg-primary/10 border border-primary/30 p-4 space-y-2">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">Invite Sent</p>
                            <p className="text-sm text-muted-foreground">
                                An email was sent to <strong>{email}</strong>. The invite expires in 7 days.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold block">
                                Invite Link (backup)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={inviteUrl}
                                    className="jenga-input w-full text-xs"
                                />
                                <button
                                    onClick={() => { navigator.clipboard.writeText(inviteUrl); toast.success("Copied!"); }}
                                    className="px-3 border border-border hover:bg-muted transition-colors text-xs font-mono"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                        <button onClick={handleClose} className="w-full h-12 bg-foreground text-background font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-primary transition-all">
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
                <div>
                    <h1 className="font-playfair text-3xl font-black text-foreground tracking-tight mb-2">System Control</h1>
                    <p className="text-muted-foreground font-mono text-sm">SuperAdmin Overview Matrix</p>
                </div>

                {/* System Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="p-6 border border-border/50 rounded-lg bg-card flex flex-col gap-2 shadow-sm relative overflow-hidden group hover:border-[#BB0000] transition-colors">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">{stat.label}</span>
                            <span className="font-playfair text-3xl font-black text-foreground">{stat.value}</span>
                            <div className={`flex items-center text-xs mt-1 font-mono ${
                                stat.trend === "up" ? "text-kenya-green" : stat.trend === "down" ? "text-kenya-red" : "text-muted-foreground"
                            }`}>
                                {stat.trend === "up" && <TrendingUp className="w-4 h-4 mr-1" />}
                                {stat.trend === "down" && <AlertTriangle className="w-4 h-4 mr-1" />}
                                {stat.trend === "neutral" && <Minus className="w-4 h-4 mr-1" />}
                                <span>{stat.change}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* User Management Table */}
                <div className="border border-border/50 rounded-lg bg-card flex flex-col shadow-sm">
                    <div className="p-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="font-playfair text-xl font-bold text-foreground">User Management</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="pl-9 pr-8 py-1.5 h-9 rounded-md border border-input bg-transparent text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono appearance-none"
                                >
                                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border/50 text-xs uppercase text-muted-foreground font-mono">
                                    <th className="p-4 font-bold tracking-wider">User</th>
                                    <th className="p-4 font-bold tracking-wider">Role</th>
                                    <th className="p-4 font-bold tracking-wider">Status</th>
                                    <th className="p-4 font-bold tracking-wider">Joined</th>
                                    <th className="p-4 font-bold tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-border/50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground font-mono text-sm">
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

                    <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground font-mono">
                        <span>Showing {filtered.length} of {users.length} users</span>
                        <button
                            onClick={() => setInviteModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-transparent border border-border/50 rounded-md text-sm font-bold font-mono hover:bg-muted transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Invite Moderator
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
