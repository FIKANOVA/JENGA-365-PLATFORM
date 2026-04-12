import { auth, SessionWithRole } from "./config";
import { headers } from "next/headers";

export async function getSession(): Promise<SessionWithRole | null> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) return null;

    // Extend the user type to include the role from additionalFields
    return {
        ...session,
        user: {
            ...session.user,
            role: (session.user as any).role || "Mentee",
            partnerId: (session.user as any).partnerId,
        },
    };
}
