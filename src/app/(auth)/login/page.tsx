/**
 * Login Page
 * Sign in to LENS
 */

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Sign in to LENS
      </h2>
      <p className="mb-8 text-center text-sm text-gray-500">
        Fast appraisals. On-site verification. Certified upgrades.
      </p>
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-blue-600 hover:bg-blue-500 text-sm normal-case",
            card: "shadow-none",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton:
              "border-gray-300 hover:bg-gray-50 text-gray-600",
            formFieldInput:
              "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
            footerActionLink: "text-blue-600 hover:text-blue-500",
          },
        }}
        routing="path"
        path="/login"
        signUpUrl="/register"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
