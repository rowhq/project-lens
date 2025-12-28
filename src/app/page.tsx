/**
 * Landing Page
 * Project LENS - Texas V1
 */

import Link from "next/link";
import { ArrowRight, Zap, MapPin, Shield, Clock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">LENS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Appraisals in minutes.
              <br />
              <span className="text-blue-600">On-site in days.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              AI-powered property valuations for lenders and investors. Get
              comprehensive reports instantly, with on-site verification when
              you need it.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Run Your First Appraisal
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="text-base font-semibold text-gray-900 hover:text-gray-700"
              >
                Sign in <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built for speed. Designed for lenders.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to evaluate properties and make lending
              decisions faster.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Zap}
              title="AI Reports in Minutes"
              description="Get comprehensive valuations with comparables, risk flags, and confidence scores. No waiting weeks for results."
            />
            <FeatureCard
              icon={MapPin}
              title="On-Site Verification"
              description="Need eyes on the property? Our verified appraisers capture photos and condition notes within 48 hours."
            />
            <FeatureCard
              icon={Shield}
              title="Certified Appraisals"
              description="Upgrade to a bank-ready certified appraisal when compliance requires it. Licensed and audit-ready."
            />
            <FeatureCard
              icon={Clock}
              title="Real-Time Tracking"
              description="Track every step from request to delivery. Know exactly where your appraisal stands."
            />
            <FeatureCard
              icon={BarChart}
              title="Confidence Scores"
              description="Understand the reliability of every valuation with transparent confidence metrics and data sources."
            />
            <FeatureCard
              icon={FileText}
              title="PDF Reports"
              description="Professional reports ready to share with your team, borrowers, or underwriting committees."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to speed up your lending?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join lenders across Texas who are making faster, smarter decisions
              with LENS.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">LENS</span>
              <span className="text-sm text-gray-500">Texas V1</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Project LENS. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function BarChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function FileText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}
