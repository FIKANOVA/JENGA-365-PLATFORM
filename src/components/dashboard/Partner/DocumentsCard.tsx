"use client"

import { FileText, Download, Eye, Plus } from "lucide-react";

interface Props {
    documents: any[];
    menteeId: string;
}

export default function DocumentsCard({ documents, menteeId }: Props) {
    const displayDocs = documents.length > 0 ? documents : [
        { id: "1", name: "CV — reviewed 3 Feb 2026", type: "pdf", size: "1.2 MB" },
        { id: "2", name: "Goal setting worksheet", type: "pdf", size: "800 KB" },
    ];

    return (
        <section
            className="rounded-md border border-border bg-background p-6 animate-fade-up"
            style={{ animationDelay: "200ms", boxShadow: "var(--shadow-sm)" }}
        >
            <span className="text-eyebrow text-foreground-muted mb-6 block">Documents</span>

            <div className="space-y-4 mb-8">
                {displayDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <FileText
                                className="w-5 h-5 text-foreground-muted group-hover:text-foreground transition-colors"
                            />
                            <div>
                                <p className="text-body-sm text-foreground font-medium truncate max-w-[140px]">
                                    {doc.documentName || doc.name}
                                </p>
                                <p className="text-eyebrow text-foreground-muted">
                                    {doc.documentType || doc.type} • {doc.fileSizeBytes ? (doc.fileSizeBytes / 1024).toFixed(0) + "KB" : doc.size}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 text-foreground-muted hover:text-foreground transition-colors" title="View">
                                <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 text-foreground-muted hover:text-foreground transition-colors" title="Download">
                                <Download className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 rounded-md border border-dashed border-border py-3 text-eyebrow text-foreground-muted hover:border-[color:var(--border-strong,#D4D4D8)] hover:text-foreground transition-all">
                <Plus className="w-4 h-4" /> Upload document
            </button>
            <p className="mt-2 text-center text-eyebrow text-foreground-muted">
                PDF • DOCX • Max 5MB
            </p>
        </section>
    );
}
