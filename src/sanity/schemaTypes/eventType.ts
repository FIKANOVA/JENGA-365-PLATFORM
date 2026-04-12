import { defineField, defineType } from "sanity";

export const eventType = defineType({
    name: "event",
    title: "Event",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Event Title",
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
            name: "eventType",
            title: "Event Type",
            type: "string",
            options: {
                list: [
                    { title: "Rugby Clinic", value: "rugby_clinic" },
                    { title: "Mentorship Session", value: "mentorship" },
                    { title: "Tree Planting", value: "tree_planting" },
                    { title: "Fundraiser", value: "fundraiser" },
                    { title: "Other", value: "other" },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "date",
            title: "Date and Time",
            type: "datetime",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "location",
            title: "Location",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "registrationLink",
            title: "Registration Link",
            type: "url",
            description: "External registration URL (e.g. Google Forms, Eventbrite)",
            validation: (Rule) => Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
        }),
        defineField({
            name: "organizer",
            title: "Organizer / Partner",
            type: "reference",
            to: [{ type: "partner" }],
        }),
        defineField({
            name: "speakers",
            title: "Speakers",
            type: "array",
            of: [{ type: "reference", to: [{ type: "speaker" }] }],
        }),
        defineField({
            name: "coaches",
            title: "Coaches",
            type: "array",
            of: [{ type: "reference", to: [{ type: "coach" }] }],
        }),
        defineField({
            name: "sponsors",
            title: "Sponsors / Partners",
            type: "array",
            of: [{ type: "reference", to: [{ type: "partner" }] }],
        }),
        defineField({
            name: "mainImage",
            title: "Event Image",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "array",
            of: [{ type: "block" }],
        }),
    ],
    preview: {
        select: {
            title: "title",
            date: "date",
            media: "mainImage",
            type: "eventType",
        },
        prepare(selection) {
            const { title, date, media, type } = selection;
            return {
                title,
                subtitle: `${type} - ${date ? new Date(date).toLocaleDateString() : "TBD"}`,
                media,
            };
        },
    },
});
