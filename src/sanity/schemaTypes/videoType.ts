import { defineField, defineType } from "sanity";

export const videoType = defineType({
    name: "video",
    title: "Video",
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
            name: "description",
            title: "Description",
            type: "text",
            rows: 3,
        }),
        defineField({
            name: "category",
            title: "Category",
            type: "string",
            options: {
                list: [
                    { title: "Platform", value: "Platform" },
                    { title: "Technology", value: "Technology" },
                    { title: "Finance", value: "Finance" },
                    { title: "Environment", value: "Environment" },
                    { title: "Corporate", value: "Corporate" },
                    { title: "Mentorship", value: "Mentorship" },
                ],
                layout: "dropdown",
            },
        }),
        defineField({
            name: "videoUrl",
            title: "Video URL",
            type: "url",
            description: "YouTube, Vimeo, or direct video link.",
        }),
        defineField({
            name: "thumbnail",
            title: "Thumbnail",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "duration",
            title: "Duration",
            type: "string",
            description: "E.g., 12:45",
        }),
        defineField({
            name: "isFeatured",
            title: "Featured",
            type: "boolean",
            initialValue: false,
        }),
        defineField({
            name: "publishedAt",
            title: "Published At",
            type: "datetime",
        }),
    ],
    preview: {
        select: {
            title: "title",
            category: "category",
            media: "thumbnail",
        },
        prepare(selection) {
            const { title, category, media } = selection;
            return { title, subtitle: category, media };
        },
    },
});
