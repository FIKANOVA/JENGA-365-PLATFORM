"use client";

import { useState } from "react";
import { Eye, EyeOff, Search, ChevronDown, Shield } from "lucide-react";

export type ShadowUser = {
    id: string;
    name: string;
    role: string;
    email: string;
};

export default function ShadowView({ users }: { users: ShadowUser[] }) {
    const [selectedUser, setSelectedUser] = useState<ShadowUser | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = users.filter(
        (u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Shadow Banner */}
            {isActive && selectedUser && (
                <div
                    className="fixed top-0 left-0 right-0 z-50 px-6 py-2 flex items-center justify-between"
                    style={{ background: "#0a0a0a", color: "#ffffff" }}
                >
                    <div className="flex items-center gap-3">
                        <Eye size={14} style={{ color: "var(--brand-red)" }} />
                        <span className="text-eyebrow">
                            Shadow mode active — viewing as <strong>{selectedUser.name}</strong> ({selectedUser.role})
                        </span>
                    </div>
                    <button
                        onClick={() => { setIsActive(false); setSelectedUser(null); }}
                        className="text-eyebrow font-medium hover:opacity-80"
                        style={{ color: "var(--brand-red)" }}
                    >
                        Exit shadow
                    </button>
                </div>
            )}

            <div className={`max-w-4xl mx-auto px-8 py-12 ${isActive ? "pt-20" : ""}`}>
                {/* Header */}
                <div className="mb-10">
                    <p className="text-eyebrow mb-2" style={{ color: "var(--brand-red)" }}>SuperAdmin tool</p>
                    <h1 className="text-display-md text-foreground mb-2">Shadow view</h1>
                    <p className="text-body-sm text-foreground-muted">
                        View any user&apos;s dashboard exactly as they see it, without modifying their session.
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
                    <input
                        type="text"
                        placeholder="Search by name or email…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 rounded-md border border-border bg-background text-body-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-[color:var(--border-strong,#D4D4D8)] focus:ring-2 focus:ring-[color:var(--brand-green-soft)] transition-all"
                    />
                </div>

                {/* User List */}
                <div className="space-y-2">
                    {filtered.map((user) => {
                        const selected = selectedUser?.id === user.id;
                        return (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-5 rounded-lg border bg-background transition-colors cursor-pointer"
                                style={{
                                    borderColor: selected ? "var(--brand-red)" : "var(--border)",
                                    boxShadow: selected ? "var(--shadow-sm)" : undefined,
                                }}
                                onClick={() => setSelectedUser(user)}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 flex items-center justify-center rounded-md text-label text-foreground"
                                        style={{ background: "var(--surface-2)" }}
                                    >
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-label text-foreground">{user.name}</p>
                                        <p className="text-eyebrow text-foreground-muted">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className="text-eyebrow px-2 py-1 rounded-md"
                                        style={{ background: "var(--surface-1)", color: "var(--foreground-muted)" }}
                                    >
                                        {user.role}
                                    </span>
                                    {selected && (
                                        <ChevronDown size={14} style={{ color: "var(--brand-red)" }} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Activate Shadow */}
                {selectedUser && !isActive && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setIsActive(true)}
                            className="inline-flex items-center gap-2 h-11 rounded-md px-6 text-label font-medium transition-opacity hover:opacity-90"
                            style={{ background: "#0a0a0a", color: "#ffffff" }}
                        >
                            <EyeOff size={16} />
                            Enter shadow as {selectedUser.name}
                        </button>
                    </div>
                )}

                {/* Active Shadow Preview */}
                {isActive && selectedUser && (
                    <div
                        className="mt-12 border-2 border-dashed p-8 rounded-lg bg-background"
                        style={{ borderColor: "var(--brand-red)" }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Shield size={14} style={{ color: "var(--brand-red)" }} />
                            <p className="text-eyebrow" style={{ color: "var(--brand-red)" }}>
                                Impersonated dashboard preview
                            </p>
                        </div>
                        <div
                            className="p-12 flex items-center justify-center text-center rounded-md"
                            style={{ background: "var(--surface-1)" }}
                        >
                            <div>
                                <p className="text-display-sm text-foreground mb-2">
                                    {selectedUser.name}&apos;s dashboard
                                </p>
                                <p className="text-body-sm text-foreground-muted">
                                    Role: {selectedUser.role} — This area would render their actual dashboard component.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
