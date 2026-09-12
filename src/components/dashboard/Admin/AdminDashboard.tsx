"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Filter, ShoppingBag, Plus } from "lucide-react";
import SyncStoreInventoryButton from "@/components/dashboard/shared/SyncStoreInventoryButton";
import { BentoCard, MetricTile } from "@/components/dashboard/shared/BentoCard";
import { UserRow, AdminDashboardProps, DEFAULT_STATS, ROLE_FILTERS, isNgo } from "./types";
import ExpandableUserRow from "./components/ExpandableUserRow";
import UserDetailsModal from "./components/UserDetailsModal";
import InviteModeratorModal from "./components/InviteModeratorModal";

export default function AdminDashboard({
  users = [],
  stats = DEFAULT_STATS,
  currentUserId,
}: AdminDashboardProps) {
  const router = useRouter();
  const [userList, setUserList] = useState<UserRow[]>(users);
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserList(users);
  }, [users]);

  const handleAction = () => {
    router.refresh();
  };

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [roleFilter, search]);

  const filtered = userList.filter((u) => {
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
