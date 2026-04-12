"use client"

import { useEffect, useState } from "react";
import { listPublicDocuments, logDocumentAccess } from "@/lib/actions/documents";
import { BookOpen, Download } from "lucide-react";

export default function PublicManualsPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDocs();
    }, []);

    const loadDocs = async () => {
        try {
            const docs = await listPublicDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleDownload = async (doc: any) => {
        // Log access
        await logDocumentAccess(doc.id, "download");
        window.open(doc.fileUrl, "_blank");
    };

    return (
        <main className="min-h-screen pt-32 pb-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                        Help <span className="text-primary">Center</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        General User Manuals and Guides for getting started on Jenga365.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {loading ? (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            Loading manuals...
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-card rounded-2xl border border-border">
                            <h3 className="text-lg font-medium text-foreground">No Manuals Available</h3>
                            <p className="text-muted-foreground mt-2">Check back later for new documentation.</p>
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <div key={doc.id} className="group relative bg-card/60 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-xl rounded-2xl p-8 hover:bg-card/80 transition-all duration-300">
                                <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity">
                                    <BookOpen className="w-24 h-24" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex-1 space-y-4">
                                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                                            v{doc.version}
                                        </div>
                                        <h3 className="text-2xl font-bold text-foreground">{doc.title}</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Last updated: {new Date(doc.publishedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="mt-8 flex items-center justify-between">
                                        <div className="text-sm font-medium text-muted-foreground">
                                            {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                        >
                                            <Download className="w-4 h-4" /> Download PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
