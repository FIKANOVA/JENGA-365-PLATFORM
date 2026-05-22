"use client"

import { Mail, Download, Lock } from "lucide-react";

interface MenteeDetailHeaderProps {
    mentee: any;
}

export default function MenteeDetailHeader({ mentee }: MenteeDetailHeaderProps) {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-display-sm"
                    style={{ background: "var(--brand-green-soft)", color: "var(--brand-green)" }}
                >
                    {mentee.name?.substring(0, 2).toUpperCase() || "AI"}
                </div>
                <div className="space-y-1">
                    <p className="text-eyebrow text-foreground-muted">
                        Dashboard → Employee mentees
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-display-md text-foreground">
                            {mentee.name || "Aisha Kamau"}
                        </h1>
                        <span
                            className="px-3 py-1 rounded-full text-eyebrow"
                            style={{ background: "var(--brand-green-soft)", color: "var(--brand-green)" }}
                        >
                            Mentee
                        </span>
                        <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: "var(--brand-green)" }}
                            title="Active"
                        />
                    </div>
                    <p className="text-eyebrow text-foreground-muted">
                        Joined {new Date(mentee.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 h-9 rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]">
                    <Mail className="w-4 h-4" /> Message mentee
                </button>
                <button className="inline-flex items-center gap-2 h-9 rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]">
                    <Download className="w-4 h-4" /> Download report
                </button>
                <button
                    className="inline-flex items-center gap-2 h-9 rounded-md border bg-background px-4 text-label transition-colors hover:bg-[color:var(--brand-red-soft)]"
                    style={{ borderColor: "var(--brand-red)", color: "var(--brand-red)" }}
                >
                    <Lock className="w-4 h-4" /> Suspend mentee
                </button>
            </div>
        </header>
    );
}
