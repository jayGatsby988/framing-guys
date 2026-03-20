import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Forma Studio — Premium Digital Craft",
    template: "%s — Forma Studio",
  },
  description:
    "We build precision-engineered digital experiences for ambitious brands. Strategy, design, and engineering at the highest level.",
  keywords: ["digital agency", "product design", "web development", "brand strategy", "UX design"],
  authors: [{ name: "Forma Studio" }],
  creator: "Forma Studio",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Forma Studio",
    title: "Forma Studio — Premium Digital Craft",
    description:
      "We build precision-engineered digital experiences for ambitious brands.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forma Studio — Premium Digital Craft",
    description: "We build precision-engineered digital experiences for ambitious brands.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-[#fafafa]`}
      >
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
