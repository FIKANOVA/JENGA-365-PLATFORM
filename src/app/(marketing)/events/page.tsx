import { fetchEvents } from "@/lib/sanity/queries";
import EventsPageClient from "./EventsPageClient";

export const metadata = {
    title: "Events | Jenga365 — Community Clinics, Summits & Webinars",
    description:
        "Join Jenga365 workshops, high-performance clinics, and strategic summits designed to foster growth and excellence.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventsPage() {
    const events = await fetchEvents().catch(() => []);
    return <EventsPageClient initialEvents={events} />;
}
