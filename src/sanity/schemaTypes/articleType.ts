import { defineField, defineType } from "sanity";

export const articleType = defineType({
    name: "article",
    title: "Article",
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
            name: "author",
            title: "Author",
            type: "reference",
            to: { type: "author" },
        }),
        defineField({
            name: "coAuthors",
            title: "Co-authors",
            type: "array",
            of: [{ type: "reference", to: [{ type: "author" }] }],
            description: "Additional authors. Synced from Neon articles.coAuthorIds at publish time.",
        }),
        defineField({
            name: "publishedAt",
            title: "Published at",
            type: "datetime",
        }),
        defineField({
            name: "status",
            title: "Status",
            type: "string",
            options: {
                list: [
                    { title: "Draft", value: "draft" },
                    { title: "In Review", value: "review" },
                    { title: "Approved", value: "approved" },
                    { title: "Published", value: "published" },
                ],
                layout: "radio",
            },
            initialValue: "draft",
        }),
        defineField({
            name: "excerpt",
            title: "Excerpt",
            type: "text",
            rows: 3,
            description: "Short summary shown in article cards and previews.",
        }),
        defineField({
            name: "category",
            title: "Category",
            type: "string",
            options: {
                list: [
                    { title: "Rugby", value: "RUGBY" },
                    { title: "Mentorship", value: "MENTORSHIP" },
                    { title: "Education", value: "EDUCATION" },
                    { title: "Business", value: "BUSINESS" },
                    { title: "Impact", value: "IMPACT" },
                    { title: "Community", value: "COMMUNITY" },
                    { title: "Wellness", value: "WELLNESS" },
                    // Legacy values from earlier schema iterations — kept so existing
                    // docs still display a label in Studio.
                    { title: "Leadership (legacy)", value: "LEADERSHIP" },
                    { title: "Career (legacy)", value: "CAREER" },
                    { title: "Finance (legacy)", value: "FINANCE" },
                    { title: "Technology (legacy)", value: "TECHNOLOGY" },
                    { title: "Environment (legacy)", value: "ENVIRONMENT" },
                    { title: "General (legacy)", value: "GENERAL" },
                ],
                layout: "dropdown",
            },
            initialValue: "MENTORSHIP",
        }),
        defineField({
            name: "tags",
            title: "Tags",
            type: "array",
            of: [{ type: "string" }],
            options: { layout: "tags" },
        }),
        defineField({
            name: "isFeatured",
            title: "Featured Article",
            type: "boolean",
            description: "Pin this article as the featured piece on the articles page.",
            initialValue: false,
        }),
        defineField({
            name: "mainImage",
            title: "Main image",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "body",
            title: "Body",
            type: "array",
            of: [{ type: "block" }, { type: "image" }],
        }),
    ],
    preview: {
        select: {
            title: "title",
            author: "author.name",
            media: "mainImage",
            status: "status",
        },
        prepare(selection) {
            const { title, author, media, status } = selection;
            return {
                title,
                subtitle: `${author ? `by ${author}` : "No author"} (${status})`,
                media,
            };
        },
    },
});
