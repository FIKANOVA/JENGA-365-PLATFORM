"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/client";

export default function AboutCTAStrip() {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    return (
        <section className="py-32 bg-primary relative overflow-hidden">
            {/* Background Watermark Accent */}
            <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 select-none pointer-events-none z-0">
                <span className="font-serif font-black text-[22rem] text-primary-foreground/5 leading-none tracking-tighter">
                    FUTURE
                </span>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 text-center relative z-10 space-y-12">
                <div className="space-y-6">
                    <h2 className="font-serif font-bold text-5xl md:text-6xl text-primary-foreground uppercase tracking-tighter">
                        Ready to Build <br className="md:hidden" />
                        the Future?
                    </h2>
                    <p className="font-sans font-light text-xl md:text-2xl text-primary-foreground/80 max-w-2xl mx-auto">
                        Join our mission to create a world-class environment for athletes and communities alike.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
                    <Link
                        href="/donate"
                        className="btn-ghost bg-background text-foreground hover:bg-black hover:text-white hover:border-secondary transition-all duration-500 shadow-2xl border-transparent"
                    >
                        {isAuthenticated ? "Donate & Support Us" : "Donate Now"}
                    </Link>
                    <Link
                        href={isAuthenticated ? "/dashboard" : "/register"}
                        className="btn-ghost border-primary-foreground/40 text-primary-foreground hover:bg-background hover:text-foreground hover:border-secondary transition-all duration-500"
                    >
                        {isAuthenticated ? "Go to Dashboard" : "Join Us Today"}
                    </Link>
                </div>
            </div>
        </section>
    );
}
