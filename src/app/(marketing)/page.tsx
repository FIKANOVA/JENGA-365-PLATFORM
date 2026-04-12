import { getGlobalImpactStats } from "@/lib/actions/marketing";
import HeroSection from "@/components/marketing/HeroSection";
import ImpactTicker from "@/components/marketing/ImpactTicker";
import WhatWeDoSection from "@/components/marketing/WhatWeDoSection";
import EventsSection from "@/components/marketing/EventsSection";
import HomeArticlesSection from "@/components/marketing/HomeArticlesSection";
import FinalCTAStrip from "@/components/marketing/FinalCTAStrip";

import { fetchEvents, fetchArticles, fetchImpactStats } from "@/lib/sanity/queries";

export const metadata = {
    title: "Jenga365 — Building Growth. Connecting Futures.",
    description: "Kenya's AI-native rugby and mentorship platform. Join 12,000+ mentors and mentees building the Total Athlete — 365 days a year.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
    const [dbStats, events, articles, sanityStats] = await Promise.all([
        getGlobalImpactStats(),
        fetchEvents(),
        fetchArticles().catch(() => []),
        fetchImpactStats(),
    ]);

    // Prefer Sanity impact stats; fall back to DB stats
    const stats = sanityStats ?? dbStats;

    return (
        <div className="flex flex-col">
            <HeroSection />
            <ImpactTicker stats={stats} />
            <WhatWeDoSection />
            <EventsSection events={events} />
            <HomeArticlesSection articles={articles} />
            <FinalCTAStrip />
        </div>
    );
}
