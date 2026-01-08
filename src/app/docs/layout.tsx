import Link from "next/link";
import Image from "next/image";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image
                  src="/truplat.svg"
                  alt="TruPlat"
                  width={80}
                  height={20}
                />
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-sm text-gray-400">Docs</span>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="h-16" />

      <main>{children}</main>

      <footer className="py-8 ml-56">
        <div className="max-w-3xl px-8">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} TruPlat
          </p>
        </div>
      </footer>
    </div>
  );
}
