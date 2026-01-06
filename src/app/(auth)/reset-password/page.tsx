"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Alert } from "@/shared/components/ui/Alert";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-lime-500/10 shadow-[inset_0_0_0_1px_theme(colors.lime.500/0.3)] clip-notch">
            <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400" />
            <CheckCircle className="h-8 w-8 text-lime-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Password reset successful
          </h1>
          <p className="mt-3 text-gray-400">
            Your password has been updated. Redirecting to login...
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm font-mono uppercase tracking-wider text-lime-400 hover:text-lime-300 transition-colors"
          style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
        >
          Go to login →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
        <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
          Enter your new password below
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
          type={showPassword ? "text" : "password"}
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
          minLength={8}
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          }
        />

        <Input
          type={showPassword ? "text" : "password"}
          label="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          required
          minLength={8}
          leftIcon={<Lock className="w-5 h-5" />}
        />

        <Button
          type="submit"
          variant="lime"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
          disabled={!token}
        >
          {isSubmitting ? "Resetting..." : "Reset password"}
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
