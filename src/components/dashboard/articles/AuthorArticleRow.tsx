"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Circle, CircleDot, Loader2, XCircle } from "lucide-react";
import { deleteArticleDraft } from "@/lib/actions/articleAuthoring";

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
    const router = useRouter();
    const [pending, start] = useTransition();
    const [showFeedback, setShowFeedback] = useState(false);

    const handleDelete = () => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        start(async () => {
            try {
                await deleteArticleDraft(id);
                router.refresh();
            } catch (err) {
                alert(err instanceof Error ? err.message : "Delete failed");
            }
        });
    };

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
                        <AlertCircle className="h-3.5 w-3.5" />
                        REQUIRES CHANGES
                    </span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3">
                        <span className="text-label font-mono tracking-wider font-bold uppercase px-2 py-1 bg-[#F5F5F5] dark:bg-slate-800 rounded text-[#4A4A4A] dark:text-slate-300">
                            {category}
                        </span>
                        <span className="text-label font-mono text-[#8A8A8A]">{date}</span>
                    </div>
                    <h3 className="text-headline leading-tight text-foreground group-hover:text-[var(--brand-red)] transition-colors">
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
                            <button
                                type="button"
                                onClick={() => setShowFeedback(true)}
                                disabled={!feedback}
                                className="flex min-w-[90px] items-center justify-center rounded h-9 px-4 bg-white dark:bg-slate-800 border border-[#BB0000] text-[#BB0000] hover:bg-[#FFF0F0] dark:hover:bg-red-900/20 text-label font-mono font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                REVIEW FEEDBACK
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={pending}
                                className="flex min-w-[90px] items-center justify-center rounded h-9 px-4 border border-red-200 text-[#BB0000] hover:bg-[#FFF0F0] dark:hover:bg-red-900/20 text-label font-mono font-bold transition-colors disabled:opacity-50"
                            >
                                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "DELETE"}
                            </button>
                            <Link href={`/dashboard/articles/${id}/edit`}>
                                <button className="flex min-w-[90px] items-center justify-center rounded h-9 px-4 bg-[#BB0000] hover:bg-[#8B0000] text-white text-label font-mono font-bold transition-colors shadow-lg">
                                    EDIT
                                </button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={pending}
                                className="flex min-w-[90px] items-center justify-center rounded h-9 px-4 border border-red-200 text-[#BB0000] hover:bg-[#FFF0F0] dark:hover:bg-red-900/20 text-label font-mono font-bold transition-colors disabled:opacity-50"
                            >
                                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "DELETE"}
                            </button>
                            <Link href={`/dashboard/articles/${id}/edit`}>
                                <button className="flex min-w-[90px] items-center justify-center rounded h-9 px-4 bg-[#BB0000] hover:bg-[#8B0000] text-white text-label font-mono font-bold transition-colors shadow-lg">
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
                    {status === "DRAFT"
                        ? <CircleDot className="h-4 w-4 text-[#BB0000]" />
                        : <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    <span className={`text-label font-mono tracking-widest uppercase ${status === "DRAFT" ? "text-[#1A1A1A] font-bold" : "text-[#8A8A8A]"}`}>Draft</span>
                </div>
                <div className={`w-10 h-[1px] ${status === "DRAFT" ? "bg-[#E8E4DC] border-dashed border-t" : "bg-green-600"}`} />

                <div className="flex items-center gap-2">
                    {isRejected ? <XCircle className="h-4 w-4 text-[#BB0000]" /> :
                        status === "IN_REVIEW" ? <CircleDot className="h-4 w-4 text-[var(--brand-green)]" /> :
                        status === "PUBLISHED" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                        <Circle className="h-4 w-4 text-[#D0CBC0]" />}
                    <span className={`text-label font-mono tracking-widest uppercase ${isRejected ? "text-[#BB0000] font-bold" :
                            status === "IN_REVIEW" ? "text-[#1A1A1A] font-bold" : "text-[#8A8A8A]"
                        }`}>
                        {isRejected ? "Rejected" : "In Review"}
                    </span>
                </div>
                <div className={`w-10 h-[1px] ${status === "PUBLISHED" ? "bg-green-600" : "bg-[#E8E4DC] border-dashed border-t"}`} />

                <div className="flex items-center gap-2">
                    {status === "PUBLISHED" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-[#D0CBC0]" />}
                    <span className={`text-label font-mono tracking-widest uppercase ${status === "PUBLISHED" ? "text-[#1A1A1A] font-bold" : "text-[#8A8A8A]"}`}>Published</span>
                </div>
            </div>

            {showFeedback && feedback && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setShowFeedback(false)}
                >
                    <div
                        className="max-w-lg w-full rounded-md border border-border bg-background p-6 space-y-4"
                        style={{ boxShadow: "var(--shadow-md, var(--shadow-sm))" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 rounded-md flex items-center justify-center"
                                style={{ background: "var(--brand-red-soft, #FEE2E2)", color: "var(--brand-red)" }}
                            >
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-eyebrow text-foreground-muted">Moderator feedback</p>
                                <h4 className="text-headline text-foreground">{title}</h4>
                            </div>
                        </div>
                        <p className="text-body-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {feedback}
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowFeedback(false)}
                                className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                            >
                                Close
                            </button>
                            <Link
                                href={`/dashboard/articles/${id}/edit`}
                                className="inline-flex h-9 items-center gap-2 rounded-md px-4 text-label font-medium text-white transition-opacity hover:opacity-90"
                                style={{ background: "var(--brand-red)" }}
                            >
                                Revise article
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
