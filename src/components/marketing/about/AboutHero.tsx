"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/client";

export default function AboutHero() {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    return (
        <section className="relative overflow-hidden min-h-[75vh] flex items-end pb-0">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://jenga365.com/wp-content/uploads/2025/07/Fanaka-Studios-SportPesa-Cheza-Dimba-Northrift-66-of-429-scaled.jpg"
                    alt=""
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=1920&auto=format&fit=crop";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90" />
            </div>

            {/* Watermark number */}
            <div className="absolute right-0 bottom-0 font-serif font-black text-[20rem] leading-none text-white/5 select-none pointer-events-none z-10 translate-y-8">
                365
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full py-24 relative z-20">
                <div className="max-w-3xl space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-primary" />
                        <span className="text-primary font-mono font-bold tracking-[0.3em] uppercase text-[10px]">Established 2023</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black font-playfair text-white uppercase tracking-tighter leading-[0.88]">
                        More Than<br />
                        A <span className="italic text-primary">Game.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-xl font-sans font-light leading-relaxed">
                        A dual-engine development initiative committed to creating sustainable community uplift through elite sports training and integrated socio-economic support systems.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <Link
                            href="/donate"
                            className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all shadow-xl"
                        >
                            Donate Now
                        </Link>
                        <Link
                            href={isAuthenticated ? "/dashboard" : "/register"}
                            className="flex items-center gap-2 px-8 py-4 border border-white/30 text-white font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-all"
                        >
                            Join the Movement
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom gradient into next section */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[var(--off-white,#F5F5F0)] to-transparent z-10 pointer-events-none" />
        </section>
    );
}
