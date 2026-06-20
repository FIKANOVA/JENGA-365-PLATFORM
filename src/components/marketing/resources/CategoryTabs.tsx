"use client";

interface CategoryTabsProps {
    readonly activeCategory: string;
    readonly onCategoryChange: (category: string) => void;
}

const CATEGORIES = [
    { id: "ALL", label: "ALL" },
    { id: "ARTICLE", label: "ARTICLES" },
    { id: "DOWNLOAD", label: "DOWNLOADS" },
    { id: "VIDEO", label: "VIDEO" },
    { id: "VOICES", label: "VOICES" },
];

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
    return (
        <div className="flex border-b border-border overflow-x-auto hide-scrollbar">
            {CATEGORIES.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`px-8 py-5 text-label font-bold whitespace-nowrap transition-all relative group ${activeCategory === cat.id
                            ? "text-[var(--brand-green)]"
                            : "text-[var(--foreground-subtle)] hover:text-black"
                        }`}
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                >
                    {cat.label}
                    <div className={`absolute bottom-0 left-0 h-[2px] bg-[var(--brand-green)] transition-all duration-300 ${activeCategory === cat.id ? "w-full" : "w-0 group-hover:w-full opacity-30"}`} />
                </button>
            ))}
        </div>
    );
}
