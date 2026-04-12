"use client";

import Link from "next/link";

export default function ArticleAuthGate() {
    return (
        <div className="bg-black p-10 text-center space-y-8 rounded-sm shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-green)]/10 blur-3xl rounded-full" />
            <div className="relative z-10 space-y-6">
                <span className="material-symbols-outlined text-4xl text-[var(--primary-green)]">lock</span>
                <div className="space-y-2">
                    <h4 className="font-serif font-black text-2xl text-white uppercase italic tracking-tight">Access Locked.</h4>
                    <p className="text-[var(--text-muted)] text-[13px] leading-relaxed max-w-[200px] mx-auto">
                        Join the Jenga365 community to unlock deep-dive insights, mentor connections, and platform tools.
                    </p>
                </div>
                <Link
                    href="/register"
                    className="block w-full bg-[var(--primary-green)] text-white py-5 px-6 font-mono text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-sm shadow-2xl text-center"
                >
                    CREATE FREE ACCOUNT
                </Link>
            </div>
        </div>
    );
}
