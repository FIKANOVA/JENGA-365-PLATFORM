import { defineField, defineType } from "sanity";

export const voicesType = defineType({
    name: "voices",
    title: "Voices (X-Spaces & X-Threads)",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "type",
            title: "Type",
            type: "string",
            options: {
                list: [
                    { title: "X-Space", value: "SPACES" },
                    { title: "X-Thread", value: "THREADS" },
                ],
                layout: "radio",
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            rows: 3,
        }),
        defineField({
            name: "host",
            title: "Host / Account",
            type: "string",
            description: "E.g., @jenga365",
        }),
        defineField({
            name: "xUrl",
            title: "X (Twitter) URL",
            type: "url",
        }),
        defineField({
            name: "date",
            title: "Date",
            type: "datetime",
        }),
        // X-Space specific
        defineField({
            name: "duration",
            title: "Duration (Spaces only)",
            type: "string",
            description: "E.g., 58 min",
        }),
        defineField({
            name: "listeners",
            title: "Listener Count (Spaces only)",
            type: "string",
            description: "E.g., 1.2K",
        }),
        defineField({
            name: "recorded",
            title: "Recorded (Spaces only)",
            type: "boolean",
            initialValue: false,
        }),
        // X-Thread specific
        defineField({
            name: "posts",
            title: "Post Count (Threads only)",
            type: "number",
        }),
        defineField({
            name: "impressions",
            title: "Impressions (Threads only)",
            type: "string",
            description: "E.g., 48K",
        }),
    ],
    preview: {
        select: {
            title: "title",
            type: "type",
        },
        prepare(selection) {
            const { title, type } = selection;
            return { title, subtitle: type === "SPACES" ? "X-Space" : "X-Thread" };
        },
    },
});
