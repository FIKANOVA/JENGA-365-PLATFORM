import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { donations, orders, userBadges, users } from "../db/schema";
import { createNotification } from "../notifications/service";
import { EmailService } from "../email/service";

/**
 * Verify a Paystack webhook event signature.
 * Paystack signs webhook payloads with HMAC-SHA512 using your secret key.
 */
export function verifyPaystackWebhook(
    rawBody: string,
    paystackSignature: string
): boolean {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!secret) throw new Error("PAYSTACK_WEBHOOK_SECRET is not set");

    const hash = crypto
        .createHmac("sha512", secret)
        .update(rawBody)
        .digest("hex");

    return hash === paystackSignature;
}

/**
 * Handle verified Paystack webhook events.
 * Called after signature verification in the route handler.
 */
const CAUSE_IMPACT: Record<string, string> = {
    RUGBY: "Your gift funds rugby equipment and clinic time for youth players in Kenyan schools.",
    ECO: "Your gift seeds and audits trees in our GPS-anchored tree-survival programmes.",
    EDU: "Your gift powers Jenga365 — mentorship matching, embeddings, and platform tooling.",
};

function extractCause(metadata: PaystackEvent["data"]["metadata"]): string | null {
    const fields = (metadata?.custom_fields ?? []) as Array<{ variable_name?: string; value?: string }>;
    const match = fields.find((f) => f?.variable_name === "donation_cause");
    return match?.value ?? null;
}

export async function handlePaystackWebhook(event: PaystackEvent) {
    switch (event.event) {
        case "charge.success": {
            const data = event.data;
            const userId = data.metadata?.userId ?? null;
            const type = data.metadata?.type; // 'donation' | 'order'
            const currency = data.currency?.toUpperCase() || "NGN";
            const amount = (data.amount / 100).toFixed(2);

            if (type === "donation") {
                const cause = extractCause(data.metadata);

                await db.insert(donations).values({
                    userId, // nullable — guest donations record with NULL userId
                    amount,
                    currency,
                    paystackReference: data.reference,
                    isRecurring: false,
                    fundAllocation: cause,
                });

                // Badge + in-app notification only for authenticated donors.
                if (userId) {
                    await db.insert(userBadges).values({
                        userId,
                        badgeType: "Supporter",
                    });
                    createNotification(userId, "payment_success", {
                        title: "Donation Received",
                        body: `Thank you! Your donation of ${currency} ${amount} has been processed.`,
                        link: "/dashboard",
                    }).catch(() => {});
                }

                // Transactional receipt — works for both authenticated and guest donors.
                // Pull first name from users table if we have a userId; otherwise default
                // to "Friend" (Paystack doesn't include the donor's name in webhook payloads).
                let firstName = "Friend";
                let donorEmail = data.customer?.email ?? null;
                if (userId) {
                    const [u] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
                    if (u?.name) firstName = u.name.split(" ")[0] ?? firstName;
                    if (u?.email) donorEmail = u.email;
                }
                if (donorEmail) {
                    const impact = (cause && CAUSE_IMPACT[cause]) || "Your gift fuels mentorship, climate action, and youth development across Kenya.";
                    EmailService.sendDonationThankYou(
                        donorEmail,
                        firstName,
                        `${currency} ${amount}`,
                        impact,
                    ).catch((err) => console.error("[Paystack] donation receipt send failed:", err));
                }
            } else if (type === "order") {
                if (!userId) {
                    // Order without a userId — log and skip; guest checkout for orders
                    // isn't supported by the current schema (orders.userId is required).
                    console.warn("[Paystack] order without userId, skipping:", data.reference);
                    break;
                }
                await db.insert(orders).values({
                    userId,
                    paystackReference: data.reference,
                    status: "paid",
                    totalAmount: amount,
                    items: data.metadata?.items ?? {},
                });

                createNotification(userId, "payment_success", {
                    title: "Order Confirmed",
                    body: `Your order of ${currency} ${amount} has been confirmed.`,
                    link: "/shop",
                }).catch(() => {});
            }
            break;
        }

        default:
            // Log unhandled events for debugging
            console.debug(`[Paystack] Unhandled event: ${event.event}`);
    }
}

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface PaystackEvent {
    event: string;
    data: {
        id: number;
        reference: string;
        amount: number; // in smallest currency unit (kobo)
        currency: string;
        status: string;
        metadata: {
            userId?: string;
            type?: "donation" | "order";
            items?: Record<string, unknown>;
            custom_fields?: Array<{ display_name?: string; variable_name?: string; value?: string }>;
            [key: string]: unknown;
        };
        customer: {
            email: string;
            id: number;
        };
    };
}
