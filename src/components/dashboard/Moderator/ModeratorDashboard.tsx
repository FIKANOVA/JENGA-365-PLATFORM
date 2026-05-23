"use client";

import { useState } from "react";
import { Check, X, Eye, AlertTriangle, UserCheck, Loader2, MapPin, Briefcase, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { approveUser, rejectUser, approveArticle, rejectArticle } from "@/lib/actions/moderation";
import { getScopePermissions, SCOPE_TIER_LABELS } from "@/lib/constants/moderator-scopes";
import SyncStoreInventoryButton from "@/components/dashboard/shared/SyncStoreInventoryButton";

interface ArticleItem {
    id: string;
    title: string;
    authorId: string;
    category: string | null;
    submittedForReviewAt: Date | null;
}

interface PendingUser {
    id: string;
    name: string | null;
    email: string;
    role: string;
    image: string | null;
    locationRegion: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}

interface ModeratorDashboardProps {
    articlesInReview?: ArticleItem[];
    pendingUsers?: PendingUser[];
    scope?: string;
}

type Tab = "articles" | "applications";

function UserProfileCard({ user, onAction, actioning, actioned }: {
    user: PendingUser;
    onAction: (id: string, action: "approve" | "reject") => void;
    actioning: string | null;
    actioned: Set<string>;
}) {
    const [expanded, setExpanded] = useState(false);
    const meta = user.metadata ?? {};

    const profileFields = [
        meta.professionalTitle && { label: "Title", value: meta.professionalTitle },
        meta.orgName && { label: "Organisation", value: meta.orgName },
        meta.contactTitle && { label: "Contact Title", value: meta.contactTitle },
        meta.orgType && { label: "Industry", value: meta.orgType },
        meta.contributionType && { label: "Contribution Type", value: meta.contributionType },
        meta.meetingPreference && { label: "Meeting Preference", value: meta.meetingPreference },
        meta.linkedIn && { label: "LinkedIn", value: meta.linkedIn },
        user.locationRegion && { label: "Location", value: user.locationRegion },
    ].filter(Boolean) as { label: string; value: string }[];

    return (
        <div className="rounded-lg border border-border bg-background overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden text-foreground-muted"
                        style={{ background: "var(--surface-2)" }}
                    >
                        {user.image
                            ? <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" />
                            : (user.name ?? user.email).charAt(0).toUpperCase()
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <span
                                className="text-eyebrow px-2 py-0.5 rounded text-foreground"
                                style={{ background: "var(--surface-2)" }}
                            >
                                {user.role}
                            </span>
                            <span className="text-eyebrow text-foreground-muted">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                            {user.locationRegion && (
                                <span className="text-eyebrow text-foreground-muted flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />{user.locationRegion}
                                </span>
                            )}
                        </div>
                        <h4 className="text-headline text-foreground">{user.name ?? "Unnamed user"}</h4>
                        <p className="text-body-sm text-foreground-muted truncate">{user.email}</p>
                        {meta.professionalTitle ? (
                            <p className="text-body-sm text-foreground-muted flex items-center gap-1 mt-0.5">
                                <Briefcase className="w-3 h-3" />{String(meta.professionalTitle)}
                                {meta.orgName ? ` · ${String(meta.orgName)}` : ""}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {actioned.has(user.id) ? (
                        <span className="text-label" style={{ color: "var(--brand-green)" }}>Actioned ✓</span>
                    ) : (
                        <>
                            {profileFields.length > 0 && (
                                <button
                                    onClick={() => setExpanded(v => !v)}
                                    className="inline-flex items-center gap-1 h-9 rounded-md border border-border bg-background px-3 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                                >
                                    {expanded ? <ChevronUp className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {expanded ? "Hide" : "Profile"}
                                </button>
                            )}
                            <button
                                onClick={() => onAction(user.id, "approve")}
                                disabled={actioning === user.id}
                                className="inline-flex items-center gap-1 h-9 rounded-md px-3 text-label font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                                style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                            >
                                {actioning === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />} Approve
                            </button>
                            <button
                                onClick={() => onAction(user.id, "reject")}
                                disabled={actioning === user.id}
                                className="inline-flex items-center gap-1 h-9 rounded-md border bg-background px-3 text-label transition-colors hover:bg-[color:var(--brand-red-soft)] disabled:opacity-50"
                                style={{ borderColor: "var(--brand-red)", color: "var(--brand-red)" }}
                            >
                                <X className="w-3 h-3" /> Reject
                            </button>
                        </>
                    )}
                </div>
            </div>

            {expanded && profileFields.length > 0 && (
                <div className="border-t border-border px-5 py-4" style={{ background: "var(--surface-1)" }}>
                    <p className="text-eyebrow text-foreground-muted mb-3">Profile details</p>
                    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                        {profileFields.map(f => (
                            <div key={f.label}>
                                <dt className="text-eyebrow text-foreground-muted">{f.label}</dt>
                                <dd className="text-body-sm text-foreground font-medium truncate">{f.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}
        </div>
    );
}

export default function ModeratorDashboard({
    articlesInReview = [],
    pendingUsers = [],
    scope = "B",
}: ModeratorDashboardProps) {
    const perms = getScopePermissions(scope);
    const tierLabel = SCOPE_TIER_LABELS[scope] ?? "Moderator";

    const defaultTab: Tab = perms.contentModeration ? "articles" : "applications";
    const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
    const [actioning, setActioning] = useState<string | null>(null);
    const [actioned, setActioned] = useState<Set<string>>(new Set());

    async function handleArticleAction(id: string, action: "approve" | "reject") {
        setActioning(id);
        try {
            if (action === "approve") await approveArticle(id);
            else await rejectArticle(id);
            setActioned(prev => new Set(prev).add(id));
        } catch (e) { console.error(e); }
        finally { setActioning(null); }
    }

    async function handleUserAction(id: string, action: "approve" | "reject") {
        setActioning(id);
        try {
            if (action === "approve") await approveUser(id);
            else await rejectUser(id);
            setActioned(prev => new Set(prev).add(id));
        } catch (e) { console.error(e); }
        finally { setActioning(null); }
    }

    const showCommerceSection = perms.contentModeration;

    if (!perms.contentModeration && !perms.userApprovals && !perms.eventsManagement) {
        return (
            <div className="flex-1 p-8 flex flex-col items-center justify-center bg-background h-full">
                <div className="text-center space-y-3 max-w-sm">
                    <p className="text-eyebrow text-foreground-muted">{tierLabel}</p>
                    <h2 className="text-display-sm text-foreground">No active queues</h2>
                    <p className="text-body-sm text-foreground-muted">
                        Your moderation scope does not include any active content queues. Contact a SuperAdmin if you believe this is an error.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 sm:p-8 flex flex-col bg-background h-full overflow-y-auto">
            <div className="max-w-5xl w-full">
                <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border pb-6">
                    <div className="space-y-1">
                        <h3 className="text-display-md text-foreground">Content queue</h3>
                        <p className="text-body-sm text-foreground-muted">
                            Review content, manage applications, and resolve reports.
                        </p>
                    </div>
                    <span
                        className="text-eyebrow border px-3 py-1 rounded-full self-start sm:self-auto"
                        style={{ borderColor: "var(--brand-green)", color: "var(--brand-green)" }}
                    >
                        {tierLabel}
                    </span>
                </header>

                {showCommerceSection && (
                    <div
                        className="rounded-lg border border-border bg-background p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                                style={{ background: "var(--surface-2)", color: "var(--brand-green)" }}
                            >
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-eyebrow text-foreground-muted">Commerce & Editorial</p>
                                <h4 className="text-headline text-foreground">Store inventory</h4>
                                <p className="text-body-sm text-foreground-muted max-w-xl mt-1">
                                    Pull the latest catalog from Sanity into Neon. Names, prices, images and variants
                                    are refreshed; stock counts are preserved.
                                </p>
                            </div>
                        </div>
                        <SyncStoreInventoryButton />
                    </div>
                )}

                {/* Tabs — only show tabs the scope allows */}
                <div className="flex border-b border-border mb-6 overflow-x-auto">
                    {perms.contentModeration && (
                        <button
                            onClick={() => setActiveTab("articles")}
                            className={`px-6 py-3 text-label font-medium whitespace-nowrap transition-colors border-b-2 ${
                                activeTab === "articles"
                                    ? "text-foreground"
                                    : "text-foreground-muted hover:text-foreground border-transparent"
                            }`}
                            style={activeTab === "articles" ? { borderColor: "var(--brand-green)" } : { borderColor: "transparent" }}
                        >
                            Articles for review ({articlesInReview.length})
                        </button>
                    )}
                    {perms.userApprovals && (
                        <button
                            onClick={() => setActiveTab("applications")}
                            className={`px-6 py-3 text-label font-medium whitespace-nowrap transition-colors border-b-2 ${
                                activeTab === "applications"
                                    ? "text-foreground"
                                    : "text-foreground-muted hover:text-foreground border-transparent"
                            }`}
                            style={activeTab === "applications" ? { borderColor: "var(--brand-green)" } : { borderColor: "transparent" }}
                        >
                            Pending approvals ({pendingUsers.length})
                        </button>
                    )}
                </div>

                {/* Articles Tab */}
                {activeTab === "articles" && perms.contentModeration && (
                    <div className="space-y-4">
                        {articlesInReview.length === 0 ? (
                            <div
                                className="rounded-md border border-dashed border-border p-8 text-center text-body-sm text-foreground-muted"
                                style={{ background: "var(--surface-1)" }}
                            >
                                No articles pending review.
                            </div>
                        ) : (
                            articlesInReview.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border border-border bg-background p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                    style={{ boxShadow: "var(--shadow-sm)" }}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span
                                                className="text-eyebrow px-2 py-1 rounded text-foreground"
                                                style={{ background: "var(--surface-2)" }}
                                            >
                                                {item.category ?? "Article"}
                                            </span>
                                            <span className="text-eyebrow text-foreground-muted">
                                                {item.submittedForReviewAt
                                                    ? new Date(item.submittedForReviewAt).toLocaleDateString()
                                                    : "Unknown date"}
                                            </span>
                                        </div>
                                        <h4 className="text-headline text-foreground mb-1">{item.title}</h4>
                                        <p className="text-body-sm text-foreground-muted">
                                            Author ID: {item.authorId.slice(0, 8)}…
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 lg:ml-4">
                                        {actioned.has(item.id) ? (
                                            <span className="text-label" style={{ color: "var(--brand-green)" }}>Actioned ✓</span>
                                        ) : (
                                            <>
                                                <button className="inline-flex items-center gap-1 h-9 rounded-md border border-border bg-background px-3 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]">
                                                    <Eye className="w-3 h-3" /> Preview
                                                </button>
                                                <button
                                                    className="inline-flex items-center gap-1 h-9 rounded-md border bg-background px-3 text-label transition-colors"
                                                    style={{ borderColor: "var(--border)", color: "#b45309" }}
                                                >
                                                    <AlertTriangle className="w-3 h-3" /> Request changes
                                                </button>
                                                <button
                                                    onClick={() => handleArticleAction(item.id, "approve")}
                                                    disabled={actioning === item.id}
                                                    className="inline-flex items-center gap-1 h-9 rounded-md px-3 text-label font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                                                    style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                                                >
                                                    {actioning === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approve
                                                </button>
                                                <button
                                                    onClick={() => handleArticleAction(item.id, "reject")}
                                                    disabled={actioning === item.id}
                                                    className="inline-flex items-center gap-1 h-9 rounded-md border bg-background px-3 text-label transition-colors hover:bg-[color:var(--brand-red-soft)] disabled:opacity-50"
                                                    style={{ borderColor: "var(--brand-red)", color: "var(--brand-red)" }}
                                                >
                                                    <X className="w-3 h-3" /> Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Applications Tab */}
                {activeTab === "applications" && perms.userApprovals && (
                    <div className="space-y-4">
                        {pendingUsers.length === 0 ? (
                            <div
                                className="rounded-md border border-dashed border-border p-8 text-center text-body-sm text-foreground-muted"
                                style={{ background: "var(--surface-1)" }}
                            >
                                No pending user applications.
                            </div>
                        ) : (
                            pendingUsers.map((user) => (
                                <UserProfileCard
                                    key={user.id}
                                    user={user}
                                    onAction={handleUserAction}
                                    actioning={actioning}
                                    actioned={actioned}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
