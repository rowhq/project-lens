/**
 * Landing Page
 * Project LENS - Redesigned for Maximum Conversion
 */

import Link from "next/link";
import {
  HeroSection,
  ComparisonTable,
  StatsBlock,
  FeatureShowcase,
  TestimonialCarousel,
  CTASection,
  TrustedBySection,
  TrustBadges,
  StickyMobileCTA,
  LeadCaptureSection,
  ROICalculator,
  VideoModal,
  CaseStudySection,
  ExitIntentPopup,
  SocialProofWidget,
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

      {/* Hero Section with Trust Badges */}
      <HeroSection />
      <div className="relative z-10 -mt-8 pb-8">
        <TrustBadges />
      </div>

      {/* Trusted By Section - Logo Wall */}
      <TrustedBySection />

      {/* Lead Capture - Free Report */}
      <LeadCaptureSection />

      {/* Stats Block */}
      <StatsBlock />

      {/* Video Demo Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              See LENS in Action
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Watch how easy it is to get property valuations in minutes
            </p>
          </div>
          <VideoModal />
        </div>
      </section>

      {/* Comparison Table */}
      <ComparisonTable />

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Features - Animated Showcase */}
      <FeatureShowcase />

      {/* Pricing with Toggle */}
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

          {/* Money-back guarantee */}
          <p className="text-center mt-8 text-sm text-[var(--muted-foreground)]">
            30-day money-back guarantee on all reports. No questions asked.
          </p>
        </div>
      </section>

      {/* Case Studies */}
      <CaseStudySection />

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

      {/* Appraiser Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--accent)]/5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Value Prop */}
            <div>
              <span className="inline-block px-3 py-1 text-sm font-medium bg-[var(--primary)]/10 text-[var(--primary)] rounded-full mb-4">
                For Appraisers
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                Earn More. Work Smarter.
              </h2>
              <p className="mt-4 text-lg text-[var(--muted-foreground)]">
                Join Texas&apos;s fastest-growing network of property
                appraisers. Accept jobs near you, work on your schedule, and get
                paid weekly.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <AppraiserBenefit
                  icon="💰"
                  title="$75-300+ per job"
                  description="Competitive payouts for inspections"
                />
                <AppraiserBenefit
                  icon="📍"
                  title="Jobs near you"
                  description="Set your service area and radius"
                />
                <AppraiserBenefit
                  icon="📅"
                  title="Your schedule"
                  description="Accept jobs when it works for you"
                />
                <AppraiserBenefit
                  icon="💳"
                  title="Weekly payouts"
                  description="Fast, reliable direct deposits"
                />
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register?role=appraiser"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-lg hover:bg-[var(--accent)] transition-colors"
                >
                  Apply Now — It&apos;s Free
                </Link>
                <Link
                  href="#appraiser-how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-lg hover:bg-[var(--secondary)] transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right - Earnings Showcase */}
            <div className="relative">
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      Top Earner This Month
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Austin, TX area
                    </p>
                  </div>
                </div>

                <div className="text-center py-6 border-y border-[var(--border)]">
                  <p className="text-5xl font-bold text-[var(--primary)]">
                    $4,250
                  </p>
                  <p className="text-[var(--muted-foreground)] mt-1">
                    32 jobs completed
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <EarningsRow label="Average per job" value="$133" />
                  <EarningsRow label="Weekly average" value="$1,062" />
                  <EarningsRow label="Hours worked" value="~25/week" />
                </div>

                <p className="mt-6 text-xs text-[var(--muted-foreground)] text-center">
                  * Earnings vary by location, job type, and availability
                </p>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                ✓ 150+ Active Appraisers
              </div>
            </div>
          </div>

          {/* How It Works for Appraisers */}
          <div id="appraiser-how-it-works" className="mt-20">
            <h3 className="text-2xl font-bold text-[var(--foreground)] text-center mb-12">
              How It Works for Appraisers
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <AppraiserStep
                number={1}
                title="Apply Online"
                description="Submit your license info and set up your profile in minutes"
              />
              <AppraiserStep
                number={2}
                title="Set Your Area"
                description="Choose your coverage radius and available hours"
              />
              <AppraiserStep
                number={3}
                title="Accept Jobs"
                description="Get notified of nearby jobs and accept what works for you"
              />
              <AppraiserStep
                number={4}
                title="Complete & Earn"
                description="Take photos, submit evidence, get paid weekly"
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="mt-16 bg-[var(--card)] rounded-xl border border-[var(--border)] p-8">
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-6 text-center">
              Requirements
            </h3>
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <RequirementItem icon="🪪" text="Valid Texas appraiser license" />
              <RequirementItem icon="📱" text="Smartphone with camera" />
              <RequirementItem icon="🚗" text="Reliable transportation" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Animated Carousel */}
      <TestimonialCarousel />

      {/* FAQ - Expanded */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-[var(--muted-foreground)]">
              Everything you need to know about LENS
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {/* Product & Features */}
            <FAQItem
              question="How accurate are the AI valuations?"
              answer="Our AI model is trained on millions of Texas property transactions and achieves 95%+ accuracy within a 5% margin of final sale prices. Each report includes a confidence score so you know how reliable the estimate is for that specific property."
            />
            <FAQItem
              question="How fast can I get an on-site inspection?"
              answer="Standard on-site inspections are completed within 48 hours. For urgent needs, our Rush service delivers within 24 hours. Certified appraisals typically take 5-7 business days."
            />
            <FAQItem
              question="What property types do you cover?"
              answer="We currently cover single-family homes, condos, townhouses, and small multi-family properties (2-4 units) across the state of Texas. Commercial property support is coming soon."
            />

            {/* Compliance & Security */}
            <FAQItem
              question="Are your certified appraisals bank-acceptable?"
              answer="Yes. Our certified appraisals are prepared by state-licensed appraisers following USPAP guidelines. They are accepted by banks, credit unions, and other regulated lenders across Texas."
            />
            <FAQItem
              question="How do you protect my data?"
              answer="We're SOC 2 Type II certified and use bank-grade encryption for all data. Your property information and reports are stored securely and never shared with third parties without your consent."
            />

            {/* Pricing & Billing */}
            <FAQItem
              question="Are there any hidden fees?"
              answer="No hidden fees, ever. The price you see is the price you pay. Volume discounts are available for teams ordering 10+ reports per month."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="Yes, we offer a 30-day money-back guarantee on all reports. If you're not satisfied with the quality of your report, we'll refund your purchase in full."
            />

            {/* For Appraisers */}
            <FAQItem
              question="How do appraisers get paid?"
              answer="Appraisers receive weekly direct deposits every Friday for all completed jobs. Payouts typically range from $75-$300 depending on property type and location."
            />
            <FAQItem
              question="Can I white-label reports for my borrowers?"
              answer="Enterprise customers can customize reports with their company branding. Contact our sales team to learn more about white-label options."
            />
            <FAQItem
              question="What areas do you serve?"
              answer="We currently serve the entire state of Texas, with our largest networks in Austin, Dallas, Houston, San Antonio, and Fort Worth. More states coming in 2025."
            />
          </div>
        </div>
      </section>

      {/* CTA - Animated Section */}
      <CTASection />

      {/* Footer - Improved */}
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
                    href="#features"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Features
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
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Integrations
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
                    Press
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
                    Blog
                  </Link>
                </li>
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
                    href="#"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?role=appraiser"
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
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gradient">LENS</span>
              <span className="text-sm text-[var(--muted-foreground)]">
                Texas V1
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              &copy; {new Date().getFullYear()} Project LENS. All rights
              reserved.
            </p>
            {/* Social links placeholder */}
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

      {/* Floating Components */}
      <StickyMobileCTA />
      <SocialProofWidget />
      <ExitIntentPopup />
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

function AppraiserBenefit({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-[var(--card)] rounded-lg border border-[var(--border)]">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-semibold text-[var(--foreground)]">{title}</p>
        <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
      </div>
    </div>
  );
}

function EarningsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <span className="font-semibold text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function AppraiserStep({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 bg-[var(--card)] rounded-xl border border-[var(--border)]">
      <div className="w-10 h-10 mx-auto bg-[var(--primary)] text-white rounded-full flex items-center justify-center font-bold mb-4">
        {number}
      </div>
      <h4 className="font-semibold text-[var(--foreground)] mb-2">{title}</h4>
      <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}

function RequirementItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 justify-center">
      <span className="text-2xl">{icon}</span>
      <span className="text-[var(--muted-foreground)]">{text}</span>
    </div>
  );
}
