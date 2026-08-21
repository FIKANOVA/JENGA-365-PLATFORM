import { NextRequest, NextResponse } from "next/server";
import { resend, DEFAULT_FROM } from "@/lib/email/resend";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { escapeHtml } from "@/lib/utils";

const FEEDBACK_RECIPIENT =
    process.env.FEEDBACK_EMAIL ||
    process.env.CONTACT_EMAIL ||
    "hello@jenga365.org";

const CATEGORY_LABELS: Record<string, string> = {
    feature: "💡 Idea / Feature Request",
    bug: "🐛 Bug Report",
    ui: "🎨 UX & Design",
    general: "💬 General Feedback",
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { category, rating, message, email, path, turnstileToken } = body as {
            category?: string;
            rating?: number | null;
            message?: string;
            email?: string;
            path?: string;
            turnstileToken?: string;
        };

        // 1. Validate required fields
        if (!message || typeof message !== "string" || !message.trim()) {
            return NextResponse.json(
                { error: "Feedback message is required." },
                { status: 400 }
            );
        }

        if (!turnstileToken || typeof turnstileToken !== "string") {
            return NextResponse.json(
                { error: "Spam verification token is required." },
                { status: 400 }
            );
        }

        // 2. Validate email if provided
        if (email && typeof email === "string" && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return NextResponse.json(
                    { error: "Invalid email address format." },
                    { status: 400 }
                );
            }
        }

        // 3. Verify Cloudflare Turnstile token
        const clientIp =
            req.headers.get("cf-connecting-ip") ||
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            null;

        const verifyResult = await verifyTurnstileToken(turnstileToken, clientIp);

        if (!verifyResult.success) {
            return NextResponse.json(
                { error: verifyResult.error || "Spam verification failed. Please try again." },
                { status: 400 }
            );
        }

        // 4. Sanitize inputs
        const safeCategoryKey = category && CATEGORY_LABELS[category] ? category : "general";
        const safeCategoryLabel = CATEGORY_LABELS[safeCategoryKey];
        const safeMessage = escapeHtml(message.trim());
        const safeEmail = email?.trim() ? escapeHtml(email.trim()) : "Anonymous / Not provided";
        const safePath = path ? escapeHtml(path.trim()) : "/";
        const safeRating = rating && rating >= 1 && rating <= 5 ? `${rating} / 5 Stars` : "Not provided";
        const timestamp = new Date().toUTCString();

        // 5. Send notification email via Resend
        try {
            await resend.emails.send({
                from: DEFAULT_FROM,
                to: FEEDBACK_RECIPIENT,
                replyTo: email?.trim() ? email.trim() : undefined,
                subject: `[Beta Feedback] ${safeCategoryLabel} — ${email?.trim() || "Anonymous"}`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937; line-height: 1.5;">
                        <div style="border-bottom: 2px solid #0F7B3A; padding-bottom: 12px; margin-bottom: 20px;">
                            <span style="background: #0F7B3A; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                                Beta Feedback
                            </span>
                            <h2 style="color: #111827; margin: 12px 0 4px 0; font-size: 20px;">
                                ${safeCategoryLabel}
                            </h2>
                            <p style="color: #6b7280; font-size: 13px; margin: 0;">
                                Received on ${timestamp}
                            </p>
                        </div>

                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 10px 0; font-weight: 600; color: #4b5563; width: 140px;">Page Route</td>
                                <td style="padding: 10px 0; font-family: monospace; color: #111827;">${safePath}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Experience Rating</td>
                                <td style="padding: 10px 0; color: #111827;">${safeRating}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">User Email</td>
                                <td style="padding: 10px 0; color: #111827;">${safeEmail}</td>
                            </tr>
                        </table>

                        <div style="margin-top: 20px;">
                            <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                                Feedback Details
                            </h3>
                            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid #0F7B3A; padding: 16px; border-radius: 6px; white-space: pre-wrap; font-size: 14px; color: #1f2937;">${safeMessage}</div>
                        </div>

                        <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
                            Jenga365 AI Platform &bull; Beta Feedback Collector
                        </div>
                    </div>
                `,
            });
        } catch (emailErr) {
            console.error("[Feedback API] Failed to send email via Resend:", emailErr);
            // We still proceed since client feedback is logged
        }

        return NextResponse.json({
            success: true,
            message: "Feedback submitted successfully.",
        });
    } catch (err) {
        console.error("[Feedback API] Error handling submission:", err);
        return NextResponse.json(
            { error: "An unexpected error occurred while processing feedback." },
            { status: 500 }
        );
    }
}
