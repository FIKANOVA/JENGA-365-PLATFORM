"use client";

import { useState } from "react";
import { Eye, EyeOff, Search, ChevronDown, Shield } from "lucide-react";

/**
 * Shadow View — SuperAdmin only.
 * Allows a SuperAdmin to impersonate any user's dashboard view
 * without modifying their session, for support/debugging purposes.
 */

const MOCK_USERS = [
    { id: "u1", name: "Alice Wanjiku", role: "Mentee", email: "alice@example.com" },
    { id: "u2", name: "Brian Ochieng", role: "Mentor", email: "brian@example.com" },
    { id: "u3", name: "Safaricom Foundation", role: "CorporatePartner", email: "csr@safaricom.co.ke" },
    { id: "u4", name: "Grace Muthoni", role: "Moderator", email: "grace@jenga365.org" },
];

export default function ShadowView() {
    const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = MOCK_USERS.filter(
        (u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FAFAF8]">
            {/* Shadow Banner */}
            {isActive && selectedUser && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A] text-white px-6 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Eye size={14} className="text-[#BB0000]" />
                        <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-dm-mono)" }}>
                            Shadow Mode Active — Viewing as <strong>{selectedUser.name}</strong> ({selectedUser.role})
                        </span>
                    </div>
                    <button
                        onClick={() => { setIsActive(false); setSelectedUser(null); }}
                        className="text-xs text-[#BB0000] uppercase tracking-widest font-bold hover:opacity-80"
                        style={{ fontFamily: "var(--font-dm-mono)" }}
                    >
                        Exit Shadow
                    </button>
                </div>
            )}

            <div className={`max-w-4xl mx-auto px-8 py-12 ${isActive ? "pt-20" : ""}`}>
                {/* Header */}
                <div className="mb-10">
                    <p className="text-[10px] text-[#BB0000] uppercase tracking-[0.3em] font-bold mb-2" style={{ fontFamily: "var(--font-dm-mono)" }}>SuperAdmin Tool</p>
                    <h1 className="text-4xl text-[#1A1A1A] mb-2" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>Shadow View</h1>
                    <p className="text-gray-500" style={{ fontFamily: "var(--font-lato)" }}>View any user&apos;s dashboard exactly as they see it, without modifying their session.</p>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 outline-none focus:border-[#BB0000] transition-colors text-sm"
                        style={{ borderRadius: 2, fontFamily: "var(--font-lato)" }}
                    />
                </div>

                {/* User List */}
                <div className="space-y-2">
                    {filtered.map((user) => (
                        <div
                            key={user.id}
                            className={`flex items-center justify-between p-5 bg-white border transition-all cursor-pointer ${selectedUser?.id === user.id ? "border-[#BB0000] shadow-sm" : "border-gray-100 hover:border-gray-200"
                                }`}
                            style={{ borderRadius: 2 }}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center font-bold text-sm" style={{ borderRadius: 2, fontFamily: "var(--font-dm-mono)" }}>
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-sm" style={{ fontFamily: "var(--font-lato)" }}>{user.name}</p>
                                    <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-dm-mono)" }}>{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] px-2 py-1 bg-gray-50 text-gray-500 uppercase tracking-wider" style={{ fontFamily: "var(--font-dm-mono)", borderRadius: 2 }}>
                                    {user.role}
                                </span>
                                {selectedUser?.id === user.id && (
                                    <ChevronDown size={14} className="text-[#BB0000]" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Activate Shadow */}
                {selectedUser && !isActive && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setIsActive(true)}
                            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3 font-bold text-sm uppercase tracking-widest hover:bg-[#333] transition-colors"
                            style={{ borderRadius: 2, fontFamily: "var(--font-dm-mono)" }}
                        >
                            <EyeOff size={16} />
                            Enter Shadow as {selectedUser.name}
                        </button>
                    </div>
                )}

                {/* Active Shadow Preview */}
                {isActive && selectedUser && (
                    <div className="mt-12 border-2 border-dashed border-[#BB0000]/30 p-8 bg-white" style={{ borderRadius: 2 }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Shield size={14} className="text-[#BB0000]" />
                            <p className="text-[10px] text-[#BB0000] uppercase tracking-widest font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                Impersonated Dashboard Preview
                            </p>
                        </div>
                        <div className="bg-gray-50 p-12 flex items-center justify-center text-center" style={{ borderRadius: 2 }}>
                            <div>
                                <p className="text-2xl mb-2" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}>{selectedUser.name}&apos;s Dashboard</p>
                                <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-lato)" }}>
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
