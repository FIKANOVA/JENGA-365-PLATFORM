import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { verifyPaystackWebhook } from "@/lib/paystack/webhooks";

describe("verifyPaystackWebhook", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("should throw an error if PAYSTACK_WEBHOOK_SECRET is not set", () => {
        delete process.env.PAYSTACK_WEBHOOK_SECRET;

        expect(() => verifyPaystackWebhook("body", "signature")).toThrowError(
            "PAYSTACK_WEBHOOK_SECRET is not set"
        );
    });
});
