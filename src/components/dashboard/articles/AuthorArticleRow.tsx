"use client";

import Link from "next/link";

export type ArticleStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "REJECTED";

interface AuthorArticleRowProps {
    readonly id: string;
    readonly title: string;
    readonly category: string;
    readonly date: string;
    readonly status: ArticleStatus;
    readonly feedback?: string;
}

export default function AuthorArticleRow({ id, title, category, date, status, feedback }: AuthorArticleRowProps) {
    const isRejected = status === "REJECTED";

    return (
        <div
            className={`flex flex-col rounded border p-6 shadow-sm hover:shadow-md transition-shadow group ${isRejected
                    ? "bg-[#FFF0F0] border-l-[3px] border-l-[#BB0000] border-y border-r border-[#BB0000]/10"
                    : "bg-white border-[#E8E4DC] dark:bg-slate-900 dark:border-slate-800"
                }`}
        >
            {isRejected && (
                <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#BB0000] bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded border border-[#BB0000]/20 shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        REQUIRES CHANGES
                    </span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono tracking-wider font-bold uppercase px-2 py-1 bg-[#F5F5F5] dark:bg-slate-800 rounded text-[#4A4A4A] dark:text-slate-300">
                            {category}
                        </span>
                        <span className="text-[10px] font-mono text-[#8A8A8A]">{date}</span>
                    </div>
                    <h3 className="text-xl font-serif font-black leading-tight text-[#1A1A1A] dark:text-white group-hover:text-[#BB0000] transition-colors">
                        {title}
                    </h3>
                </div>

                <div className="flex gap-2 shrink-0">
                    {status === "PUBLISHED" ? (
                        <>
                            <button className="flex min-w-[90px] items-center justify-center rounded h-9 px-4 border border-[#D0CBC0] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#4A4A4A] dark:text-slate-300 text-xs font-mono font-bold transition-colors">
                                SHARE
                            </button>
                            <Link href={`/articles/${id}`}>
                                <button className="flex min-w-[90px] items-center justify-center rounded h-9 px-4 border border-[#D0CBC0] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#4A4A4A] dark:text-slate-300 text-xs font-mono font-bold transition-colors">
                                    VIEW
                                </button>
                            </Link>
                        </>
                    ) : isRejected ? (
                        <>
                            <button className="flex min-w-[90px] items-center justify-center rounded h-9 px-4 bg-white dark:bg-slate-800 border border-[#BB0000] text-[#BB0000] hover:bg-[#FFF0F0] dark:hover:bg-red-900/20 text-[10px] font-mono font-bold transition-colors shadow-sm">
                                REVIEW FEEDBACK
                            </button>
                            <Link href={`/articles/${id}/edit`}>
                                <button className="flex min-w-[90px] items-center justify-center rounded h-9 px-4 bg-[#BB0000] hover:bg-[#8B0000] text-white text-[10px] font-mono font-bold transition-colors shadow-lg">
                                    EDIT
                                </button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <button className="flex min-w-[90px] items-center justify-center rounded h-9 px-4 border border-red-200 text-[#BB0000] hover:bg-[#FFF0F0] dark:hover:bg-red-900/20 text-[10px] font-mono font-bold transition-colors">
                                DELETE
                            </button>
                            <Link href={`/articles/${id}/edit`}>
                                <button className="flex min-w-[90px] items-center justify-center rounded h-9 px-4 bg-[#BB0000] hover:bg-[#8B0000] text-white text-[10px] font-mono font-bold transition-colors shadow-lg">
                                    EDIT
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-3 mt-8 px-1">
                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[18px] ${status === "DRAFT" ? "text-[#BB0000]" : "text-green-600"}`}>
                        {status === "DRAFT" ? "radio_button_checked" : "check_circle"}
                    </span>
                    <span className={`text-[10px] font-mono tracking-widest uppercase ${status === "DRAFT" ? "text-[#1A1A1A] font-bold" : "text-[#8A8A8A]"}`}>Draft</span>
                </div>
                <div className={`w-10 h-[1px] ${status === "DRAFT" ? "bg-[#E8E4DC] border-dashed border-t" : "bg-green-600"}`} />

                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[18px] ${isRejected ? "text-[#BB0000]" :
                            status === "IN_REVIEW" ? "text-primary" :
                                status === "PUBLISHED" ? "text-green-600" : "text-[#D0CBC0]"
                        }`}>
                        {isRejected ? "cancel" : status === "IN_REVIEW" ? "radio_button_checked" : status === "PUBLISHED" ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span className={`text-[10px] font-mono tracking-widest uppercase ${isRejected ? "text-[#BB0000] font-bold" :
                            status === "IN_REVIEW" ? "text-[#1A1A1A] font-bold" : "text-[#8A8A8A]"
                        }`}>
                        {isRejected ? "Rejected" : "In Review"}
                    </span>
                </div>
                <div className={`w-10 h-[1px] ${status === "PUBLISHED" ? "bg-green-600" : "bg-[#E8E4DC] border-dashed border-t"}`} />

                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[18px] ${status === "PUBLISHED" ? "text-green-600" : "text-[#D0CBC0]"}`}>
                        {status === "PUBLISHED" ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span className={`text-[10px] font-mono tracking-widest uppercase ${status === "PUBLISHED" ? "text-[#1A1A1A] font-bold" : "text-[#8A8A8A]"}`}>Published</span>
                </div>
            </div>
        </div>
    );
}
