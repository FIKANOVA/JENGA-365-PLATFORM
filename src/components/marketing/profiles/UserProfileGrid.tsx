"use client";

import { useState, useMemo } from "react";
import { Search, Users, Filter } from "lucide-react";
import { PublicProfile } from "@/lib/db/queries/users";
import UserProfileCard from "./UserProfileCard";

interface UserProfileGridProps {
  profiles: PublicProfile[];
  title?: string;
  subtitle?: string;
  showRoleFilters?: boolean;
  emptyMessage?: string;
  defaultRole?: string;
}

export default function UserProfileGrid({
  profiles = [],
  title,
  subtitle,
  showRoleFilters = false,
  emptyMessage = "No profiles found matching your search.",
  defaultRole = "All",
}: UserProfileGridProps) {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState(defaultRole);

  const roles = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach((p) => {
      if (p.role) set.add(p.role);
    });
    return ["All", ...Array.from(set)];
  }, [profiles]);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const matchesRole =
        selectedRole === "All" ||
        p.role.toLowerCase() === selectedRole.toLowerCase();

      if (!matchesRole) return false;

      const q = search.trim().toLowerCase();
      if (!q) return true;

      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.profession || "").toLowerCase().includes(q) ||
        (p.locationRegion || "").toLowerCase().includes(q) ||
        (p.orgName || "").toLowerCase().includes(q) ||
        (p.bio || "").toLowerCase().includes(q)
      );
    });
  }, [profiles, search, selectedRole]);

  return (
    <div className="space-y-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        {(title || subtitle) && (
          <div className="space-y-1">
            {subtitle && (
              <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-display-md text-foreground font-bold">
                {title}
              </h2>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, profession, location…"
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-background text-body-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-[color:var(--brand-green)] focus:ring-2 focus:ring-[color:var(--brand-green-soft)] transition-all"
            />
          </div>

          {/* Optional Role Dropdown / Filter on mobile */}
          {showRoleFilters && roles.length > 2 && (
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full sm:w-auto h-11 pl-10 pr-8 rounded-lg border border-border bg-background text-body-sm text-foreground appearance-none focus:outline-none focus:border-[color:var(--brand-green)] focus:ring-2 focus:ring-[color:var(--brand-green-soft)] transition-all cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r === "CorporatePartner"
                      ? "Corporate Partners"
                      : r === "NGO"
                      ? "NGO Partners"
                      : r === "All"
                      ? "All Roles"
                      : `${r}s`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Role Filter Pills (Desktop) */}
      {showRoleFilters && roles.length > 2 && (
        <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1">
          {roles.map((r) => {
            const active = selectedRole === r;
            const label =
              r === "CorporatePartner"
                ? "Corporate Partners"
                : r === "NGO"
                ? "NGO Partners"
                : r === "All"
                ? "All Community"
                : `${r}s`;
            return (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "bg-[color:var(--brand-green)] text-white shadow-sm"
                    : "bg-surface-2 border border-border text-foreground-muted hover:text-foreground hover:bg-surface-3"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Profile Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3 bg-surface-1">
          <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mx-auto text-foreground-muted">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-headline text-foreground font-semibold">
            {emptyMessage}
          </h3>
          <p className="text-body-sm text-foreground-muted max-w-md mx-auto">
            Try adjusting your search terms or filter to discover more members of the Jenga365 network.
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-2 text-label font-medium text-[color:var(--brand-green)] hover:underline cursor-pointer"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((profile) => (
            <UserProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
