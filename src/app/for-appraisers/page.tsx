/**
 * For Appraisers Landing Page
 * TruPlat - Dedicated page for appraiser recruitment
 */

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/components/ui/Button";
import {
  TestimonialCarousel,
  CTASection,
  TrustBadges,
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
import { LedgerHeader } from "@/shared/components/layout/LedgerHeader";

export const metadata = {
  title: "Join TruPlat as an Appraiser | Earn $175-350 Per Job",
  description:
    "Join Texas's fastest-growing network of property appraisers. Accept jobs near you, work on your schedule, and get paid weekly.",
};

export default function ForAppraisersPage() {
  const navItems = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Clients", href: "/" },
    { label: "Docs", href: "/docs" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Ledger-style Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <LedgerHeader
          navItems={navItems}
          actionButtonText="APPLY NOW"
          actionButtonHref="/register?role=appraiser"
        />
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden bg-[var(--background)]">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left - Value Prop */}
            <div>
              <span className="inline-block px-4 py-1.5 font-mono text-xs uppercase tracking-wider bg-transparent border border-lime-400/50 text-lime-400 mb-6">
                Join 150+ Active Appraisers
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                Earn More.
                <br />
                <span className="text-lime-400">Work Smarter.</span>
              </h1>
              <p className="mt-6 text-xl text-gray-400">
                Join Texas&apos;s fastest-growing network of property
                appraisers. Accept jobs near you, work on your schedule, and get
                paid weekly.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/register?role=appraiser">
                  <Button variant="lime">Apply Now — It&apos;s Free</Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline">Learn How It Works</Button>
                </Link>
              </div>

              {/* Quick stats */}
              <div className="mt-10 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-lime-400" />
                  <span className="font-mono text-sm uppercase tracking-wider text-white">
                    $175-350 per job
                  </span>
                </div>
                <span className="w-px h-4 bg-gray-700 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-lime-400" />
                  <span className="font-mono text-sm uppercase tracking-wider text-white">
                    Weekly payouts
                  </span>
                </div>
                <span className="w-px h-4 bg-gray-700 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-lime-400" />
                  <span className="font-mono text-sm uppercase tracking-wider text-white">
                    Jobs near you
                  </span>
                </div>
              </div>
            </div>

            {/* Right - Earnings Showcase */}
            <div className="relative">
              <div className="relative bg-gray-900 border border-gray-800 p-6">
                {/* L-bracket corners */}
                <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-lime-400 pointer-events-none" />
                <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-lime-400 pointer-events-none" />
                <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-lime-400 pointer-events-none" />
                <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-lime-400 pointer-events-none" />

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-transparent border border-lime-400/50 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-lime-400" />
                  </div>
                  <div>
                    <p className="font-mono text-sm uppercase tracking-wider text-white">
                      Top Earner This Month
                    </p>
                    <p className="text-sm text-gray-500">Austin, TX area</p>
                  </div>
                </div>

                <div className="text-center py-6 border-y border-gray-800">
                  <p className="text-5xl font-bold text-lime-400">$4,250</p>
                  <p className="text-gray-500 mt-1 font-mono text-xs uppercase tracking-wider">
                    32 jobs completed
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <EarningsRow label="Average per job" value="$133" />
                  <EarningsRow label="Weekly average" value="$1,062" />
                  <EarningsRow label="Hours worked" value="~25/week" />
                </div>

                <p className="mt-6 text-xs text-gray-500 text-center font-mono uppercase tracking-wider">
                  * Earnings vary by location, job type, and availability
                </p>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-lime-400 text-black px-4 py-2 font-mono text-xs uppercase tracking-wider">
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
      <section className="py-20 bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-mono text-2xl uppercase tracking-wider text-white">
              Why Appraisers Choose TruPlat
            </h2>
            <p className="mt-4 text-gray-400">
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
      <section id="how-it-works" className="py-20 bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-mono text-2xl uppercase tracking-wider text-white">
              Start Earning in 4 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <section className="py-20 bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gray-900 border border-gray-800 p-8 md:p-12">
            {/* L-bracket corners */}
            <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lime-400 pointer-events-none" />
            <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-lime-400 pointer-events-none" />
            <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-lime-400 pointer-events-none" />
            <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-lime-400 pointer-events-none" />

            <div className="text-center mb-8">
              <h2 className="font-mono text-xl uppercase tracking-wider text-white">
                Requirements to Join
              </h2>
              <p className="mt-2 text-gray-400">
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
                <Button size="lg" variant="lime">
                  Apply Now — Takes 5 Minutes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialCarousel />

      {/* FAQ */}
      <section className="py-20 bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-mono text-2xl uppercase tracking-wider text-white">
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

      {/* Footer - Ledger Style */}
      <footer className="border-t border-gray-800 py-12 bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* TruPlat logo */}
              <Image src="/truplat.svg" alt="TruPlat" width={100} height={30} />
              <span className="w-px h-4 bg-gray-700" />
              <span className="font-mono text-xs uppercase tracking-wider text-gray-500">
                For Appraisers
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
                }}
              >
                Back to Home
              </Link>
              <span className="w-px h-3 bg-gray-700" />
              <Link
                href="/login"
                className="font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
                }}
              >
                Appraiser Login
              </Link>
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
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
    <div
      className="relative p-6 bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors duration-300"
      style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
    >
      {/* L-bracket corners */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/50 pointer-events-none" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-lime-400/50 pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-lime-400/50 pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/50 pointer-events-none" />

      <div className="w-12 h-12 bg-transparent border border-lime-400/50 flex items-center justify-center text-lime-400 mb-4">
        {icon}
      </div>
      <h3 className="font-mono text-sm uppercase tracking-wider text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-400">{description}</p>
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
    <div className="text-center p-6 bg-gray-900 border border-gray-800">
      <div className="w-10 h-10 mx-auto bg-transparent border border-lime-400 text-lime-400 flex items-center justify-center font-mono font-bold mb-4">
        {number}
      </div>
      <h4 className="font-mono text-sm uppercase tracking-wider text-white mb-2">
        {title}
      </h4>
      <p className="text-sm text-gray-400">{description}</p>
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
      <div className="w-16 h-16 mx-auto bg-transparent border border-lime-400/50 flex items-center justify-center text-lime-400 mb-4">
        {icon}
      </div>
      <h3 className="font-mono text-sm uppercase tracking-wider text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function EarningsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 font-mono text-xs uppercase tracking-wider">
        {label}
      </span>
      <span className="font-mono text-sm text-white">{value}</span>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border border-gray-800 bg-gray-900/50">
      <summary
        className="flex items-center justify-between cursor-pointer px-6 py-4 font-mono text-sm uppercase tracking-wider text-white hover:bg-gray-800/50 transition-colors duration-300"
        style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
      >
        {question}
        <span className="font-mono text-lime-400 text-xs group-open:hidden">
          [+]
        </span>
        <span className="font-mono text-lime-400 text-xs hidden group-open:inline">
          [-]
        </span>
      </summary>
      <div className="px-6 pb-4 text-gray-400 text-sm">{answer}</div>
    </details>
  );
}
