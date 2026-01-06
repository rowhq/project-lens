"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Alert } from "@/shared/components/ui/Alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Failed to send reset email");
      }

      setIsSuccess(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mb-6">
          {/* Ledger-style success icon */}
          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-lime-500/10 shadow-[inset_0_0_0_1px_theme(colors.lime.500/0.3)] clip-notch">
            <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400" />
            <CheckCircle className="h-8 w-8 text-lime-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-3 text-gray-400">
            We&apos;ve sent a password reset link to
          </p>
          <p className="mt-1 font-mono text-sm text-lime-400">{email}</p>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm font-mono uppercase tracking-wider text-lime-400 hover:text-lime-300 transition-colors"
          style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
        >
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">
          Reset your password
        </h1>
        <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
          Enter your email to receive a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          </Alert>
        )}

        <Input
          type="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          leftIcon={<Mail className="w-5 h-5" />}
        />

        <Button
          type="submit"
          variant="lime"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="text-sm font-mono uppercase tracking-wider text-lime-400 hover:text-lime-300 transition-colors"
          style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
        >
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
