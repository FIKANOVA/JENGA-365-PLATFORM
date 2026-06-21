import { defineField, defineType } from "sanity";

export const legalPageType = defineType({
    name: "legalPage",
    title: "Legal Page",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: { source: "title", maxLength: 96 },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "lastUpdated",
            title: "Last Updated",
            type: "date",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "body",
            title: "Body",
            type: "array",
            of: [{ type: "block" }],
        }),
    ],
    preview: {
        select: {
            title: "title",
            subtitle: "slug.current",
        },
    },
});
