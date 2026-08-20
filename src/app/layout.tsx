import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cartContext";
import { DonateProvider } from "@/components/shared/DonateProvider";

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
  title: "Jenga365: Total Athlete. 365 Days a Year.",
  description:
    "Kenya's AI-native mentorship and environmental stewardship platform. Building the Total Athlete through structured mentorship (Engine A) and measurable climate action (Engine B).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <DonateProvider>
          <CartProvider>{children}</CartProvider>
        </DonateProvider>
      </body>
    </html>
  );
}
