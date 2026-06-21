"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Play, FileText, Lock, User, ArrowRight, Download } from "lucide-react";
import { useSession } from "@/lib/auth/client";

export type ResourceType = "ARTICLE" | "DOWNLOAD" | "VIDEO" | "VOICES";

interface ResourceCardProps {
    readonly id: string;
    readonly type: ResourceType;
    readonly title: string;
    readonly author?: string;
    readonly role?: string;
    readonly date?: string;
    readonly size?: string;
    readonly format?: string;
    readonly duration?: string;
    readonly thumbnail?: string;
    readonly category?: string;
    readonly locked?: boolean;
}

export default function ResourceCard(props: ResourceCardProps) {
    const { type, title, author, role, date, size, format, duration, thumbnail, category, locked } = props;
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const isEffectivelyLocked = locked && !isAuthenticated;

    return (
        <div
            className="group flex flex-col bg-white border border-border transition-all duration-500 hover:border-foreground hover:shadow-2xl relative h-full rounded-md overflow-hidden"
        >
            {/* ── Top Visual Area ── */}
            <div className="relative aspect-[16/10] bg-[var(--surface-1)] overflow-hidden">
                {type === "VIDEO" && (
                    <>
                        {thumbnail ? (
                            <Image src={thumbnail} alt={title} fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 opacity-80" />
                        ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                                <PlayCircle className="h-16 w-16" style={{ color: "var(--brand-green)", opacity: 0.4 }} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full scale-110 shadow-2xl" style={{ background: "var(--brand-green)" }}>
                                <Play className="h-7 w-7 text-white fill-white" />
                            </div>
                        </div>
                        <div className="absolute bottom-5 right-5 px-3 py-1 bg-black text-white text-eyebrow rounded-md">
                            {duration}
                        </div>
                    </>
                )}

                {type === "DOWNLOAD" && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[var(--surface-1)] group-hover:bg-white transition-colors duration-500">
                        <FileText className="h-16 w-16 text-black/10 group-hover:text-[var(--brand-green)]/20 transition-colors duration-500" strokeWidth={1.2} />
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-eyebrow text-[var(--foreground-subtle)] font-bold">
                                {format?.toUpperCase()} FORMAT
                            </span>
                            <span className="text-eyebrow text-black/30">
                                {size}
                            </span>
                        </div>
                    </div>
                )}

                {type === "ARTICLE" && (
                    <>
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--brand-green-soft)" }}>
                            <div className="absolute inset-0 bg-[var(--brand-green)]/5" />
                            <div className="text-center p-6 z-10">
                                <FileText className="h-16 w-16" style={{ color: "var(--brand-green)", opacity: 0.1 }} />
                            </div>
                        </div>
                        {thumbnail && (
                            <Image src={thumbnail} alt={title} fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 opacity-60 mix-blend-multiply" />
                        )}
                    </>
                )}

                {/* Pathway Badge */}
                {(category || role) && (
                    <div className="absolute top-6 left-6 z-10">
                        <span className="px-3 py-1 bg-white text-black text-eyebrow font-bold shadow-xl rounded-md border border-border">
                            {category || role}
                        </span>
                    </div>
                )}

                {/* Guest Locked Overlay */}
                {isEffectivelyLocked && (
                    <div className="absolute inset-0 z-20 bg-black/95 transition-all duration-700 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-10 text-center space-y-6">
                        <div className="size-16 bg-[var(--brand-green)]/10 rounded-full flex items-center justify-center">
                            <Lock className="h-6 w-6" style={{ color: "var(--brand-green)" }} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-white text-display-sm italic leading-tight">Access locked.</p>
                            <p className="text-[var(--foreground-subtle)] text-[11px] leading-relaxed max-w-[200px] mx-auto">Requires verified Jenga365 account to download strategic assets.</p>
                        </div>
                        <Link href="/register/mentorship" className="w-full">
                            <button className="w-full bg-[var(--brand-green)] text-white py-4 px-6 text-eyebrow hover:bg-white hover:text-black transition-all rounded-md shadow-2xl">
                                REGISTER TO UNLOCK
                            </button>
                        </Link>
                    </div>
                )}
            </div>

            {/* ── Content Area ── */}
            <div className="p-10 flex-1 flex flex-col space-y-6 bg-white">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                        <span
                            className={`text-label font-bold ${type === "VIDEO" ? "text-blue-700" : type === "DOWNLOAD" ? "text-[var(--brand-green)]" : "text-[var(--brand-green)]"}`}
                        >
                            {type}
                        </span>
                        <span className="w-4 h-px bg-[var(--border)]"></span>
                        <span className="text-label text-[var(--foreground-subtle)] font-bold">
                            {date}
                        </span>
                    </div>

                    <h3 className="text-display-sm text-foreground leading-tight line-clamp-2 min-h-[2.8em] group-hover:text-[var(--brand-green)] transition-colors duration-500">
                        {title}
                    </h3>
                </div>

                <div className="pt-8 border-t border-border">
                    {author ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md bg-[var(--surface-1)] border border-border flex items-center justify-center">
                                    <User className="h-4 w-4 text-[var(--foreground-subtle)]" />
                                </div>
                                <p className="text-body-sm font-medium text-foreground">
                                    {author}
                                </p>
                            </div>
                            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                <ArrowRight className="h-3.5 w-3.5 text-white" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                             <span className="text-eyebrow text-black font-bold">
                                {isEffectivelyLocked ? "RESTRICTED" : (type === "DOWNLOAD" ? "READY FOR DOWNLOAD" : "VIEW RESOURCE")}
                             </span>
                             <div className={`w-8 h-8 flex items-center justify-center rounded-md transition-all duration-500 ${isEffectivelyLocked ? 'bg-[var(--border)] text-white' : 'bg-[var(--brand-green)] text-white group-hover:scale-110 shadow-xl'}`}>
                                {isEffectivelyLocked ? <Lock className="h-4 w-4" /> : (type === 'DOWNLOAD' ? <Download className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />)}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
