import { defineField, defineType } from "sanity";

export const impactStatsType = defineType({
    name: "impactStats",
    title: "Global Impact Stats",
    type: "document",
    fields: [
        defineField({
            name: "activeMentors",
            title: "Active Mentors",
            type: "string",
            description: "E.g., 482+",
        }),
        defineField({
            name: "youthImpacted",
            title: "Youth Impacted",
            type: "string",
            description: "E.g., 1,200+",
        }),
        defineField({
            name: "mentorshipHours",
            title: "Mentorship Hours",
            type: "string",
            description: "E.g., 9,840",
        }),
        defineField({
            name: "clinicsHeld",
            title: "Clinics Held",
            type: "number",
        }),
        defineField({
            name: "treesPlanted",
            title: "Trees Planted",
            type: "string",
        }),
        defineField({
            name: "activePartnerships",
            title: "Active Partnerships",
            type: "number",
        }),
        defineField({
            name: "countriesReached",
            title: "Countries Reached",
            type: "number",
        }),
    ],
    preview: {
        prepare() {
            return {
                title: "Global Impact Stats",
                subtitle: "Used on the landing page ticker and hero",
            };
        },
    },
});
