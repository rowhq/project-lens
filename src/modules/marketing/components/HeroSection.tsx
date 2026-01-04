"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[var(--background)]">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(163, 230, 53, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(163, 230, 53, 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 clip-notch-sm border border-lime-400/30 mb-8">
          <span className="w-1.5 h-1.5 bg-lime-400 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-wider text-gray-400">
            Now Live in Texas
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="text-white">Property Values</span>
          <br />
          <span className="text-lime-400">in Minutes, Not Weeks</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
          From address to value in 5 minutes.
          <br className="hidden sm:block" />
          Close deals faster. Decide with confidence.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col items-center justify-center gap-3 mb-16">
          <Link href="/register">
            <Button
              variant="lime"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Start Free Trial
            </Button>
          </Link>
          <span className="font-mono text-xs uppercase tracking-wider text-gray-500">
            3 free AI reports included
          </span>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 clip-notch-sm border border-gray-800 bg-gray-900/50">
            <Zap className="w-4 h-4 text-lime-400" />
            <span className="font-mono text-xs uppercase tracking-wider text-white">
              5-min AI Reports
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 clip-notch-sm border border-gray-800 bg-gray-900/50">
            <Shield className="w-4 h-4 text-lime-400" />
            <span className="font-mono text-xs uppercase tracking-wider text-white">
              USPAP Compliant
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 clip-notch-sm border border-gray-800 bg-gray-900/50">
            <Clock className="w-4 h-4 text-lime-400" />
            <span className="font-mono text-xs uppercase tracking-wider text-white">
              48hr On-Site
            </span>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}

export default HeroSection;
