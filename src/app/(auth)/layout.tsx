/**
 * Auth Layout
 * Clean, centered layout for authentication pages with dark theme
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)]">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-purple-600/5 pointer-events-none" />

      {/* Logo */}
      <div className="relative mb-8">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">
          <span className="text-[var(--primary)]">TruPlat</span>
        </h1>
        <p className="mt-1 text-center text-sm text-[var(--muted-foreground)]">
          Fast appraisals. On-site verification.
        </p>
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md rounded-xl bg-[var(--card)] border border-[var(--border)] p-8 shadow-xl">
        {children}
      </div>

      {/* Footer */}
      <p className="relative mt-8 text-xs text-[var(--muted-foreground)]">
        &copy; {new Date().getFullYear()} TruPlat. All rights reserved.
      </p>
    </div>
  );
}
