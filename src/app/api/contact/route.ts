import { NextRequest, NextResponse } from "next/server";
import { resend, DEFAULT_FROM } from "@/lib/email/resend";
import { escapeHtml } from "@/lib/utils";
import { verifyTurnstileToken } from "@/lib/turnstile";

const CONTACT_RECIPIENT = process.env.CONTACT_EMAIL ?? "jengaccclxv@gmail.com";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { name, email, subject, message, turnstileToken } = body as Record<string, string>;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    if (!turnstileToken) {
        return NextResponse.json({ error: "Spam verification token is required." }, { status: 400 });
    }

    const clientIp =
        req.headers.get("cf-connecting-ip") ||
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        null;

    const verifyResult = await verifyTurnstileToken(turnstileToken, clientIp, "contact");
    if (!verifyResult.success) {
        return NextResponse.json({ error: verifyResult.error || "Spam check failed. Please refresh and try again." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }


    try {
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSubject = escapeHtml(subject ?? "General Inquiry");
        const safeMessage = escapeHtml(message);

        await resend.emails.send({
            from: DEFAULT_FROM,
            to: CONTACT_RECIPIENT,
            replyTo: email,
            subject: `[Contact Form] ${subject ?? "General Inquiry"} — ${name}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1A1A1A; border-bottom: 2px solid #2D6A4F; padding-bottom: 8px;">
                        New Contact Form Submission
                    </h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Name</td>
                            <td style="padding: 8px 0;">${safeName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #555;">Email</td>
                            <td style="padding: 8px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #555;">Subject</td>
                            <td style="padding: 8px 0;">${safeSubject}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 16px;">
                        <p style="font-weight: bold; color: #555; margin-bottom: 8px;">Message</p>
                        <p style="background: #f5f5f5; padding: 16px; border-left: 3px solid #2D6A4F; white-space: pre-wrap;">${safeMessage}</p>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[Contact API] Error sending contact email via Resend:", err);
        return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
    }
}
