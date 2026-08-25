"use client";

import { useState } from "react";
import Link from "next/link";
import {
    MapPin,
    Building,
    Briefcase,
    Calendar,
    Share2,
    Check,
    PenSquare,
    BrainCircuit,
    ArrowLeft,
    ShieldCheck,
    LayoutDashboard,
    Sparkles,
} from "lucide-react";
import SocialLinks from "@/components/marketing/profiles/SocialLinks";
import { PublicProfile } from "@/lib/db/queries/users";
import { ROLE_ACCENT } from "@/components/dashboard/shared/BentoCard";
import { getDashboardHref } from "@/lib/auth/roles";

interface RenderedProfileViewProps {
    profile: PublicProfile;
    isOwner?: boolean;
    backHref?: string;
    backLabel?: string;
}

export default function RenderedProfileView({
    profile,
    isOwner = false,
    backHref,
    backLabel,
}: RenderedProfileViewProps) {
    const [copied, setCopied] = useState(false);
    const roleColor = ROLE_ACCENT[profile.role] || "var(--brand-green)";
    const dashboardHref = getDashboardHref(profile.role);

    const initials = (profile.name || "User")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const roleLabel =
        profile.role === "CorporatePartner"
            ? "Corporate Partner"
            : profile.role === "NGO"
            ? "NGO Partner"
            : profile.role;

    const defaultBackHref =
        profile.role === "Mentor"
            ? "/mentors"
            : profile.role === "Mentee"
            ? "/mentees"
            : "/";
    const defaultBackLabel =
        profile.role === "Mentor"
            ? "Back to Mentors"
            : profile.role === "Mentee"
            ? "Back to Mentees"
            : "Back to Home";

    const resolvedBackHref = backHref || defaultBackHref;
    const resolvedBackLabel = backLabel || defaultBackLabel;

    const joinDate = profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
          })
        : "Active Member";

    function handleShare() {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            });
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
            {/* Back Navigation Bar */}
            <div className="flex items-center justify-between gap-4">
                <Link
                    href={resolvedBackHref}
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>{resolvedBackLabel}</span>
                </Link>

                <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-background hover:bg-[color:var(--surface-2)] text-foreground transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            <span>Link Copied!</span>
                        </>
                    ) : (
                        <>
                            <Share2 className="w-3.5 h-3.5 text-foreground-muted" />
                            <span>Share Profile</span>
                        </>
                    )}
                </button>
            </div>

            {/* Main Rendered Profile Card */}
            <div
                className="overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
                style={{ boxShadow: "var(--shadow-md)" }}
            >
                {/* Banner / Cover */}
                <div
                    className="h-36 sm:h-48 relative overflow-hidden bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 border-b border-border"
                    style={{
                        background: `linear-gradient(135deg, #0a0a0a 0%, ${roleColor}22 50%, #171717 100%)`,
                    }}
                >
                    <div className="absolute inset-0 bg-topo opacity-[0.15] pointer-events-none" aria-hidden />
                    <div className="absolute top-4 right-4">
                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border border-white/10 text-white"
                            style={{ backgroundColor: `${roleColor}33` }}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" style={{ color: roleColor }} />
                            <span>{roleLabel}</span>
                        </span>
                    </div>
                </div>

                {/* Profile Header & Info */}
                <div className="px-6 sm:px-8 pb-8">
                    {/* Avatar & Action Row */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
                        {/* Avatar */}
                        <div className="relative inline-block">
                            <div
                                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-background bg-surface-2 flex items-center justify-center font-bold text-3xl text-foreground-muted shadow-xl shrink-0"
                                style={{ background: "var(--surface-2)" }}
                            >
                                {profile.image ? (
                                    <img
                                        src={profile.image}
                                        alt={profile.name || "Profile picture"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            <span
                                className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-background"
                                style={{ background: roleColor }}
                                title={`${roleLabel} Status Active`}
                            />
                        </div>

                        {/* Owner Quick Actions or Guest CTAs */}
                        <div className="flex flex-wrap items-center gap-2.5 sm:mb-2">
                            {isOwner ? (
                                <>
                                    <Link
                                        href="/dashboard/settings"
                                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-semibold border border-border bg-background hover:bg-[color:var(--surface-2)] text-foreground transition-colors"
                                    >
                                        <PenSquare className="w-3.5 h-3.5 text-foreground-muted" />
                                        Edit Profile
                                    </Link>
                                    <Link
                                        href="/dashboard/profile"
                                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
                                        style={{ background: "var(--brand-green)" }}
                                    >
                                        <BrainCircuit className="w-3.5 h-3.5" />
                                        AI Interview
                                    </Link>
                                    <Link
                                        href={dashboardHref}
                                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-semibold border border-border bg-background hover:bg-[color:var(--surface-2)] text-foreground transition-colors"
                                    >
                                        <LayoutDashboard className="w-3.5 h-3.5 text-foreground-muted" />
                                        Dashboard
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={
                                        profile.role === "Mentor"
                                            ? "/register/mentee"
                                            : "/register/mentor"
                                    }
                                    className="inline-flex items-center gap-1.5 h-9 px-5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {profile.role === "Mentor"
                                        ? "Request Mentorship"
                                        : "Connect on Platform"}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Name & Primary Metadata */}
                    <div className="space-y-3">
                        <div>
                            <h1 className="text-display-md text-foreground font-bold flex items-center gap-2">
                                {profile.name || "Community Member"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-body-sm text-foreground-muted mt-1 font-medium">
                                <div className="flex items-center gap-1.5 text-foreground">
                                    <Briefcase className="w-4 h-4 text-foreground-muted shrink-0" />
                                    <span>{profile.profession}</span>
                                </div>

                                {profile.orgName && (
                                    <div className="flex items-center gap-1.5">
                                        <Building className="w-4 h-4 text-foreground-muted shrink-0" />
                                        <span>{profile.orgName}</span>
                                    </div>
                                )}

                                {profile.locationRegion && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-foreground-muted shrink-0" />
                                        <span>{profile.locationRegion}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-1.5 text-foreground-subtle">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <span>Member since {joinDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bio / Motivation / Statement */}
                        {profile.bio && (
                            <div
                                className="rounded-xl border border-border/80 bg-surface-1 p-5 space-y-2 mt-4"
                                style={{ background: "var(--surface-1)" }}
                            >
                                <p className="text-eyebrow text-foreground-muted uppercase tracking-wider font-semibold">
                                    About &amp; Statement
                                </p>
                                <p className="text-body text-foreground leading-relaxed italic">
                                    &ldquo;{profile.bio}&rdquo;
                                </p>
                            </div>
                        )}

                        {/* Social & Channel Links */}
                        <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-4 flex-wrap mt-6">
                            <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                                Channels &amp; Profiles
                            </span>
                            <SocialLinks
                                linkedIn={profile.linkedIn}
                                x={profile.x}
                                instagram={profile.instagram}
                                youtube={profile.youtube}
                                tiktok={profile.tiktok}
                                website={profile.website}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
