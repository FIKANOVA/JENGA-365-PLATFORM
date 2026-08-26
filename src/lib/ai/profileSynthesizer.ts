import { db } from "@/lib/db";
import { users, userProfileAssets, userChunks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateProfileEmbedding } from "./embeddings";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import * as pdfParseModule from "pdf-parse";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

const pdfParse = (pdfParseModule as any).default || pdfParseModule;

export async function synthesizeUserProfile(userId: string) {
    // 1. Fetch User and their assets
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
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
      Role: ${user.role}
      CV Content: ${cvText.substring(0, 5000)}
      LinkedIn: ${linkedInAsset?.url || "Not provided"}
      Portfolio: ${portfolioAsset?.url || "Not provided"}
    `;

    // 3. AI Synthesis
    let synthesis = "";
    try {
        const { text } = await generateText({
            model: google("gemini-1.5-flash"),
            prompt: `
            Analyze the following user profile data and create a structured professional persona.
            Provide a concise summary of their skills, primary industry, years of experience, and a "matching profile" (what kind of mentor or mentee would be ideal for them).
            
            Data:
            ${context}
            
            Output format should be a plain text summary that encapsulates their professional essence.
            `
        });
        synthesis = text;
    } catch (e) {
        console.warn("[profileSynthesizer] LLM synthesis fallback:", e);
        synthesis = `${user.name || "User"} (${user.role || "Member"}). Industry interests and background matching profile on Jenga365.`;
    }

    // 4. Update Main User Embedding
    try {
        const mainEmbedding = await generateProfileEmbedding(synthesis);
        await db.update(users)
            .set({
                embedding: mainEmbedding,
                embeddingStale: false
            })
            .where(eq(users.id, userId));

        // 5. Granular Chunking — delete stale chunks first, then insert fresh ones atomically
        const chunks = splitIntoProfessionalChunks(cvText);
        if (chunks.length > 0) {
            const chunkEmbeddings = await Promise.all(chunks.map(chunk => generateProfileEmbedding(chunk)));
            await db.transaction(async (tx) => {
                await tx.delete(userChunks).where(eq(userChunks.userId, userId));

                for (let i = 0; i < chunks.length; i++) {
                    await tx.insert(userChunks).values({
                        userId,
                        content: chunks[i],
                        embedding: chunkEmbeddings[i],
                        chunkType: "experience",
                    });
                }
            });
        }
    } catch (e) {
        console.error("[profileSynthesizer] Embedding generation error:", e);
    }

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
