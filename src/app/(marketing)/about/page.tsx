import AboutHero from "@/components/marketing/about/AboutHero";
import OurPhilosophy from "@/components/marketing/about/OurPhilosophy";
import HistoryTimeline from "@/components/marketing/about/HistoryTimeline";
import LeadershipGrid from "@/components/marketing/about/LeadershipGrid";
import WhyJenga from "@/components/marketing/about/WhyJenga";
import Testimonials from "@/components/marketing/about/Testimonials";
import AboutCTAStrip from "@/components/marketing/about/AboutCTAStrip";
import PartnerCarousel from "@/components/marketing/about/PartnerCarousel";
import { fetchPartners } from "@/lib/sanity/queries";

export const metadata = {
    title: "About Jenga365 | More Than a Game",
    description:
        "Jenga365 is a dual-engine mentorship and rugby impact platform rooted in Kenyan heritage. Learn about our journey, our team, and the principles behind the Total Athlete model.",
    openGraph: {
        title: "About Jenga365",
        description: "Mentorship. Stewardship. Impact. Building the Total Athlete — 365 days a year.",
        images: [
            {
                url: "https://jenga365.com/wp-content/uploads/2025/07/Fanaka-Studios-SportPesa-Cheza-Dimba-Northrift-66-of-429-scaled.jpg",
            },
        ],
    },
};

export default async function AboutPage() {
    const partners = await fetchPartners();

    return (
        <div className="flex flex-col">
            {/* 1. Who we are */}
            <AboutHero />

            {/* 2. Philosophy & Mission */}
            <OurPhilosophy />

            {/* 3. Our story */}
            <HistoryTimeline />

            {/* 4. Why us — accordion */}
            <WhyJenga />

            {/* 5. The people */}
            <LeadershipGrid />

            {/* 6. Social proof */}
            <Testimonials />

            {/* 7. Ecosystem */}
            <PartnerCarousel partners={partners} />

            {/* 8. Convert */}
            <AboutCTAStrip />
        </div>
    );
}
