import { db } from "@/lib/db";
import { platformDocuments, documentChunks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateProfileEmbedding } from "./embeddings"; // Assuming this is generic text-embedding-004
import * as pdfParseModule from "pdf-parse";
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

/**
 * Helper to split text into overlapping chunks
 * Target ~1000 characters chunk with ~200 chars overlap
 */
function splitTextIntoChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let i = 0;

    // simple cleaning: remove excessive whitespace
    const cleanText = text.replace(/\s+/g, " ").trim();

    while (i < cleanText.length) {
        let chunk = cleanText.substring(i, i + chunkSize);

        // try to break at a natural sentence boundary if we aren't at the end
        if (i + chunkSize < cleanText.length) {
            const lastPeriod = chunk.lastIndexOf(". ");
            const lastNewline = chunk.lastIndexOf("\n");
            const breakPoint = Math.max(lastPeriod, lastNewline);

            if (breakPoint > chunkSize * 0.5) { // Only break if it's reasonably far into the chunk
                chunk = chunk.substring(0, breakPoint + 1);
            }
        }

        chunks.push(chunk.trim());
        i += chunk.length - overlap;
    }

    return chunks;
}

export async function processAndEmbedDocument(documentId: string) {
    // 1. Fetch Document Metadata
    const doc = await db.query.platformDocuments.findFirst({
        where: eq(platformDocuments.id, documentId)
    });

    if (!doc) {
        throw new Error("Document not found");
    }

    if (doc.isIndexed) {
        return { success: true, message: "Document is already indexed" };
    }

    console.log(`[AI Processor] Starting index for document: ${doc.title}`);

    // 2. Fetch PDF Buffer from URL
    let pdfBuffer: Buffer;
    try {
        const response = await fetch(doc.fileUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status} failed to fetch PDF from ${doc.fileUrl}`);
        const arrayBuffer = await response.arrayBuffer();
        pdfBuffer = Buffer.from(arrayBuffer);
    } catch (e: any) {
        console.error("[AI Processor] Failed to download PDF", e);
        throw new Error("Failed to download PDF for processing");
    }

    // 3. Extract Text via pdf-parse
    let extractedText = "";
    try {
        const data = await pdfParse(pdfBuffer);
        extractedText = data.text;
    } catch (e: any) {
        console.error("[AI Processor] PDF Parse Failed", e);
        throw new Error("Failed to parse text from PDF");
    }

    if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("No readable text found in PDF");
    }

    // 4. Chunk Text
    const chunks = splitTextIntoChunks(extractedText, 1000, 200);
    console.log(`[AI Processor] Document split into ${chunks.length} chunks`);

    // 5. Generate Embeddings & Save
    // We process sequentially to avoid rate-limiting limits on free/dev tiers. 
    // In production, this can be batched (e.g., Promise.all inside chunks of 10).
    for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        try {
            const vector = await generateProfileEmbedding(chunkText);

            await db.insert(documentChunks).values({
                documentId: doc.id,
                chunkIndex: i,
                content: chunkText,
                embedding: vector
            });

        } catch (e: any) {
            console.error(`[AI Processor] Failed to embed chunk ${i}`, e);
            // Decide if we fail entire process or skip bad chunks.
            // For now, throw to abort and debug early.
            throw new Error(`Failed to generate embedding for chunk ${i}`);
        }
    }

    // 6. Mark Document as Indexed
    await db.update(platformDocuments)
        .set({ isIndexed: true })
        .where(eq(platformDocuments.id, doc.id));

    console.log(`[AI Processor] Document ${doc.id} successfully indexed and stored in pgvector.`);

    return { success: true, totalChunks: chunks.length };
}
