import { NextResponse } from "next/server";

export async function GET() {
    return new NextResponse("google-site-verification: googlec1711f3b52a48f29.html", {
        status: 200,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
        },
    });
}
