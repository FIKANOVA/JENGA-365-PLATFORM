import { describe, it, expect } from "vitest";
import { convertToModelMessages, UIMessage } from "ai";

describe("/api/chat route handling", () => {
    it("converts UI messages with parts to model messages", async () => {
        const uiMessages: UIMessage[] = [
            {
                id: "msg-1",
                role: "user",
                parts: [{ type: "text", text: "Hello Jenga AI! I am ready to start." }],
            },
        ];

        const modelMessages = await convertToModelMessages(uiMessages);
        expect(modelMessages).toBeDefined();
        expect(modelMessages.length).toBe(1);
        expect(modelMessages[0].role).toBe("user");
    });
});
