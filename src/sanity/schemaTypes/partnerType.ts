import { defineField, defineType } from "sanity";

export const partnerType = defineType({
    name: "partner",
    title: "Partner",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Organization Name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: { source: "name", maxLength: 96 },
        }),
        defineField({
            name: "logo",
            title: "Logo",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "tier",
            title: "Partnership Tier",
            type: "string",
            options: {
                list: [
                    { title: "Platinum", value: "platinum" },
                    { title: "Gold", value: "gold" },
                    { title: "Silver", value: "silver" },
                    { title: "Bronze", value: "bronze" },
                    { title: "Community", value: "community" },
                ],
            },
            initialValue: "community",
        }),
        defineField({
            name: "website",
            title: "Website",
            type: "url",
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            rows: 3,
        }),
        defineField({
            name: "contactEmail",
            title: "Contact Email",
            type: "string",
        }),
    ],
    preview: {
        select: { title: "name", subtitle: "tier", media: "logo" },
    },
});
