/**
 * Auth Layout
 * Clean, centered layout for authentication pages
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          <span className="text-blue-600">LENS</span>
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Fast appraisals. On-site verification.
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Project LENS. All rights reserved.
      </p>
    </div>
  );
}
