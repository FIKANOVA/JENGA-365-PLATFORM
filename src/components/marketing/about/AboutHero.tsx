"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { useSession } from "@/lib/auth/client";
import DonateButton from "@/components/shared/DonateButton";
import { urlFor } from "@/lib/sanity/client";
import { motion, Variants } from "framer-motion";

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
        ? heroImage.asset.url.match(/\.(mp4|webm|mov)(\?.*)?$/i)
            ? heroImage.asset.url // Don't use urlFor on video
            : urlFor(heroImage).width(1920).height(1080).fit("crop").auto("format").url()
        : null;
    const hasImage = !!heroUrl;
    const isVideo = hasImage && !!heroUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i);

    const headingColor = hasImage ? "#ffffff" : "var(--foreground)";
    const mutedColor = hasImage ? "rgba(255,255,255,0.88)" : "var(--foreground-muted)";

    const staggerVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.8,
                ease: "easeOut" as const,
            },
        }),
    };

    return (
        <section className="relative overflow-hidden bg-hero-radial bg-topo border-b border-border">
            {hasImage && (
                <>
                    {isVideo ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                            src={heroUrl!}
                        />
                    ) : (
                        <motion.img
                            initial={{ scale: 1.05 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            src={heroUrl!}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                        />
                    )}
                    <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/40 via-black/20 to-transparent"
                        aria-hidden
                    />
                    <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent"
                        aria-hidden
                    />
                </>
            )}
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-12 md:pt-20 pb-12 md:pb-24 lg:pt-32 lg:pb-32">
                <div className="max-w-3xl space-y-8">
                    <motion.p
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        variants={staggerVariants}
                        className="text-eyebrow"
                        style={{ color: hasImage ? "#7CE2A8" : "var(--brand-green)" }}
                    >
                        Established 2023 · Nairobi, Kenya
                    </motion.p>

                    <motion.h1
                        custom={1}
                        initial="hidden"
                        animate="visible"
                        variants={staggerVariants}
                        className="text-display-xl"
                        style={{ color: headingColor }}
                    >
                        More than a game.
                    </motion.h1>

                    <motion.p
                        custom={2}
                        initial="hidden"
                        animate="visible"
                        variants={staggerVariants}
                        className="text-body-lg max-w-2xl"
                        style={{ color: mutedColor }}
                    >
                        A dual-engine development initiative committed to sustainable
                        community uplift, through elite sports training and integrated
                        socio-economic support systems.
                    </motion.p>

                    <motion.div
                        custom={3}
                        initial="hidden"
                        animate="visible"
                        variants={staggerVariants}
                        className="flex flex-wrap items-center gap-3"
                    >
                        <DonateButton
                            className="inline-flex h-11 items-center gap-2 rounded-md px-5 text-label font-medium text-white transition-transform hover:-translate-y-0.5 shadow-md"
                            style={{ background: "var(--brand-green)" }}
                        >
                            <Heart className="h-4 w-4" /> Donate
                        </DonateButton>
                        <Link
                            href={isAuthenticated ? "/dashboard" : "/register"}
                            className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-5 text-label text-foreground transition-all hover:bg-[color:var(--surface-2)] hover:-translate-y-0.5 shadow-sm"
                        >
                            {isAuthenticated ? "Open dashboard" : "Join the movement"}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}