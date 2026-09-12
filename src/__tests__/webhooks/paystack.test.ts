import crypto from "crypto";
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

    it("should return true for a valid signature", () => {
        process.env.PAYSTACK_WEBHOOK_SECRET = "my_secret_key";
        const rawBody = JSON.stringify({ event: "charge.success", data: { amount: 1000 } });

        const validSignature = crypto
            .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET)
            .update(rawBody)
            .digest("hex");

        const result = verifyPaystackWebhook(rawBody, validSignature);
        expect(result).toBe(true);
    });

    it("should return false for an invalid signature", () => {
        process.env.PAYSTACK_WEBHOOK_SECRET = "my_secret_key";
        const rawBody = JSON.stringify({ event: "charge.success", data: { amount: 1000 } });

        const invalidSignature = crypto
            .createHmac("sha512", "different_key")
            .update(rawBody)
            .digest("hex");

        const result = verifyPaystackWebhook(rawBody, invalidSignature);
        expect(result).toBe(false);
    });

    it("should throw an error if PAYSTACK_WEBHOOK_SECRET is not set", () => {
        delete process.env.PAYSTACK_WEBHOOK_SECRET;
        const rawBody = JSON.stringify({ event: "charge.success", data: { amount: 1000 } });
        const dummySignature = "dummy_signature";

        expect(() => verifyPaystackWebhook(rawBody, dummySignature)).toThrowError("PAYSTACK_WEBHOOK_SECRET is not set");
    });
});
