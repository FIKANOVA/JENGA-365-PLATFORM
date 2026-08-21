"use client";

import { MapPin, Building, Briefcase } from "lucide-react";
import SocialLinks from "./SocialLinks";
import { PublicProfile } from "@/lib/db/queries/users";
import { ROLE_ACCENT } from "@/components/dashboard/shared/BentoCard";

interface UserProfileCardProps {
  profile: PublicProfile;
}

export default function UserProfileCard({ profile }: UserProfileCardProps) {
  const roleColor = ROLE_ACCENT[profile.role] || "var(--brand-green)";
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

  return (
    <div
      className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--brand-green)] hover:shadow-lg"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div>
        {/* Top Header: Avatar & Role Badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border/80 bg-surface-2 flex items-center justify-center text-foreground-muted font-bold text-lg shrink-0 group-hover:border-[color:var(--brand-green)] transition-colors">
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
              className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background"
              style={{ background: roleColor }}
              title={roleLabel}
            />
          </div>

          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${roleColor}18`,
              color: roleColor,
            }}
          >
            {roleLabel}
          </span>
        </div>

        {/* Name & Profession */}
        <div className="space-y-1 mb-3">
          <h3 className="text-headline text-foreground font-bold group-hover:text-[color:var(--brand-green)] transition-colors">
            {profile.name}
          </h3>

          <div className="text-body-sm text-foreground font-medium flex items-center gap-1.5 line-clamp-1">
            <Briefcase className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
            <span>{profile.profession}</span>
          </div>

          {profile.orgName && (
            <div className="text-body-sm text-foreground-muted flex items-center gap-1.5 line-clamp-1">
              <Building className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
              <span>{profile.orgName}</span>
            </div>
          )}

          {profile.locationRegion && (
            <div className="text-eyebrow text-foreground-muted flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{profile.locationRegion}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-body-sm text-foreground-muted line-clamp-3 mb-4 leading-relaxed italic">
            "{profile.bio}"
          </p>
        )}
      </div>

      {/* Footer: Social Links */}
      <div className="pt-4 border-t border-border/60 mt-auto flex items-center justify-between gap-2">
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
  );
}
