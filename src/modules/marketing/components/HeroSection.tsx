"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-[var(--gradient-hero)]"
        aria-hidden="true"
      />

      {/* Glow effect */}
      <div
        className="absolute inset-0 bg-[var(--gradient-glow)]"
        aria-hidden="true"
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 108, 243, 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 108, 243, 0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-sm text-[var(--color-navy-300)]">
            AI-Powered Appraisals Now Available in Texas
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="text-[var(--foreground)]">Fast Appraisals</span>
          <br />
          <span className="text-gradient">for Modern Lenders</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-[var(--muted-foreground)] max-w-3xl mx-auto mb-10">
          AI-powered valuations in minutes. On-site verification in days.
          <br className="hidden sm:block" />
          Built for the speed of modern lending.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-6 glow">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
            <Zap className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm text-[var(--foreground)]">24hr Turnaround</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
            <Shield className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm text-[var(--foreground)]">USPAP Compliant</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
            <Clock className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm text-[var(--foreground)]">Real-time Updates</span>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}

export default HeroSection;
