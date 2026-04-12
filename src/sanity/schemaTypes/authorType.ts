import { defineField, defineType } from "sanity";

export const authorType = defineType({
    name: "author",
    title: "Author",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "role",
            title: "Role / Title",
            type: "string",
        }),
        defineField({
            name: "image",
            title: "Image",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "bio",
            title: "Bio",
            type: "text",
        }),
        // Map back to our SQL User ID if needed
        defineField({
            name: "userId",
            title: "System User ID",
            type: "string",
            description: "The SQL database user ID for this author",
        }),
    ],
    preview: {
        select: {
            title: "name",
            media: "image",
            subtitle: "role",
        },
    },
});
