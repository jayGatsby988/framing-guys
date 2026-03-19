import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AURA — Adaptive Universal Responsive Assistant",
  description:
    "AI-powered accessibility platform that helps people with vision and hearing impairments interact with the world seamlessly.",
  keywords: [
    "accessibility",
    "AI",
    "vision impairment",
    "hearing impairment",
    "assistive technology",
    "live captions",
    "voice control",
    "screen reader",
  ],
  openGraph: {
    title: "AURA — Adaptive Universal Responsive Assistant",
    description:
      "One intelligent layer for a more accessible world. AI-powered vision assist, live captions, voice control, and web accessibility tools.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#070709] text-[#F8F8FC] antialiased overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded-lg z-[9999] focus:z-[9999]"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
