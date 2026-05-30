"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, MapPin } from "lucide-react";
import type { DirectoryView as DirectoryViewData } from "@/lib/actions/userSearch";

function roleLabel(role: string) {
    if (role === "CorporatePartner") return "Partner";
    if (role === "NGO") return "NGO Partner";
    return role;
}

export default function DirectoryView({ data }: { data: DirectoryViewData }) {
    const [query, setQuery] = useState("");

    const entries = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return data.entries;
        return data.entries.filter((e) =>
            e.name.toLowerCase().includes(q) ||
            (e.email ?? "").toLowerCase().includes(q) ||
            (e.region ?? "").toLowerCase().includes(q),
        );
    }, [data.entries, query]);

    return (
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-8">
            <h1 className="text-display-sm text-foreground">{data.title}</h1>
            {data.subtitle && <p className="text-body-sm text-foreground-muted mt-1">{data.subtitle}</p>}

            {data.entries.length > 3 && (
                <label className="jenga-input mt-6 flex items-center gap-2 max-w-sm">
                    <Search className="w-4 h-4 text-foreground-subtle" />
                    <input
                        type="search"
                        className="bg-transparent outline-none border-0 w-full text-body-sm"
                        placeholder="Search name, email, region…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </label>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {entries.map((e) => (
                    <div key={e.id} className="jenga-card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center text-foreground-subtle">
                            {e.image ? (
                                <Image src={e.image} alt={e.name} width={40} height={40} className="object-cover w-full h-full" />
                            ) : (
                                <span className="text-label">{e.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-body font-medium text-foreground truncate">{e.name}</p>
                            <p className="text-body-sm text-foreground-subtle truncate">
                                {e.relationship ?? roleLabel(e.role)}
                                {e.status ? ` · ${e.status}` : ""}
                            </p>
                            {e.email && <p className="text-body-sm text-foreground-muted truncate">{e.email}</p>}
                            {e.region && (
                                <p className="text-body-sm text-foreground-subtle flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {e.region}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {entries.length === 0 && (
                <p className="jenga-card p-6 mt-6 text-body-sm text-foreground-muted">No people to show.</p>
            )}
        </div>
    );
}
