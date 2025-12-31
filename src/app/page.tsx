/**
 * Landing Page
 * TruPlat - Optimized for Conversion (11 sections)
 */

import Link from "next/link";
import {
  HeroSection,
  ComparisonTable,
  StatsBlock,
  TestimonialCarousel,
  CTASection,
  TrustBadges,
  StickyMobileCTA,
  VideoModal,
} from "@/modules/marketing/components";
import { Button } from "@/shared/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient">TruPlat</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#pricing"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/for-appraisers"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              For Appraisers
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Sign in
            </Link>
            <Link href="/register">
              <Button>Start Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* 1. Hero Section with Trust Badges */}
      <HeroSection />
      <div className="relative z-10 -mt-8 pb-8">
        <TrustBadges />
      </div>

      {/* 2. Stats Block */}
      <StatsBlock />

      {/* 3. How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Your Valuation in 3 Steps
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Get accurate property valuations faster than ever
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                number={1}
                title="Enter Property Address"
                description="Simply enter the property address and our system pulls in relevant property data automatically."
              />
              <StepCard
                number={2}
                title="Choose Your Report Type"
                description="Select from AI-only, on-site verification, or full certified appraisal based on your needs."
              />
              <StepCard
                number={3}
                title="Get Your Report"
                description="Receive your comprehensive valuation report with comparables, risk flags, and confidence scores."
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Video Demo Section */}
      <section className="py-16 bg-[var(--card)]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              See TruPlat in Action
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Watch how easy it is to get property valuations in minutes
            </p>
          </div>
          <VideoModal />
        </div>
      </section>

      {/* 5. Comparison Table */}
      <ComparisonTable />

      {/* 6. Testimonials */}
      <TestimonialCarousel />

      {/* 7. Pricing with Toggle */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 bg-[var(--gradient-glow)] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Three Plans. One Clear Mission.
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Pay only for what you need. No hidden fees. No commitments.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
            <PricingCard
              name="AI Report"
              price="$99"
              description="Instant AI-powered valuation"
              features={[
                "5-minute delivery",
                "Comparable analysis",
                "Risk assessment",
                "PDF report",
              ]}
            />
            <PricingCard
              name="On-Site Verification"
              price="$249"
              description="AI report + physical inspection"
              features={[
                "48-hour turnaround",
                "Geotagged photos",
                "Condition assessment",
                "Verified by appraiser",
              ]}
              popular
            />
            <PricingCard
              name="Certified Appraisal"
              price="$499"
              description="Full bank-compliant appraisal"
              features={[
                "Licensed appraiser",
                "USPAP compliant",
                "Court admissible",
                "E&O insured",
              ]}
            />
          </div>

          {/* Money-back guarantee */}
          <p className="text-center mt-8 text-sm text-[var(--muted-foreground)]">
            30-day money-back guarantee on all reports. No questions asked.
          </p>
        </div>
      </section>

      {/* 8. FAQ - Reduced to 5 key questions */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Quick Answers
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            <FAQItem
              question="How accurate are the AI valuations?"
              answer="Our AI model is trained on millions of Texas property transactions and achieves 95%+ accuracy within a 5% margin of final sale prices. Each report includes a confidence score so you know how reliable the estimate is for that specific property."
            />
            <FAQItem
              question="How fast can I get an on-site inspection?"
              answer="Standard on-site inspections are completed within 48 hours. For urgent needs, our Rush service delivers within 24 hours. Certified appraisals typically take 5-7 business days."
            />
            <FAQItem
              question="Are your certified appraisals bank-acceptable?"
              answer="Yes. Our certified appraisals are prepared by state-licensed appraisers following USPAP guidelines. They are accepted by banks, credit unions, and other regulated lenders across Texas."
            />
            <FAQItem
              question="What property types do you cover?"
              answer="We currently cover single-family homes, condos, townhouses, and small multi-family properties (2-4 units) across the state of Texas. Commercial property support is coming soon."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="Yes, we offer a 30-day money-back guarantee on all reports. If you're not satisfied with the quality of your report, we'll refund your purchase in full."
            />
          </div>
        </div>
      </section>

      {/* 9. CTA Section */}
      <CTASection />

      {/* 10. Footer */}
      <footer className="border-t border-[var(--border)] py-16 bg-[var(--card)]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Product */}
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-4">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#how-it-works"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    API Docs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-4">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/for-appraisers"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    For Appraisers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gradient">TruPlat</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              &copy; {new Date().getFullYear()} TruPlat. All rights reserved.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="w-5 h-5"
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
    <div className="text-center">
      <div className="w-16 h-16 mx-auto bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-[var(--primary)] text-2xl font-bold mb-4 border border-[var(--primary)]/20">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--muted-foreground)] text-sm">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  popular,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl border bg-[var(--card)] p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        popular
          ? "border-[var(--primary)] ring-2 ring-[var(--primary)]"
          : "border-[var(--border)] hover:border-[var(--primary)]/50"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--primary)] text-white text-sm font-medium rounded-full">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-semibold text-[var(--foreground)]">{name}</h3>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {description}
      </p>
      <div className="mt-6">
        <span className="text-4xl font-bold text-[var(--foreground)]">
          {price}
        </span>
        <span className="text-[var(--muted-foreground)]">/report</span>
      </div>
      <ul className="mt-8 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]"
          >
            <svg
              className="h-4 w-4 text-[var(--color-success)]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`mt-8 block w-full rounded-lg py-3 text-center font-semibold transition-colors ${
          popular
            ? "bg-[var(--primary)] text-white hover:bg-[var(--accent)]"
            : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]"
        }`}
      >
        Start Free
      </Link>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border border-[var(--border)] rounded-lg bg-[var(--card)]">
      <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg transition-colors">
        {question}
        <svg
          className="w-5 h-5 text-[var(--muted-foreground)] group-open:rotate-180 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </summary>
      <div className="px-6 pb-4 text-[var(--muted-foreground)]">{answer}</div>
    </details>
  );
}
