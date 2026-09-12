import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/db/schema", () => ({
    users: {},
    mentorshipPairs: {
        mentorId: "mentor_id",
        menteeId: "mentee_id",
        status: "status",
    },
    sessionsLog: {},
    learningPathways: { pairId: "pair_id" },
    userBadges: {},
    activityLog: {},
    menteeDocuments: {},
    moderationLog: {},
}));

vi.mock("drizzle-orm", () => ({
    eq: vi.fn((_col, val) => ({ eq: val })),
    and: vi.fn((...args) => args),
    desc: vi.fn((col) => col),
    ne: vi.fn((_col, val) => ({ ne: val })),
    sql: vi.fn(() => "count_sql"),
}));

vi.mock("next/headers", () => ({
    headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/auth/config", () => ({
    auth: {
        api: {
            getSession: vi.fn(async () => ({
                user: { id: "admin-1", role: "SuperAdmin", partnerId: null },
            })),
        },
    },
}));

vi.mock("@/lib/notifications/service", () => ({
    createNotification: vi.fn(async () => undefined),
}));

const txState: { activeOther: number } = { activeOther: 0 };

function buildTx() {
    const insertedPair = { id: "pair-1", status: "active" };

    const tx: any = {
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([{ count: txState.activeOther }]),
            }),
        }),
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                onConflictDoUpdate: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([insertedPair]),
                }),
                onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
                returning: vi.fn().mockResolvedValue([insertedPair]),
            }),
        }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined),
            }),
        }),
    };
    return tx;
}

vi.mock("@/lib/db", () => {
    const mockFindFirst = vi.fn();
    return {
        db: {
            transaction: vi.fn(async (fn: (tx: any) => Promise<unknown>) => fn(buildTx())),
            query: {
                mentorshipPairs: {
                    findFirst: mockFindFirst,
                }
            }
        },
        mockFindFirst,
    };
});

const VALID_MENTEE = "11111111-1111-4111-8111-111111111111";
const VALID_MENTOR = "22222222-2222-4222-8222-222222222222";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("assignMentor — mentor capacity guard (CLAUDE.md §5)", () => {
    beforeEach(() => {
        txState.activeOther = 0;
    });

    it("inserts when mentor has 0 other active pairs", async () => {
        txState.activeOther = 0;
        const { assignMentor } = await import("@/lib/actions/menteeManagement");
        const result = await assignMentor({
            menteeId: VALID_MENTEE,
            mentorId: VALID_MENTOR,
        });
        expect(result.success).toBe(true);
    });

    it("inserts when mentor has 1 other active pair", async () => {
        txState.activeOther = 1;
        const { assignMentor } = await import("@/lib/actions/menteeManagement");
        const result = await assignMentor({
            menteeId: VALID_MENTEE,
            mentorId: VALID_MENTOR,
        });
        expect(result.success).toBe(true);
    });

    it("throws MENTOR_CAPACITY_EXCEEDED when mentor has 2 other active pairs", async () => {
        txState.activeOther = 2;
        const { assignMentor } = await import("@/lib/actions/menteeManagement");
        await expect(
            assignMentor({
                menteeId: VALID_MENTEE,
                mentorId: VALID_MENTOR,
            }),
        ).rejects.toThrow("MENTOR_CAPACITY_EXCEEDED");
    });

    it("throws MENTOR_CAPACITY_EXCEEDED at 3 (defense in depth)", async () => {
        txState.activeOther = 3;
        const { assignMentor } = await import("@/lib/actions/menteeManagement");
        await expect(
            assignMentor({
                menteeId: VALID_MENTEE,
                mentorId: VALID_MENTOR,
            }),
        ).rejects.toThrow("MENTOR_CAPACITY_EXCEEDED");
    });
});

describe("acceptMentorRequest - pending request handling", () => {
    let mockFindFirst: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        const { mockFindFirst: mf } = await import("@/lib/db");
        mockFindFirst = mf;
        mockFindFirst.mockReset();
        txState.activeOther = 0;
    });

    it("throws error when request is not found", async () => {
        mockFindFirst.mockResolvedValue(null);
        const { acceptMentorRequest } = await import("@/lib/actions/mentorship");

        await expect(acceptMentorRequest("non-existent-pair")).rejects.toThrow("Request not found or already actioned");
    });

    it("successfully accepts request when valid and under capacity", async () => {
        const validPair = { id: "pair-1", menteeId: "mentee-1", mentorId: "admin-1", status: "pending" };
        mockFindFirst.mockResolvedValue(validPair);

        const { acceptMentorRequest } = await import("@/lib/actions/mentorship");

        await expect(acceptMentorRequest("pair-1")).resolves.not.toThrow();
    });
});
