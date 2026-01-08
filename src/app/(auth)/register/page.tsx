"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Building2 } from "lucide-react";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/utils";

type UserRole = "CLIENT" | "APPRAISER";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: (roleParam === "appraiser" ? "APPRAISER" : "CLIENT") as UserRole,
    organizationName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Redirect based on role (mockup - just go to next page)
    if (formData.role === "APPRAISER") {
      router.push("/appraiser/onboarding");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-1 text-xl font-bold text-white">Create Account</h2>
      <p className="mb-5 text-center font-mono text-[10px] uppercase tracking-wider text-gray-500">
        Get started with TruPlat
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        {/* Role Selection - Compact */}
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-2">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: "CLIENT" }))
              }
              className={cn(
                "relative py-2.5 px-3 border text-center transition-all clip-notch-sm flex items-center justify-center gap-2",
                formData.role === "CLIENT"
                  ? "border-lime-500 bg-lime-500/10 text-lime-400"
                  : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600",
              )}
            >
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-medium">Lender</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: "APPRAISER" }))
              }
              className={cn(
                "relative py-2.5 px-3 border text-center transition-all clip-notch-sm flex items-center justify-center gap-2",
                formData.role === "APPRAISER"
                  ? "border-lime-500 bg-lime-500/10 text-lime-400"
                  : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600",
              )}
            >
              <User className="w-4 h-4" />
              <span className="text-xs font-medium">Appraiser</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            id="firstName"
            name="firstName"
            type="text"
            label="First Name"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            disabled={isLoading}
          />
          <Input
            id="lastName"
            name="lastName"
            type="text"
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            disabled={isLoading}
          />
        </div>

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          disabled={isLoading}
          leftIcon={<Mail className="w-5 h-5" />}
        />

        {formData.role === "CLIENT" && (
          <Input
            id="organizationName"
            name="organizationName"
            type="text"
            label="Organization Name"
            value={formData.organizationName}
            onChange={handleChange}
            placeholder="Your company name"
            disabled={isLoading}
            leftIcon={<Building2 className="w-5 h-5" />}
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min 8 chars"
            disabled={isLoading}
            leftIcon={<Lock className="w-4 h-4" />}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat"
            disabled={isLoading}
            leftIcon={<Lock className="w-4 h-4" />}
          />
        </div>

        <Button
          type="submit"
          variant="lime"
          size="md"
          disabled={isLoading}
          isLoading={isLoading}
          className="w-full"
        >
          {isLoading ? "Creating..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-4 text-xs text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-lime-400 hover:text-lime-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
