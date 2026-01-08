"use client";

import { useState, useEffect, useRef } from "react";
import { PRICING, SUBSCRIPTION_PLANS } from "@/shared/config/constants";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "how-it-works", label: "How It Works" },
  { id: "products", label: "Products" },
  { id: "pricing", label: "Pricing" },
  { id: "for-appraisers", label: "For Appraisers" },
  { id: "data-sources", label: "Data Sources" },
  { id: "api", label: "API" },
  { id: "security", label: "Security" },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const isClickScrolling = useRef(false);

  useEffect(() => {
    const sectionIds = sections.map((s) => s.id);
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isClickScrolling.current) {
              setActiveSection(id);
            }
          });
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const handleSectionClick = (sectionId: string) => {
    isClickScrolling.current = true;
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <nav className="fixed left-0 top-16 bottom-0 w-56 border-r border-white/5 bg-black overflow-y-auto">
        <div className="p-4">
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => handleSectionClick(section.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    activeSection === section.id
                      ? "text-white bg-white/5"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Content */}
      <div className="ml-56 flex-1 max-w-3xl px-8 py-12">
        {/* Overview */}
        <section id="overview" className="mb-16 scroll-mt-20">
          <h1 className="text-3xl font-bold text-white mb-6">
            TruPlat Documentation
          </h1>

          <p className="text-gray-400 mb-6 leading-relaxed">
            TruPlat is a property valuation platform for Texas. We combine
            AI-powered instant reports with a network of licensed appraisers for
            certified valuations.
          </p>

          <h2 className="text-xl font-semibold text-white mb-4">What we do</h2>
          <ul className="text-gray-400 space-y-2 mb-6">
            <li>
              • AI valuations using 50+ data sources including MLS, permits, and
              infrastructure data
            </li>
            <li>• Certified appraisals from licensed Texas appraisers</li>
            <li>
              • Infrastructure growth signals (schools, roads, zoning changes)
            </li>
            <li>• Coverage across all 254 Texas counties</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mb-4">
            Who it&apos;s for
          </h2>
          <ul className="text-gray-400 space-y-2">
            <li>
              <strong className="text-white">Investors</strong> — Quick
              valuations before making offers
            </li>
            <li>
              <strong className="text-white">Lenders</strong> — Fast
              pre-approval valuations, certified appraisals for closing
            </li>
            <li>
              <strong className="text-white">Agents</strong> — Pricing guidance
              and client reports
            </li>
            <li>
              <strong className="text-white">Appraisers</strong> — Accept jobs,
              AI assists with report assembly
            </li>
          </ul>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mb-16 scroll-mt-20">
          <h1 className="text-2xl font-bold text-white mb-6">How It Works</h1>

          <h2 className="text-xl font-semibold text-white mb-4">
            For property reports
          </h2>
          <ol className="text-gray-400 space-y-3 mb-8 list-decimal list-inside">
            <li>Enter any Texas address</li>
            <li>Get instant AI valuation with growth signals</li>
            <li>Request certified appraisal if needed for lending</li>
          </ol>

          <h2 className="text-xl font-semibold text-white mb-4">
            For appraisers
          </h2>
          <ol className="text-gray-400 space-y-3 list-decimal list-inside">
            <li>Apply online with license information</li>
            <li>Set your coverage area and availability</li>
            <li>Accept jobs that work for your schedule</li>
            <li>Visit property, take photos, add field notes</li>
            <li>AI assembles report draft for your review</li>
            <li>Approve and submit, get paid weekly</li>
          </ol>
        </section>

        {/* Products */}
        <section id="products" className="mb-16 scroll-mt-20">
          <h1 className="text-2xl font-bold text-white mb-6">Products</h1>

          <h2 className="text-xl font-semibold text-white mb-3">AI Reports</h2>
          <p className="text-gray-400 mb-4">
            Instant valuations powered by 50+ data APIs. Includes property
            details, comparable sales, market analysis, and infrastructure
            growth signals. Best for quick decisions, pre-offers, and pricing
            guidance.
          </p>
          <ul className="text-gray-500 text-sm space-y-1 mb-8">
            <li>• Delivery: Instant</li>
            <li>• Included in subscription plans</li>
            <li>• PDF export available</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mb-3">
            On-Site Reports
          </h2>
          <p className="text-gray-400 mb-4">
            AI report plus property photos from a licensed appraiser visit.
            Verifies condition, upgrades, and features that affect value. Best
            for investment decisions and due diligence.
          </p>
          <ul className="text-gray-500 text-sm space-y-1 mb-8">
            <li>• Delivery: 48 hours</li>
            <li>• Price: ${PRICING.ON_SITE}</li>
            <li>• Includes interior/exterior photos</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mb-3">
            Certified Appraisals
          </h2>
          <p className="text-gray-400 mb-4">
            Full USPAP-compliant appraisal by a licensed Texas appraiser.
            Accepted by banks and lenders for mortgage origination and
            refinancing. Includes on-site inspection and formal opinion of
            value.
          </p>
          <ul className="text-gray-500 text-sm space-y-1">
            <li>• Delivery: 3-5 days</li>
            <li>• Price: ${PRICING.CERTIFIED}</li>
            <li>• USPAP compliant, bank-ready</li>
          </ul>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mb-16 scroll-mt-20">
          <h1 className="text-2xl font-bold text-white mb-6">Pricing</h1>

          <h2 className="text-xl font-semibold text-white mb-4">
            Subscription Plans
          </h2>
          <div className="text-gray-400 space-y-4 mb-8">
            <div>
              <strong className="text-white">Free</strong> — $0/month
              <p className="text-sm text-gray-500">
                5 AI reports/month, PDF export
              </p>
            </div>
            <div>
              <strong className="text-white">Pro</strong> — $
              {SUBSCRIPTION_PLANS.PROFESSIONAL.price}/month
              <p className="text-sm text-gray-500">
                {SUBSCRIPTION_PLANS.PROFESSIONAL.reportsPerMonth} AI
                reports/month, API access, priority support
              </p>
            </div>
            <div>
              <strong className="text-white">Enterprise</strong> — Custom
              pricing
              <p className="text-sm text-gray-500">
                Unlimited reports, white-label options, dedicated support, SLA
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white mb-4">
            One-time Reports
          </h2>
          <ul className="text-gray-400 space-y-2">
            <li>On-Site Report: ${PRICING.ON_SITE}</li>
            <li>Certified Appraisal: ${PRICING.CERTIFIED}</li>
          </ul>
        </section>

        {/* For Appraisers */}
        <section id="for-appraisers" className="mb-16 scroll-mt-20">
          <h1 className="text-2xl font-bold text-white mb-6">For Appraisers</h1>

          <p className="text-gray-400 mb-6">
            Join our network of licensed Texas appraisers. Accept jobs on your
            schedule, and let our AI co-pilot help assemble your reports.
          </p>

          <h2 className="text-xl font-semibold text-white mb-4">
            Requirements
          </h2>
          <ul className="text-gray-400 space-y-2 mb-6">
            <li>• Valid Texas appraiser license</li>
            <li>• Smartphone (iPhone or Android)</li>
            <li>• Reliable transportation</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mb-4">
            How it works
          </h2>
          <ol className="text-gray-400 space-y-2 mb-6 list-decimal list-inside">
            <li>Apply online — approval typically within 48 hours</li>
            <li>Set your coverage area and weekly availability</li>
            <li>Receive job notifications for properties in your area</li>
            <li>Accept jobs that fit your schedule</li>
            <li>Complete on-site visit, upload photos and notes</li>
            <li>AI generates report draft for your review</li>
            <li>Approve and submit</li>
            <li>Get paid weekly via direct deposit</li>
          </ol>

          <h2 className="text-xl font-semibold text-white mb-4">AI Co-pilot</h2>
          <p className="text-gray-400">
            Our AI assists with the time-consuming parts of report assembly. It
            organizes your photos, parses field notes, selects comparable sales,
            generates market analysis, and formats the final report. You review,
            make adjustments, and approve.
          </p>
        </section>

        {/* Data Sources */}
        <section id="data-sources" className="mb-16 scroll-mt-20">
          <h1 className="text-2xl font-bold text-white mb-6">Data Sources</h1>

          <p className="text-gray-400 mb-6">
            Our AI valuations aggregate data from 50+ sources to provide
            comprehensive property analysis.
          </p>

          <h2 className="text-xl font-semibold text-white mb-4">
            Property Data
          </h2>
          <ul className="text-gray-400 space-y-1 mb-6">
            <li>• MLS listings and sales records</li>
            <li>• County tax assessor records</li>
            <li>• Property characteristics and features</li>
            <li>• Historical sales data</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mb-4">
            Infrastructure Signals
          </h2>
          <p className="text-gray-400 mb-4">
            We scrape county documents daily to identify infrastructure changes
            that historically correlate with property appreciation:
          </p>
          <ul className="text-gray-400 space-y-1 mb-6">
            <li>• School construction and expansions</li>
            <li>• Road and highway projects</li>
            <li>• Zoning changes</li>
            <li>• Commercial development permits</li>
            <li>• Utility infrastructure</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mb-4">Market Data</h2>
          <ul className="text-gray-400 space-y-1">
            <li>• Neighborhood trends</li>
            <li>• Days on market</li>
            <li>• Price per square foot trends</li>
            <li>• Inventory levels</li>
          </ul>
        </section>

        {/* API */}
        <section id="api" className="mb-16 scroll-mt-20">
          <h1 className="text-2xl font-bold text-white mb-6">API</h1>

          <p className="text-gray-400 mb-6">
            Pro and Enterprise plans include API access for programmatic
            valuations.
          </p>

          <h2 className="text-xl font-semibold text-white mb-4">Endpoints</h2>
          <div className="font-mono text-sm space-y-4 mb-6">
            <div>
              <code className="text-lime-400">POST /api/v1/valuations</code>
              <p className="text-gray-500 mt-1">
                Generate AI valuation for an address
              </p>
            </div>
            <div>
              <code className="text-lime-400">GET /api/v1/valuations/:id</code>
              <p className="text-gray-500 mt-1">Retrieve valuation report</p>
            </div>
            <div>
              <code className="text-lime-400">
                GET /api/v1/properties/:address
              </code>
              <p className="text-gray-500 mt-1">
                Get property details and history
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white mb-4">
            Authentication
          </h2>
          <p className="text-gray-400 mb-4">
            API requests require a bearer token in the Authorization header:
          </p>
          <code className="text-sm text-gray-400 font-mono">
            Authorization: Bearer your_api_key
          </code>
        </section>

        {/* Security */}
        <section id="security" className="mb-16 scroll-mt-20">
          <h1 className="text-2xl font-bold text-white mb-6">Security</h1>

          <ul className="text-gray-400 space-y-3">
            <li>
              <strong className="text-white">Encryption</strong> — All data
              encrypted in transit (TLS 1.3) and at rest (AES-256)
            </li>
            <li>
              <strong className="text-white">Authentication</strong> — OAuth 2.0
              with optional MFA
            </li>
            <li>
              <strong className="text-white">Infrastructure</strong> — Hosted on
              Vercel with SOC 2 compliance
            </li>
            <li>
              <strong className="text-white">Data retention</strong> — Reports
              stored for 7 years per USPAP requirements
            </li>
            <li>
              <strong className="text-white">Access control</strong> —
              Role-based permissions, audit logging
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
