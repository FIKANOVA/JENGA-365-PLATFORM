"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { corporatePartners, users, moderationLog, notifications } from "@/lib/db/schema";
import { EmailService } from "@/lib/email/service";
import { eq, inArray } from "drizzle-orm";
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
 * These feed `src/components/dashboard/Partner/LookerEmbed.tsx` so the sponsor
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

    // Validate up front so the operator gets a clear message instead of a raw DB
    // CHECK-constraint error (corporate_partners_looker_share_url_format, migration 0009).
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
        // @ts-ignore
        // @ts-ignore
        // @ts-ignore
        await auth.api.forgetPassword({
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

    // Filter out duplicates in input
    const uniqueEmails = Array.from(new Set(legacyUsers));

    // Batch fetch existing users
    let existingEmails = new Set<string>();
    if (uniqueEmails.length > 0) {
        const existingUsers = await db.query.users.findMany({
            where: inArray(users.email, uniqueEmails),
            columns: {
                email: true,
            },
        });
        existingEmails = new Set(existingUsers.map(u => u.email));
    }

    for (const email of uniqueEmails) {
        try {
            if (existingEmails.has(email)) {
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
            console.error(`Failed to import ${email}:`, err);
            results.push({ email, status: "error", message: err instanceof Error ? err.message : String(err) });
        }
    }

    return results;
}

export async function updateLegacyUserRoleAction(email: string, role: "SuperAdmin" | "Moderator" | "CorporatePartner" | "NGO" | "Mentor" | "Mentee") {
    const session = await requireSuperAdmin();
    const adminId = session.user.id;

    try {
        const targetUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        const oldRole = targetUser?.role || "Mentee";

        // Update user role and ensure account is active and approved
        await db.update(users).set({ 
            role, 
            isApproved: true, 
            status: "active" 
        }).where(eq(users.email, email));

        if (targetUser) {
            // In-app notification
            await db.insert(notifications).values({
                userId: targetUser.id,
                type: "general",
                title: "Role Updated",
                body: `Your account role has been updated to ${role}. Your dashboard permissions have been updated.`,
                link: "/dashboard",
            });

            // Audit log
            await db.insert(moderationLog).values({
                moderatorId: adminId,
                actionType: "role_updated",
                targetId: targetUser.id,
                targetType: "user",
                notes: `SuperAdmin changed role for ${email} from ${oldRole} to ${role}`,
            });

            // Transactional email notification
            const firstName = targetUser.name ? targetUser.name.split(" ")[0] : email.split("@")[0];
            const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "https://jenga365.org").replace(/\/+$/, "");
            await EmailService.sendRoleUpdated(email, firstName, role, `${baseUrl}/dashboard`);
        }

        revalidatePath("/dashboard/admin");
        revalidatePath("/dashboard/people");
        return { ok: true };
    } catch (err) {
        console.error(`Failed to update role for ${email}:`, err);
        return { error: "Failed to update user role" };
    }
}

export async function deleteUserByAdminAction(targetUserId: string) {
    const session = await requireSuperAdmin();
    const adminId = session.user.id;

    if (targetUserId === adminId) {
        return { error: "You cannot delete your own account from the Admin panel. Use Account Settings instead." };
    }

    const targetUser = await db.query.users.findFirst({
        where: eq(users.id, targetUserId)
    });

    if (!targetUser) {
        return { error: "User not found." };
    }

    try {
        // Log the deletion
        await db.insert(moderationLog).values({
            moderatorId: adminId,
            actionType: "user_deleted",
            targetId: targetUserId,
            targetType: "user",
            notes: `SuperAdmin deleted user ${targetUser.email} (${targetUser.role})`,
        });

        // Delete user (cascades to child tables)
        await db.delete(users).where(eq(users.id, targetUserId));

        revalidatePath("/dashboard/admin");
        revalidatePath("/dashboard/people");
        return { ok: true };
    } catch (err: any) {
        console.error("[deleteUserByAdminAction] failed:", err);
        return { error: err?.message || "Failed to delete user." };
    }
}
