"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { ngoMouAgreements, resourceExchangeLog, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * Guard: confirms the acting user is registered as an NGO.
 * NGO type is stored in users.metadata.orgType — set during corporate partner registration.
 * Throws 'NGO_ONLY' if the user is not an NGO, preventing financial flow bypass misuse.
 */
async function assertNgoPartner(userId: string): Promise<void> {
    const user = await db
        .select({ metadata: users.metadata })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then((rows) => rows[0]);

    if (!user || user.metadata?.orgType !== "NGO") {
        throw new Error("NGO_ONLY");
    }
}

/**
 * Creates an MOU agreement record for an NGO partner.
 * NGOs bypass financial flow entirely — no Paystack calls, no payment references.
 * Reads the acting user's ID from the session server-side.
 */
export async function createMouAgreement(params: {
    partnerCorporateId: string; // corporatePartners.id
    mouDocumentUrl?: string;
    resourceTypes?: string[];
    expiresAt?: Date;
}): Promise<string> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("UNAUTHORIZED");

    await assertNgoPartner(session.user.id);

    const [row] = await db
        .insert(ngoMouAgreements)
        .values({
            partnerId: params.partnerCorporateId,
            mouDocumentUrl: params.mouDocumentUrl ?? null,
            resourceTypes: params.resourceTypes ?? null,
            signedAt: new Date(),
            expiresAt: params.expiresAt ?? null,
        })
        .returning({ id: ngoMouAgreements.id });

    return row.id;
}

/**
 * Logs a resource exchange between two NGO partners.
 * No payment reference field — NGOs exchange resources without financial transactions.
 * Reads the acting user's ID from the session server-side.
 */
export async function logResourceExchange(params: {
    fromPartnerId: string;
    toPartnerId: string;
    resourceType: string;
    quantity?: number;
    notes?: string;
}): Promise<string> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("UNAUTHORIZED");

    await assertNgoPartner(session.user.id);

    const [row] = await db
        .insert(resourceExchangeLog)
        .values({
            fromPartnerId: params.fromPartnerId,
            toPartnerId: params.toPartnerId,
            resourceType: params.resourceType,
            quantity: params.quantity ?? null,
            notes: params.notes ?? null,
        })
        .returning({ id: resourceExchangeLog.id });

    return row.id;
}
