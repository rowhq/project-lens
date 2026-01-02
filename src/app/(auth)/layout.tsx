/**
 * Auth Layout
 * Two-column layout: Brand panel (left) + Form (right)
 * Ledger-style design
 */

import Link from "next/link";
import Image from "next/image";
import { BrandPanel } from "./components/BrandPanel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black">
      {/* Brand Panel - Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] border-r border-gray-800">
        <BrandPanel />
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header - Simplified for desktop (logo is in brand panel), full for mobile */}
        <header className="flex items-center justify-between h-14 px-6 border-b border-gray-800">
          {/* Logo only visible on mobile (when brand panel is hidden) */}
          <Link href="/" className="flex-shrink-0 lg:hidden">
            <Image
              src="/truplat.svg"
              alt="TruPlat"
              width={100}
              height={30}
              priority
            />
          </Link>
          {/* Spacer for desktop */}
          <div className="hidden lg:block" />
          <Link
            href="/"
            className="h-10 px-4 flex items-center font-mono text-sm uppercase tracking-wider text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 clip-notch-sm transition-colors duration-300"
            style={{
              transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
            }}
          >
            Back to Home
          </Link>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          {/* Auth Card */}
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 clip-notch p-6">
            {/* L-bracket corners */}
            <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-lime-400 pointer-events-none" />
            <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-lime-400 pointer-events-none" />
            <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-lime-400 pointer-events-none" />
            <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-lime-400 pointer-events-none" />
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-center h-14 border-t border-gray-800">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-600">
            &copy; {new Date().getFullYear()} TruPlat. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
