import { defineField, defineType } from "sanity";

export const coachType = defineType({
    name: "coach",
    title: "Coach",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Full Name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "specialty",
            title: "Coaching Specialty",
            type: "string",
            options: {
                list: [
                    { title: "Rugby", value: "rugby" },
                    { title: "Career & Life", value: "career_life" },
                    { title: "Fitness & Wellness", value: "fitness" },
                    { title: "Leadership", value: "leadership" },
                    { title: "Environmental", value: "environmental" },
                ],
            },
        }),
        defineField({
            name: "image",
            title: "Photo",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "bio",
            title: "Bio",
            type: "text",
            rows: 4,
        }),
        defineField({
            name: "certifications",
            title: "Certifications",
            type: "array",
            of: [{ type: "string" }],
            description: "e.g. 'World Rugby Level 2', 'ICF ACC'",
        }),
        defineField({
            name: "userId",
            title: "System User ID",
            type: "string",
            description: "The SQL database user ID for this coach",
        }),
    ],
    preview: {
        select: { title: "name", subtitle: "specialty", media: "image" },
    },
});
