import { defineField, defineType } from "sanity";

export const helpTopicType = defineType({
    name: "helpTopic",
    title: "Help · Topic",
    type: "document",
    fields: [
        defineField({
            name: "title",
            type: "string",
            validation: (R) => R.required(),
        }),
        defineField({
            name: "slug",
            type: "slug",
            options: { source: "title", maxLength: 96 },
            validation: (R) => R.required(),
        }),
        defineField({
            name: "description",
            type: "text",
            rows: 3,
            description: "One-paragraph summary shown on the Help Center listing.",
            validation: (R) => R.required().max(280),
        }),
        defineField({
            name: "body",
            type: "array",
            of: [{ type: "block" }],
            description: "Long-form topic content (rendered on /help/[slug]).",
        }),
        defineField({
            name: "allowedRoles",
            type: "array",
            of: [{ type: "string" }],
            options: {
                list: [
                    { title: "Guest (unauthenticated)", value: "guest" },
                    { title: "Mentee", value: "mentee" },
                    { title: "Mentor", value: "mentor" },
                    { title: "Corporate partner", value: "corporate" },
                    { title: "NGO partner", value: "ngo" },
                    { title: "Moderator (content scope)", value: "content" },
                    { title: "SuperAdmin / all", value: "all" },
                ],
            },
            description:
                "Who can see this topic. Pick all roles that should have access. Leave empty to keep it draft-only (hidden from the site).",
            validation: (R) => R.required().min(1),
        }),
        defineField({
            name: "order",
            type: "number",
            description: "Sort order on the listing (ascending). Lower numbers appear first.",
            initialValue: 100,
        }),
    ],
    preview: {
        select: { title: "title", roles: "allowedRoles" },
        prepare({ title, roles }: { title?: string; roles?: string[] }) {
            return {
                title: title ?? "Untitled topic",
                subtitle: roles?.length ? roles.join(", ") : "No audience set",
            };
        },
    },
});
