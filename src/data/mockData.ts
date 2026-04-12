/**
 * Jenga365 Mock Data
 * Extracted from Stitch Designs (Project 14355863195030415182)
 * Used to decouple design content from component logic.
 */

import { ResourceType } from "@/components/resources/ResourceCard";

export interface Resource {
    id: string;
    type: ResourceType;
    title: string;
    author?: string;
    role?: string;
    category?: string;
    date?: string;
    size?: string;
    format?: string;
    duration?: string;
    thumbnail?: string;
    locked?: boolean;
}

export const NAV_LINKS = [
    { label: "ABOUT", href: "/about" },
    { label: "MENTORS", href: "/mentors" },
    { label: "MENTEES", href: "/mentees" },
    { label: "ARTICLES", href: "/articles" },
    { label: "RESOURCES", href: "/resources" },
    { label: "EVENTS", href: "/events" },
    { label: "IMPACT", href: "/impact" },
    { label: "CONTACT", href: "/contact" },
    { label: "STORE", href: "/shop", isRed: true },
];

export const ARTICLES = [
    {
        id: "1",
        title: "The Future of Rugby Mentorship in East Africa",
        excerpt: "How structured guidance is changing the pathway for young athletes on and off the field.",
        author: "Dr. Amara Okoro",
        role: "MENTOR",
        category: "RUGBY",
        date: "2024-03-01",
        image: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80",
        isFeatured: true,
    },
    {
        id: "2",
        title: "Scaling Impact: The Jenga365 Operating Model",
        excerpt: "A deep dive into how AI Agents are facilitating human growth at scale.",
        author: "Moseti Omari",
        role: "ADMIN",
        category: "LEADERSHIP",
        date: "2024-02-28",
        image: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80",
    },
    {
        id: "3",
        title: "From Mentee to Mentor: A Personal Journey",
        excerpt: "Celebrating 10 years of community-driven growth and sustainable transformation.",
        author: "Sarah Juma",
        role: "MENTOR",
        category: "CAREER",
        date: "2024-02-25",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80",
    },
    // More to be added as we process screens...
];

export const RESOURCES: Resource[] = [
    {
        id: "r1",
        type: "ARTICLE",
        title: "The 2024 Mentorship Playbook",
        author: "Jenga365 Editorial",
        role: "STAFF",
        date: "Mar 2024",
    },
    {
        id: "r2",
        type: "DOWNLOAD",
        title: "Mentor Readiness Checklist (PDF)",
        size: "1.2 MB",
        format: "PDF",
        locked: true,
    },
    {
        id: "r3",
        type: "VIDEO",
        title: "Welcome to Jenga365: Our Mission",
        duration: "12:45",
        thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80",
    },
    {
        id: "r4",
        type: "VOICES",
        title: "X-Space: Building the Total Athlete",
        author: "Jenga365 Team",
        date: "Mar 2026",
        duration: "58:12",
        category: "SPACES",
    },
    {
        id: "r5",
        type: "VOICES",
        title: "X-Thread: AI in East African Mentorship",
        author: "@jenga365",
        date: "Feb 2026",
        category: "THREADS",
    },
];

export const STATS = [
    { value: "482+", label: "ACTIVE MENTORS" },
    { value: "1,200+", label: "YOUTH IMPACTED" },
    { value: "9,840", label: "MENTORSHIP HOURS" },
];

export const NDA_CONTENT = {
    version: "2.1",
    lastUpdated: "2024-02-15",
    text: `This Non-Disclosure Agreement (the "Agreement") is entered into by and between Jenga365...`
};
