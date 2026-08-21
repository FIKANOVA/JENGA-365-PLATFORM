import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { authorDocIdFor } from "@/lib/sanity/ensureAuthor";

describe("authorDocIdFor", () => {
    it("should prefix the jengaUserId correctly", () => {
        expect(authorDocIdFor("12345")).toBe("author-jenga-12345");
    });

    it("should handle empty strings", () => {
        expect(authorDocIdFor("")).toBe("author-jenga-");
    });

    it("should handle special characters", () => {
        expect(authorDocIdFor("user_@123")).toBe("author-jenga-user_@123");
    });
});
