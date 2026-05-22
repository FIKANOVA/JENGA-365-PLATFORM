import { getGlobalImpactStats } from "@/lib/actions/marketing";
import HeroSection from "@/components/marketing/HeroSection";
import ImpactTicker from "@/components/marketing/ImpactTicker";
import SweatEquityBand from "@/components/marketing/SweatEquityBand";
import WhatWeDoSection from "@/components/marketing/WhatWeDoSection";
import ChoosePathSection from "@/components/marketing/ChoosePathSection";
import EventsSection from "@/components/marketing/EventsSection";
import HomeArticlesSection from "@/components/marketing/HomeArticlesSection";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";

import { fetchEvents, fetchArticles } from "@/lib/sanity/queries";

export const metadata = {
    title: "Jenga365 — Building Growth. Connecting Futures.",
    description: "Kenya's AI-native rugby and mentorship platform. Verified impact, 365 days a year.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
    const [dbStats, events, articles] = await Promise.all([
        getGlobalImpactStats(),
        fetchEvents(),
        fetchArticles().catch(() => []),
    ]);

    const tickerStats = dbStats
        ? {
            activeMentors: dbStats.activeMentors,
            youthImpacted: dbStats.youthEngagedActive,
            mentorshipHours: dbStats.mentorshipHoursTotal,
            treesPlanted: dbStats.treesPlantedTotal,
            activePartnerships: dbStats.activeCorporatePartners,
        }
        : undefined;

    return (
        <div className="flex flex-col">
            <HeroSection />
            <ImpactTicker stats={tickerStats} />
            <WhatWeDoSection />
            <ChoosePathSection />
            <SweatEquityBand />
            <EventsSection events={events} />
            <HomeArticlesSection articles={articles} />
            <FinalCTAStrip />
        </div>
    );
}
