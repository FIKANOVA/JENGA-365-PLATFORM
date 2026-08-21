import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/lib/cartContext";
import { DonateProvider } from "@/components/shared/DonateProvider";
import { FeedbackProvider } from "@/components/shared/FeedbackContext";
import BetaBanner from "@/components/shared/BetaBanner";
import SessionIdleTimeout from "@/components/shared/SessionIdleTimeout";
import { Toaster } from "sonner";

// Single typography family per DESIGN.md §2. Inter for everything except
// monospace contexts (code, IDs) which use JetBrains Mono.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jenga365 — Dual-Engine Platform for Youth Mentorship & Climate Action",
    template: "%s | Jenga365",
  },
  applicationName: "Jenga365",
  description:
    "Jenga365 is Kenya's AI-native mentorship and environmental stewardship platform. Building the Total Athlete through structured mentorship and verified climate action.",
  metadataBase: new URL("https://jenga365.org"),
  openGraph: {
    title: "Jenga365 — Youth Mentorship & Climate Action Platform",
    description:
      "Jenga365 is Kenya's AI-native mentorship and environmental stewardship platform. Building the Total Athlete through structured mentorship and verified climate action.",
    siteName: "Jenga365",
    url: "https://jenga365.org",
  },
  icons: {
    icon: "/assets/logos/Jenga365%20logo.svg",
    shortcut: "/assets/logos/Jenga365%20logo.svg",
    apple: "/assets/logos/Jenga365%20logo.svg",
  },
  verification: {
    google: "googlec1711f3b52a48f29",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <Script
          id="cf-turnstile-script"
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <DonateProvider>
          <CartProvider>
            <FeedbackProvider>
              <BetaBanner />
              <SessionIdleTimeout />
              {children}
              <Toaster richColors position="top-right" />
            </FeedbackProvider>
          </CartProvider>
        </DonateProvider>
      </body>
    </html>
  );
}
