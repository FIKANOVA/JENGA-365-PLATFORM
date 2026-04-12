"use client";

import { useState } from "react";
import { FileText, Upload, Trash2, Clock, ShieldCheck, AlertTriangle } from "lucide-react";

/**
 * NDA Manager — SuperAdmin only.
 * Manage NDA document versions, view signing status, and upload new versions.
 */

const MOCK_VERSIONS = [
    { id: "v3", version: "3.0", uploadedAt: "2026-02-15", status: "active", signedCount: 1124, totalUsers: 1247 },
    { id: "v2", version: "2.1", uploadedAt: "2025-09-01", status: "archived", signedCount: 987, totalUsers: 1050 },
    { id: "v1", version: "1.0", uploadedAt: "2025-01-15", status: "archived", signedCount: 412, totalUsers: 500 },
];

export default function NDAManager() {
    const [versions] = useState(MOCK_VERSIONS);

    const activeVersion = versions.find((v) => v.status === "active");
    const unsignedCount = activeVersion ? activeVersion.totalUsers - activeVersion.signedCount : 0;

    return (
        <div className="min-h-screen bg-[#FAFAF8]">
            <div className="max-w-5xl mx-auto px-8 py-12">
                {/* Header */}
                <div className="mb-10">
                    <p className="text-[10px] text-[#BB0000] uppercase tracking-[0.3em] font-bold mb-2" style={{ fontFamily: "var(--font-dm-mono)" }}>SuperAdmin Tool</p>
                    <h1 className="text-4xl text-[#1A1A1A] mb-2" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900 }}>NDA Manager</h1>
                    <p className="text-gray-500" style={{ fontFamily: "var(--font-lato)" }}>Manage NDA document versions and track user signing compliance.</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white border border-gray-100 p-6" style={{ borderRadius: 2 }}>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-dm-mono)" }}>Active Version</p>
                        <p className="text-3xl font-bold text-[#006600]" style={{ fontFamily: "var(--font-dm-mono)" }}>v{activeVersion?.version}</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-6" style={{ borderRadius: 2 }}>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-dm-mono)" }}>Signed</p>
                        <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>{activeVersion?.signedCount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "var(--font-lato)" }}>of {activeVersion?.totalUsers.toLocaleString()} users</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 border-l-4 border-l-[#BB0000]" style={{ borderRadius: 2 }}>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-dm-mono)" }}>Unsigned</p>
                        <p className="text-3xl font-bold text-[#BB0000]" style={{ fontFamily: "var(--font-dm-mono)" }}>{unsignedCount}</p>
                        <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "var(--font-lato)" }}>Require reminder</p>
                    </div>
                </div>

                {/* Upload New Version */}
                <section className="mb-12">
                    <h2 className="text-xl mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}>
                        <span className="w-6 h-[2px] bg-[#BB0000]" />
                        Upload New Version
                    </h2>
                    <div className="bg-white border-2 border-dashed border-gray-200 p-8 text-center hover:border-[#BB0000]/40 transition-colors cursor-pointer" style={{ borderRadius: 2 }}>
                        <Upload size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-sm font-bold mb-1" style={{ fontFamily: "var(--font-lato)" }}>Drop a PDF here or click to upload</p>
                        <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-dm-mono)" }}>
                            Uploading a new version will require ALL users to re-sign
                        </p>
                    </div>
                </section>

                {/* Version History */}
                <section>
                    <h2 className="text-xl mb-6 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}>
                        <span className="w-6 h-[2px] bg-[#006600]" />
                        Version History
                    </h2>
                    <div className="space-y-3">
                        {versions.map((v) => (
                            <div
                                key={v.id}
                                className={`flex items-center justify-between p-5 bg-white border transition-all ${v.status === "active" ? "border-[#006600]/40" : "border-gray-100"
                                    }`}
                                style={{ borderRadius: 2 }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 flex items-center justify-center ${v.status === "active" ? "bg-[#006600]/10" : "bg-gray-50"}`} style={{ borderRadius: 2 }}>
                                        <FileText size={18} className={v.status === "active" ? "text-[#006600]" : "text-gray-400"} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm" style={{ fontFamily: "var(--font-dm-mono)" }}>Version {v.version}</p>
                                            {v.status === "active" && (
                                                <span className="text-[8px] px-2 py-0.5 bg-[#006600] text-white uppercase tracking-wider font-bold" style={{ fontFamily: "var(--font-dm-mono)", borderRadius: 2 }}>
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Clock size={10} className="text-gray-400" />
                                            <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-dm-mono)" }}>{v.uploadedAt}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-bold" style={{ fontFamily: "var(--font-dm-mono)" }}>
                                            {v.signedCount}/{v.totalUsers}
                                        </p>
                                        <p className="text-[9px] text-gray-400 uppercase" style={{ fontFamily: "var(--font-dm-mono)" }}>Signed</p>
                                    </div>
                                    {v.status === "archived" && (
                                        <button className="text-gray-300 hover:text-[#BB0000] transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Warning */}
                <div className="mt-8 flex items-start gap-3 p-4 bg-[#BB0000]/5 border border-[#BB0000]/20" style={{ borderRadius: 2 }}>
                    <AlertTriangle size={16} className="text-[#BB0000] flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-[#BB0000] mb-1" style={{ fontFamily: "var(--font-dm-mono)" }}>IMPORTANT</p>
                        <p className="text-xs text-gray-600" style={{ fontFamily: "var(--font-lato)" }}>
                            Uploading a new NDA version will invalidate all existing signatures and require every user to re-sign before accessing their dashboard. Use with caution.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
