"use client";

import { useState } from "react";
import { Check, X, Eye, AlertTriangle, UserCheck, Loader2, MapPin, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { approveUser, rejectUser, approveArticle, rejectArticle } from "@/lib/actions/moderation";
import { getScopePermissions, SCOPE_TIER_LABELS } from "@/lib/constants/moderator-scopes";

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
    metadata: Record<string, string> | null;
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
        <div className="border border-border/50 rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-lg shrink-0 overflow-hidden">
                        {user.image
                            ? <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" />
                            : (user.name ?? user.email).charAt(0).toUpperCase()
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-foreground">{user.role}</span>
                            <span className="font-mono text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
                            {user.locationRegion && (
                                <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />{user.locationRegion}
                                </span>
                            )}
                        </div>
                        <h4 className="font-bold text-base text-foreground">{user.name ?? "Unnamed User"}</h4>
                        <p className="text-sm text-muted-foreground font-mono truncate">{user.email}</p>
                        {meta.professionalTitle && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Briefcase className="w-3 h-3" />{meta.professionalTitle}
                                {meta.orgName && ` · ${meta.orgName}`}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold shrink-0">
                    {actioned.has(user.id) ? (
                        <span className="text-kenya-green font-mono text-xs">Actioned ✓</span>
                    ) : (
                        <>
                            {profileFields.length > 0 && (
                                <button
                                    onClick={() => setExpanded(v => !v)}
                                    className="px-4 py-2 border border-border/50 text-foreground rounded hover:bg-muted transition-colors uppercase flex items-center gap-1"
                                >
                                    {expanded ? <ChevronUp className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {expanded ? "Hide" : "Profile"}
                                </button>
                            )}
                            <button
                                onClick={() => onAction(user.id, "approve")}
                                disabled={actioning === user.id}
                                className="px-4 py-2 bg-kenya-green text-white rounded hover:bg-kenya-green/90 transition-colors uppercase flex items-center gap-1 disabled:opacity-50"
                            >
                                {actioning === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />} Approve
                            </button>
                            <button
                                onClick={() => onAction(user.id, "reject")}
                                disabled={actioning === user.id}
                                className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded transition-colors uppercase flex items-center gap-1 disabled:opacity-50"
                            >
                                <X className="w-3 h-3" /> Reject
                            </button>
                        </>
                    )}
                </div>
            </div>

            {expanded && profileFields.length > 0 && (
                <div className="border-t border-border/50 bg-muted/20 px-5 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Profile Details</p>
                    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                        {profileFields.map(f => (
                            <div key={f.label}>
                                <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</dt>
                                <dd className="text-sm text-foreground font-medium truncate">{f.value}</dd>
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

    if (!perms.contentModeration && !perms.userApprovals && !perms.eventsManagement) {
        return (
            <div className="flex-1 p-8 flex flex-col items-center justify-center bg-background h-full">
                <div className="text-center space-y-3 max-w-sm">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{tierLabel}</p>
                    <h2 className="font-playfair text-2xl font-black text-foreground">No Active Queues</h2>
                    <p className="text-sm text-muted-foreground">Your moderation scope does not include any active content queues. Contact a SuperAdmin if you believe this is an error.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 sm:p-8 flex flex-col bg-background h-full overflow-y-auto">
            <div className="max-w-5xl w-full">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                        <h3 className="font-playfair text-3xl font-black text-foreground mb-1">Content Queue</h3>
                        <p className="text-muted-foreground font-lato text-sm">Review content, manage applications, and resolve reports.</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-primary border border-primary/30 px-3 py-1 self-start sm:self-auto">
                        {tierLabel}
                    </span>
                </div>

                {/* Tabs — only show tabs the scope allows */}
                <div className="flex border-b border-border/50 mb-6 font-mono text-xs uppercase tracking-wider overflow-x-auto">
                    {perms.contentModeration && (
                        <button
                            onClick={() => setActiveTab("articles")}
                            className={`px-6 py-3 border-b-2 font-bold whitespace-nowrap transition-colors ${
                                activeTab === "articles"
                                    ? "text-foreground border-primary"
                                    : "text-muted-foreground border-transparent hover:text-foreground"
                            }`}
                        >
                            Articles for Review ({articlesInReview.length})
                        </button>
                    )}
                    {perms.userApprovals && (
                        <button
                            onClick={() => setActiveTab("applications")}
                            className={`px-6 py-3 border-b-2 font-bold whitespace-nowrap transition-colors ${
                                activeTab === "applications"
                                    ? "text-foreground border-primary"
                                    : "text-muted-foreground border-transparent hover:text-foreground"
                            }`}
                        >
                            Pending Approvals ({pendingUsers.length})
                        </button>
                    )}
                </div>

                {/* Articles Tab */}
                {activeTab === "articles" && perms.contentModeration && (
                    <div className="space-y-4">
                        {articlesInReview.length === 0 ? (
                            <div className="border border-dashed border-border/50 rounded-lg p-8 text-center text-sm text-muted-foreground font-mono">
                                No articles pending review.
                            </div>
                        ) : (
                            articlesInReview.map((item) => (
                                <div key={item.id} className="border border-border/50 rounded-lg p-5 bg-card shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-foreground">
                                                {item.category ?? "Article"}
                                            </span>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {item.submittedForReviewAt
                                                    ? new Date(item.submittedForReviewAt).toLocaleDateString()
                                                    : "Unknown date"}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-lg text-foreground mb-1">{item.title}</h4>
                                        <p className="text-sm text-muted-foreground font-mono">
                                            Author ID: {item.authorId.slice(0, 8)}…
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 lg:ml-4 font-mono text-xs font-bold">
                                        {actioned.has(item.id) ? (
                                            <span className="text-kenya-green font-mono text-xs">Actioned ✓</span>
                                        ) : (
                                            <>
                                                <button className="px-4 py-2 border border-border/50 text-foreground rounded hover:bg-muted transition-colors uppercase flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> Preview
                                                </button>
                                                <button className="px-4 py-2 border border-border/50 text-amber-600 rounded hover:bg-amber-600/10 transition-colors uppercase flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> Request Changes
                                                </button>
                                                <button
                                                    onClick={() => handleArticleAction(item.id, "approve")}
                                                    disabled={actioning === item.id}
                                                    className="px-4 py-2 bg-kenya-green text-white rounded hover:bg-kenya-green/90 transition-colors uppercase flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    {actioning === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approve
                                                </button>
                                                <button
                                                    onClick={() => handleArticleAction(item.id, "reject")}
                                                    disabled={actioning === item.id}
                                                    className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded transition-colors uppercase flex items-center gap-1 disabled:opacity-50"
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
                            <div className="border border-dashed border-border/50 rounded-lg p-8 text-center text-sm text-muted-foreground font-mono">
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
