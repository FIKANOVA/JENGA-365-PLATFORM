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
            name: "description",
            title: "Description",
            type: "text",
        }),
        defineField({
            name: "mainImage",
            title: "Main Image",
            type: "image",
            options: { hotspot: true },
            description: "Primary product image used in card listings.",
        }),
        defineField({
            name: "gallery",
            title: "Image Gallery",
            type: "array",
            description: "Additional product photography. First gallery entry is used after mainImage on detail surfaces.",
            of: [
                {
                    type: "image",
                    options: { hotspot: true },
                    fields: [
                        defineField({
                            name: "alt",
                            title: "Alt text",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        }),
                    ],
                },
            ],
            options: { layout: "grid" },
        }),
        defineField({
            name: "variants",
            title: "Variants",
            type: "array",
            description: "Size, color, or other variant options. Stock per variant lives on the Neon merchandise table.",
            of: [
                {
                    type: "object",
                    name: "variant",
                    fields: [
                        defineField({
                            name: "label",
                            title: "Label",
                            type: "string",
                            description: "Human-facing label shown in the storefront (e.g. \"Medium · Black\").",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "sku",
                            title: "SKU",
                            type: "string",
                            description: "Stable identifier used as the variant key in Neon.",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "size",
                            title: "Size",
                            type: "string",
                            options: {
                                list: [
                                    { title: "Extra Small (XS)", value: "XS" },
                                    { title: "Small (S)", value: "S" },
                                    { title: "Medium (M)", value: "M" },
                                    { title: "Large (L)", value: "L" },
                                    { title: "Extra Large (XL)", value: "XL" },
                                    { title: "Double XL (XXL)", value: "XXL" },
                                    { title: "One Size", value: "ONE" },
                                ],
                            },
                        }),
                        defineField({
                            name: "color",
                            title: "Color",
                            type: "string",
                        }),
                        defineField({
                            name: "priceOverride",
                            title: "Price Override (KES)",
                            type: "number",
                            description: "Optional. Overrides the base price for this variant.",
                        }),
                    ],
                    preview: {
                        select: { title: "label", subtitle: "sku" },
                    },
                },
            ],
            validation: (Rule) =>
                Rule.custom((variants) => {
                    if (!Array.isArray(variants)) return true;
                    const skus = variants
                        .map((v) => (v as { sku?: string })?.sku)
                        .filter((s): s is string => !!s);
                    return skus.length === new Set(skus).size || "Variant SKUs must be unique within a product";
                }),
        }),
        defineField({
            name: "isActive",
            title: "Active",
            type: "boolean",
            description: "Toggle off to hide from the storefront without deleting.",
            initialValue: true,
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
