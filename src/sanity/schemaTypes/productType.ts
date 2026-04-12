import { defineField, defineType } from "sanity";

export const productType = defineType({
    name: "product",
    title: "Store Product",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Product Title",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: "title",
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "category",
            title: "Category",
            type: "string",
            options: {
                list: [
                    { title: "Apparel", value: "apparel" },
                    { title: "Equipment", value: "equipment" },
                    { title: "Accessories", value: "accessories" },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "price",
            title: "Price (KES)",
            type: "number",
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: "discountPrice",
            title: "Discount Price (KES)",
            type: "number",
            description: "Optional. Setting this will show the item on sale.",
        }),
        defineField({
            name: "mainImage",
            title: "Main Image",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "stockStatus",
            title: "Stock Status",
            type: "string",
            options: {
                list: [
                    { title: "In Stock", value: "inStock" },
                    { title: "Low Stock", value: "lowStock" },
                    { title: "Out of Stock", value: "outOfStock" },
                ],
            },
            initialValue: "inStock",
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
        }),
    ],
    preview: {
        select: {
            title: "title",
            subtitle: "category",
            media: "mainImage",
        },
    },
});
