/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import SessionIdleTimeout from "@/components/shared/SessionIdleTimeout";
import { useSession, signOut } from "@/lib/auth/client";

const mockPush = vi.fn();

vi.mock("@/lib/auth/client", () => ({
    useSession: vi.fn(),
    signOut: vi.fn().mockResolvedValue({ success: true }),
    authClient: {
        signOut: vi.fn().mockResolvedValue({ success: true }),
    },
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    usePathname: () => "/dashboard/mentee",
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("SessionIdleTimeout Component", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("does not display warning when user is not logged in", () => {
        vi.mocked(useSession).mockReturnValue({
            data: null,
            isPending: false,
            error: null,
        } as any);

        render(<SessionIdleTimeout />);
        expect(screen.queryByRole("alertdialog")).toBeNull();
    });

    it("renders warning dialog when inactivity approaches timeout threshold", () => {
        vi.mocked(useSession).mockReturnValue({
            data: {
                user: { id: "user_123", email: "mentee@jenga365.org", name: "Jane Doe" },
                session: { id: "sess_123" },
            },
            isPending: false,
            error: null,
        } as any);

        render(<SessionIdleTimeout />);

        // Advance timer to 14 minutes and 10 seconds (15m default timeout - 60s warning = 14m)
        act(() => {
            vi.advanceTimersByTime(14 * 60 * 1000 + 10 * 1000);
        });

        // Warning alertdialog should be visible
        const dialog = screen.getByRole("alertdialog");
        expect(dialog).toBeDefined();
        expect(screen.getByText("Session Inactivity Warning")).toBeDefined();
        expect(screen.getByText("Stay Signed In")).toBeDefined();
    });

    it("dismisses warning and extends session when 'Stay Signed In' is clicked", () => {
        vi.mocked(useSession).mockReturnValue({
            data: {
                user: { id: "user_123", email: "mentee@jenga365.org", name: "Jane Doe" },
                session: { id: "sess_123" },
            },
            isPending: false,
            error: null,
        } as any);

        render(<SessionIdleTimeout />);

        // Advance into warning zone
        act(() => {
            vi.advanceTimersByTime(14 * 60 * 1000 + 15 * 1000);
        });

        const stayButton = screen.getByText("Stay Signed In");
        act(() => {
            fireEvent.click(stayButton);
        });

        // Warning dialog should be removed
        expect(screen.queryByRole("alertdialog")).toBeNull();
    });

    it("signs out and redirects when inactivity exceeds total threshold", async () => {
        vi.mocked(useSession).mockReturnValue({
            data: {
                user: { id: "user_123", email: "mentee@jenga365.org", name: "Jane Doe" },
                session: { id: "sess_123" },
            },
            isPending: false,
            error: null,
        } as any);

        render(<SessionIdleTimeout />);

        // Advance past 15 minutes (900 seconds)
        await act(async () => {
            vi.advanceTimersByTime(15 * 60 * 1000 + 2000);
        });

        expect(signOut).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith(
            expect.stringContaining("/login?reason=idle_timeout")
        );
    });
});

