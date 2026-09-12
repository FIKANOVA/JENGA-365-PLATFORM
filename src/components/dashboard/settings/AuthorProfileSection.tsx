"use client";

import Link from "next/link";
import { PenSquare, ArrowRight } from "lucide-react";

export default function AuthorProfileSection() {
    return (
        <section className="border border-border/50 rounded-md bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <PenSquare className="w-5 h-5" style={{ color: "var(--brand-green)" }} />
                    <div>
                        <h2 className="text-headline text-foreground">Author profile</h2>
                        <p className="text-body-sm text-foreground-muted mt-1">
                            Bio and professional title shown on articles you write.
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/settings/author-profile"
                    className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-label font-medium transition-opacity hover:opacity-90"
                    style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                >
                    Edit profile
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </section>
    );
}
