import { describe, it, expect, vi, beforeEach } from "vitest";
import { importLegacyUsersAction } from "@/lib/actions/adminOps";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/config";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      }
    }
  }
}));

vi.mock("@/lib/auth/config", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      signUpEmail: vi.fn(),
    }
  }
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({}),
}));

vi.mock("crypto", () => ({
  default: {
    randomBytes: vi.fn().mockReturnValue({ toString: () => "mock-random" }),
  }
}));

describe("importLegacyUsersAction Performance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.api.getSession as any).mockResolvedValue({
      user: { role: "SuperAdmin" }
    });
    (auth.api.signUpEmail as any).mockResolvedValue({});
  });

  it("should benchmark importLegacyUsersAction", async () => {
    // We add a synthetic 1ms delay for each DB query to simulate DB I/O
    (db.query.users.findFirst as any).mockImplementation(async () => {
        await new Promise(r => setTimeout(r, 1));
        return null;
    });

    (db.query.users.findMany as any).mockImplementation(async () => {
        await new Promise(r => setTimeout(r, 1));
        return [];
    });

    const numUsers = 500;
    const legacyUsers = Array.from({ length: numUsers }, (_, i) => `user${i}@example.com`);

    const start = performance.now();
    await importLegacyUsersAction(legacyUsers);
    const end = performance.now();

    console.log(`importLegacyUsersAction took ${Math.round(end - start)}ms for ${numUsers} users`);

    expect(end - start).toBeGreaterThan(0);
  });
});
