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
        <section className="jenga-card p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <span className="section-label mb-6">Documents</span>

            <div className="space-y-4 mb-8">
                {displayDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div>
                                <p className="font-lato text-[13px] text-foreground font-medium truncate max-w-[140px]">
                                    {doc.documentName || doc.name}
                                </p>
                                <p className="font-mono text-[9px] text-muted-foreground uppercase">
                                    {doc.documentType || doc.type} • {doc.fileSizeBytes ? (doc.fileSizeBytes / 1024).toFixed(0) + "KB" : doc.size}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:text-primary transition-colors" title="View">
                                <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 hover:text-primary transition-colors" title="Download">
                                <Download className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 border border-dashed border-input py-3 font-mono text-[10px] text-muted-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-all">
                <Plus className="w-4 h-4" /> Upload Document
            </button>
            <p className="mt-2 text-center font-mono text-[8px] text-muted-foreground uppercase">
                PDF • DOCX • MAX 5MB
            </p>
        </section>
    );
}
