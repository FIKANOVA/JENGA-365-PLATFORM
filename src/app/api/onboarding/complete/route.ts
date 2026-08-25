import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { generateProfileEmbedding } from "@/lib/ai/embeddings";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileSummary, ...profileData } = await req.json();

    // 1. Generate text embedding from profile summary
    let embedding: number[] | null = null;
    try {
        if (profileSummary) {
            embedding = await generateProfileEmbedding(profileSummary);
        }
    } catch (err) {
        console.error("[onboarding/complete] Embedding generation failed:", err);
    }

    // 2. Update user profile with embedding and metadata
    const sessionUser = session.user as { role?: string; isApproved?: boolean };
    const isMentee = sessionUser.role === "Mentee";

    await db
        .update(users)
        .set({
            ...profileData,
            onboarded: true,
            ...(embedding ? { embedding, embeddingStale: false } : {}),
            isApproved: isMentee ? true : (sessionUser.isApproved ?? false),
        })
        .where(eq(users.id, session.user.id));

    // 3. Redirect URL
    const redirectUrl = isMentee ? "/dashboard/mentee" : "/pending-approval";
    return NextResponse.json({ success: true, redirectUrl });
}
