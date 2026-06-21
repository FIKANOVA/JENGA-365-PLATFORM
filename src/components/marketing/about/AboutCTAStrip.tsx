"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/client";
import { ArrowRight, Heart } from "lucide-react";
import DonateButton from "@/components/shared/DonateButton";

/**
 * Final landing CTA strip — re-exported by FinalCTAStrip.tsx.
 * Dual CTAs: Donate (Kenya red) + Join/Dashboard (Kenya green).
 * Dark surface for visual rest after the lighter sections above.
 */
export default function AboutCTAStrip() {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    return (
        <section className="relative overflow-hidden" style={{ background: "var(--brand-black)" }}>
            <div className="absolute inset-0 bg-topo opacity-[0.10] pointer-events-none" aria-hidden />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-12 md:py-24 text-center">
                <div className="mx-auto max-w-3xl">
                    <span className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                        Build with us
                    </span>
                    <h2 className="mt-4 text-display-md md:text-display-lg" style={{ color: "#FFFFFF" }}>
                        Ready to build the future?
                    </h2>
                    <p
                        className="mt-5 text-body-lg max-w-2xl mx-auto"
                        style={{ color: "rgba(255, 255, 255, 0.72)" }}
                    >
                        Join the platform creating verified climate action and world-class
                        mentorship for athletes and the communities they come from.
                    </p>
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                    <DonateButton
                        className="group/btn inline-flex max-w-full items-center justify-between gap-3 h-12 pl-6 pr-1.5 rounded-full text-sm sm:text-base font-medium text-white transition-opacity hover:opacity-90 shadow-lg"
                        style={{ background: "var(--brand-red)" }}
                    >
                        <span className="truncate">{isAuthenticated ? "Donate & Support" : "Donate Now"}</span>
                        <span className="bg-white shrink-0 rounded-full p-2 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover/btn:translate-x-1">
                            <Heart className="h-4 w-4 text-black" aria-hidden />
                        </span>
                    </DonateButton>
                    <Link
                        href={isAuthenticated ? "/dashboard" : "/register"}
                        className="group/btn inline-flex max-w-full items-center justify-between gap-3 h-12 pl-6 pr-1.5 rounded-full text-sm sm:text-base font-medium text-white transition-opacity hover:opacity-90 shadow-lg"
                        style={{ background: "var(--brand-green)" }}
                    >
                        <span className="truncate">{isAuthenticated ? "Go to Dashboard" : "Join Us Today"}</span>
                        <span className="bg-white shrink-0 rounded-full p-2 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover/btn:translate-x-1">
                            <ArrowRight className="h-4 w-4 text-black" />
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
