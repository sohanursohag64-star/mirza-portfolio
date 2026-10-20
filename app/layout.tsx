import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

// NEXT_PUBLIC_SITE_URL must be set to the real deployed origin for metadataBase, canonical
// URLs and Open Graph image URLs to resolve correctly; falls back to localhost for local dev.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const title = "Mirza Asif Iqbal — Zonal Manager, Radiant Pharmaceuticals";
const description =
  "Leadership profile of Mirza Asif Iqbal, Zonal Manager, Specialty Product Division, Radiant Pharmaceuticals Ltd. — career, team, regions and achievements.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s — Mirza Asif Iqbal" },
  description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: "/", siteName: "Mirza Asif Iqbal", type: "profile", locale: "en_US" },
  twitter: { card: "summary", title, description },
  icons: { icon: "/icon.svg" },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0B1F3A" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
