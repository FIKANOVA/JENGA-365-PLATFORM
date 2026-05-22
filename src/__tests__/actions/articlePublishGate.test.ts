import { describe, it, expect } from "vitest";
import { hasCapability, CAPABILITIES } from "@/lib/auth/roles";

describe("Article publish gate (Phase 2.6 / CLAUDE.md §10.6)", () => {
    it("exposes PUBLISH_ARTICLE in the capabilities map", () => {
        expect(CAPABILITIES.PUBLISH_ARTICLE).toBeDefined();
    });

    it("PUBLISH_ARTICLE maps to the content scope (and all)", () => {
        expect(CAPABILITIES.PUBLISH_ARTICLE).toEqual(
            expect.arrayContaining(["content", "all"]),
        );
        expect(CAPABILITIES.PUBLISH_ARTICLE).toHaveLength(2);
    });

    it("Moderator with content scope can publish articles", () => {
        expect(hasCapability("Moderator", ["content"], "PUBLISH_ARTICLE")).toBe(true);
    });

    it("Moderator with all scope can publish articles", () => {
        expect(hasCapability("Moderator", ["all"], "PUBLISH_ARTICLE")).toBe(true);
    });

    it("Moderator with mentor_applications scope cannot publish articles", () => {
        expect(
            hasCapability("Moderator", ["mentor_applications"], "PUBLISH_ARTICLE"),
        ).toBe(false);
    });

    it("Moderator with corporate scope cannot publish articles", () => {
        expect(hasCapability("Moderator", ["corporate"], "PUBLISH_ARTICLE")).toBe(
            false,
        );
    });

    it("Mentee, Mentor, CorporatePartner cannot publish articles", () => {
        for (const role of ["Mentee", "Mentor", "CorporatePartner"] as const) {
            expect(hasCapability(role, [], "PUBLISH_ARTICLE")).toBe(false);
        }
    });

    it("SuperAdmin bypasses scope checks for PUBLISH_ARTICLE", () => {
        expect(hasCapability("SuperAdmin", [], "PUBLISH_ARTICLE")).toBe(true);
    });
});
