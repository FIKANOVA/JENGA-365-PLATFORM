import { defineField, defineType } from "sanity";

export const userManualType = defineType({
    name: "userManual",
    title: "Help · User Manual",
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
            description: "URL slug. Detail page lives at /help/<slug>.",
            validation: (R) => R.required(),
        }),
        defineField({
            name: "description",
            type: "text",
            rows: 3,
            description: "One-paragraph summary shown on the Help Center card.",
            validation: (R) => R.required().max(280),
        }),
        defineField({
            name: "iconName",
            type: "string",
            description:
                'Lucide icon name (e.g. "BookOpen", "Users", "ShieldCheck"). Falls back to BookOpen if unknown.',
            initialValue: "BookOpen",
        }),
        defineField({
            name: "badge",
            type: "object",
            description: "Optional badge label shown on the card (e.g. Restricted, Confidential).",
            fields: [
                defineField({
                    name: "label",
                    type: "string",
                }),
                defineField({
                    name: "tone",
                    type: "string",
                    options: {
                        list: [
                            { title: "Muted (neutral)", value: "muted" },
                            { title: "Brand (green)", value: "brand" },
                        ],
                    },
                    initialValue: "muted",
                }),
            ],
        }),
        defineField({
            name: "body",
            type: "array",
            of: [{ type: "block" }],
            description: "Long-form manual content (rendered on /help/[slug]).",
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
                "Who can read this manual. Gates both the listing card AND the destination URL (server-side check).",
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
        select: { title: "title", roles: "allowedRoles", badge: "badge.label" },
        prepare({ title, roles, badge }: { title?: string; roles?: string[]; badge?: string }) {
            return {
                title: title ?? "Untitled manual",
                subtitle: [badge, roles?.join(", ")].filter(Boolean).join(" · ") || "No audience set",
            };
        },
    },
});
