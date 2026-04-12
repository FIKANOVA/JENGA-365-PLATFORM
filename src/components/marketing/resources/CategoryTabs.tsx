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
        <div className="flex border-b border-[var(--border)] overflow-x-auto hide-scrollbar">
            {CATEGORIES.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`px-8 py-5 text-[10px] font-bold tracking-[0.3em] whitespace-nowrap transition-all relative group ${activeCategory === cat.id
                            ? "text-[var(--primary-green)]"
                            : "text-[var(--text-muted)] hover:text-black"
                        }`}
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                >
                    {cat.label}
                    <div className={`absolute bottom-0 left-0 h-[2px] bg-[var(--primary-green)] transition-all duration-300 ${activeCategory === cat.id ? "w-full" : "w-0 group-hover:w-full opacity-30"}`} />
                </button>
            ))}
        </div>
    );
}
