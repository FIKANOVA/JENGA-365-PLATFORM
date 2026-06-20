import AboutHero from "@/components/marketing/about/AboutHero";
import OurPhilosophy from "@/components/marketing/about/OurPhilosophy";
import StakeholdersDeepDive from "@/components/marketing/about/StakeholdersDeepDive";
import HistoryTimeline from "@/components/marketing/about/HistoryTimeline";
import LeadershipGrid from "@/components/marketing/about/LeadershipGrid";
import WhyJenga from "@/components/marketing/about/WhyJenga";
import Testimonials from "@/components/marketing/about/Testimonials";
import AboutCTAStrip from "@/components/marketing/about/AboutCTAStrip";
import { fetchSiteSettings, fetchTeamOfficials } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";

export async function generateMetadata() {
    const settings = await fetchSiteSettings();
    const ogSource = settings?.aboutOpenGraphImage ?? settings?.openGraphImage ?? null;
    const ogUrl = ogSource?.asset?.url
        ? urlFor(ogSource).width(1200).height(630).fit("crop").url()
        : undefined;

    return {
        title: "About Jenga365 | More Than a Game",
        description:
            "Jenga365 is a dual-engine mentorship and rugby impact platform rooted in Kenyan heritage. Learn about our journey, our team, and the principles behind the Total Athlete model.",
        openGraph: {
            title: "About Jenga365",
            description: "Mentorship. Stewardship. Impact. Building the Total Athlete, 365 days a year.",
            ...(ogUrl ? { images: [{ url: ogUrl }] } : {}),
        },
    };
}

export default async function AboutPage() {
    const [settings, team] = await Promise.all([
        fetchSiteSettings(),
        fetchTeamOfficials(),
    ]);

    return (
        <div className="flex flex-col">
            <AboutHero heroImage={settings?.aboutHeroImage ?? null} />
            <OurPhilosophy />
            <StakeholdersDeepDive />
            <HistoryTimeline nodes={settings?.historyTimeline ?? null} />
            <WhyJenga />
            <LeadershipGrid team={team} />
            <Testimonials testimonials={settings?.impactTestimonials ?? null} />
            <AboutCTAStrip />
        </div>
    );
}
