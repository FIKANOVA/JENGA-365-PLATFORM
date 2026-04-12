import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
    verifyPaystackWebhook,
    handlePaystackWebhook,
    type PaystackEvent,
} from "@/lib/paystack/webhooks";

/**
 * POST /api/webhooks/paystack
 *
 * Receives and processes Paystack webhook events.
 * Paystack sends a x-paystack-signature header with HMAC-SHA512.
 */
export async function POST(req: Request) {
    const rawBody = await req.text();
    const headersList = await headers();
    const paystackSig = headersList.get("x-paystack-signature");

    if (!paystackSig) {
        return NextResponse.json(
            { error: "Missing x-paystack-signature header" },
            { status: 400 }
        );
    }

    // Verify the webhook signature
    let isValid: boolean;
    try {
        isValid = verifyPaystackWebhook(rawBody, paystackSig);
    } catch (err: any) {
        return NextResponse.json(
            { error: `Webhook verification error: ${err.message}` },
            { status: 400 }
        );
    }

    if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse and handle the event
    let event: PaystackEvent;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Always respond 200 quickly — Paystack will retry if we take too long
    await handlePaystackWebhook(event);

    return NextResponse.json({ received: true }, { status: 200 });
}
