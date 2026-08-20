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
            placeholder: "e.g. Total Athlete: Balancing High-Performance Sport with Career Readiness",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "type",
            title: "Source Type",
            type: "string",
            options: {
                list: [
                    { title: "Google Review", value: "GOOGLE_REVIEW" },
                    { title: "X (Twitter) Post / Mention", value: "X_POST" },
                    { title: "X (Twitter) Space", value: "SPACES" },
                    { title: "X (Twitter) Thread", value: "THREADS" },
                    { title: "LinkedIn Recommendation / Post", value: "LINKEDIN" },
                    { title: "Instagram Post / Story", value: "INSTAGRAM" },
                    { title: "Athlete / Mentee Quote", value: "ATHLETE_QUOTE" },
                    { title: "Public / Media Mention", value: "PUBLIC_MENTION" },
                    { title: "Social", value: "SOCIALS" },
                    { title: "Article Comment", value: "ARTICLE_COMMENTS" },
                ],
                layout: "dropdown",
            },
            initialValue: "GOOGLE_REVIEW",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "description",
            title: "Quote / Review Content",
            type: "text",
            rows: 3,
            placeholder: "e.g. 'Jenga365 gave me structured mentorship that helped me balance competitive rugby with my degree.'",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "host",
            title: "Author / Reviewer Name",
            type: "string",
            description: "E.g. David Omondi or @jenga365",
            placeholder: "e.g. David Omondi",
            initialValue: "David Omondi",
        }),
        defineField({
            name: "authorRole",
            title: "Author Role / Context",
            type: "string",
            description: "E.g. Google Verified Reviewer, Mentee (Kenya U20), Corporate Partner",
            placeholder: "e.g. Mentee & Junior Developer",
        }),
        defineField({
            name: "authorAvatar",
            title: "Author Profile Picture / Avatar",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "rating",
            title: "Star Rating (1 - 5)",
            type: "number",
            description: "Used for Google reviews or ratings (1 to 5 stars).",
            placeholder: "5",
            initialValue: 5,
            validation: (Rule) => Rule.min(1).max(5),
        }),
        defineField({
            name: "url",
            title: "Public Source URL (Google Review, X post, LinkedIn, etc.)",
            type: "url",
            placeholder: "https://...",
        }),
        defineField({
            name: "date",
            title: "Review / Post Date",
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
            subtitle: "host",
            type: "type",
            media: "authorAvatar",
        },
        prepare(selection) {
            const { title, subtitle, type, media } = selection;
            return {
                title: title || "Review / Public Mention",
                subtitle: `${subtitle ?? "Anonymous"} • ${type ?? "Social"}`,
                media,
            };
        },
    },
});
