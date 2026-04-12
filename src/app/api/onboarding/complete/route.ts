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
    const embedding = await generateProfileEmbedding(profileSummary);

    // 2. Update user profile with embedding and metadata
    await db
        .update(users)
        .set({
            ...profileData,
            embedding,
            isApproved: false, // Defaults to false until moderator approval
        })
        .where(eq(users.id, session.user.id));

    // 3. Redirect to NDA (handled by client or return URL)
    return NextResponse.json({ success: true, redirectUrl: "/legal/nda" });
}
