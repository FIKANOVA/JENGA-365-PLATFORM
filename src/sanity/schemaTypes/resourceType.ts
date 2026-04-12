import { defineField, defineType } from "sanity";

export const resourceType = defineType({
    name: "resource",
    title: "Resource",
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
            name: "resourceType",
            title: "Resource Type",
            type: "string",
            options: {
                list: [
                    { title: "PDF Document", value: "pdf" },
                    { title: "YouTube Video", value: "youtube" },
                    { title: "Spotify Podcast", value: "spotify" },
                    { title: "X (Twitter) Post", value: "x_post" },
                    { title: "LinkedIn Newsletter", value: "linkedin" },
                    { title: "External Article", value: "article" },
                    { title: "Slide Deck", value: "slides" },
                    { title: "Other", value: "other" },
                ],
                layout: "dropdown",
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "category",
            title: "Category",
            type: "string",
            options: {
                list: [
                    { title: "Mentorship", value: "mentorship" },
                    { title: "Rugby & Sport", value: "rugby" },
                    { title: "Career Development", value: "career" },
                    { title: "Environmental / ESG", value: "esg" },
                    { title: "Leadership", value: "leadership" },
                    { title: "Community", value: "community" },
                ],
            },
        }),
        defineField({
            name: "externalUrl",
            title: "External URL",
            type: "url",
            description: "YouTube link, Spotify episode, LinkedIn newsletter, X post, etc.",
            validation: (Rule) =>
                Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
        }),
        defineField({
            name: "file",
            title: "File Upload",
            type: "file",
            description: "Upload a PDF, slide deck, or other document.",
            options: { accept: ".pdf,.pptx,.docx,.xlsx" },
        }),
        defineField({
            name: "thumbnail",
            title: "Thumbnail",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            rows: 3,
        }),
        defineField({
            name: "author",
            title: "Uploaded By",
            type: "reference",
            to: [{ type: "author" }],
        }),
        defineField({
            name: "publishedAt",
            title: "Published At",
            type: "datetime",
        }),
        defineField({
            name: "isFeatured",
            title: "Featured",
            type: "boolean",
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            title: "title",
            type: "resourceType",
            media: "thumbnail",
            featured: "isFeatured",
        },
        prepare(selection) {
            const { title, type, media, featured } = selection;
            const typeLabels: Record<string, string> = {
                pdf: "📄 PDF",
                youtube: "▶️ YouTube",
                spotify: "🎧 Spotify",
                x_post: "𝕏 Post",
                linkedin: "💼 LinkedIn",
                article: "📰 Article",
                slides: "📊 Slides",
                other: "📎 Other",
            };
            return {
                title: `${featured ? "⭐ " : ""}${title}`,
                subtitle: typeLabels[type] ?? type,
                media,
            };
        },
    },
});
