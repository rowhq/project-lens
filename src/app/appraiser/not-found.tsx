import Link from "next/link";

export default function AppraiserNotFound() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-[var(--primary)]">404</h1>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mt-4">
          Page Not Found
        </h2>
        <p className="text-[var(--muted-foreground)] mt-2">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/appraiser/dashboard"
          className="inline-block mt-6 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
