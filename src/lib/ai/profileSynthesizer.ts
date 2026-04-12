import { db } from "@/lib/db";
import { users, userProfileAssets, userChunks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateProfileEmbedding } from "./embeddings";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import * as pdfParseModule from "pdf-parse";

const pdfParse = (pdfParseModule as any).default || pdfParseModule;

export async function synthesizeUserProfile(userId: string) {
    // 1. Fetch User and their assets
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
            // Assuming relations are defined, otherwise fetch manually
        }
    });

    if (!user) throw new Error("User not found");

    // Skip synthesis if a fresh embedding already exists (token efficiency)
    if (user.embedding && !user.embeddingStale) {
        return { success: true, cached: true };
    }

    const assets = await db.select()
        .from(userProfileAssets)
        .where(eq(userProfileAssets.userId, userId));

    const cvAsset = assets.find(a => a.type === "CV");
    const linkedInAsset = assets.find(a => a.type === "LinkedIn");
    const portfolioAsset = assets.find(a => a.type === "Portfolio");

    let cvText = "";
    if (cvAsset?.url) {
        try {
            const resp = await fetch(cvAsset.url);
            const buffer = Buffer.from(await resp.arrayBuffer());
            const pdfData = await pdfParse(buffer);
            cvText = pdfData.text;
        } catch (e) {
            console.error("Failed to parse CV:", e);
        }
    }

    // 2. Prepare context for LLM
    const context = `
      User Name: ${user.name}
      CV Content: ${cvText.substring(0, 5000)}
      LinkedIn: ${linkedInAsset?.url || "Not provided"}
      Portfolio: ${portfolioAsset?.url || "Not provided"}
    `;

    // 3. AI Synthesis
    const { text: synthesis } = await generateText({
        model: google("gemini-1.5-pro"),
        prompt: `
        Analyze the following user profile data and create a structured professional persona.
        Provide a concise summary of their skills, primary industry, years of experience, and a "matching profile" (what kind of mentor or mentee would be ideal for them).
        
        Data:
        ${context}
        
        Output format should be a plain text summary that encapsulates their professional essence.
        `
    });

    // 4. Update Main User Embedding
    const mainEmbedding = await generateProfileEmbedding(synthesis);
    await db.update(users)
        .set({
            embedding: mainEmbedding,
            embeddingStale: false
        })
        .where(eq(users.id, userId));

    // 5. Granular Chunking — delete stale chunks first, then insert fresh ones atomically
    const chunks = splitIntoProfessionalChunks(cvText);
    await db.transaction(async (tx) => {
        // Delete ALL existing chunks for this user before inserting new ones.
        // Without this, every re-synthesis appends 5 more rows (chunk accumulation bug).
        await tx.delete(userChunks).where(eq(userChunks.userId, userId));

        for (const chunk of chunks) {
            const chunkEmbedding = await generateProfileEmbedding(chunk);
            await tx.insert(userChunks).values({
                userId,
                content: chunk,
                embedding: chunkEmbedding,
                chunkType: "experience",
            });
        }
    });

    return { success: true, summary: synthesis };
}

function splitIntoProfessionalChunks(text: string): string[] {
    // Simple logic to split by major sections if possible, otherwise by length
    const cleanText = text.replace(/\s+/g, " ").trim();
    const chunks: string[] = [];
    const size = 1000;

    for (let i = 0; i < cleanText.length; i += size - 200) {
        chunks.push(cleanText.substring(i, i + size));
        if (chunks.length > 5) break; // limit to 5 granular chunks for now
    }

    return chunks;
}
