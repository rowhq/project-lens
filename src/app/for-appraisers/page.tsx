/**
 * For Appraisers Landing Page
 * TruPlat - Dedicated page for appraiser recruitment
 */

import Link from "next/link";
import { Button } from "@/shared/components/ui/Button";
import {
  TestimonialCarousel,
  CTASection,
  TrustBadges,
  StatsBlock,
} from "@/modules/marketing/components";
import {
  Check,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  Smartphone,
  Car,
} from "lucide-react";

export const metadata = {
  title: "Join TruPlat as an Appraiser | Earn $175-350 Per Job",
  description:
    "Join Texas's fastest-growing network of property appraisers. Accept jobs near you, work on your schedule, and get paid weekly.",
};

export default function ForAppraisersPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient">TruPlat</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Sign in
            </Link>
            <Link href="/register?role=appraiser">
              <Button>Apply Now</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-[var(--accent)]/10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Value Prop */}
            <div>
              <span className="inline-block px-3 py-1 text-sm font-medium bg-[var(--primary)]/10 text-[var(--primary)] rounded-full mb-4">
                Join 150+ Active Appraisers
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--foreground)]">
                Earn More.
                <br />
                <span className="text-gradient">Work Smarter.</span>
              </h1>
              <p className="mt-6 text-xl text-[var(--muted-foreground)]">
                Join Texas&apos;s fastest-growing network of property
                appraisers. Accept jobs near you, work on your schedule, and get
                paid weekly.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/register?role=appraiser">
                  <Button size="lg" className="w-full sm:w-auto">
                    Apply Now — It&apos;s Free
                  </Button>
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-lg hover:bg-[var(--secondary)] transition-colors"
                >
                  Learn How It Works
                </Link>
              </div>

              {/* Quick stats */}
              <div className="mt-10 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[var(--primary)]" />
                  <span className="text-[var(--foreground)] font-medium">
                    $175-350 per job
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[var(--primary)]" />
                  <span className="text-[var(--foreground)] font-medium">
                    Weekly payouts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[var(--primary)]" />
                  <span className="text-[var(--foreground)] font-medium">
                    Jobs near you
                  </span>
                </div>
              </div>
            </div>

            {/* Right - Earnings Showcase */}
            <div className="relative">
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[var(--primary)]" />
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
                <Check className="w-4 h-4 inline mr-1" />
                Verified Earnings
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="relative z-10 pb-8">
        <TrustBadges />
      </div>

      {/* Benefits Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Why Appraisers Choose TruPlat
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Join a platform designed for your success
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <BenefitCard
              icon={<DollarSign className="w-6 h-6" />}
              title="$175-350 per job"
              description="Competitive payouts for every inspection you complete"
            />
            <BenefitCard
              icon={<MapPin className="w-6 h-6" />}
              title="Jobs near you"
              description="Set your service area and radius — only see relevant jobs"
            />
            <BenefitCard
              icon={<Calendar className="w-6 h-6" />}
              title="Your schedule"
              description="Accept jobs when it works for you, decline when it doesn't"
            />
            <BenefitCard
              icon={<Clock className="w-6 h-6" />}
              title="Weekly payouts"
              description="Fast, reliable direct deposits every Friday"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[var(--card)]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Start Earning in 4 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <StepCard
              number={1}
              title="Apply Online"
              description="Submit your license info and set up your profile in minutes"
            />
            <StepCard
              number={2}
              title="Set Your Area"
              description="Choose your coverage radius and available hours"
            />
            <StepCard
              number={3}
              title="Accept Jobs"
              description="Get notified of nearby jobs and accept what works for you"
            />
            <StepCard
              number={4}
              title="Complete & Earn"
              description="Take photos, submit evidence, get paid weekly"
            />
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                Requirements to Join
              </h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                Get started if you meet these simple requirements
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <RequirementCard
                icon={<Shield className="w-8 h-8" />}
                title="Valid License"
                description="Texas appraiser license in good standing"
              />
              <RequirementCard
                icon={<Smartphone className="w-8 h-8" />}
                title="Smartphone"
                description="iPhone or Android with a quality camera"
              />
              <RequirementCard
                icon={<Car className="w-8 h-8" />}
                title="Transportation"
                description="Reliable vehicle to reach properties"
              />
            </div>

            <div className="text-center mt-10">
              <Link href="/register?role=appraiser">
                <Button size="lg">Apply Now — Takes 5 Minutes</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialCarousel />

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Common Questions
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            <FAQItem
              question="How do I get paid?"
              answer="Appraisers receive weekly direct deposits every Friday for all completed jobs. Payouts typically range from $175-$350 depending on job type and location."
            />
            <FAQItem
              question="How many jobs can I expect?"
              answer="Job availability depends on your location and service area. Appraisers in major metro areas (Austin, Dallas, Houston, San Antonio) typically see 5-15 jobs per week."
            />
            <FAQItem
              question="What equipment do I need?"
              answer="Just a smartphone with a good camera and reliable transportation. Our app guides you through each inspection with a checklist of required photos."
            />
            <FAQItem
              question="How long does approval take?"
              answer="Most applications are approved within 24-48 hours after license verification. You can start accepting jobs immediately after approval."
            />
            <FAQItem
              question="Can I choose which jobs I take?"
              answer="Absolutely. You control your schedule. Accept jobs that work for you, decline those that don't. No minimums required."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <CTASection />

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 bg-[var(--card)]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gradient">TruPlat</span>
              <span className="text-sm text-[var(--muted-foreground)]">
                For Appraisers
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                Back to Home
              </Link>
              <Link
                href="/login"
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                Appraiser Login
              </Link>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              &copy; {new Date().getFullYear()} TruPlat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Component definitions

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors">
      <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center text-[var(--primary)] mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
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
    <div className="text-center p-6 bg-[var(--card)] rounded-xl border border-[var(--border)]">
      <div className="w-10 h-10 mx-auto bg-[var(--primary)] text-white rounded-full flex items-center justify-center font-bold mb-4">
        {number}
      </div>
      <h4 className="font-semibold text-[var(--foreground)] mb-2">{title}</h4>
      <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}

function RequirementCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-[var(--primary)] mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-[var(--foreground)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
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
