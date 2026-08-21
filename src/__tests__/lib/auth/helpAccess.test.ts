import { describe, it, expect } from "vitest";
import { canViewHelpDoc } from "@/lib/auth/helpAccess";

describe("canViewHelpDoc", () => {
    it("returns false if allowedRoles is null or empty", () => {
        expect(canViewHelpDoc(null, null)).toBe(false);
        expect(canViewHelpDoc(null, undefined)).toBe(false);
        expect(canViewHelpDoc(null, [])).toBe(false);
    });

    describe("guest access", () => {
        it("returns true if session is null and allowedRoles includes guest", () => {
            expect(canViewHelpDoc(null, ["guest"])).toBe(true);
        });

        it("returns true if session has no role and allowedRoles includes guest", () => {
            expect(canViewHelpDoc({ role: null }, ["guest"])).toBe(true);
        });

        it("returns false if session is null and allowedRoles does not include guest", () => {
            expect(canViewHelpDoc(null, ["mentee"])).toBe(false);
        });
    });

    describe("SuperAdmin access", () => {
        it("returns true for any non-empty allowedRoles", () => {
            const session = { role: "SuperAdmin" as const };
            expect(canViewHelpDoc(session, ["mentee"])).toBe(true);
            expect(canViewHelpDoc(session, ["all"])).toBe(true);
            expect(canViewHelpDoc(session, ["corporate"])).toBe(true);
            expect(canViewHelpDoc(session, ["guest"])).toBe(true);
        });
    });

    describe("Mentee access", () => {
        const session = { role: "Mentee" as const };

        it("returns true if allowedRoles includes mentee", () => {
            expect(canViewHelpDoc(session, ["mentee"])).toBe(true);
        });

        it("returns false if allowedRoles does not include mentee", () => {
            expect(canViewHelpDoc(session, ["mentor", "corporate"])).toBe(false);
        });
    });

    describe("Mentor access", () => {
        const session = { role: "Mentor" as const };

        it("returns true if allowedRoles includes mentor", () => {
            expect(canViewHelpDoc(session, ["mentor"])).toBe(true);
        });

        it("returns false if allowedRoles does not include mentor", () => {
            expect(canViewHelpDoc(session, ["mentee", "ngo"])).toBe(false);
        });
    });

    describe("CorporatePartner access", () => {
        const session = { role: "CorporatePartner" as const };

        it("returns true if allowedRoles includes corporate", () => {
            expect(canViewHelpDoc(session, ["corporate"])).toBe(true);
        });

        it("returns false if allowedRoles does not include corporate", () => {
            expect(canViewHelpDoc(session, ["mentor", "mentee"])).toBe(false);
        });
    });

    describe("NGO access", () => {
        const session = { role: "NGO" as const };

        it("returns true if allowedRoles includes ngo", () => {
            expect(canViewHelpDoc(session, ["ngo"])).toBe(true);
        });

        it("returns false if allowedRoles does not include ngo", () => {
            expect(canViewHelpDoc(session, ["corporate", "all"])).toBe(false);
        });
    });

    describe("Moderator access", () => {
        it("returns true for 'all' and 'content' allowedRoles if moderator has 'all' scope", () => {
            const session = { role: "Moderator" as const, moderationScope: '["all"]' };
            expect(canViewHelpDoc(session, ["all"])).toBe(true);
            expect(canViewHelpDoc(session, ["content"])).toBe(true);
        });

        it("returns false for 'all' allowedRoles but true for 'content' if moderator has 'content' scope", () => {
            const session = { role: "Moderator" as const, moderationScope: '["content"]' };
            expect(canViewHelpDoc(session, ["all"])).toBe(false);
            expect(canViewHelpDoc(session, ["content"])).toBe(true);
        });

        it("returns false for 'content' or 'all' allowedRoles if moderator has unrelated scope", () => {
            const session = { role: "Moderator" as const, moderationScope: '["corporate"]' };
            expect(canViewHelpDoc(session, ["all"])).toBe(false);
            expect(canViewHelpDoc(session, ["content"])).toBe(false);
        });

        it("returns false for other allowedRoles regardless of scope", () => {
            const session = { role: "Moderator" as const, moderationScope: '["all"]' };
            expect(canViewHelpDoc(session, ["mentee"])).toBe(false);
            expect(canViewHelpDoc(session, ["mentor"])).toBe(false);
            expect(canViewHelpDoc(session, ["corporate"])).toBe(false);
            expect(canViewHelpDoc(session, ["ngo"])).toBe(false);
            expect(canViewHelpDoc(session, ["guest"])).toBe(false);
        });
    });
});
