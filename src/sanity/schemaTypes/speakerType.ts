import { defineField, defineType } from "sanity";

export const speakerType = defineType({
    name: "speaker",
    title: "Speaker",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Full Name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "title",
            title: "Title / Role",
            type: "string",
            description: "e.g. 'Head Coach, KRU' or 'Keynote Speaker'",
        }),
        defineField({
            name: "organization",
            title: "Organization",
            type: "string",
        }),
        defineField({
            name: "image",
            title: "Photo",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "bio",
            title: "Bio",
            type: "text",
            rows: 4,
        }),
        defineField({
            name: "socialLinks",
            title: "Social Links",
            type: "object",
            fields: [
                defineField({ name: "linkedin", title: "LinkedIn", type: "url" }),
                defineField({ name: "twitter", title: "Twitter / X", type: "url" }),
            ],
        }),
    ],
    preview: {
        select: { title: "name", subtitle: "title", media: "image" },
    },
});
