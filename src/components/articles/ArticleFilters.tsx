"use client";

import { Search } from "lucide-react";

const PILLS = ["ALL", "MENTORSHIP", "CAREER", "RUGBY", "RESOURCES", "MY DRAFTS"];

interface ArticleFiltersProps {
    readonly activePill: string;
    readonly onPillChange: (pill: string) => void;
    readonly showDrafts?: boolean;
}

export default function ArticleFilters({ activePill, onPillChange, showDrafts = false }: ArticleFiltersProps) {
    const visiblePills = showDrafts ? PILLS : PILLS.filter(p => p !== "MY DRAFTS");

    return (
        <div className="flex flex-col gap-8 mb-12">
            {/* Search Bar */}
            <div className="relative w-full max-w-4xl">
                <input
                    type="text"
                    placeholder="Search articles, topics, or authors..."
                    className="w-full h-14 pl-12 pr-4 bg-white border border-[#E8E4DC] focus:outline-none focus:border-[#BB0000] focus:ring-4 focus:ring-[#BB0000]/5 transition-all"
                    style={{ borderRadius: 2, fontFamily: "var(--font-lato)", fontSize: 16 }}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A]" size={20} />
            </div>

            {/* Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {visiblePills.map((pill) => (
                    <button
                        key={pill}
                        onClick={() => onPillChange(pill)}
                        className={`whitespace-nowrap px-5 py-2 transition-all duration-200 ${activePill === pill
                                ? "bg-[#BB0000] text-white"
                                : "bg-[#F5F5F5] text-[#1A1A1A] border border-[#E8E4DC] hover:border-[#D0CBC0]"
                            }`}
                        style={{
                            fontFamily: "var(--font-dm-mono)",
                            fontSize: 10,
                            fontWeight: 600,
                            borderRadius: 2,
                            letterSpacing: "0.15em"
                        }}
                    >
                        {pill}
                    </button>
                ))}
            </div>
        </div>
    );
}
