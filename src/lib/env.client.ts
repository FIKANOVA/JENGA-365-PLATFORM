import { z } from "zod";

const clientEnvSchema = z.object({
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().startsWith("pk_"),
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1).optional(),
    NEXT_PUBLIC_CDN_URL: z.string().url().optional(),
});

const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
});

if (!parsed.success) {
    console.error("❌ Invalid client environment variables:", parsed.error.flatten().fieldErrors);
    // In client, we might not want to throw and crash the whole app if one optional var is missing,
    // but for a strict prototype, let's keep it visible.
}

export const clientEnv = parsed.data;
