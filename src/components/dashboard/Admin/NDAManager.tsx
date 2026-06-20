"use client";

import { useState } from "react";
import { FileText, Upload, Trash2, Clock, AlertTriangle } from "lucide-react";

export type NdaVersionRow = {
    id: string;
    version: string;
    uploadedAt: string;
    status: "active" | "archived";
    signedCount: number;
    totalUsers: number;
};

interface NDAManagerProps {
    versions: NdaVersionRow[];
}

export default function NDAManager({ versions: initialVersions }: NDAManagerProps) {
    const [versions] = useState(initialVersions);

    const activeVersion = versions.find((v) => v.status === "active");
    const unsignedCount = activeVersion ? activeVersion.totalUsers - activeVersion.signedCount : 0;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-8 py-12">
                {/* Header */}
                <div className="mb-10">
                    <p className="text-eyebrow mb-2" style={{ color: "var(--brand-red)" }}>SuperAdmin tool</p>
                    <h1 className="text-display-md text-foreground mb-2">NDA manager</h1>
                    <p className="text-body-sm text-foreground-muted">
                        Manage NDA document versions and track user signing compliance.
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <div className="rounded-md border border-border bg-background p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
                        <p className="text-eyebrow text-foreground-muted mb-2">Active version</p>
                        <p className="text-display-sm" style={{ color: "var(--brand-green)" }}>
                            v{activeVersion?.version}
                        </p>
                    </div>
                    <div className="rounded-md border border-border bg-background p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
                        <p className="text-eyebrow text-foreground-muted mb-2">Signed</p>
                        <p className="text-display-sm text-foreground">{activeVersion?.signedCount.toLocaleString()}</p>
                        <p className="text-body-sm text-foreground-muted mt-1">
                            of {activeVersion?.totalUsers.toLocaleString()} users
                        </p>
                    </div>
                    <div
                        className="rounded-md border bg-background p-6 border-l-4"
                        style={{ boxShadow: "var(--shadow-sm)", borderLeftColor: "var(--brand-red)" }}
                    >
                        <p className="text-eyebrow text-foreground-muted mb-2">Unsigned</p>
                        <p className="text-display-sm" style={{ color: "var(--brand-red)" }}>{unsignedCount}</p>
                        <p className="text-body-sm text-foreground-muted mt-1">Require reminder</p>
                    </div>
                </div>

                {/* Upload New Version */}
                <section className="mb-12">
                    <h2 className="text-headline text-foreground mb-4 flex items-center gap-2">
                        <span className="w-6 h-[2px]" style={{ background: "var(--brand-red)" }} />
                        Upload new version
                    </h2>
                    <div
                        className="rounded-md border-2 border-dashed border-border bg-background p-8 text-center hover:border-[color:var(--border-strong,#D4D4D8)] transition-colors cursor-pointer"
                        style={{ background: "var(--surface-1)" }}
                    >
                        <Upload size={32} className="mx-auto text-foreground-subtle mb-3" />
                        <p className="text-label text-foreground mb-1">Drop a PDF here or click to upload</p>
                        <p className="text-eyebrow text-foreground-muted">
                            Uploading a new version will require ALL users to re-sign
                        </p>
                    </div>
                </section>

                {/* Version History */}
                <section>
                    <h2 className="text-headline text-foreground mb-6 flex items-center gap-2">
                        <span className="w-6 h-[2px]" style={{ background: "var(--brand-green)" }} />
                        Version history
                    </h2>
                    <div className="space-y-3">
                        {versions.map((v) => {
                            const isActive = v.status === "active";
                            return (
                                <div
                                    key={v.id}
                                    className="flex items-center justify-between p-5 rounded-md border bg-background transition-colors"
                                    style={{
                                        borderColor: isActive ? "var(--brand-green)" : "var(--border)",
                                        boxShadow: "var(--shadow-sm)",
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 flex items-center justify-center rounded-md"
                                            style={{
                                                background: isActive ? "var(--brand-green-soft)" : "var(--surface-1)",
                                                color: isActive ? "var(--brand-green)" : "var(--foreground-subtle)",
                                            }}
                                        >
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-label text-foreground">Version {v.version}</p>
                                                {isActive && (
                                                    <span
                                                        className="text-eyebrow px-2 py-0.5 rounded-full"
                                                        style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                                                    >
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Clock size={10} className="text-foreground-subtle" />
                                                <p className="text-eyebrow text-foreground-muted">{v.uploadedAt}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-label text-foreground">
                                                {v.signedCount}/{v.totalUsers}
                                            </p>
                                            <p className="text-eyebrow text-foreground-muted">Signed</p>
                                        </div>
                                        {!isActive && (
                                            <button className="text-foreground-subtle hover:text-[color:var(--brand-red)] transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Warning */}
                <div
                    className="mt-8 flex items-start gap-3 p-4 rounded-md border"
                    style={{
                        background: "var(--brand-red-soft)",
                        borderColor: "var(--brand-red)",
                    }}
                >
                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--brand-red)" }} />
                    <div>
                        <p className="text-label mb-1" style={{ color: "var(--brand-red)" }}>Important</p>
                        <p className="text-body-sm text-foreground-muted">
                            Uploading a new NDA version will invalidate all existing signatures and require every user to re-sign before accessing their dashboard. Use with caution.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
