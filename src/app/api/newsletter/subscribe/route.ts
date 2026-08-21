import { NextResponse } from "next/server";
import { resend, DEFAULT_FROM } from "@/lib/email/resend";
import { buildNewsletterWelcomeEmail } from "@/lib/email/templates";

import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, turnstileToken } = body;

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "A valid email address is required." },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json(
                { error: "Please enter a valid email address." },
                { status: 400 }
            );
        }

        const clientIp =
            req.headers.get("cf-connecting-ip") ||
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            null;

        const verifyResult = await verifyTurnstileToken(turnstileToken, clientIp, "subscribe");
        if (!verifyResult.success) {
            return NextResponse.json(
                { error: verifyResult.error || "Spam check failed. Please refresh and try again." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 1. Send confirmation email to subscriber if Resend API key is present
        if (process.env.RESEND_API_KEY) {
            try {
                const welcomeTemplate = buildNewsletterWelcomeEmail(normalizedEmail);
                await resend.emails.send({
                    from: DEFAULT_FROM,
                    to: normalizedEmail,
                    subject: welcomeTemplate.subject,
                    html: welcomeTemplate.html,
                });

                // Notify admin of new newsletter subscriber
                const adminDestination = process.env.ADMIN_NOTIFICATION_EMAIL || "jengaccclxv@gmail.com";
                await resend.emails.send({
                    from: DEFAULT_FROM,
                    to: adminDestination,
                    subject: `[Jenga Journal] New Subscriber: ${normalizedEmail}`,
                    html: `<p>New subscriber to Jenga Journal: <strong>${normalizedEmail}</strong></p><p>Time: ${new Date().toISOString()}</p>`,
                });
            } catch (emailErr) {
                console.error("[Newsletter] Resend send error:", emailErr);
                // Continue to return success so subscriber gets positive UX
            }
        }

        return NextResponse.json({
            success: true,
            message: "Thank you for subscribing to Jenga Journal!",
        });
    } catch (err) {
        console.error("[Newsletter] Error handling subscription:", err);
        return NextResponse.json(
            { error: "Unable to process subscription. Please try again." },
            { status: 500 }
        );
    }
}
