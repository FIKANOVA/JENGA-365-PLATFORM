"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { requestDataExport } from "@/lib/actions/settings";

export default function DataExportSection() {
    const [exporting, setExporting] = useState(false);

    async function handleExport() {
        setExporting(true);
        try {
            const data = await requestDataExport();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `jenga365-data-export-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        } finally {
            setExporting(false);
        }
    }

    return (
        <section className="border border-border/50 rounded-md bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <Download className="w-5 h-5" style={{ color: "var(--brand-green)" }} />
                <h2 className="text-headline text-foreground">Data export (GDPR)</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
                Download a full copy of all data Jenga365 holds about your account.
            </p>
            <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-6 py-2 border border-border/50 text-foreground font-bold text-sm rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {exporting ? "Preparing export…" : "Download My Data"}
            </button>
        </section>
    );
}
