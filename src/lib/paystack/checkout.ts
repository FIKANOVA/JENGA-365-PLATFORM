/**
 * Paystack Checkout Utilities
 * Handles payment initialisation for donations and merchandise orders.
 * Uses Paystack's server-side API (not the inline popup) for Next.js API routes.
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not set");
}

/** Base headers for all Paystack API calls */
const paystackHeaders = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
};

export interface InitialisePaymentParams {
    email: string;
    /** Amount in the smallest currency unit (kobo for NGN, pesewas for GHS) */
    amountInKobo: number;
    reference?: string;
    callbackUrl: string;
    metadata?: {
        userId: string;
        type: "donation" | "order";
        [key: string]: string;
    };
}

export interface PaystackInitResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

/**
 * Initialise a Paystack payment transaction.
 * Returns a redirect URL to send the user to Paystack's payment page.
 */
export async function initialisePayment(
    params: InitialisePaymentParams
): Promise<PaystackInitResponse> {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: paystackHeaders,
        body: JSON.stringify({
            email: params.email,
            amount: params.amountInKobo,
            reference: params.reference,
            callback_url: params.callbackUrl,
            metadata: params.metadata,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Paystack API error: ${error.message}`);
    }

    return response.json();
}

/**
 * Verify a Paystack transaction by reference.
 * Call this in the webhook handler or callback to confirm payment.
 */
export async function verifyPayment(reference: string) {
    const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
            method: "GET",
            headers: paystackHeaders,
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Paystack verify error: ${error.message}`);
    }

    return response.json();
}
