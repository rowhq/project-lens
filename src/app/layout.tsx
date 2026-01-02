/**
 * Root Layout
 * Project Lens - Ledger-Inspired Design
 */

import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@/shared/components/providers/SessionProvider";
import { TRPCProvider } from "@/shared/components/providers/TRPCProvider";
import { ToastProvider } from "@/shared/components/ui/Toast";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TruPlat | Fast Appraisals for Lenders",
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
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <SessionProvider>
          <TRPCProvider>
            <ToastProvider>{children}</ToastProvider>
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
