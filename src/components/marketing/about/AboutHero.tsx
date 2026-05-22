"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { useSession } from "@/lib/auth/client";
import DonateButton from "@/components/shared/DonateButton";

export default function AboutHero() {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    return (
        <section className="relative overflow-hidden bg-hero-radial bg-topo border-b border-border">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
                <div className="max-w-3xl space-y-8">
                    <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                        Established 2023 · Nairobi, Kenya
                    </p>
                    <h1 className="text-display-xl text-foreground">
                        More than a game.
                    </h1>
                    <p className="text-body-lg text-foreground-muted max-w-2xl">
                        A dual-engine development initiative committed to sustainable
                        community uplift — through elite sports training and integrated
                        socio-economic support systems.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        <DonateButton
                            className="inline-flex h-11 items-center gap-2 rounded-md px-5 text-label font-medium text-white transition-opacity hover:opacity-90"
                            style={{ background: "var(--brand-green)" }}
                        >
                            <Heart className="h-4 w-4" /> Donate
                        </DonateButton>
                        <Link
                            href={isAuthenticated ? "/dashboard" : "/register"}
                            className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-5 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                        >
                            {isAuthenticated ? "Open dashboard" : "Join the movement"}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
