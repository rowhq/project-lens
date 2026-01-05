/**
 * Landing Page
 * TruPlat - Optimized for Conversion (11 sections)
 */

import Link from "next/link";
import Image from "next/image";
import {
  HeroSection,
  ComparisonTable,
  StatsBlock,
  CTASection,
  TrustBadges,
  StickyMobileCTA,
} from "@/modules/marketing/components";
import { LedgerHeader } from "@/shared/components/layout/LedgerHeader";
import { Button } from "@/shared/components/ui/Button";
import { PRICING } from "@/shared/config/constants";
import {
  Zap,
  Camera,
  Award,
  Check,
  Clock,
  ArrowRight,
  Gift,
} from "lucide-react";

export default function LandingPage() {
  const navItems = [
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Appraisers", href: "/for-appraisers" },
    { label: "Docs", href: "/docs" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Ledger-style Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <LedgerHeader
          navItems={navItems}
          actionButtonText="START FREE"
          actionButtonHref="/register"
        />
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-4">
              Simple Process
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get Your Valuation in 3 Steps
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              From address to professional report in minutes
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <StepCard
                number={1}
                title="Enter the Address"
                description="Paste any Texas address. We pull property data instantly."
              />
              <StepCard
                number={2}
                title="Pick Your Report"
                description={`Free (5/mo), AI ($${PRICING.AI_REPORT}), Verified ($${PRICING.ON_SITE}), or Certified ($${PRICING.CERTIFIED}). Pick what fits.`}
              />
              <StepCard
                number={3}
                title="Get Your Valuation"
                description="Download your PDF with comps, risk flags, and confidence score."
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats Block */}
      <StatsBlock />

      {/* 4. Trust Badges */}
      <div className="relative z-10 py-8">
        <TrustBadges />
      </div>

      {/* 5. Real Results (Comparison + Testimonials merged) */}
      <ComparisonTable />

      {/* 6. Pricing */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-4">
              Transparent Pricing
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Pick Your Speed
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              From instant AI to certified appraisals. Pay per report.
            </p>
          </div>

          {/* Pricing Cards - Popular elevated */}
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-center pt-6">
              {/* Free tier */}
              <PricingCard
                icon={Gift}
                tier="free"
                name="Starter"
                price={0}
                turnaround="5 min"
                useCase="Try before you buy"
                features={[
                  "5 AI Reports/month",
                  "Comparable analysis",
                  "Risk flags",
                  "PDF download",
                ]}
              />

              {/* AI Report - Basic tier */}
              <PricingCard
                icon={Zap}
                tier="fastest"
                name="AI Report"
                price={PRICING.AI_REPORT}
                turnaround="5 min"
                useCase="Quick decisions & deal screening"
                features={[
                  "Unlimited AI Reports",
                  "Comparable analysis",
                  "Risk flags",
                  "PDF download",
                ]}
              />

              {/* On-Site - Popular tier */}
              <PricingCard
                icon={Camera}
                tier="popular"
                name="Verified"
                price={PRICING.ON_SITE}
                turnaround="48 hrs"
                useCase="Refinancing & HELOCs"
                features={[
                  "Everything in AI Report",
                  "Physical inspection",
                  "Geotagged photos",
                  "Condition assessment",
                ]}
                popular
              />

              {/* Certified - Premium tier */}
              <PricingCard
                icon={Award}
                tier="premium"
                name="Certified"
                price={PRICING.CERTIFIED}
                turnaround="5-7 days"
                useCase="Purchase loans & litigation"
                features={[
                  "Everything in Verified",
                  "Licensed appraiser",
                  "USPAP compliant",
                  "Court admissible",
                ]}
              />
            </div>

            {/* Quick comparison bar */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 py-6 border-t border-gray-800">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Check className="w-4 h-4 text-lime-400" />
                <span>No subscriptions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Check className="w-4 h-4 text-lime-400" />
                <span>30-day money-back</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Check className="w-4 h-4 text-lime-400" />
                <span>Volume discounts available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-4">
              Common Questions
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Got Questions?
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            <FAQItem
              question="How accurate is the AI?"
              answer="95%+ accuracy within a 5% margin of final sale prices. Each report includes a confidence score for that specific property."
            />
            <FAQItem
              question="How quickly can someone visit the property?"
              answer="On-site inspections within 48 hours. Rush service available for 24-hour turnaround. Certified appraisals take 5-7 business days."
            />
            <FAQItem
              question="Will my bank accept this appraisal?"
              answer="Yes. Certified appraisals are prepared by state-licensed appraisers following USPAP guidelines. Accepted by banks, credit unions, and lenders across Texas."
            />
            <FAQItem
              question="What properties can you appraise?"
              answer="Single-family homes, condos, townhouses, small multi-family (2-4 units), commercial properties, and land across Texas."
            />
            <FAQItem
              question="What if I'm not satisfied?"
              answer="30-day money-back guarantee. Full refund, no questions asked."
            />
          </div>
        </div>
      </section>

      {/* 9. CTA Section */}
      <CTASection />

      {/* 10. Footer - Ledger Style */}
      <footer className="border-t border-gray-800 py-16 bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
            {/* Product */}
            <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-gray-500 mb-4">
                Product
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#how-it-works"
                    className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.85, 0, 0.15, 1)",
                    }}
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.85, 0, 0.15, 1)",
                    }}
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.85, 0, 0.15, 1)",
                    }}
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-gray-500 mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/docs#executive-summary"
                    className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.85, 0, 0.15, 1)",
                    }}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="mailto:careers@truplat.com"
                    className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.85, 0, 0.15, 1)",
                    }}
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="mailto:contact@truplat.com"
                    className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.85, 0, 0.15, 1)",
                    }}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-gray-500 mb-4">
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/docs"
                    className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.85, 0, 0.15, 1)",
                    }}
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/for-appraisers"
                    className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.85, 0, 0.15, 1)",
                    }}
                  >
                    For Appraisers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-gray-500 mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/docs#security"
                    className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.85, 0, 0.15, 1)",
                    }}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs#risks"
                    className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.85, 0, 0.15, 1)",
                    }}
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs#security"
                    className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.85, 0, 0.15, 1)",
                    }}
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-800">
            <div className="flex items-center">
              {/* TruPlat logo */}
              <Image src="/truplat.svg" alt="TruPlat" width={100} height={30} />
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
              &copy; {new Date().getFullYear()} TruPlat. All rights reserved.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-6">
              <Link
                href="https://x.com/truplat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors duration-300"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
                }}
              >
                <span className="sr-only">X (Twitter)</span>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link
                href="https://linkedin.com/company/truplat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors duration-300"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
                }}
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Mobile CTA */}
      <StickyMobileCTA />
    </div>
  );
}

// Local component definitions

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center group">
      <div className="relative w-14 h-14 mx-auto clip-notch-sm bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 font-mono text-xl font-bold mb-4">
        <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        {number}
      </div>
      <h3 className="font-mono text-sm uppercase tracking-wider text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function PricingCard({
  icon: Icon,
  tier,
  name,
  price,
  turnaround,
  useCase,
  features,
  popular,
}: {
  icon: React.ElementType;
  tier: "free" | "fastest" | "popular" | "premium";
  name: string;
  price: number;
  turnaround: string;
  useCase: string;
  features: string[];
  popular?: boolean;
}) {
  const tierColors = {
    free: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    fastest: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
    popular: "text-lime-400 bg-lime-400/10 border-lime-400/30",
    premium: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  };

  const tierLabels = {
    free: "Free",
    fastest: "Fastest",
    popular: "Best Value",
    premium: "Premium",
  };

  return (
    <div
      className={`relative ${popular ? "lg:scale-105 lg:-my-4" : ""}`}
      style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
    >
      {/* Popular badge - OUTSIDE clip-notch container */}
      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <span className="px-4 py-1.5 bg-lime-400 text-black font-mono text-xs uppercase tracking-wider clip-notch-sm">
            Most Popular
          </span>
        </div>
      )}

      <div
        className={`group relative bg-gray-900 clip-notch border transition-all duration-500 ${
          popular
            ? "border-lime-400 shadow-xl shadow-lime-400/10"
            : "border-gray-800 hover:border-gray-700"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
      >
        {/* Glow effect for popular */}
        {popular && (
          <div className="absolute -inset-px bg-gradient-to-b from-lime-400/20 to-transparent opacity-50 clip-notch pointer-events-none" />
        )}

        {/* L-bracket corners */}
        <span
          className={`absolute top-0 left-0 w-3 h-3 border-t border-l pointer-events-none transition-colors ${
            popular
              ? "border-lime-400"
              : "border-gray-700 group-hover:border-lime-400/50"
          }`}
        />
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r pointer-events-none transition-colors ${
            popular
              ? "border-lime-400"
              : "border-gray-700 group-hover:border-lime-400/50"
          }`}
        />

        {/* Content */}
        <div className="relative p-6 lg:p-8">
          {/* Header: Icon + Tier badge */}
          <div className="flex items-start justify-between mb-6">
            <div
              className={`w-12 h-12 clip-notch-sm flex items-center justify-center border ${tierColors[tier]}`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <span
              className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wider border clip-notch-sm ${tierColors[tier]}`}
            >
              {tierLabels[tier]}
            </span>
          </div>

          {/* Plan name */}
          <h3 className="font-mono text-xl uppercase tracking-wider text-white mb-2">
            {name}
          </h3>

          {/* Use case */}
          <p className="text-sm text-gray-400 mb-6">{useCase}</p>

          {/* Price + Turnaround hero */}
          <div className="flex items-end justify-between mb-6 pb-6 border-b border-gray-800">
            <div>
              {price === 0 ? (
                <>
                  <span className="text-4xl font-bold text-emerald-400">
                    Free
                  </span>
                  <span className="text-gray-500 font-mono text-sm">
                    {" "}
                    · 5/month
                  </span>
                </>
              ) : (
                <>
                  <span className="text-4xl font-bold text-white">
                    ${price}
                  </span>
                  <span className="text-gray-500 font-mono text-sm">
                    /report
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 clip-notch-sm">
              <Clock className="w-3.5 h-3.5 text-lime-400" />
              <span className="font-mono text-xs uppercase tracking-wider text-white">
                {turnaround}
              </span>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <Check
                  className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    index === 0 && feature.startsWith("Everything")
                      ? "text-lime-400"
                      : "text-gray-600"
                  }`}
                />
                <span
                  className={
                    index === 0 && feature.startsWith("Everything")
                      ? "text-lime-400 font-medium"
                      : "text-gray-400"
                  }
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link href="/register" className="block">
            <Button
              variant={popular ? "lime" : "outline"}
              size="md"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group clip-notch border border-gray-800 bg-gray-900">
      <summary
        className="flex items-center justify-between cursor-pointer px-6 py-4 font-mono text-sm uppercase tracking-wider text-white hover:bg-gray-800/50 transition-colors duration-300"
        style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
      >
        {question}
        <span className="font-mono text-lime-400 text-xs group-open:hidden">
          [+]
        </span>
        <span className="font-mono text-lime-400 text-xs hidden group-open:inline">
          [−]
        </span>
      </summary>
      <div className="px-6 pb-4 text-gray-400 text-sm">{answer}</div>
    </details>
  );
}
