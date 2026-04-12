"use client";

import Image from "next/image";
import Link from "next/link";

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

    return (
        <div
            className="group flex flex-col bg-white border border-[var(--border)] transition-all duration-500 hover:border-black hover:shadow-2xl relative h-full rounded-sm overflow-hidden"
        >
            {/* ── Top Visual Area ── */}
            <div className="relative aspect-[16/10] bg-[var(--off-white)] overflow-hidden">
                {type === "VIDEO" && (
                    <>
                        {thumbnail ? (
                            <Image src={thumbnail} alt={title} fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 opacity-80" />
                        ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                                <span className="material-symbols-outlined text-[64px] text-[var(--primary-green)] opacity-40">play_circle</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="w-16 h-16 bg-[var(--primary-green)] flex items-center justify-center rounded-full scale-110 shadow-2xl">
                                <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                            </div>
                        </div>
                        <div className="absolute bottom-5 right-5 px-3 py-1 bg-black text-white font-mono text-[9px] uppercase tracking-widest rounded-sm">
                            {duration}
                        </div>
                    </>
                )}

                {type === "DOWNLOAD" && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[var(--off-white)] group-hover:bg-white transition-colors duration-500">
                        <span className="material-symbols-outlined text-7xl text-black/10 group-hover:text-[var(--primary-green)]/20 transition-colors duration-500" style={{ fontVariationSettings: "'wght' 200" }}>
                            {format?.toLowerCase() === 'pdf' ? 'picture_as_pdf' : 'description'}
                        </span>
                        <div className="flex flex-col items-center gap-1">
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">
                                {format?.toUpperCase()} FORMAT
                            </span>
                            <span className="font-mono text-[8px] uppercase tracking-widest text-black/30">
                                {size}
                            </span>
                        </div>
                    </div>
                )}

                {type === "ARTICLE" && (
                    <>
                        <div className="w-full h-full flex items-center justify-center bg-[var(--green-tint)]">
                            <div className="absolute inset-0 bg-[var(--green)]/5" />
                            <div className="text-center p-6 z-10">
                                <span className="material-symbols-outlined text-7xl text-[var(--green)] opacity-10">article</span>
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
                        <span className="px-3 py-1 bg-white text-black font-mono text-[9px] uppercase tracking-[0.2em] font-bold shadow-xl rounded-sm border border-[var(--border)]">
                            {category || role}
                        </span>
                    </div>
                )}

                {/* Guest Locked Overlay */}
                {locked && (
                    <div className="absolute inset-0 z-20 bg-black/95 transition-all duration-700 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-10 text-center space-y-6">
                        <div className="size-16 bg-[var(--primary-green)]/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-[var(--primary-green)]">lock</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-white font-serif font-black text-xl italic leading-tight uppercase tracking-tight">Access Locked.</p>
                            <p className="text-[var(--text-muted)] text-[11px] leading-relaxed max-w-[200px] mx-auto">Requires verified Jenga365 account to download strategic assets.</p>
                        </div>
                        <Link href="/register" className="w-full">
                            <button className="w-full bg-[var(--primary-green)] text-white py-4 px-6 font-mono text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-sm shadow-2xl">
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
                            className={`font-mono text-[9px] font-bold uppercase tracking-[0.3em] ${type === "VIDEO" ? "text-blue-700" : type === "DOWNLOAD" ? "text-[var(--primary-green)]" : "text-[var(--green)]"}`}
                        >
                            {type}
                        </span>
                        <span className="w-4 h-px bg-[var(--border)]"></span>
                        <span className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                            {date}
                        </span>
                    </div>

                    <h3
                        className="font-serif font-black text-2xl text-black leading-tight line-clamp-2 min-h-[2.8em] group-hover:text-[var(--primary-green)] transition-colors duration-500 uppercase tracking-tighter"
                    >
                        {title}
                    </h3>
                </div>

                <div className="pt-8 border-t border-[var(--border)]">
                    {author ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-sm bg-[var(--off-white)] border border-[var(--border)] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[16px] text-[var(--text-muted)]">person</span>
                                </div>
                                <p className="font-serif font-bold text-[13px] text-black">
                                    {author}
                                </p>
                            </div>
                            <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                <span className="material-symbols-outlined text-white text-[14px]">arrow_forward</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                             <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black font-bold">
                                {locked ? "RESTRICTED" : (type === "DOWNLOAD" ? "READY FOR DOWNLOAD" : "VIEW RESOURCE")}
                             </span>
                             <div className={`w-8 h-8 flex items-center justify-center rounded-sm transition-all duration-500 ${locked ? 'bg-[var(--border)] text-white' : 'bg-[var(--primary-green)] text-white group-hover:scale-110 shadow-xl'}`}>
                                <span className="material-symbols-outlined text-[18px]">{locked ? 'lock' : (type === 'DOWNLOAD' ? 'download' : 'arrow_forward')}</span>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
