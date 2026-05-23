import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
    name: "siteSettings",
    title: "Site Settings",
    type: "document",
    // Singleton: enforced via `document.actions` + custom structure in sanity.config.ts.
    fields: [
        defineField({
            name: "landingHeroImage",
            title: "Landing Page Hero Image",
            type: "image",
            description:
                "Subtle background image on the landing hero. Leave empty to use the default radial/topo backdrop.",
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
            name: "openGraphImage",
            title: "Default Open Graph Image",
            type: "image",
            description:
                "Used as the social-share fallback when a page doesn't supply its own. 1200x630 recommended.",
            options: { hotspot: true },
        }),
        defineField({
            name: "aboutOpenGraphImage",
            title: "About Page Open Graph Image",
            type: "image",
            description: "Specific OG image for /about (overrides the default).",
            options: { hotspot: true },
        }),
    ],
    preview: {
        prepare: () => ({ title: "Site Settings" }),
    },
});
