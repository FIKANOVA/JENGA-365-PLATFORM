"use client";

import { urlFor } from "@/lib/sanity/client";

interface SanityPartner {
    _id: string;
    name: string;
    website?: string;
    logo?: { asset?: { _id?: string; url?: string } };
    tier?: string;
}

interface PartnerCarouselProps {
    readonly partners?: SanityPartner[];
}

const DEFAULT_PARTNERS: SanityPartner[] = [
    { _id: "p1", name: "ETCO-Kenya", website: "https://www.etco-kenya.org/", logo: { asset: { url: "https://cdn.sanity.io/images/juu4g4fy/production/6e0a7318a2ef9c37aefde0aaca465bec875e742c-500x500.png" } } },
    { _id: "p2", name: "Standard Chartered", website: "https://www.sc.com/ke/", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" } } },
    { _id: "p3", name: "Google Cloud", website: "https://cloud.google.com/", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" } } },
    { _id: "p4", name: "Stripe", website: "https://stripe.com/", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" } } },
    { _id: "p5", name: "Microsoft", website: "https://microsoft.com/", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" } } },
    { _id: "p6", name: "Spotify", website: "https://spotify.com/", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" } } },
];

export default function PartnerCarousel({ partners = [] }: PartnerCarouselProps) {
    const withLogos = partners.filter((p) => p.logo?.asset?.url || p.logo?.asset?._id);

    // Combine Sanity partners with fallback list if Sanity only has 1 or few partners
    const baseList = withLogos.length > 0
        ? (withLogos.length < 4 ? [...withLogos, ...DEFAULT_PARTNERS.filter(d => !withLogos.some(w => w.name === d.name))] : withLogos)
        : DEFAULT_PARTNERS;

    // Multiply to guarantee at least 12 items per track so any widescreen resolution is densely filled
    const repeatFactor = Math.max(2, Math.ceil(12 / baseList.length));
    const trackItems = Array.from({ length: repeatFactor }, () => baseList).flat();

    const renderPartnerLogo = (partner: SanityPartner, key: string) => {
        const isSanityImage = !!partner.logo?.asset?._id;
        const logoUrl = isSanityImage
            ? urlFor(partner.logo).height(160).fit("max").auto("format").url()
            : partner.logo?.asset?.url;

        if (!logoUrl) return null;

        const content = (
            <div className="h-14 sm:h-16 w-36 sm:w-44 flex items-center justify-center px-4 py-2 mx-2.5 sm:mx-3.5 rounded-xl bg-card border border-border/80 shadow-sm transition-all duration-300 hover:border-foreground/30 hover:shadow-md hover:-translate-y-0.5">
                <img
                    src={logoUrl}
                    alt={partner.name}
                    loading="lazy"
                    className="max-h-9 sm:max-h-10 max-w-[120px] sm:max-w-[140px] w-auto h-auto object-contain opacity-85 hover:opacity-100 transition-opacity duration-200"
                />
            </div>
        );

        return partner.website ? (
            <a
                key={key}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                title={partner.name}
                className="inline-flex items-center justify-center shrink-0 focus:outline-none"
            >
                {content}
            </a>
        ) : (
            <div
                key={key}
                title={partner.name}
                className="inline-flex items-center justify-center shrink-0"
            >
                {content}
            </div>
        );
    };

    return (
        <section className="py-8 sm:py-10 bg-surface-1 overflow-hidden border-y border-border/60">
            <div className="mx-auto max-w-7xl px-4 mb-5 sm:mb-6">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-center text-foreground-muted/70">
                    Trusted by forward-thinking partners & organizations
                </p>
            </div>

            <div className="relative group">
                {/* 2-track infinite marquee for seamless 100% coverage */}
                <div className="flex animate-marquee hover:pause whitespace-nowrap">
                    <div className="flex items-center shrink-0">
                        {trackItems.map((partner, i) => renderPartnerLogo(partner, `track1-${partner._id}-${i}`))}
                    </div>
                    <div className="flex items-center shrink-0" aria-hidden="true">
                        {trackItems.map((partner, i) => renderPartnerLogo(partner, `track2-${partner._id}-${i}`))}
                    </div>
                </div>

                {/* Left & Right Subtle Gradient Fade Masks */}
                <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-surface-1 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-surface-1 to-transparent pointer-events-none z-10" />
            </div>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: flex;
                    width: max-content;
                    animation: marquee 32s linear infinite;
                }
                .pause:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
