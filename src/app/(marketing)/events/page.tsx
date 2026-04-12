import { fetchEvents } from "@/lib/sanity/queries";
import EventsPageClient from "./EventsPageClient";

// Fallback events shown when Sanity returns no data (e.g. CMS not yet populated)
const FALLBACK_EVENTS = [
    {
        _id: "ev-1",
        title: "Mental Resilience Webinar",
        type: "Webinar",
        date: "2026-04-15",
        isOnline: true,
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
        description: "Join our expert panel as they discuss strategies for maintaining peak performance and mental health in high-pressure environments."
    },
    {
        _id: "ev-2",
        title: "Nairobi Rugby Clinic",
        type: "Workshop",
        date: "2026-04-22",
        isOnline: false,
        image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
        description: "Hands-on training session for young athletes focusing on core rugby skills, teamwork, and tactical awareness."
    },
    {
        _id: "ev-3",
        title: "Financial Literacy Summit",
        type: "Conference",
        date: "2026-05-01",
        isOnline: false,
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
        description: "A comprehensive workshop on wealth management, investment basics, and financial planning for professionals."
    },
    {
        _id: "ev-4",
        title: "AI & Social Impact Meetup",
        type: "Meetup",
        date: "2026-05-15",
        isOnline: true,
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
        description: "Exploring how artificial intelligence can be leveraged to solve real-world community challenges in East Africa."
    }
];

export const metadata = {
    title: "Events | Jenga365 — Community Clinics, Summits & Webinars",
    description: "Join Jenga365 workshops, high-performance clinics, and strategic summits designed to foster growth and excellence.",
};

export default async function EventsPage() {
    const sanityEvents = await fetchEvents().catch(() => []);
    const events = sanityEvents.length > 0 ? sanityEvents : FALLBACK_EVENTS;
    return <EventsPageClient initialEvents={events} />;
}
