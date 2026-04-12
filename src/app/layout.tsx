import type { Metadata } from "next";
import { Playfair_Display, DM_Mono, Lato, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cartContext";

// ── Jenga365 Design System Fonts ──────────────────────────────────────────────
// Playfair Display → headings, hero text, stat values, pull quotes
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

// DM Mono → labels, buttons, badges, nav, metadata, timestamps
const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

// Lato → body copy, descriptions, article body, form helper text
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

// Montserrat → brand/extended font (matches Jenga365 logotype)
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Inter → system/UI fallback only
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jenga365 | Building Growth. Connecting Futures.",
  description:
    "Jenga365 is a dual-engine mentorship and rugby impact platform. Connecting ambitious youth with seasoned veterans — 365 days a year.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${playfair.variable} ${dmMono.variable} ${lato.variable} ${montserrat.variable} ${inter.variable} antialiased`}
      >
        {/* Scroll Progress Bar */}
        <div id="scrollProgress" className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-red-600 to-green-600" />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
