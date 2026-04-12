import { google } from "@ai-sdk/google";
import { embed } from "ai";

// Note: Gemini's text-embedding-004 produces 768-dimensional vectors.
// Ensure your Neon DB schema uses vector(768) for the embedding column.
export async function generateProfileEmbedding(text: string) {
    const { embedding } = await embed({
        model: google.textEmbeddingModel("text-embedding-004"),
        value: text,
    });
    return embedding;
}
