import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-[var(--primary)]">404</h1>
        <h2 className="text-2xl font-semibold text-[var(--foreground)] mt-4">
          Page Not Found
        </h2>
        <p className="text-[var(--muted-foreground)] mt-2 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-[var(--primary)] text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
