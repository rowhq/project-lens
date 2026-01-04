import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/truplat.svg"
                  alt="TruPlat"
                  width={100}
                  height={30}
                />
              </Link>
              <span className="text-gray-600">/</span>
              <span className="font-mono text-sm uppercase tracking-wider text-lime-400">
                Documentation
              </span>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-mono text-sm uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 font-mono text-xs uppercase tracking-wider">
            &copy; {new Date().getFullYear()} TruPlat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
