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

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-12 md:py-24 md:py-32 text-center">
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
                        className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-red)" }}
                    >
                        <Heart className="h-4 w-4" aria-hidden />
                        {isAuthenticated ? "Donate & Support" : "Donate Now"}
                    </DonateButton>
                    <Link
                        href={isAuthenticated ? "/dashboard" : "/register"}
                        className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-green)" }}
                    >
                        {isAuthenticated ? "Go to Dashboard" : "Join Us Today"}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
