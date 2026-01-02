/**
 * Auth Layout
 * Clean, centered layout for authentication pages
 * Ledger-style design
 */

import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/truplat.svg"
            alt="TruPlat"
            width={120}
            height={36}
            priority
          />
        </Link>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
          style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
        >
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        {/* Tagline */}
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
            Fast appraisals. On-site verification.
          </p>
        </div>

        {/* Auth Card */}
        <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 p-8">
          {/* L-bracket corners */}
          <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-lime-400 pointer-events-none" />
          <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-lime-400 pointer-events-none" />
          <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-lime-400 pointer-events-none" />
          <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-lime-400 pointer-events-none" />
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-center h-16 border-t border-gray-800">
        <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
          &copy; {new Date().getFullYear()} TruPlat. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
