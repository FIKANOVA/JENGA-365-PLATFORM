import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import { verifyPaystackWebhook } from "@/lib/paystack/webhooks";

describe("verifyPaystackWebhook", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("should throw an error when PAYSTACK_WEBHOOK_SECRET is not set", () => {
        delete process.env.PAYSTACK_WEBHOOK_SECRET;

        expect(() => {
            verifyPaystackWebhook("test_body", "test_signature");
        }).toThrow("PAYSTACK_WEBHOOK_SECRET is not set");
    });

    it("should return true when the signature is valid", () => {
        const secret = "test_secret";
        process.env.PAYSTACK_WEBHOOK_SECRET = secret;

        const rawBody = "test_body";
        const validSignature = crypto
            .createHmac("sha512", secret)
            .update(rawBody)
            .digest("hex");

        const result = verifyPaystackWebhook(rawBody, validSignature);

        expect(result).toBe(true);
    });

    it("should return false when the signature is invalid", () => {
        const secret = "test_secret";
        process.env.PAYSTACK_WEBHOOK_SECRET = secret;

        const rawBody = "test_body";
        const invalidSignature = "invalid_signature";

        const result = verifyPaystackWebhook(rawBody, invalidSignature);

        expect(result).toBe(false);
    });
});
