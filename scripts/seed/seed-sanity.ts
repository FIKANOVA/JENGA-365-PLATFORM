/**
 * Seed script for Sanity CMS.
 *
 * Populates or synchronizes all default placeholder documents in Sanity Studio:
 * 1. Site Settings (singleton: hero copy, Luma calendar iframe, timeline, FAQs, public reviews)
 * 2. Events (with Luma embeds)
 * 3. Articles (with categories and excerpts)
 * 4. Team Officials (Leadership & Executives)
 * 5. Voices (Google Reviews, X-Spaces, LinkedIn recommendations)
 * 6. Videos (Featured YouTube / MP4 video)
 * 7. Resources (Playbooks, guides)
 * 8. Partners (Corporate & NGO partners)
 * 9. Legal Pages (Privacy Policy, Terms of Service)
 *
 * Usage:
 * npx dotenv -e .env -- npx tsx scripts/seed/seed-sanity.ts
 */

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || projectId === "dummy") {
    console.error("❌ NEXT_PUBLIC_SANITY_PROJECT_ID is missing or set to dummy.");
    process.exit(1);
}

if (!token) {
    console.error("❌ SANITY_API_TOKEN is missing. Please provide a Sanity token with Write permissions.");
    console.error("👉 Create one at: https://www.sanity.io/manage -> Project -> API -> Tokens -> Add API Token (Editor/Admin)");
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-03-04",
    token,
    useCdn: false,
});

async function main() {
    console.log(`🚀 Starting Sanity seed for project: ${projectId} (dataset: ${dataset})...\n`);

    // 1. Site Settings (Singleton)
    console.log("📝 Seeding Site Settings (singleton)...");
    const siteSettingsDoc = {
        _id: "siteSettings",
        _type: "siteSettings",
        landingHero: {
            eyebrow: "AI-Native Mentorship Platform",
            heading: "Build the Total Athlete.\n365 days a year.",
            description:
                "Jenga365 is Kenya's dual-engine platform connecting human capital with environmental stewardship. AI-matched mentorship pairs athletes and young professionals with seasoned veterans.",
            primaryCtaLabel: "Apply for mentorship",
            primaryCtaHref: "/register/mentorship",
            secondaryCtaLabel: "Corporate ESG partnership",
            secondaryCtaHref: "/impact",
        },
        featuredVideoHeading: "See it in motion",
        lumaCalendarIframe: `<iframe src="https://luma.com/embed/calendar/cal-example" width="100%" height="600" frameborder="0" style="border: 1px solid #bfcbda88; border-radius: 8px;" allow="fullscreen; payment" aria-hidden="false" tabindex="0"></iframe>`,
        impactTestimonials: [
            {
                _key: "t1",
                quote: "Jenga365 transformed my athletic discipline into professional clarity. The 1:2 mentorship helped me transition into software engineering with confidence.",
                name: "Brian Ochieng",
                role: "Athlete & Junior Engineer",
                handle: "@brian_rugby",
                source: "x_twitter",
                rating: 5,
                sourceUrl: "https://x.com",
            },
            {
                _key: "t2",
                quote: "Trees for Tries gave our rugby cohort a higher purpose beyond match days. Planting and tracking tree survival connected us directly with our home county.",
                name: "Faith Mwangi",
                role: "Mentee & Environmental Lead",
                handle: "Google Verified Review",
                source: "google_review",
                rating: 5,
                sourceUrl: "https://google.com/maps",
            },
            {
                _key: "t3",
                quote: "The corporate ESG milestone framework allowed our CSR committee to create measurable, trackable, GPS-audited impact for the first time.",
                name: "James Karanja",
                role: "CSR Director, Enterprise Partner",
                handle: "LinkedIn Recommendation",
                source: "linkedin",
                rating: 5,
                sourceUrl: "https://linkedin.com",
            },
        ],
        environmentalStats: [
            {
                _key: "e1",
                value: "100%",
                label: "Digital-First Operations",
                description: "Zero paper waste through AI-driven digital mentorship matching and reporting.",
            },
            {
                _key: "e2",
                value: "{{treesAlive}}",
                label: "Trees Alive (Latest Audit)",
                description: "GPS-anchored survival audits at 6/12/24-month intervals via KoBoToolbox.",
            },
            {
                _key: "e3",
                value: "{{corporatePartners}}",
                label: "Active ESG Partners",
                description: "Corporate partners with verified milestone-based impact agreements.",
            },
            {
                _key: "e4",
                value: "{{ngoPartners}}",
                label: "Active NGO Partners",
                description: "Non-profit collaborators delivering field programmes alongside the network.",
            },
        ],
        historyTimeline: [
            {
                _key: "h1",
                title: "Platform Conception",
                date: "2024",
                content: "Established as Kenya's premier AI-native athlete mentorship and leadership platform.",
            },
            {
                _key: "h2",
                title: "Trees for Tries Launch",
                date: "2025",
                content: "Integrated climate action and mobile audit verification into quarterly mentee pathways.",
            },
            {
                _key: "h3",
                title: "Dual-Engine Expansion",
                date: "2026",
                content: "Scaled corporate ESG unlocks, university partnerships, and nationwide community clinics.",
            },
        ],
        faqItems: [
            {
                _key: "f1",
                question: "How does AI mentor matching work?",
                answer: "Our pgvector semantic algorithm analyzes career goals, availability, sports discipline, and geographic location to create optimal 1:2 mentor-mentee pairs.",
            },
            {
                _key: "f2",
                question: "What is the Sweat Equity requirement?",
                answer: "Mentorship is earned through service. Mentees complete one verified climate action or community give-back activity each quarter to remain in active standing.",
            },
            {
                _key: "f3",
                question: "How do Corporate Unlocks work?",
                answer: "Corporate sponsors pledge funds tied to ESG milestones. Capital is programmatically unlocked once field surveys verify tree survival rates and volunteer hours.",
            },
        ],
    };

    await client.createOrReplace(siteSettingsDoc);
    console.log("✅ Site Settings seeded successfully.\n");

    // 2. Events
    console.log("📅 Seeding Events...");
    const events = [
        {
            _id: "event-total-athlete-summit-2026",
            _type: "event",
            title: "Total Athlete Summit, Nairobi 2026",
            slug: { _type: "slug", current: "total-athlete-summit-nairobi-2026" },
            eventType: "Conference",
            date: new Date(Date.now() + 14 * 86400000).toISOString(),
            location: "KICC, Nairobi",
            isOnline: false,
            capacity: 250,
            registrationLink: "https://lu.ma",
            lumaEventIframe: `<iframe src="https://luma.com/embed/event/evt-gWucjduFnvtUQxC/simple" width="100%" height="450" frameborder="0" style="border: 1px solid #bfcbda88; border-radius: 8px;" allow="fullscreen; payment" aria-hidden="false" tabindex="0"></iframe>`,
        },
        {
            _id: "event-financial-literacy-workshop",
            _type: "event",
            title: "Financial Literacy Workshop for Athletes",
            slug: { _type: "slug", current: "financial-literacy-workshop-athletes" },
            eventType: "Workshop",
            date: new Date(Date.now() + 21 * 86400000).toISOString(),
            location: "Online (Zoom)",
            isOnline: true,
            capacity: 100,
            registrationLink: "https://lu.ma",
            lumaEventIframe: `<iframe src="https://luma.com/embed/event/evt-mJGYNTh3mcAb1Sr/simple" width="100%" height="450" frameborder="0" style="border: 1px solid #bfcbda88; border-radius: 8px;" allow="fullscreen; payment" aria-hidden="false" tabindex="0"></iframe>`,
        },
        {
            _id: "event-mentor-matching-open-day",
            _type: "event",
            title: "Mentor Matching Open Day",
            slug: { _type: "slug", current: "mentor-matching-open-day" },
            eventType: "mentorship",
            date: new Date(Date.now() + 35 * 86400000).toISOString(),
            location: "Strathmore University, Nairobi",
            isOnline: false,
            capacity: 150,
            registrationLink: "https://lu.ma",
            lumaEventIframe: `<iframe src="https://luma.com/embed/event/evt-rG1pmkgKCFHduI5/simple" width="100%" height="450" frameborder="0" style="border: 1px solid #bfcbda88; border-radius: 8px;" allow="fullscreen; payment" aria-hidden="false" tabindex="0"></iframe>`,
        },
    ];

    for (const ev of events) {
        await client.createOrReplace(ev);
        console.log(`  ✓ Event: ${ev.title}`);
    }
    console.log("✅ Events seeded.\n");

    // 3. Articles
    console.log("📰 Seeding Articles...");
    const articles = [
        {
            _id: "article-future-of-rugby-mentorship",
            _type: "article",
            title: "The Future of Rugby Mentorship in East Africa",
            slug: { _type: "slug", current: "future-of-rugby-mentorship-east-africa" },
            category: "RUGBY",
            status: "published",
            publishedAt: new Date().toISOString(),
            isFeatured: true,
            excerpt: "How structured guidance and dual-engine development are changing the pathway for young athletes across Kenya.",
        },
        {
            _id: "article-scaling-impact-operating-model",
            _type: "article",
            title: "Scaling Impact: The Jenga365 Operating Model",
            slug: { _type: "slug", current: "scaling-impact-jenga365-operating-model" },
            category: "IMPACT",
            status: "published",
            publishedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            isFeatured: false,
            excerpt: "A deep dive into how vector matching and verified sweat equity facilitate human capital development at scale.",
        },
        {
            _id: "article-from-mentee-to-mentor",
            _type: "article",
            title: "From Mentee to Mentor: A Personal Journey",
            slug: { _type: "slug", current: "from-mentee-to-mentor-personal-journey" },
            category: "MENTORSHIP",
            status: "published",
            publishedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
            isFeatured: false,
            excerpt: "Celebrating community-driven growth and sustainable transformation from collegiate athletics to professional leadership.",
        },
    ];

    for (const art of articles) {
        await client.createOrReplace(art);
        console.log(`  ✓ Article: ${art.title}`);
    }
    console.log("✅ Articles seeded.\n");

    // 4. Team Officials
    console.log("👥 Seeding Team Officials...");
    const officials = [
        {
            _id: "official-humphrey-kayange",
            _type: "teamOfficial",
            name: "Humphrey Kayange",
            slug: { _type: "slug", current: "humphrey-kayange" },
            role: "EXECUTIVE DIRECTOR & CO-FOUNDER",
            bio: "Former Kenya 7s Captain, World Rugby Hall of Famer, and IOC Member pioneering holistic athlete mentorship.",
            linkedinUrl: "https://www.linkedin.com/in/humphreykayange",
            order: 1,
        },
    ];

    for (const off of officials) {
        await client.createOrReplace(off);
        console.log(`  ✓ Team Official: ${off.name}`);
    }
    console.log("✅ Team Officials seeded.\n");

    // 5. Voices (Google Reviews, X-Spaces, LinkedIn)
    console.log("🎙️ Seeding Voices & Public Reviews...");
    const voices = [
        {
            _id: "voice-google-review-david",
            _type: "voices",
            title: "Total Athlete Mentee Review",
            type: "GOOGLE_REVIEW",
            description: "Jenga365 gave me a clear roadmap for both rugby and my tech career. The 1:2 mentorship model is top tier.",
            host: "David Omondi",
            authorRole: "Google Verified Reviewer",
            rating: 5,
            url: "https://google.com/maps",
            date: new Date().toISOString(),
        },
        {
            _id: "voice-x-space-total-athlete",
            _type: "voices",
            title: "Building the Total Athlete: A Jenga365 X-Space",
            type: "SPACES",
            description: "Coaches, mentors, and athletes joined live to discuss holistic athlete development and career readiness in East Africa.",
            host: "@jenga365",
            duration: "58 min",
            listeners: "1.2K",
            recorded: true,
            url: "https://x.com/jenga365",
            date: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
            _id: "voice-linkedin-csr-partner",
            _type: "voices",
            title: "Corporate ESG & Athletic Mentorship Unlocks",
            type: "LINKEDIN",
            description: "How milestone-based ESG funding creates accountable, GPS-audited impact across East African communities.",
            host: "James Karanja",
            authorRole: "CSR Director, Enterprise Partner",
            rating: 5,
            url: "https://linkedin.com",
            date: new Date(Date.now() - 12 * 86400000).toISOString(),
        },
    ];

    for (const v of voices) {
        await client.createOrReplace(v);
        console.log(`  ✓ Voice: [${v.type}] ${v.title}`);
    }
    console.log("✅ Voices seeded.\n");

    // 6. Featured Video
    console.log("🎥 Seeding Featured Video...");
    const videoDoc = {
        _id: "video-featured-brand-story",
        _type: "video",
        title: "The Jenga365 Story: Building the Total Athlete",
        description: "An inside look at how AI mentorship, athletic excellence, and environmental stewardship intersect across Kenya.",
        category: "Overview",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "3:45",
        isFeatured: true,
        publishedAt: new Date().toISOString(),
    };
    await client.createOrReplace(videoDoc);

    // Link video into siteSettings
    await client.patch("siteSettings").set({
        featuredVideo: {
            _type: "reference",
            _ref: "video-featured-brand-story",
        },
    }).commit();
    console.log("✅ Featured Video seeded & linked to Site Settings.\n");

    // 7. Resources
    console.log("📚 Seeding Resources...");
    const resourceDoc = {
        _id: "resource-total-athlete-playbook",
        _type: "resource",
        title: "Total Athlete Playbook: Career & Financial Literacy Guide",
        slug: { _type: "slug", current: "total-athlete-playbook" },
        resourceType: "pdf",
        category: "mentorship",
        description: "A comprehensive guide on balancing elite sports training, quarterly sweat equity, and career transitions.",
        externalUrl: "https://fikanova.com/resources/playbook.pdf",
    };
    await client.createOrReplace(resourceDoc);
    console.log("✅ Resources seeded.\n");

    // 8. Legal Pages
    console.log("⚖️ Seeding Legal Pages...");
    const legalPages = [
        {
            _id: "legal-privacy-policy",
            _type: "legalPage",
            title: "Privacy Policy",
            slug: { _type: "slug", current: "privacy" },
            lastUpdated: new Date().toISOString().split("T")[0],
        },
        {
            _id: "legal-terms-of-service",
            _type: "legalPage",
            title: "Terms of Service",
            slug: { _type: "slug", current: "terms" },
            lastUpdated: new Date().toISOString().split("T")[0],
        },
    ];
    for (const lp of legalPages) {
        await client.createOrReplace(lp);
        console.log(`  ✓ Legal Page: ${lp.title}`);
    }
    console.log("✅ Legal pages seeded.\n");

    console.log("🎉 All placeholder content successfully seeded to Sanity CMS!");
    console.log("👉 You can now open Sanity Studio at /dashboard/admin/studio or /studio to edit any section or upload background images and media.");
}

main().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
