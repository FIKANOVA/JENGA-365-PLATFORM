import { auth } from "@/lib/auth/config";
import { hasCapability, parseScopes, type Capability, type ModeratorScope, type Role } from "@/lib/auth/roles";
import { headers } from "next/headers";

export async function requireCapability(cap: Capability): Promise<void> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        throw new Error("UNAUTHORIZED");
    }
    const role = (session.user as { role?: string }).role as Role | undefined;
    const scopeString = (session.user as { moderationScope?: string }).moderationScope;
    const scopes: ModeratorScope[] = parseScopes(scopeString);
    if (!role || !hasCapability(role, scopes, cap)) {
        throw new Error(`FORBIDDEN:${cap}`);
    }
}
