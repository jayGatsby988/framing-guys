import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AURA — The Ultimate Education Platform for the Impaired",
  description:
    "AI-powered education platform for students with disabilities. Live lecture captions, AI note-taking, vision assistance, and accessible learning tools — all in one place.",
  keywords: [
    "accessible education",
    "AI",
    "disability",
    "lecture captions",
    "assistive technology",
    "live captions",
    "lecture notes",
    "vision impairment",
    "hearing impairment",
    "AccessHear",
    "education accessibility",
  ],
  openGraph: {
    title: "AURA — The Ultimate Education Platform for the Impaired",
    description:
      "Every student deserves to learn without limits. Live lecture captions, AI note-taking, vision assistance, and accessible learning tools for students with disabilities.",
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
