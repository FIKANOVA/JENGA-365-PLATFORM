import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
    name: "siteSettings",
    title: "Site Settings",
    type: "document",
    // Singleton: enforced via `document.actions` + custom structure in sanity.config.ts.
    groups: [
        { name: "media", title: "Media & images", default: true },
        { name: "homepage", title: "Homepage" },
        { name: "impact", title: "Impact page" },
        { name: "about", title: "About page" },
        { name: "faq", title: "FAQ" },
    ],
    fields: [
        // ── Media (existing) ─────────────────────────────────────────────────
        defineField({
            name: "landingHeroImage",
            title: "Landing Page Hero Image",
            type: "image",
            group: "media",
            description: "Subtle background image on the landing hero. Leave empty to use the default radial/topo backdrop.",
            options: { hotspot: true },
            fields: [
                defineField({
                    name: "alt",
                    title: "Alt text",
                    type: "string",
                    validation: (Rule) =>
                        Rule.custom((alt, ctx) => {
                            const parent = ctx.parent as { asset?: unknown } | undefined;
                            if (parent?.asset && !alt) return "Alt text is required when an image is set";
                            return true;
                        }),
                }),
            ],
        }),
        defineField({
            name: "aboutHeroImage",
            title: "About Page Hero Image",
            type: "image",
            group: "media",
            description: "Optional hero image for /about. Leave empty to use the default backdrop.",
            options: { hotspot: true },
            fields: [
                defineField({
                    name: "alt",
                    title: "Alt text",
                    type: "string",
                    validation: (Rule) =>
                        Rule.custom((alt, ctx) => {
                            const parent = ctx.parent as { asset?: unknown } | undefined;
                            if (parent?.asset && !alt) return "Alt text is required when an image is set";
                            return true;
                        }),
                }),
            ],
        }),
        defineField({
            name: "authImage",
            title: "Sign-in / Auth Image",
            type: "image",
            group: "media",
            description: "Image shown on the side panel of the sign-in (and auth) pages. Leave empty to use the default brand surface.",
            options: { hotspot: true },
            fields: [
                defineField({
                    name: "alt",
                    title: "Alt text",
                    type: "string",
                    validation: (Rule) =>
                        Rule.custom((alt, ctx) => {
                            const parent = ctx.parent as { asset?: unknown } | undefined;
                            if (parent?.asset && !alt) return "Alt text is required when an image is set";
                            return true;
                        }),
                }),
            ],
        }),
        defineField({
            name: "openGraphImage",
            title: "Default Open Graph Image",
            type: "image",
            group: "media",
            description: "Used as the social-share fallback when a page doesn't supply its own. 1200x630 recommended.",
            options: { hotspot: true },
        }),
        defineField({
            name: "aboutOpenGraphImage",
            title: "About Page Open Graph Image",
            type: "image",
            group: "media",
            description: "Specific OG image for /about (overrides the default).",
            options: { hotspot: true },
        }),
        defineField({
            name: "sweatEquityImage",
            title: "Sweat Equity Background Image",
            type: "image",
            group: "media",
            description: "Background image for the Sweat Equity section on the homepage.",
            options: { hotspot: true },
            fields: [
                defineField({
                    name: "alt",
                    title: "Alt text",
                    type: "string",
                    validation: (Rule) =>
                        Rule.custom((alt, ctx) => {
                            const parent = ctx.parent as { asset?: unknown } | undefined;
                            if (parent?.asset && !alt) return "Alt text is required when an image is set";
                            return true;
                        }),
                }),
            ],
        }),

        // ── Homepage ─────────────────────────────────────────────────────────
        defineField({
            name: "landingHero",
            title: "Landing hero copy",
            type: "object",
            group: "homepage",
            description: "Override the homepage hero text. Leave any field empty to fall back to the in-code default.",
            initialValue: {
                eyebrow: "AI-Native Mentorship Platform",
                heading: "Build the Total Athlete.\n365 days a year.",
                description: "Jenga365 is Kenya's dual-engine platform connecting human capital with environmental stewardship. AI-matched mentorship pairs athletes and young professionals with seasoned veterans.",
                primaryCtaLabel: "Apply for mentorship",
                primaryCtaHref: "/register/mentorship",
                secondaryCtaLabel: "Corporate ESG partnership",
                secondaryCtaHref: "/impact",
            },
            fields: [
                defineField({ name: "eyebrow", title: "Eyebrow", type: "string", placeholder: "e.g. AI-Native Mentorship Platform" }),
                defineField({ name: "heading", title: "Heading", type: "string", placeholder: "e.g. Build the Total Athlete.\n365 days a year." }),
                defineField({ name: "description", title: "Description", type: "text", rows: 3, placeholder: "e.g. Jenga365 is Kenya's dual-engine platform..." }),
                defineField({ name: "primaryCtaLabel", title: "Primary CTA label", type: "string", placeholder: "e.g. Apply for mentorship" }),
                defineField({ name: "primaryCtaHref", title: "Primary CTA href", type: "string", placeholder: "e.g. /register/mentorship" }),
                defineField({ name: "secondaryCtaLabel", title: "Secondary CTA label", type: "string", placeholder: "e.g. Corporate ESG partnership" }),
                defineField({ name: "secondaryCtaHref", title: "Secondary CTA href", type: "string", placeholder: "e.g. /impact" }),
            ],
            options: { collapsible: true, collapsed: false },
        }),
        defineField({
            name: "featuredVideo",
            title: "Featured video",
            type: "reference",
            group: "homepage",
            to: [{ type: "video" }],
            description: "Optional. Renders a featured video section on the homepage when set.",
        }),
        defineField({
            name: "featuredVideoHeading",
            title: "Featured video — section heading",
            type: "string",
            group: "homepage",
            description: "Shown above the featured video. Defaults to 'See it in motion'.",
            placeholder: "e.g. See it in motion",
            initialValue: "See it in motion",
        }),
        defineField({
            name: "lumaCalendarIframe",
            title: "Luma Calendar Iframe (Events Page)",
            type: "text",
            group: "homepage",
            description: "The complete iframe code provided by Luma for the events calendar. E.g. <iframe src='...'></iframe>",
            placeholder: "<iframe src='https://luma.com/embed/calendar/cal-...' width='100%' height='600' frameborder='0'></iframe>",
            rows: 4,
        }),

        // ── Impact page ──────────────────────────────────────────────────────
        defineField({
            name: "impactTestimonials",
            title: "Public Mentions, Social Quotes & Google Reviews",
            type: "array",
            group: "impact",
            description: "Verified public testimonials, Google reviews, athlete quotes, and social media mentions across X, LinkedIn, and Instagram.",
            initialValue: [
                {
                    quote: "Jenga365 transformed my athletic discipline into professional clarity. The 1:2 mentorship helped me transition into software engineering with confidence.",
                    name: "Brian Ochieng",
                    role: "Athlete & Junior Engineer",
                    handle: "@brian_rugby",
                    source: "x_twitter",
                    rating: 5,
                    sourceUrl: "https://x.com",
                },
                {
                    quote: "Trees for Tries gave our team a higher purpose beyond match days. Planting and tracking tree survival connected us directly with community forestry.",
                    name: "Faith Mwangi",
                    role: "Mentee & Environmental Lead",
                    handle: "Google Verified Review",
                    source: "google_review",
                    rating: 5,
                    sourceUrl: "https://google.com/maps",
                },
            ],
            of: [
                {
                    type: "object",
                    name: "testimonial",
                    fields: [
                        defineField({
                            name: "source",
                            title: "Platform / Source",
                            type: "string",
                            options: {
                                list: [
                                    { title: "Google Review", value: "google_review" },
                                    { title: "X (Twitter)", value: "x_twitter" },
                                    { title: "LinkedIn", value: "linkedin" },
                                    { title: "Instagram", value: "instagram" },
                                    { title: "Public Media / Press", value: "public_mention" },
                                    { title: "Athlete Field Testimony", value: "athlete_quote" },
                                ],
                                layout: "dropdown",
                            },
                            initialValue: "google_review",
                            validation: (R) => R.required(),
                        }),
                        defineField({ name: "quote", title: "Quote / Review Text", type: "text", rows: 4, validation: (R) => R.required() }),
                        defineField({ name: "name", title: "Author / Reviewer Name", type: "string", validation: (R) => R.required(), placeholder: "e.g. Brian Ochieng" }),
                        defineField({ name: "role", title: "Role / Context", type: "string", placeholder: "e.g. Mentee & Athlete" }),
                        defineField({ name: "handle", title: "Handle / Tag", type: "string", placeholder: "e.g. @brian_rugby or Google Verified Review" }),
                        defineField({ name: "rating", title: "Star Rating (1 - 5)", type: "number", initialValue: 5, validation: (R) => R.min(1).max(5) }),
                        defineField({ name: "sourceUrl", title: "Link to Original Post / Review", type: "url", placeholder: "https://..." }),
                        defineField({ name: "avatar", title: "Author Avatar / Profile Image", type: "image", options: { hotspot: true } }),
                    ],
                    preview: {
                        select: { title: "name", subtitle: "role", media: "avatar" },
                    },
                },
            ],
        }),
        defineField({
            name: "environmentalStats",
            title: "Environmental stewardship stats",
            type: "array",
            group: "impact",
            description: "Cards rendered in the 'Environmental stewardship' section on /impact.",
            initialValue: [
                { value: "100%", label: "GPS Verified", description: "Independent monitoring and evaluation on all tree survival sites." },
                { value: "12,000+", label: "Trees Tracked", description: "Surviving indigenous trees across 6 target counties in Kenya." },
                { value: "3,500+", label: "Give-Back Hours", description: "Direct community service completed by athlete cohorts." },
            ],
            of: [
                {
                    type: "object",
                    name: "envStat",
                    fields: [
                        defineField({
                            name: "value",
                            title: "Value",
                            type: "string",
                            description: "Static text like '100%' or one of the bound metrics: {{treesAlive}}, {{corporatePartners}}, {{ngoPartners}}",
                            validation: (R) => R.required(),
                            placeholder: "e.g. 100% or 12,000+",
                        }),
                        defineField({ name: "label", title: "Label", type: "string", validation: (R) => R.required(), placeholder: "e.g. Trees Monitored" }),
                        defineField({ name: "description", title: "Description", type: "text", rows: 2, placeholder: "e.g. GPS-anchored survival monitoring..." }),
                    ],
                    preview: {
                        select: { title: "label", subtitle: "value" },
                    },
                },
            ],
        }),

        // ── About page ───────────────────────────────────────────────────────
        defineField({
            name: "historyTimeline",
            title: "History timeline",
            type: "array",
            group: "about",
            description: "Timeline nodes rendered on /about. Order is preserved.",
            initialValue: [
                { title: "Platform Conception", date: "2024", content: "Established as Kenya's first AI-native athlete mentorship and leadership platform." },
                { title: "Trees for Tries Launch", date: "2025", content: "Integrated climate action and mobile audit verification into quarterly mentee pathways." },
                { title: "Dual-Engine Expansion", date: "2026", content: "Scaled corporate ESG unlocks, university partnerships, and nationwide community clinics." },
            ],
            of: [
                {
                    type: "object",
                    name: "timelineNode",
                    fields: [
                        defineField({ name: "title", title: "Title", type: "string", validation: (R) => R.required(), placeholder: "e.g. Platform Conception" }),
                        defineField({ name: "date", title: "Date / era", type: "string", placeholder: "e.g. 2024" }),
                        defineField({ name: "content", title: "Content", type: "text", rows: 3, placeholder: "e.g. Established as Kenya's premier..." }),
                    ],
                    preview: {
                        select: { title: "title", subtitle: "date" },
                    },
                },
            ],
        }),

        // ── FAQ ──────────────────────────────────────────────────────────────
        defineField({
            name: "faqItems",
            title: "FAQ entries",
            type: "array",
            group: "faq",
            description: "Q&A pairs shown in the FAQ section on the homepage / contact page.",
            initialValue: [
                {
                    question: "How does AI mentor matching work?",
                    answer: "Our pgvector semantic algorithm analyzes career goals, availability, sports discipline, and geographic location to create optimal 1:2 mentor-mentee pairs.",
                },
                {
                    question: "What is the Sweat Equity requirement?",
                    answer: "Mentorship is earned through service. Mentees complete one verified climate action or community give-back activity each quarter to remain in active standing.",
                },
                {
                    question: "How do Corporate Unlocks work?",
                    answer: "Corporate sponsors pledge funds tied to ESG milestones. Capital is programmatically unlocked once field surveys verify tree survival rates and volunteer hours.",
                },
            ],
            of: [
                {
                    type: "object",
                    name: "faqItem",
                    fields: [
                        defineField({ name: "question", title: "Question", type: "string", validation: (R) => R.required(), placeholder: "e.g. How does AI mentor matching work?" }),
                        defineField({ name: "answer", title: "Answer", type: "text", rows: 3, validation: (R) => R.required(), placeholder: "e.g. Our algorithm pairs mentees..." }),
                    ],
                    preview: {
                        select: { title: "question" },
                    },
                },
            ],
        }),
    ],
    preview: {
        prepare: () => ({ title: "Site Settings" }),
    },
});
