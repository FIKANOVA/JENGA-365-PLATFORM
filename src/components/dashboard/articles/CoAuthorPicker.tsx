"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { searchUsersForCoAuthor, type UserSearchResult } from "@/lib/actions/userSearch";

interface CoAuthorPickerProps {
    readonly selected: readonly UserSearchResult[];
    readonly onChange: (next: UserSearchResult[]) => void;
    readonly maxCount?: number;
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
    let t: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
        if (t) clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

export default function CoAuthorPicker({ selected, onChange, maxCount = 5 }: CoAuthorPickerProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserSearchResult[]>([]);
    const [open, setOpen] = useState(false);
    const [pending, start] = useTransition();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const search = debounce((q: string) => {
            if (q.trim().length < 2) {
                setResults([]);
                return;
            }
            start(async () => {
                try {
                    const rows = await searchUsersForCoAuthor(q);
                    setResults(rows);
                } catch {
                    setResults([]);
                }
            });
        }, 200);
        search(query);
    }, [query]);

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [open]);

    const add = (user: UserSearchResult) => {
        if (selected.some((s) => s.id === user.id)) return;
        if (selected.length >= maxCount) return;
        onChange([...selected, user]);
        setQuery("");
        setResults([]);
    };

    const remove = (id: string) => {
        onChange(selected.filter((s) => s.id !== id));
    };

    return (
        <div ref={ref} className="space-y-2 relative">
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selected.map((u) => (
                        <span
                            key={u.id}
                            className="inline-flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-border bg-background text-body-sm text-foreground"
                        >
                            {u.image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={u.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                            ) : (
                                <span
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-eyebrow"
                                    style={{ background: "var(--surface-2)" }}
                                >
                                    {(u.name || u.email).charAt(0).toUpperCase()}
                                </span>
                            )}
                            <span className="truncate max-w-[150px]">{u.name || u.email}</span>
                            <button
                                type="button"
                                onClick={() => remove(u.id)}
                                aria-label={`Remove ${u.name || u.email}`}
                                className="text-foreground-muted hover:text-foreground rounded-full p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {selected.length < maxCount && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
                    <input
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                        onFocus={() => setOpen(true)}
                        placeholder="Search by name or email…"
                        className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-background text-body-sm text-foreground placeholder:text-[var(--foreground-subtle)] focus:border-[color:var(--brand-red)] focus:outline-none"
                    />
                    {pending && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-foreground-muted" />
                    )}

                    {open && (results.length > 0 || (query.trim().length >= 2 && !pending)) && (
                        <ul
                            className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-md border border-border bg-background"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            {results.length === 0 ? (
                                <li className="px-3 py-3 text-body-sm text-foreground-muted">No matching users.</li>
                            ) : (
                                results.map((u) => {
                                    const already = selected.some((s) => s.id === u.id);
                                    return (
                                        <li key={u.id}>
                                            <button
                                                type="button"
                                                onClick={() => add(u)}
                                                disabled={already}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[color:var(--surface-1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                                            >
                                                {u.image ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img src={u.image} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                                                ) : (
                                                    <span
                                                        className="w-7 h-7 rounded-full flex items-center justify-center text-label shrink-0"
                                                        style={{ background: "var(--surface-2)" }}
                                                    >
                                                        {(u.name || u.email).charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-label text-foreground truncate">{u.name || u.email}</p>
                                                    <p className="text-eyebrow text-foreground-muted truncate">
                                                        {u.email} · {u.role}
                                                    </p>
                                                </div>
                                                {already && (
                                                    <span className="text-eyebrow text-foreground-muted">added</span>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    )}
                </div>
            )}

            {selected.length >= maxCount && (
                <p className="text-eyebrow text-foreground-muted">
                    Maximum {maxCount} co-authors.
                </p>
            )}
        </div>
    );
}
