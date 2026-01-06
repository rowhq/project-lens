"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden clip-notch-lg"
        >
          {/* Dark gradient background - Ledger style */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />

          {/* Grid Pattern Overlay - Ledger style */}
          <div className="absolute inset-0 grid-pattern opacity-50" />

          {/* L-bracket corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lime-400 z-10" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-lime-400 z-10" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-lime-400 z-10" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-lime-400 z-10" />

          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />

          {/* Content */}
          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center shadow-[inset_0_0_0_1px_theme(colors.gray.800)]">
            <p className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-4">
              Start Today
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Speed Up
              <br />
              <span className="text-lime-400">Your Lending?</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
              Join 500+ lenders who&apos;ve made the switch to faster, smarter
              valuations.
            </p>

            {/* Benefits - Ledger style badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] clip-notch-sm">
                <Zap className="w-4 h-4 text-lime-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-gray-300">
                  5-min AI Reports
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] clip-notch-sm">
                <Clock className="w-4 h-4 text-lime-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-gray-300">
                  48hr On-Site
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] clip-notch-sm">
                <Shield className="w-4 h-4 text-lime-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-gray-300">
                  Bank-Ready
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col items-center justify-center gap-3">
              <Link href="/register">
                <Button
                  variant="lime"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Free Trial
                </Button>
              </Link>
              <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
                3 free AI reports • No credit card required
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
