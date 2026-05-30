"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { useSession } from "@/lib/auth/client";
import DonateButton from "@/components/shared/DonateButton";
import { urlFor } from "@/lib/sanity/client";

interface SanityImage {
    asset?: { _id?: string; url?: string };
    alt?: string;
}

interface AboutHeroProps {
    readonly heroImage?: SanityImage | null;
}

export default function AboutHero({ heroImage }: AboutHeroProps) {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const heroUrl = heroImage?.asset?.url
        ? urlFor(heroImage).width(1920).height(1080).fit("crop").auto("format").url()
        : null;
    const hasImage = !!heroUrl;

    const headingColor = hasImage ? "#ffffff" : "var(--foreground)";
    const mutedColor = hasImage ? "rgba(255,255,255,0.88)" : "var(--foreground-muted)";

    return (
        <section className="relative overflow-hidden bg-hero-radial bg-topo border-b border-border">
            {hasImage && (
                <>
                    <img
                        src={heroUrl!}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                    />
                    <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/80 via-black/60 to-black/35"
                        aria-hidden
                    />
                    <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent"
                        aria-hidden
                    />
                </>
            )}
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
                <div className="max-w-3xl space-y-8">
                    <p className="text-eyebrow" style={{ color: hasImage ? "#7CE2A8" : "var(--brand-green)" }}>
                        Established 2023 · Nairobi, Kenya
                    </p>
                    <h1 className="text-display-xl" style={{ color: headingColor }}>
                        More than a game.
                    </h1>
                    <p className="text-body-lg max-w-2xl" style={{ color: mutedColor }}>
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
