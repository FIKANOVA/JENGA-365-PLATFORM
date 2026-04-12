import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    SANITY_API_TOKEN: z.string().min(1),
    SANITY_WEBHOOK_SECRET: z.string().min(1),
    PAYSTACK_SECRET_KEY: z.string().startsWith("sk_"),
    GEMINI_API_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    REVALIDATE_SECRET: z.string().min(16),
    // Vercel / R2
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
}

export const env = parsed.data;
