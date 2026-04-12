import crypto from "crypto";
import { db } from "../db";
import { donations, orders, userBadges } from "../db/schema";
import { createNotification } from "../notifications/service";

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
export async function handlePaystackWebhook(event: PaystackEvent) {
    switch (event.event) {
        case "charge.success": {
            const data = event.data;
            const userId = data.metadata?.userId;
            const type = data.metadata?.type; // 'donation' | 'order'

            if (!userId) break;

            if (type === "donation") {
                const amount = (data.amount / 100).toFixed(2);
                await db.insert(donations).values({
                    userId,
                    amount,
                    currency: data.currency?.toUpperCase() || "NGN",
                    paystackReference: data.reference,
                    isRecurring: false,
                });

                await db.insert(userBadges).values({
                    userId,
                    badgeType: "Supporter",
                });

                createNotification(userId, "payment_success", {
                    title: "Donation Received",
                    body: `Thank you! Your donation of ${data.currency?.toUpperCase() || "NGN"} ${amount} has been processed.`,
                    link: "/dashboard",
                }).catch(() => {});
            } else if (type === "order") {
                const amount = (data.amount / 100).toFixed(2);
                await db.insert(orders).values({
                    userId,
                    paystackReference: data.reference,
                    status: "paid",
                    totalAmount: amount,
                    items: data.metadata?.items ?? {},
                });

                createNotification(userId, "payment_success", {
                    title: "Order Confirmed",
                    body: `Your order of ${data.currency?.toUpperCase() || "NGN"} ${amount} has been confirmed.`,
                    link: "/shop",
                }).catch(() => {});
            }
            break;
        }

        default:
            // Log unhandled events for debugging
            console.log(`[Paystack] Unhandled event: ${event.event}`);
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
            [key: string]: unknown;
        };
        customer: {
            email: string;
            id: number;
        };
    };
}
