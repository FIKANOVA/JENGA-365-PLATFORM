import fs from 'fs';

let content = fs.readFileSync('src/lib/actions/adminOps.ts', 'utf8');

// The file was concatenated incorrectly, resulting in duplicate imports and 'use server' declarations.
// Let's rewrite the file completely based on the previous versions.
const newContent = `"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { corporatePartners, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

async function requireSuperAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");
    if ((session.user as { role?: string }).role !== "SuperAdmin") {
        throw new Error("FORBIDDEN");
    }
    return session;
}

/**
 * Persist a partner's Looker Studio report id and/or login-free share URL.
 * These feed \`src/components/dashboard/Partner/LookerEmbed.tsx\` so the sponsor
 * sees their embedded ESG dashboard at /dashboard/partner.
 */
export async function setPartnerLooker(
    partnerId: string,
    lookerReportId: string,
    lookerShareUrl: string,
): Promise<{ ok: true } | { error: string }> {
    try {
        await requireSuperAdmin();
    } catch (err) {
        return { error: err instanceof Error ? err.message : "FORBIDDEN" };
    }

    const reportId = lookerReportId.trim() || null;
    const shareUrl = lookerShareUrl.trim() || null;

    if (shareUrl && !shareUrl.startsWith("https://lookerstudio.google.com/")) {
        return { error: "Share URL must start with https://lookerstudio.google.com/" };
    }
    if (reportId && !/^[A-Za-z0-9_-]+$/.test(reportId)) {
        return { error: "Report ID may contain only letters, numbers, hyphens and underscores." };
    }

    try {
        await db
            .update(corporatePartners)
            .set({ lookerReportId: reportId, lookerShareUrl: shareUrl })
            .where(eq(corporatePartners.id, partnerId));
    } catch (err) {
        console.error("[setPartnerLooker] update failed:", err);
        return { error: "Could not save Looker settings. Check the report ID and share URL." };
    }

    revalidatePath("/dashboard/admin/esg-unlock");
    revalidatePath("/dashboard/partner");
    return { ok: true };
}

export async function sendResetPasswordEmailAction(email: string) {
    await requireSuperAdmin();

    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (!user) {
        return { error: "User not found" };
    }

    try {
        await auth.api.requestPasswordReset({
            body: {
                email,
                redirectTo: "/reset-password",
            }
        });
        return { ok: true };
    } catch (err) {
        console.error("Failed to send reset password email:", err);
        return { error: "Failed to send reset password email" };
    }
}

export async function importLegacyUsersAction(legacyUsers: string[]) {
    await requireSuperAdmin();
    const results = [];

    for (const email of legacyUsers) {
        try {
            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, email),
            });

            if (existingUser) {
                results.push({ email, status: "skipped" });
                continue;
            }

            const tempPassword = crypto.randomBytes(16).toString("hex") + "A1!";

            await auth.api.signUpEmail({
                body: {
                    email,
                    password: tempPassword,
                    name: email.split("@")[0],
                }
            });
            results.push({ email, status: "imported" });
        } catch (err) {
            console.error(\`Failed to import \${email}:\`, err);
            results.push({ email, status: "error", message: err instanceof Error ? err.message : String(err) });
        }
    }

    return results;
}

export async function updateLegacyUserRoleAction(email: string, role: "SuperAdmin" | "Moderator" | "CorporatePartner" | "NGO" | "Mentor" | "Mentee") {
    await requireSuperAdmin();

    try {
        await db.update(users).set({ role }).where(eq(users.email, email));
        return { ok: true };
    } catch (err) {
        console.error(\`Failed to update role for \${email}:\`, err);
        return { error: "Failed to update user role" };
    }
}
`;

fs.writeFileSync('src/lib/actions/adminOps.ts', newContent);
console.log('Fixed src/lib/actions/adminOps.ts');
