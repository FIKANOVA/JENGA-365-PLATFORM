"use client";

import { useState } from "react";
import { Copy, ExternalLink, BarChart3, Check } from "lucide-react";

interface LookerEmbedProps {
    reportId: string | null;
    shareUrl: string | null;
    partnerName: string;
}

/**
 * CLAUDE.md §11 partner dashboard surface: embedded Looker Studio report +
 * login-free shareable link. Renders a placeholder when the partner has no
 * report configured so the operator can see exactly what's missing.
 */
export default function LookerEmbed({
    reportId,
    shareUrl,
    partnerName,
}: LookerEmbedProps) {
    const [copied, setCopied] = useState(false);

    if (!reportId && !shareUrl) {
        return (
            <section
                className="rounded-md border border-border bg-background p-6 lg:p-8"
                style={{ boxShadow: "var(--shadow-sm)" }}
            >
                <div className="flex items-start gap-4">
                    <span
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                        style={{ background: "var(--surface-2)" }}
                    >
                        <BarChart3 className="h-5 w-5 text-foreground" />
                    </span>
                    <div className="space-y-1.5">
                        <h2 className="text-headline text-foreground">
                            Looker Studio dashboard
                        </h2>
                        <p className="text-body-sm text-foreground-muted">
                            No dashboard is linked to your account yet. Once the Jenga365
                            M&amp;E team configures your per-partner view, your ESG report
                            and shareable link will appear here.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    const embedSrc = reportId
        ? `https://lookerstudio.google.com/embed/reporting/${encodeURIComponent(reportId)}/page/p_1`
        : null;

    const handleCopy = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard unavailable — fall through silently
        }
    };

    return (
        <section
            className="rounded-md border border-border bg-background overflow-hidden"
            style={{ boxShadow: "var(--shadow-sm)" }}
        >
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 lg:p-8 border-b border-border">
                <div className="space-y-1">
                    <p
                        className="text-eyebrow"
                        style={{ color: "var(--brand-green)" }}
                    >
                        ESG impact dashboard
                    </p>
                    <h2 className="text-headline text-foreground">
                        {partnerName} · live report
                    </h2>
                </div>
                {shareUrl && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                        >
                            {copied ? (
                                <>
                                    <Check
                                        className="h-3.5 w-3.5"
                                        style={{ color: "var(--brand-green)" }}
                                    />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" />
                                    Copy share link
                                </>
                            )}
                        </button>
                        <a
                            href={shareUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-label font-medium text-white transition-opacity hover:opacity-90"
                            style={{ background: "var(--brand-green)" }}
                        >
                            Open in Looker
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>
                )}
            </header>

            {embedSrc ? (
                <div
                    className="relative w-full"
                    style={{ aspectRatio: "16 / 9", background: "var(--surface-1)" }}
                >
                    <iframe
                        title={`${partnerName} ESG dashboard`}
                        src={embedSrc}
                        className="absolute inset-0 h-full w-full"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                </div>
            ) : shareUrl ? (
                <div className="p-6 lg:p-8 text-body-sm text-foreground-muted">
                    Direct embed not configured. Use the share link to view the
                    dashboard.
                </div>
            ) : null}
        </section>
    );
}
