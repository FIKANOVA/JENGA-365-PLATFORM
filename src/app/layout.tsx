import type { Metadata } from "next";
import { Big_Shoulders_Display, Plus_Jakarta_Sans, DM_Mono, Barlow_Semi_Condensed, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cartContext";

// ── Jenga365 Design System Fonts — "Modern Premium" palette ──────────────────
// Big Shoulders Display → H1/H2 hero headings (free alt for Europa Grotesk Extended)
// Extended, cinematic, architectural — adds a "luxe" feel to large headings
const bigShoulders = Big_Shoulders_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

// Barlow Semi Condensed → H3, navigation, section titles (free alt for Britanica)
// Maintains the wide feel with strong scanning weight
const barlowSemiCondensed = Barlow_Semi_Condensed({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Plus Jakarta Sans → body copy, descriptions, UI text (free alt for Helvetica Now)
// Optimised for digital screens, highly legible at small sizes
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// DM Mono → labels, buttons, badges, nav metadata, timestamps
const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

// Montserrat → buttons, CTAs, UI interactive elements
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
        className={`${bigShoulders.variable} ${barlowSemiCondensed.variable} ${plusJakarta.variable} ${dmMono.variable} ${montserrat.variable} antialiased`}
      >
        {/* Scroll Progress Bar */}
        <div id="scrollProgress" className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-red-600 to-green-600" />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
