import { getGlobalImpactStats } from "@/lib/actions/marketing";
import HeroSection from "@/components/marketing/HeroSection";
import FeaturedVideoSection from "@/components/marketing/FeaturedVideoSection";
import ImpactTicker from "@/components/marketing/ImpactTicker";
import SweatEquityBand from "@/components/marketing/SweatEquityBand";
import WhatWeDoSection from "@/components/marketing/WhatWeDoSection";
import ChoosePathSection from "@/components/marketing/ChoosePathSection";
import EventsSection from "@/components/marketing/EventsSection";
import HomeArticlesSection from "@/components/marketing/HomeArticlesSection";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";
import PartnerCarousel from "@/components/marketing/about/PartnerCarousel";

import {
    fetchEvents,
    fetchArticles,
    fetchPartners,
    fetchSiteSettings,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";

export async function generateMetadata() {
    const settings = await fetchSiteSettings();
    const ogUrl = settings?.openGraphImage?.asset?.url
        ? urlFor(settings.openGraphImage).width(1200).height(630).fit("crop").url()
        : undefined;

    return {
        title: "Jenga365 — Building Growth. Connecting Futures.",
        description: "Kenya's AI-native rugby and mentorship platform. Verified impact, 365 days a year.",
        openGraph: {
            title: "Jenga365 — Building Growth. Connecting Futures.",
            description: "Kenya's AI-native rugby and mentorship platform. Verified impact, 365 days a year.",
            ...(ogUrl ? { images: [{ url: ogUrl }] } : {}),
        },
    };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
    const [dbStats, events, articles, partners, settings] = await Promise.all([
        getGlobalImpactStats().catch(() => null),
        fetchEvents().catch(() => []),
        fetchArticles().catch(() => []),
        fetchPartners().catch(() => []),
        fetchSiteSettings().catch(() => null),
    ]);

    const tickerStats = dbStats
        ? {
            activeMentors: dbStats.activeMentors,
            youthImpacted: dbStats.youthEngagedActive,
            mentorshipHours: dbStats.mentorshipHoursTotal,
            treesPlanted: dbStats.treesPlantedTotal,
            activePartnerships: dbStats.activeCorporatePartners,
            activeNgoPartners: dbStats.activeNgoPartners,
        }
        : undefined;

    return (
        <div className="flex flex-col">
            <HeroSection
                heroImage={settings?.landingHeroImage ?? null}
                copy={settings?.landingHero ?? null}
            />
            <FeaturedVideoSection
                video={settings?.featuredVideo ?? null}
                heading={settings?.featuredVideoHeading ?? null}
            />
            <ImpactTicker stats={tickerStats} />
            <WhatWeDoSection copy={settings?.whatWeDo ?? null} />
            <ChoosePathSection copy={settings?.choosePath ?? null} />
            <SweatEquityBand copy={settings?.sweatEquity ?? null} />
            <EventsSection events={events} />
            <PartnerCarousel partners={partners} />
            <HomeArticlesSection articles={articles} />
            <FinalCTAStrip />
        </div>
    );
}
