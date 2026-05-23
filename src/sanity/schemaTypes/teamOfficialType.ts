import { defineField, defineType } from "sanity";

export const teamOfficialType = defineType({
    name: "teamOfficial",
    title: "Team Official",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: { source: "name", maxLength: 96 },
        }),
        defineField({
            name: "role",
            title: "Role / Title",
            type: "string",
            description: "Displayed as the mono-cap subtitle (e.g. EXECUTIVE DIRECTOR).",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "headshot",
            title: "Headshot",
            type: "image",
            options: { hotspot: true },
            fields: [
                defineField({
                    name: "alt",
                    title: "Alt text",
                    type: "string",
                }),
            ],
        }),
        defineField({
            name: "bio",
            title: "Short Bio",
            type: "text",
            rows: 4,
        }),
        defineField({
            name: "linkedinUrl",
            title: "LinkedIn URL",
            type: "url",
            validation: (Rule) =>
                Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
        }),
        defineField({
            name: "order",
            title: "Display Order",
            type: "number",
            description: "Lower numbers appear first in the leadership grid.",
            initialValue: 100,
            validation: (Rule) => Rule.integer().min(0),
        }),
        defineField({
            name: "isPublished",
            title: "Published",
            type: "boolean",
            description: "Toggle off to hide from the About page without deleting.",
            initialValue: true,
        }),
    ],
    orderings: [
        {
            title: "Display Order",
            name: "orderAsc",
            by: [{ field: "order", direction: "asc" }],
        },
    ],
    preview: {
        select: { title: "name", subtitle: "role", media: "headshot" },
    },
});
