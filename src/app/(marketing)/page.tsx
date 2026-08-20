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

import {
    fetchEvents,
    fetchArticles,
    fetchSiteSettings,
    fetchPartners,
} from "@/lib/sanity/queries";
import PartnerCarousel from "@/components/marketing/about/PartnerCarousel";
import { urlFor } from "@/lib/sanity/client";

export async function generateMetadata() {
    const settings = await fetchSiteSettings();
    const ogUrl = settings?.openGraphImage?.asset?.url
        ? urlFor(settings.openGraphImage).width(1200).height(630).fit("crop").url()
        : undefined;

    return {
        title: "Jenga365: Building Growth. Connecting Futures.",
        description: "Kenya's AI-native rugby and mentorship platform. Verified impact, 365 days a year.",
        openGraph: {
            title: "Jenga365: Building Growth. Connecting Futures.",
            description: "Kenya's AI-native rugby and mentorship platform. Verified impact, 365 days a year.",
            ...(ogUrl ? { images: [{ url: ogUrl }] } : {}),
        },
    };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
    const [dbStats, events, articles, settings, partners] = await Promise.all([
        getGlobalImpactStats(),
        fetchEvents(),
        fetchArticles().catch(() => []),
        fetchSiteSettings(),
        fetchPartners().catch(() => []),
    ]);

    const cmsStats = settings?.impactStatsOverride;
    const tickerStats = {
        activeMentors: cmsStats?.activeMentors || dbStats?.activeMentors,
        youthImpacted: cmsStats?.youthImpacted || dbStats?.youthEngagedActive,
        mentorshipHours: cmsStats?.mentorshipHours || dbStats?.mentorshipHoursTotal,
        treesPlanted: cmsStats?.treesPlanted || dbStats?.treesPlantedTotal,
        activePartnerships: cmsStats?.activePartnerships || dbStats?.activeCorporatePartners,
        activeNgoPartners: cmsStats?.activeNgoPartners || dbStats?.activeNgoPartners,
    };

    return (
        <div className="flex flex-col">
            <HeroSection
                heroImage={settings?.landingHeroImage ?? null}
                copy={settings?.landingHero ?? null}
            />
            <ImpactTicker stats={tickerStats} />
            <WhatWeDoSection />
            <FeaturedVideoSection
                video={settings?.featuredVideo ?? null}
                heading={settings?.featuredVideoHeading ?? null}
            />
            <ChoosePathSection />
            <SweatEquityBand 
                bgImage={settings?.sweatEquityImage?.asset?.url ? urlFor(settings.sweatEquityImage).url() : null}
            />
            <EventsSection events={events} />
            <HomeArticlesSection articles={articles} />
            <FinalCTAStrip />
        </div>
    );
}
