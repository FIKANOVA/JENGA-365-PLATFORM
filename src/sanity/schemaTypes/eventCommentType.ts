import { defineField, defineType } from "sanity";

/**
 * Event comments — submitted by NGO/Corporate Partners via their Sanity Studio.
 * Displayed on event pages as partner/NGO endorsements or notes.
 */
export const eventCommentType = defineType({
    name: "eventComment",
    title: "Event Comment",
    type: "document",
    fields: [
        defineField({
            name: "event",
            title: "Event",
            type: "reference",
            to: [{ type: "event" }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "authorOrg",
            title: "Organisation Name",
            type: "string",
            description: "Name of the NGO or organisation leaving this comment.",
            validation: (Rule) => Rule.required().max(200),
        }),
        defineField({
            name: "comment",
            title: "Comment",
            type: "text",
            rows: 4,
            validation: (Rule) => Rule.required().max(1000),
        }),
        defineField({
            name: "publishedAt",
            title: "Published At",
            type: "datetime",
            initialValue: () => new Date().toISOString(),
        }),
        defineField({
            name: "approved",
            title: "Approved by Moderator",
            type: "boolean",
            description: "Only approved comments appear on the public event page.",
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            title: "authorOrg",
            subtitle: "comment",
            eventTitle: "event.title",
        },
        prepare({ title, subtitle, eventTitle }) {
            return {
                title: `${title} → ${eventTitle ?? "Event"}`,
                subtitle: subtitle?.substring(0, 80),
            };
        },
    },
    orderings: [
        {
            title: "Newest first",
            name: "publishedAtDesc",
            by: [{ field: "publishedAt", direction: "desc" }],
        },
    ],
});
