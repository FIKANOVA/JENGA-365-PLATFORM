import { fetchEvents, fetchSiteSettings } from "@/lib/sanity/queries";
import EventsPageClient from "./EventsPageClient";

export const metadata = {
    title: "Events | Jenga365: Community Clinics, Summits & Webinars",
    description:
        "Join Jenga365 workshops, high-performance clinics, and strategic summits designed to foster growth and excellence.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventsPage() {
    const [events, settings] = await Promise.all([
        fetchEvents().catch(() => []),
        fetchSiteSettings()
    ]);
    return <EventsPageClient initialEvents={events} lumaCalendarIframe={settings?.lumaCalendarIframe} />;
}
