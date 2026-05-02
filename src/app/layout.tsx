import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "navimumbai.rent — real rents from real tenants",
  description:
    "Crowdsourced, broker-free rent map for Navi Mumbai. Anonymously share what you pay, find a flat, or find a flatmate. No signup. No app. No fees.",
  metadataBase: new URL("https://navimumbai.rent"),
  openGraph: {
    title: "navimumbai.rent",
    description:
      "Real rents from real tenants across Vashi, Nerul, Belapur, Kharghar, Panvel and the rest of Navi Mumbai.",
    url: "https://navimumbai.rent",
    siteName: "navimumbai.rent",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
