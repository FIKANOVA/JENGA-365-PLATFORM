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
    } catch (e: unknown) {
        console.error("[AI Processor] Failed to download PDF", e instanceof Error ? e.message : e);
        throw new Error("Failed to download PDF for processing");
    }

    // 3. Extract Text via pdf-parse
    let extractedText = "";
    try {
        const data = await pdfParse(pdfBuffer);
        extractedText = data.text;
    } catch (e: unknown) {
        console.error("[AI Processor] PDF Parse Failed", e instanceof Error ? e.message : e);
        throw new Error("Failed to parse text from PDF");
    }

    if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("No readable text found in PDF");
    }

    // 4. Chunk Text
    const chunks = splitTextIntoChunks(extractedText, 1000, 200);
    console.log(`[AI Processor] Document split into ${chunks.length} chunks`);

    // 5. Generate Embeddings & Save
    // We process in batches to optimize performance while avoiding excessive rate-limiting.
    const BATCH_SIZE = 10;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batchChunks = chunks.slice(i, i + BATCH_SIZE);

        try {
            // Generate embeddings for the batch concurrently
            const embeddingsBatch = await Promise.all(
                batchChunks.map(chunk => generateProfileEmbedding(chunk))
            );

            // Prepare the values for a single bulk insert
            const valuesToInsert = batchChunks.map((chunkText, batchIndex) => ({
                documentId: doc.id,
                chunkIndex: i + batchIndex,
                content: chunkText,
                embedding: embeddingsBatch[batchIndex]
            }));

            // Bulk insert the batch
            if (valuesToInsert.length > 0) {
                await db.insert(documentChunks).values(valuesToInsert);
            }
        } catch (e: unknown) {
            console.error(`[AI Processor] Failed to process batch starting at index ${i}`, e instanceof Error ? e.message : e);
            // Throw to abort and debug early.
            throw new Error(`Failed to generate embedding for batch starting at ${i}`);
        }
    }

    // 6. Mark Document as Indexed
    await db.update(platformDocuments)
        .set({ isIndexed: true })
        .where(eq(platformDocuments.id, doc.id));

    console.log(`[AI Processor] Document ${doc.id} successfully indexed and stored in pgvector.`);

    return { success: true, totalChunks: chunks.length };
}
