import type { Metadata } from "next";
import "../globals.css";
import Footer from "@/components/marketing/Footer";
import HeaderWrapper from "@/components/shared/HeaderWrapper";

export const metadata: Metadata = {
    title: "Jenga365 | The AI-Native System of Growth",
    description: "Impact SaaS scaling mentorship, education, and social impact through AI.",
};

export default function MarketingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen">
            <HeaderWrapper />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
