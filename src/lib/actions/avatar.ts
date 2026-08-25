"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { writeClient } from "@/lib/sanity/client";

export async function uploadAvatarAction(formData: FormData): Promise<{
    success: boolean;
    imageUrl?: string;
    error?: string;
}> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorised. Please log in." };
        }

        const file = formData.get("avatar") as File | null;
        if (!file || !(file instanceof File)) {
            return { success: false, error: "No image file provided." };
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: "Invalid image format. Please use JPG, PNG, or WebP." };
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return { success: false, error: "Image size exceeds 5MB limit." };
        }

        let imageUrl: string | null = null;

        // Try uploading to Sanity Asset CDN first
        try {
            const hasToken = Boolean(process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN);
            if (hasToken) {
                const asset = await writeClient.assets.upload("image", buffer, {
                    filename: `avatar-${session.user.id}-${Date.now()}.${file.type.split("/")[1] || "jpg"}`,
                    contentType: file.type,
                });
                if (asset?.url) {
                    imageUrl = asset.url;
                }
            }
        } catch (sanityErr) {
            console.warn("[avatar] Sanity upload failed (falling back to direct storage):", sanityErr);
        }

        // Fallback: Store optimized base64 Data URI in DB if Sanity CDN is unauthenticated/restricted
        if (!imageUrl) {
            imageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
        }

        // Save URL / Data URI in users table
        await db
            .update(users)
            .set({
                image: imageUrl,
            })
            .where(eq(users.id, session.user.id));

        return { success: true, imageUrl };
    } catch (err: unknown) {
        console.error("[avatar] Upload failed:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to upload avatar.",
        };
    }
}

export async function removeAvatarAction(): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorised. Please log in." };
        }

        await db
            .update(users)
            .set({
                image: null,
            })
            .where(eq(users.id, session.user.id));

        return { success: true };
    } catch (err: unknown) {
        console.error("[avatar] Remove failed:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to remove avatar.",
        };
    }
}
