import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { interviewerSystemPrompt } from "@/lib/ai/interviewer";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Cap history to last 12 messages to bound context cost (~60% saving on long chats)
    const trimmedMessages = Array.isArray(messages) ? messages.slice(-12) : [];

    const result = await streamText({
        model: google("gemini-2.0-flash"),
        system: interviewerSystemPrompt,
        messages: trimmedMessages,
        maxOutputTokens: 512,
    });

    return result.toTextStreamResponse();
}
