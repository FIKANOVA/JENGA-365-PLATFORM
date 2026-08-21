import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/feedback/route";
import { NextRequest } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { resend } from "@/lib/email/resend";

vi.mock("@/lib/turnstile", () => ({
    verifyTurnstileToken: vi.fn(),
}));

vi.mock("@/lib/email/resend", () => ({
    resend: {
        emails: {
            send: vi.fn().mockResolvedValue({ id: "mock-email-id" }),
        },
    },
    DEFAULT_FROM: "Jenga365 <noreply@jenga365.com>",
}));

describe("Feedback API Route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects request if message is empty", async () => {
        const req = new NextRequest("http://localhost:3000/api/feedback", {
            method: "POST",
            body: JSON.stringify({
                message: "",
                turnstileToken: "valid-token",
            }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toContain("Feedback message is required");
    });

    it("rejects request if turnstileToken is missing", async () => {
        const req = new NextRequest("http://localhost:3000/api/feedback", {
            method: "POST",
            body: JSON.stringify({
                message: "Great beta version!",
            }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toContain("Spam verification token is required");
    });

    it("rejects request if Turnstile verification fails", async () => {
        vi.mocked(verifyTurnstileToken).mockResolvedValueOnce({
            success: false,
            error: "Verification failed. Please complete the security check again.",
        });

        const req = new NextRequest("http://localhost:3000/api/feedback", {
            method: "POST",
            body: JSON.stringify({
                message: "Here is my feedback",
                turnstileToken: "invalid-token",
            }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toContain("Verification failed");
    });

    it("accepts valid feedback and dispatches email via Resend", async () => {
        vi.mocked(verifyTurnstileToken).mockResolvedValueOnce({
            success: true,
            hostname: "jenga365.org",
        });

        const req = new NextRequest("http://localhost:3000/api/feedback", {
            method: "POST",
            body: JSON.stringify({
                category: "feature",
                rating: 5,
                message: "Love the new interface, would like offline support!",
                email: "user@example.com",
                path: "/articles",
                turnstileToken: "valid-token",
            }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(resend.emails.send).toHaveBeenCalledTimes(1);
    });
});
