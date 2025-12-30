/**
 * Landing Page
 * Project LENS - Dark + Blue Theme
 */

import Link from "next/link";
import {
  HeroSection,
  ComparisonTable,
  StatsBlock,
  FeatureShowcase,
  TestimonialCarousel,
  CTASection
} from "@/modules/marketing/components";
import { Button } from "@/shared/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient">LENS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Sign in
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Block */}
      <StatsBlock />

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Features - Animated Showcase */}
      <FeatureShowcase />

      {/* Pricing */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[var(--gradient-glow)] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Pay only for what you need. No hidden fees. No commitments.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
            <PricingCard
              name="AI Report"
              price="$29"
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
              price="$149"
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
              price="$449"
              description="Full bank-compliant appraisal"
              features={[
                "Licensed appraiser",
                "USPAP compliant",
                "Court admissible",
                "E&O insured",
              ]}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Get property valuations in three simple steps
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

      {/* Testimonials - Animated Carousel */}
      <TestimonialCarousel />

      {/* FAQ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Frequently Asked Questions
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
              question="Can I white-label reports for my borrowers?"
              answer="Enterprise customers can customize reports with their company branding. Contact our sales team to learn more about white-label options."
            />
          </div>
        </div>
      </section>

      {/* CTA - Animated Section */}
      <CTASection />

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gradient">LENS</span>
              <span className="text-sm text-[var(--muted-foreground)]">Texas V1</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              &copy; {new Date().getFullYear()} Project LENS. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-[var(--muted-foreground)] text-sm">
        {description}
      </p>
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
      className={`relative rounded-xl border bg-[var(--card)] p-8 ${
        popular ? "border-[var(--primary)] ring-2 ring-[var(--primary)]" : "border-[var(--border)]"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--primary)] text-white text-sm font-medium rounded-full">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-semibold text-[var(--foreground)]">{name}</h3>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p>
      <div className="mt-6">
        <span className="text-4xl font-bold text-[var(--foreground)]">{price}</span>
        <span className="text-[var(--muted-foreground)]">/report</span>
      </div>
      <ul className="mt-8 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <svg className="h-4 w-4 text-[var(--color-success)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
        Get Started
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-6 pb-4 text-[var(--muted-foreground)]">
        {answer}
      </div>
    </details>
  );
}
