"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Check, Mail } from "lucide-react";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";

export function LeadCaptureSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    // Simulate API call - replace with actual endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For now, just show success
    setStatus("success");
    setEmail("");

    // Reset after 3 seconds
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          {/* Icon */}
          <div className="relative mx-auto w-16 h-16 bg-lime-500/10 clip-notch flex items-center justify-center mb-6 shadow-[inset_0_0_0_1px_theme(colors.lime.500/0.3)]">
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-lime-400" />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-lime-400" />
            <FileText className="w-8 h-8 text-lime-400" />
          </div>

          {/* Headline */}
          <p className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-2">
            Free Resource
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Get the Free Texas Market Report
          </h2>
          <p className="text-gray-400 mb-8">
            Q4 2025 property trends, hot markets, and valuation insights.
            Updated weekly.
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <div className="flex-1">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === "loading" || status === "success"}
                required
                leftIcon={<Mail className="w-5 h-5" />}
              />
            </div>
            <Button
              type="submit"
              variant="lime"
              disabled={status === "loading" || status === "success"}
              isLoading={status === "loading"}
              rightIcon={
                status === "success" ? (
                  <Check className="w-4 h-4" />
                ) : status !== "loading" ? (
                  <ArrowRight className="w-4 h-4" />
                ) : undefined
              }
            >
              {status === "loading"
                ? "Sending..."
                : status === "success"
                  ? "Sent!"
                  : "Download Now"}
            </Button>
          </form>

          {/* Social proof */}
          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-gray-500">
            Join 2,000+ real estate professionals. No spam, unsubscribe anytime.
          </p>

          {/* Success message */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mt-4 p-3 bg-lime-500/10 shadow-[inset_0_0_0_1px_theme(colors.lime.500/0.3)] clip-notch-sm text-lime-400 text-sm"
            >
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-lime-400" />
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-lime-400" />
              Check your inbox! The report is on its way.
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
