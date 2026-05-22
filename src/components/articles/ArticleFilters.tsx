"use client";

import { Search } from "lucide-react";

const PILLS = ["All", "Mentorship", "Career", "Rugby", "Resources", "My drafts"];

interface ArticleFiltersProps {
    readonly activePill: string;
    readonly onPillChange: (pill: string) => void;
    readonly showDrafts?: boolean;
}

export default function ArticleFilters({ activePill, onPillChange, showDrafts = false }: ArticleFiltersProps) {
    const visiblePills = showDrafts ? PILLS : PILLS.filter(p => p !== "My drafts");

    return (
        <div className="flex flex-col gap-6 mb-10">
            {/* Search Bar */}
            <div className="relative w-full max-w-4xl">
                <input
                    type="text"
                    placeholder="Search articles, topics, or authors…"
                    className="w-full h-12 pl-11 pr-4 rounded-md border border-border bg-background text-body-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-[color:var(--border-strong,#D4D4D8)] focus:ring-2 focus:ring-[color:var(--brand-green-soft)]"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-subtle" size={18} />
            </div>

            {/* Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {visiblePills.map((pill) => {
                    const active = activePill === pill;
                    return (
                        <button
                            key={pill}
                            onClick={() => onPillChange(pill)}
                            className="whitespace-nowrap px-4 py-2 rounded-md text-label transition-colors"
                            style={
                                active
                                    ? { background: "var(--brand-green)", color: "var(--brand-green-fg)" }
                                    : { background: "var(--surface-1)", color: "var(--foreground)", border: "1px solid var(--border)" }
                            }
                        >
                            {pill}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
