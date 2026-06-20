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

        // ── Homepage ─────────────────────────────────────────────────────────
        defineField({
            name: "landingHero",
            title: "Landing hero copy",
            type: "object",
            group: "homepage",
            description: "Override the homepage hero text. Leave any field empty to fall back to the in-code default.",
            fields: [
                defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
                defineField({ name: "heading", title: "Heading", type: "string" }),
                defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
                defineField({ name: "primaryCtaLabel", title: "Primary CTA label", type: "string" }),
                defineField({ name: "primaryCtaHref", title: "Primary CTA href", type: "string" }),
                defineField({ name: "secondaryCtaLabel", title: "Secondary CTA label", type: "string" }),
                defineField({ name: "secondaryCtaHref", title: "Secondary CTA href", type: "string" }),
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
        }),

        // ── Impact page ──────────────────────────────────────────────────────
        defineField({
            name: "impactTestimonials",
            title: "Impact page testimonials",
            type: "array",
            group: "impact",
            description: "Quotes shown in the 'Voices of growth' band on /impact.",
            of: [
                {
                    type: "object",
                    name: "testimonial",
                    fields: [
                        defineField({ name: "quote", title: "Quote", type: "text", rows: 4, validation: (R) => R.required() }),
                        defineField({ name: "name", title: "Name", type: "string", validation: (R) => R.required() }),
                        defineField({ name: "role", title: "Role / context", type: "string" }),
                    ],
                    preview: {
                        select: { title: "name", subtitle: "role" },
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
                        }),
                        defineField({ name: "label", title: "Label", type: "string", validation: (R) => R.required() }),
                        defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
                    ],
                    preview: {
                        select: { title: "label", subtitle: "value" },
                    },
                },
            ],
        }),


        // ── What We Do (Dual Engine) ─────────────────────────────────────────
        defineField({
            name: "whatWeDo",
            title: "What We Do (Dual Engine)",
            type: "object",
            group: "homepage",
            description: "Override the What We Do section. Leave empty to use defaults.",
            fields: [
                defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
                defineField({ name: "heading", title: "Heading", type: "string" }),
                defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
                defineField({
                    name: "engineA",
                    title: "Engine A",
                    type: "object",
                    fields: [
                        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
                        defineField({ name: "title", title: "Title", type: "string" }),
                        defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
                        defineField({ name: "bullets", title: "Bullets", type: "array", of: [{ type: "string" }] }),
                        defineField({ name: "ctaLabel", title: "CTA Label", type: "string" }),
                    ]
                }),
                defineField({
                    name: "engineB",
                    title: "Engine B",
                    type: "object",
                    fields: [
                        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
                        defineField({ name: "title", title: "Title", type: "string" }),
                        defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
                        defineField({ name: "bullets", title: "Bullets", type: "array", of: [{ type: "string" }] }),
                        defineField({ name: "ctaLabel", title: "CTA Label", type: "string" }),
                    ]
                })
            ]
        }),

        // ── Choose Path ──────────────────────────────────────────────────────
        defineField({
            name: "choosePath",
            title: "Choose Path",
            type: "object",
            group: "homepage",
            description: "Override the Choose Path section. Leave empty to use defaults.",
            fields: [
                defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
                defineField({ name: "heading", title: "Heading", type: "string" }),
                defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
                defineField({
                    name: "paths",
                    title: "Paths",
                    type: "array",
                    of: [
                        {
                            type: "object",
                            fields: [
                                defineField({ name: "id", title: "ID (mentee, mentor, corporate, ngo)", type: "string" }),
                                defineField({ name: "tag", title: "Tag (e.g. The Army)", type: "string" }),
                                defineField({ name: "name", title: "Name", type: "string" }),
                                defineField({ name: "tagline", title: "Tagline", type: "string" }),
                                defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
                                defineField({ name: "highlights", title: "Highlights", type: "array", of: [{ type: "string" }] }),
                                defineField({ name: "joinCta", title: "Join CTA", type: "string" })
                            ]
                        }
                    ]
                })
            ]
        }),

        // ── Sweat Equity Band ────────────────────────────────────────────────
        defineField({
            name: "sweatEquity",
            title: "Sweat Equity",
            type: "object",
            group: "homepage",
            description: "Override the Sweat Equity section. Leave empty to use defaults.",
            fields: [
                defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
                defineField({ name: "heading", title: "Heading", type: "string" }),
                defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
                defineField({
                    name: "cards",
                    title: "Cards",
                    type: "array",
                    of: [
                        {
                            type: "object",
                            fields: [
                                defineField({ name: "title", title: "Title", type: "string" }),
                                defineField({ name: "body", title: "Body", type: "text", rows: 2 }),
                            ]
                        }
                    ]
                }),
                defineField({ name: "ctaLabel", title: "CTA Label", type: "string" })
            ]
        }),

        // ── About page ───────────────────────────────────────────────────────
        defineField({
            name: "historyTimeline",
            title: "History timeline",
            type: "array",
            group: "about",
            description: "Timeline nodes rendered on /about. Order is preserved.",
            of: [
                {
                    type: "object",
                    name: "timelineNode",
                    fields: [
                        defineField({ name: "title", title: "Title", type: "string", validation: (R) => R.required() }),
                        defineField({ name: "date", title: "Date / era", type: "string" }),
                        defineField({ name: "content", title: "Content", type: "text", rows: 3 }),
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
            of: [
                {
                    type: "object",
                    name: "faqItem",
                    fields: [
                        defineField({ name: "question", title: "Question", type: "string", validation: (R) => R.required() }),
                        defineField({ name: "answer", title: "Answer", type: "text", rows: 3, validation: (R) => R.required() }),
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
