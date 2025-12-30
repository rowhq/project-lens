/**
 * Root Layout
 * Project LENS - Texas V1
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/shared/components/providers/SessionProvider";
import { TRPCProvider } from "@/shared/components/providers/TRPCProvider";
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
  title: "LENS | Fast Appraisals for Lenders",
  description:
    "AI-powered appraisals in minutes. On-site verification in days. Built for lenders.",
  keywords: [
    "appraisal",
    "real estate",
    "lender",
    "valuation",
    "Texas",
    "property",
  ],
};

// Dynamic to prevent static generation issues
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
