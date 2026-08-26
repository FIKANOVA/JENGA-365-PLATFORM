import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { interviewerSystemPrompt } from "@/lib/ai/interviewer";

export const maxDuration = 30;

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const google = createGoogleGenerativeAI({
    apiKey,
});

export async function POST(req: Request) {
    try {
        const { messages }: { messages?: UIMessage[] } = await req.json();

        // Cap history to last 12 messages to bound context cost (~60% saving on long chats)
        const trimmedMessages = Array.isArray(messages) ? messages.slice(-12) : [];
        const modelMessages = await convertToModelMessages(trimmedMessages);

        const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

        const result = streamText({
            model: google(modelName),
            system: interviewerSystemPrompt,
            messages: modelMessages,
            maxOutputTokens: 512,
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("[/api/chat] stream error:", error);
        return new Response(
            JSON.stringify({ error: error?.message || "Failed to process chat request" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

