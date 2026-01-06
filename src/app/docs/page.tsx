"use client";

import { useState, useEffect, useRef } from "react";
import {
  PRICING,
  SUBSCRIPTION_PLANS,
  PAYOUT_RATES,
} from "@/shared/config/constants";
import {
  Zap,
  Camera,
  Award,
  Users,
  Shield,
  Map,
  CheckCircle,
  Database,
  Globe,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Briefcase,
  Settings,
  Lock,
  Server,
  BarChart3,
  Rocket,
  AlertTriangle,
  Calendar,
  Building2,
  PieChart,
  ArrowUpRight,
  Minus,
  FileText,
  Clock,
} from "lucide-react";

// Navigation sections - Organized for CEO/Executive review
const sections = [
  // Executive & Business
  {
    id: "executive-summary",
    label: "Executive Summary",
    icon: FileText,
    category: "business",
  },
  {
    id: "what-is-truplat",
    label: "What is TruPlat?",
    icon: Building2,
    category: "business",
  },
  {
    id: "business-model",
    label: "Business Model",
    icon: DollarSign,
    category: "business",
  },
  {
    id: "market-analysis",
    label: "Market Analysis",
    icon: PieChart,
    category: "business",
  },
  {
    id: "go-to-market",
    label: "Go-to-Market",
    icon: Rocket,
    category: "business",
  },
  {
    id: "financials",
    label: "Financial Projections",
    icon: BarChart3,
    category: "business",
  },
  {
    id: "risks",
    label: "Risk Analysis",
    icon: AlertTriangle,
    category: "business",
  },
  {
    id: "roadmap",
    label: "Platform Status",
    icon: Calendar,
    category: "business",
  },
  // Product & Technical
  {
    id: "pricing",
    label: "Pricing",
    icon: DollarSign,
    category: "product",
  },
  { id: "features", label: "Core Features", icon: Zap, category: "product" },
  { id: "workflow", label: "Workflows", icon: TrendingUp, category: "product" },
  { id: "users", label: "User Roles", icon: Users, category: "product" },
  {
    id: "architecture",
    label: "Architecture",
    icon: Server,
    category: "technical",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Globe,
    category: "technical",
  },
  {
    id: "database",
    label: "Database Schema",
    icon: Database,
    category: "technical",
  },
  { id: "security", label: "Security", icon: Shield, category: "technical" },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("executive-summary");
  const isClickScrolling = useRef(false);

  // Scroll spy - detect which section is visible
  useEffect(() => {
    const sectionIds = sections.map((s) => s.id);
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Only update if not currently click-scrolling and section is intersecting
            if (entry.isIntersecting && !isClickScrolling.current) {
              setActiveSection(id);
            }
          });
        },
        {
          rootMargin: "-20% 0px -70% 0px", // Trigger when section is in top 30% of viewport
          threshold: 0,
        },
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // Handle sidebar click with smooth scroll
  const handleSectionClick = (sectionId: string) => {
    isClickScrolling.current = true;
    setActiveSection(sectionId);

    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });

    // Re-enable scroll spy after animation completes
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);
  };

  // Unit Economics calculations (real costs based on API research)
  // RapidCanvas: ~$0.50 (flat monthly fee ÷ volume)
  // OpenAI GPT-4o: ~$0.03 (800 input + 2000 output tokens)
  // ATTOM Data: ~$0.30 (~10 API reports × $0.03)
  // PDF/Infra: ~$0.02
  // Total: ~$0.85, using $1 as conservative buffer
  const aiReportCost = 1;
  const aiReportPrice = PRICING.AI_REPORT;
  const aiReportMargin = (
    ((aiReportPrice - aiReportCost) / aiReportPrice) *
    100
  ).toFixed(0);

  const onSiteCost = aiReportCost + PAYOUT_RATES.ON_SITE.base; // API + Appraiser payout
  const onSitePrice = PRICING.ON_SITE;
  const onSiteMargin = (
    ((onSitePrice - onSiteCost) / onSitePrice) *
    100
  ).toFixed(0);

  const certifiedCost = aiReportCost + PAYOUT_RATES.CERTIFIED.base;
  const certifiedPrice = PRICING.CERTIFIED;
  const certifiedMargin = (
    ((certifiedPrice - certifiedCost) / certifiedPrice) *
    100
  ).toFixed(0);

  return (
    <div className="flex">
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-16 bottom-0 w-56 lg:w-64 xl:w-72 border-r border-gray-800 bg-gray-950 overflow-y-auto">
        <div className="p-4">
          {/* Business Sections */}
          <h2 className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-3 mt-2">
            Business & Strategy
          </h2>
          <ul className="space-y-1 mb-6">
            {sections
              .filter((s) => s.category === "business")
              .map((section) => {
                const Icon = section.icon;
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded ${
                        activeSection === section.id
                          ? "text-lime-400 bg-lime-400/10"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  </li>
                );
              })}
          </ul>

          {/* Product Sections */}
          <h2 className="font-mono text-xs uppercase tracking-wider text-cyan-400 mb-3">
            Product
          </h2>
          <ul className="space-y-1 mb-6">
            {sections
              .filter((s) => s.category === "product")
              .map((section) => {
                const Icon = section.icon;
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded ${
                        activeSection === section.id
                          ? "text-cyan-400 bg-cyan-400/10"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  </li>
                );
              })}
          </ul>

          {/* Technical Sections */}
          <h2 className="font-mono text-xs uppercase tracking-wider text-amber-400 mb-3">
            Technical
          </h2>
          <ul className="space-y-1">
            {sections
              .filter((s) => s.category === "technical")
              .map((section) => {
                const Icon = section.icon;
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded ${
                        activeSection === section.id
                          ? "text-amber-400 bg-amber-400/10"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="ml-56 lg:ml-64 xl:ml-72 flex-1 max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="mb-16">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <span>TruPlat</span>
            <ChevronRight className="w-4 h-4" />
            <span>Product Documentation</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            TruPlat Product Documentation
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            Complete business, product, and technical documentation for
            executive review and approval.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="px-3 py-1 bg-lime-400/10 text-lime-400 font-mono text-xs uppercase tracking-wider rounded border border-lime-400/30">
              Version 1.0
            </span>
            <span className="px-3 py-1 bg-cyan-400/10 text-cyan-400 font-mono text-xs uppercase tracking-wider rounded border border-cyan-400/30">
              Texas Market Launch
            </span>
            <span className="px-3 py-1 bg-amber-400/10 text-amber-400 font-mono text-xs uppercase tracking-wider rounded border border-amber-400/30">
              Q1 2026
            </span>
          </div>
        </div>

        {/* ==================== EXECUTIVE SUMMARY ==================== */}
        <section id="executive-summary" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={FileText}
            title="Executive Summary"
            subtitle="High-level overview for decision makers"
            color="lime"
          />

          {/* One-liner */}
          <div className="bg-gradient-to-r from-lime-400/10 to-transparent border-l-4 border-lime-400 p-6 mb-8">
            <p className="text-xl text-white font-medium">
              TruPlat is a property valuation platform that combines AI with
              licensed appraisers to deliver valuation reports 10x faster and
              70% cheaper than the traditional process.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="SAM (Texas)"
              value="$2.1B"
              change="+8% YoY"
              positive
            />
            <MetricCard
              label="Gross Margin"
              value={`${aiReportMargin}%`}
              sublabel="AI Reports"
            />
            <MetricCard
              label="CAC Target"
              value="$45"
              sublabel="Per customer"
            />
            <MetricCard
              label="LTV:CAC"
              value="20:1"
              sublabel="Target ratio"
              positive
            />
          </div>

          {/* Value Proposition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="w-10 h-10 bg-lime-400/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-lime-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Speed</h4>
              <p className="text-gray-400 text-sm">
                Instant AI Reports (~30 sec) vs 2-3 weeks for traditional
                process. On-Site verification in 48 hours.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5 text-cyan-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Price</h4>
              <p className="text-gray-400 text-sm">
                Subscriptions from $0/month with AI Reports included vs $400-600
                for a traditional valuation.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Reliability
              </h4>
              <p className="text-gray-400 text-sm">
                USPAP-compliant certified valuations with licensed appraisers in
                Texas.
              </p>
            </div>
          </div>

          {/* Problem / Solution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                The Problem
              </h4>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  Traditional valuations take 2-4 weeks
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  Average cost $400-600 per valuation
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  Appraiser shortage (40% retiring in 10 years)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  Manual, inconsistent, and opaque process
                </li>
              </ul>
            </div>
            <div className="bg-lime-500/5 border border-lime-500/20 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-lime-400 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Our Solution
              </h4>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  Instant AI Reports (~30 sec) included in subscription
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  Verified reports with photos in 48 hours (${PRICING.ON_SITE})
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  USPAP Certified appraisals in 3 days (${PRICING.CERTIFIED})
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 mt-1">•</span>
                  Appraiser marketplace with automated dispatch
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ==================== WHAT IS TRUPLAT ==================== */}
        <section id="what-is-truplat" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={Building2}
            title="What is TruPlat?"
            subtitle="Complete product overview and how it works"
            color="lime"
          />

          {/* Product Definition */}
          <div className="bg-gradient-to-r from-cyan-400/10 to-lime-400/10 border border-cyan-400/20 rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              The AI-Powered Property Valuation Platform
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              TruPlat is a{" "}
              <span className="text-lime-400 font-semibold">
                hybrid AI + human
              </span>{" "}
              property valuation platform that delivers professional-grade
              appraisals at a fraction of the traditional cost and time. We
              combine cutting-edge machine learning models with a network of
              licensed Texas appraisers to serve real estate investors, mortgage
              professionals, and property owners.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-400 mb-2">3</div>
                <div className="text-gray-400 text-sm">Product Tiers</div>
                <div className="text-gray-500 text-xs">
                  AI → Verified → Certified
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-lime-400 mb-2">254</div>
                <div className="text-gray-400 text-sm">Texas Counties</div>
                <div className="text-gray-500 text-xs">Full state coverage</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-400 mb-2">
                  USPAP
                </div>
                <div className="text-gray-400 text-sm">Compliant</div>
                <div className="text-gray-500 text-xs">
                  Lender & court ready
                </div>
              </div>
            </div>
          </div>

          {/* How It Works - User Journey */}
          <h3 className="text-xl font-semibold text-white mb-4">
            How It Works
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center text-black font-bold">
                1
              </div>
              <h4 className="text-white font-semibold mb-2 mt-2">
                Enter Address
              </h4>
              <p className="text-gray-400 text-sm">
                Search any Texas property by address or use our interactive map
                to select a parcel.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-lime-400 rounded-full flex items-center justify-center text-black font-bold">
                2
              </div>
              <h4 className="text-white font-semibold mb-2 mt-2">
                Choose Report Type
              </h4>
              <p className="text-gray-400 text-sm">
                Select AI Report (instant), Verified (48hr with photos), or
                Certified (USPAP compliant).
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-black font-bold">
                3
              </div>
              <h4 className="text-white font-semibold mb-2 mt-2">We Process</h4>
              <p className="text-gray-400 text-sm">
                Our AI analyzes data, finds comps, and (if needed) dispatches a
                licensed appraiser.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-black font-bold">
                4
              </div>
              <h4 className="text-white font-semibold mb-2 mt-2">Get Report</h4>
              <p className="text-gray-400 text-sm">
                Download your professional PDF report with valuation, comps, and
                analysis.
              </p>
            </div>
          </div>

          {/* What's in a Report */}
          <h3 className="text-xl font-semibold text-white mb-4">
            What&apos;s in a TruPlat Report?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="text-cyan-400 font-mono text-sm mb-4">
                VALUATION ANALYSIS
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white">Estimated Market Value</span>
                    <span className="text-gray-500 block text-xs">
                      AI-powered valuation with confidence score
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white">Value Range</span>
                    <span className="text-gray-500 block text-xs">
                      Low-to-high estimate with statistical basis
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white">Price per Sq Ft Analysis</span>
                    <span className="text-gray-500 block text-xs">
                      Compared to neighborhood averages
                    </span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="text-lime-400 font-mono text-sm mb-4">
                COMPARABLE SALES
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white">
                      5-10 Comparable Properties
                    </span>
                    <span className="text-gray-500 block text-xs">
                      Recent sales with similarity scores
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white">Adjustment Grid</span>
                    <span className="text-gray-500 block text-xs">
                      Size, age, condition, location factors
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white">Map Visualization</span>
                    <span className="text-gray-500 block text-xs">
                      Geographic context of comps
                    </span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="text-amber-400 font-mono text-sm mb-4">
                PROPERTY DETAILS
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white">Property Characteristics</span>
                    <span className="text-gray-500 block text-xs">
                      Beds, baths, sqft, lot size, year built
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white">Tax & Legal Info</span>
                    <span className="text-gray-500 block text-xs">
                      Parcel ID, zoning, tax assessment
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white">
                      Photos (Verified/Certified)
                    </span>
                    <span className="text-gray-500 block text-xs">
                      Geotagged interior/exterior images
                    </span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="text-purple-400 font-mono text-sm mb-4">
                MARKET INTELLIGENCE
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white">Market Trends</span>
                    <span className="text-gray-500 block text-xs">
                      1/3/5 year appreciation rates
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white">Risk Assessment</span>
                    <span className="text-gray-500 block text-xs">
                      Flood zone, market volatility flags
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white">AI Narrative Summary</span>
                    <span className="text-gray-500 block text-xs">
                      Investment potential analysis
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Key Differentiators */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Why TruPlat?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-b from-cyan-400/10 to-transparent border border-cyan-400/20 rounded-lg p-6">
              <Zap className="w-8 h-8 text-cyan-400 mb-4" />
              <h4 className="text-white font-semibold mb-2">Speed</h4>
              <p className="text-gray-400 text-sm">
                AI Reports in &lt;1 minute. Verified in 48 hours. 10x faster
                than traditional 2-4 week appraisals.
              </p>
            </div>
            <div className="bg-gradient-to-b from-lime-400/10 to-transparent border border-lime-400/20 rounded-lg p-6">
              <DollarSign className="w-8 h-8 text-lime-400 mb-4" />
              <h4 className="text-white font-semibold mb-2">Cost</h4>
              <p className="text-gray-400 text-sm">
                Free tier with 5 AI reports/month. Pro plans from $99/month.
                Save vs $400-600 traditional appraisals.
              </p>
            </div>
            <div className="bg-gradient-to-b from-amber-400/10 to-transparent border border-amber-400/20 rounded-lg p-6">
              <Award className="w-8 h-8 text-amber-400 mb-4" />
              <h4 className="text-white font-semibold mb-2">Quality</h4>
              <p className="text-gray-400 text-sm">
                USPAP-compliant certified appraisals accepted by lenders and
                courts. Licensed Texas appraisers.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== BUSINESS MODEL ==================== */}
        <section id="business-model" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={DollarSign}
            title="Business Model"
            subtitle="Revenue streams, unit economics, and margins"
            color="lime"
          />

          {/* Revenue Model Summary */}
          <div className="bg-gradient-to-r from-lime-400/10 to-transparent border-l-4 border-lime-400 p-6 mb-8">
            <p className="text-gray-300">
              <span className="text-white font-semibold">Revenue model:</span>{" "}
              60% from subscriptions, 25% from On-Site add-ons, 15% from
              Certified add-ons. See{" "}
              <button
                onClick={() => handleSectionClick("pricing")}
                className="text-lime-400 hover:underline"
              >
                Pricing section
              </button>{" "}
              for full details.
            </p>
          </div>

          {/* Unit Economics */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Unit Economics
          </h3>
          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 text-gray-500 font-mono text-xs uppercase">
                    Product
                  </th>
                  <th className="text-right py-3 text-gray-500 font-mono text-xs uppercase">
                    Price
                  </th>
                  <th className="text-right py-3 text-gray-500 font-mono text-xs uppercase">
                    COGS
                  </th>
                  <th className="text-right py-3 text-gray-500 font-mono text-xs uppercase">
                    Gross Margin
                  </th>
                  <th className="text-right py-3 text-gray-500 font-mono text-xs uppercase">
                    Margin %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-white">AI Report</span>
                    </div>
                  </td>
                  <td className="text-right text-white font-mono">
                    ${aiReportPrice}
                  </td>
                  <td className="text-right text-gray-400 font-mono">
                    ${aiReportCost}
                  </td>
                  <td className="text-right text-lime-400 font-mono">
                    ${aiReportPrice - aiReportCost}
                  </td>
                  <td className="text-right">
                    <span className="px-2 py-1 bg-lime-400/10 text-lime-400 rounded text-sm font-mono">
                      {aiReportMargin}%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-lime-400" />
                      <span className="text-white">On-Site Verification</span>
                    </div>
                  </td>
                  <td className="text-right text-white font-mono">
                    ${onSitePrice}
                  </td>
                  <td className="text-right text-gray-400 font-mono">
                    ${onSiteCost}
                  </td>
                  <td className="text-right text-lime-400 font-mono">
                    ${onSitePrice - onSiteCost}
                  </td>
                  <td className="text-right">
                    <span className="px-2 py-1 bg-lime-400/10 text-lime-400 rounded text-sm font-mono">
                      {onSiteMargin}%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-white">Certified Appraisal</span>
                    </div>
                  </td>
                  <td className="text-right text-white font-mono">
                    ${certifiedPrice}
                  </td>
                  <td className="text-right text-gray-400 font-mono">
                    ${certifiedCost}
                  </td>
                  <td className="text-right text-lime-400 font-mono">
                    ${certifiedPrice - certifiedCost}
                  </td>
                  <td className="text-right">
                    <span className="px-2 py-1 bg-lime-400/10 text-lime-400 rounded text-sm font-mono">
                      {certifiedMargin}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* COGS Breakdown */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Cost Structure (COGS)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h5 className="text-sm text-gray-500 mb-2">AI Report Costs</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-400">RapidCanvas API</span>
                  <span className="text-white font-mono">$0.50</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">OpenAI GPT-4o</span>
                  <span className="text-white font-mono">$0.03</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">ATTOM Data</span>
                  <span className="text-white font-mono">$0.30</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">PDF/Infrastructure</span>
                  <span className="text-white font-mono">$0.02</span>
                </li>
                <li className="flex justify-between border-t border-gray-800 pt-2 mt-2">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-lime-400 font-mono font-medium">
                    ~$1.00
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h5 className="text-sm text-gray-500 mb-2">On-Site Additional</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-400">AI Report costs</span>
                  <span className="text-white font-mono">$1.00</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Appraiser payout</span>
                  <span className="text-white font-mono">
                    ${PAYOUT_RATES.ON_SITE.base}.00
                  </span>
                </li>
                <li className="flex justify-between border-t border-gray-800 pt-2 mt-2">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-lime-400 font-mono font-medium">
                    ${onSiteCost}.00
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h5 className="text-sm text-gray-500 mb-2">
                Certified Additional
              </h5>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-400">AI Report costs</span>
                  <span className="text-white font-mono">$1.00</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Appraiser payout</span>
                  <span className="text-white font-mono">
                    ${PAYOUT_RATES.CERTIFIED.base}.00
                  </span>
                </li>
                <li className="flex justify-between border-t border-gray-800 pt-2 mt-2">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-lime-400 font-mono font-medium">
                    ${certifiedCost}.00
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Marketplace Take Rate */}
          <div className="bg-gradient-to-r from-amber-400/10 to-transparent border border-amber-400/20 rounded-lg p-6">
            <h4 className="font-semibold text-amber-400 mb-2">
              Marketplace Model
            </h4>
            <p className="text-gray-300 text-sm mb-4">
              For On-Site and Certified appraisals, we operate a marketplace of
              licensed appraisers with automated dispatch based on location,
              availability, and rating.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  ${PAYOUT_RATES.ON_SITE.base}
                </div>
                <div className="text-xs text-gray-500">On-Site Base</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  ${PAYOUT_RATES.CERTIFIED.base}
                </div>
                <div className="text-xs text-gray-500">Certified Base</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  +{PAYOUT_RATES.ON_SITE.percentage}%
                </div>
                <div className="text-xs text-gray-500">Revenue Share</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-lime-400">48hr</div>
                <div className="text-xs text-gray-500">SLA</div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== MARKET ANALYSIS ==================== */}
        <section id="market-analysis" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={PieChart}
            title="Market Analysis"
            subtitle="TAM, SAM, SOM and competitive landscape"
            color="lime"
          />

          {/* TAM SAM SOM */}
          <h3 className="text-xl font-semibold text-white mb-4">Market Size</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">$15B</div>
              <div className="text-lime-400 font-mono text-sm mb-3">TAM</div>
              <p className="text-gray-400 text-xs">
                US Appraisal Market total (residential + commercial)
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">$2.1B</div>
              <div className="text-cyan-400 font-mono text-sm mb-3">SAM</div>
              <p className="text-gray-400 text-xs">
                Texas residential appraisal market (~14% of US)
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">$210M</div>
              <div className="text-amber-400 font-mono text-sm mb-3">SOM</div>
              <p className="text-gray-400 text-xs">
                Target: 10% Texas market share in 5 years
              </p>
            </div>
          </div>

          {/* Market Drivers */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Market Drivers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg p-4">
              <ArrowUpRight className="w-5 h-5 text-lime-400 mt-1" />
              <div>
                <h5 className="text-white font-medium mb-1">
                  Texas Population Growth
                </h5>
                <p className="text-gray-400 text-sm">
                  +1,000 people/day migrating to Texas. Top state for real
                  estate growth.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg p-4">
              <ArrowUpRight className="w-5 h-5 text-lime-400 mt-1" />
              <div>
                <h5 className="text-white font-medium mb-1">
                  Appraiser Shortage
                </h5>
                <p className="text-gray-400 text-sm">
                  40% of appraisers will retire in 10 years. Demand &gt; Supply.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg p-4">
              <ArrowUpRight className="w-5 h-5 text-lime-400 mt-1" />
              <div>
                <h5 className="text-white font-medium mb-1">
                  AI Adoption in Real Estate
                </h5>
                <p className="text-gray-400 text-sm">
                  Zillow, Redfin, OpenDoor already use AVMs. Educated market.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg p-4">
              <ArrowUpRight className="w-5 h-5 text-lime-400 mt-1" />
              <div>
                <h5 className="text-white font-medium mb-1">
                  Favorable Regulation
                </h5>
                <p className="text-gray-400 text-sm">
                  FHFA allows AVMs for certain transactions. Trend towards
                  deregulation.
                </p>
              </div>
            </div>
          </div>

          {/* Competition */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Competitive Landscape
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 text-gray-500 font-mono text-xs uppercase">
                    Competitor
                  </th>
                  <th className="text-left py-3 text-gray-500 font-mono text-xs uppercase">
                    Type
                  </th>
                  <th className="text-center py-3 text-gray-500 font-mono text-xs uppercase">
                    Speed
                  </th>
                  <th className="text-center py-3 text-gray-500 font-mono text-xs uppercase">
                    Price
                  </th>
                  <th className="text-center py-3 text-gray-500 font-mono text-xs uppercase">
                    AI
                  </th>
                  <th className="text-center py-3 text-gray-500 font-mono text-xs uppercase">
                    Certified
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="bg-lime-400/5">
                  <td className="py-4 text-lime-400 font-medium">TruPlat</td>
                  <td className="py-4 text-gray-400">Hybrid AI + Human</td>
                  <td className="py-4 text-center text-lime-400">
                    Instant - 7 days
                  </td>
                  <td className="py-4 text-center text-lime-400">
                    Free-${PRICING.CERTIFIED}
                  </td>
                  <td className="py-4 text-center">
                    <CheckCircle className="w-5 h-5 text-lime-400 mx-auto" />
                  </td>
                  <td className="py-4 text-center">
                    <CheckCircle className="w-5 h-5 text-lime-400 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">Zillow Zestimate</td>
                  <td className="py-4 text-gray-400">AVM Only</td>
                  <td className="py-4 text-center text-gray-400">Instant</td>
                  <td className="py-4 text-center text-gray-400">Free</td>
                  <td className="py-4 text-center">
                    <CheckCircle className="w-5 h-5 text-gray-600 mx-auto" />
                  </td>
                  <td className="py-4 text-center">
                    <Minus className="w-5 h-5 text-gray-700 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">Traditional Appraiser</td>
                  <td className="py-4 text-gray-400">Human Only</td>
                  <td className="py-4 text-center text-red-400">2-4 weeks</td>
                  <td className="py-4 text-center text-red-400">$400-600</td>
                  <td className="py-4 text-center">
                    <Minus className="w-5 h-5 text-gray-700 mx-auto" />
                  </td>
                  <td className="py-4 text-center">
                    <CheckCircle className="w-5 h-5 text-gray-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">HouseCanary</td>
                  <td className="py-4 text-gray-400">AVM + Reports</td>
                  <td className="py-4 text-center text-gray-400">Instant</td>
                  <td className="py-4 text-center text-gray-400">$15-100</td>
                  <td className="py-4 text-center">
                    <CheckCircle className="w-5 h-5 text-gray-600 mx-auto" />
                  </td>
                  <td className="py-4 text-center">
                    <Minus className="w-5 h-5 text-gray-700 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">CoreLogic</td>
                  <td className="py-4 text-gray-400">Enterprise AVM</td>
                  <td className="py-4 text-center text-gray-400">Instant</td>
                  <td className="py-4 text-center text-gray-400">Enterprise</td>
                  <td className="py-4 text-center">
                    <CheckCircle className="w-5 h-5 text-gray-600 mx-auto" />
                  </td>
                  <td className="py-4 text-center">
                    <Minus className="w-5 h-5 text-gray-700 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Competitive Advantage */}
          <div className="mt-8 bg-gradient-to-r from-lime-400/10 to-transparent border-l-4 border-lime-400 p-6">
            <h4 className="font-semibold text-white mb-3">
              Competitive Advantage
            </h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-lime-400 mt-1" />
                <span>
                  <strong>Unique hybrid:</strong> AI + Human on a single
                  platform with seamless upgrade path
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-lime-400 mt-1" />
                <span>
                  <strong>Appraiser marketplace:</strong> Own network of
                  licensed appraisers with automated dispatch
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-lime-400 mt-1" />
                <span>
                  <strong>Texas Focus:</strong> Geographic specialization vs
                  national competitors
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-lime-400 mt-1" />
                <span>
                  <strong>USPAP Certified:</strong> Reports valid for lenders
                  and courts, not just estimates
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ==================== GO TO MARKET ==================== */}
        <section id="go-to-market" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={Rocket}
            title="Go-to-Market Strategy"
            subtitle="Customer acquisition, channels, and growth strategy"
            color="lime"
          />

          {/* Target Segments */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Target Customer Segments
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-lime-400/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-lime-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    Real Estate Investors
                  </h4>
                  <span className="text-xs text-lime-400">Primary Segment</span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Fix & flip operators (alto volumen)</li>
                <li>• Buy & hold landlords</li>
                <li>• Wholesalers</li>
                <li>• REITs pequeños/medianos</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Use Case</span>
                  <span className="text-white">
                    Deal screening, Due diligence
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Product Fit</span>
                  <span className="text-cyan-400">AI Report → On-Site</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    Mortgage Professionals
                  </h4>
                  <span className="text-xs text-cyan-400">
                    Secondary Segment
                  </span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Mortgage brokers</li>
                <li>• Loan officers</li>
                <li>• Small lenders</li>
                <li>• Credit unions</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Use Case</span>
                  <span className="text-white">
                    Pre-qual, Refinance, HELOCs
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Product Fit</span>
                  <span className="text-amber-400">On-Site → Certified</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    Real Estate Agents
                  </h4>
                  <span className="text-xs text-amber-400">
                    Tertiary Segment
                  </span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Listing agents (pricing)</li>
                <li>• Buyer agents (negotiation)</li>
                <li>• Teams and brokerages</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Use Case</span>
                  <span className="text-white">Listing price, CMAs</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Product Fit</span>
                  <span className="text-cyan-400">AI Report</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-400/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Legal & Estate</h4>
                  <span className="text-xs text-purple-400">Niche Segment</span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Divorce attorneys</li>
                <li>• Estate planners</li>
                <li>• Tax appeal specialists</li>
                <li>• Probate courts</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Use Case</span>
                  <span className="text-white">Litigation, Settlements</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Product Fit</span>
                  <span className="text-amber-400">Certified (USPAP)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acquisition Channels */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Acquisition Channels
          </h3>
          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 text-gray-500 font-mono text-xs uppercase">
                    Channel
                  </th>
                  <th className="text-center py-3 text-gray-500 font-mono text-xs uppercase">
                    Priority
                  </th>
                  <th className="text-center py-3 text-gray-500 font-mono text-xs uppercase">
                    CAC Est.
                  </th>
                  <th className="text-left py-3 text-gray-500 font-mono text-xs uppercase">
                    Strategy
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr>
                  <td className="py-4 text-white">SEO / Content</td>
                  <td className="py-4 text-center">
                    <PriorityBadge level="high" />
                  </td>
                  <td className="py-4 text-center text-lime-400 font-mono">
                    $15
                  </td>
                  <td className="py-4 text-gray-400 text-sm">
                    &quot;property valuation Texas&quot;, &quot;home appraisal
                    cost&quot;
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">Google Ads</td>
                  <td className="py-4 text-center">
                    <PriorityBadge level="high" />
                  </td>
                  <td className="py-4 text-center text-amber-400 font-mono">
                    $45
                  </td>
                  <td className="py-4 text-gray-400 text-sm">
                    Intent keywords, retargeting, local targeting
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">Partnerships</td>
                  <td className="py-4 text-center">
                    <PriorityBadge level="medium" />
                  </td>
                  <td className="py-4 text-center text-lime-400 font-mono">
                    $25
                  </td>
                  <td className="py-4 text-gray-400 text-sm">
                    Title companies, mortgage brokers, RE associations
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">Referral Program</td>
                  <td className="py-4 text-center">
                    <PriorityBadge level="medium" />
                  </td>
                  <td className="py-4 text-center text-lime-400 font-mono">
                    $20
                  </td>
                  <td className="py-4 text-gray-400 text-sm">
                    $25 credit por referido, viral loops
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">LinkedIn / Social</td>
                  <td className="py-4 text-center">
                    <PriorityBadge level="low" />
                  </td>
                  <td className="py-4 text-center text-amber-400 font-mono">
                    $60
                  </td>
                  <td className="py-4 text-gray-400 text-sm">
                    Thought leadership, case studies
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Launch Strategy */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Launch Strategy
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-24 text-right">
                <span className="text-lime-400 font-mono text-sm">Phase 1</span>
                <div className="text-gray-500 text-xs">Q1 2026</div>
              </div>
              <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">
                  Austin Metro Launch
                </h5>
                <p className="text-gray-400 text-sm">
                  Soft launch in Austin (Travis, Williamson, Hays). 100 beta
                  users. Focus on investors and agents. Target: 500
                  reports/month, PMF validation.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-24 text-right">
                <span className="text-cyan-400 font-mono text-sm">Phase 2</span>
                <div className="text-gray-500 text-xs">Q2 2026</div>
              </div>
              <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">
                  DFW + Houston Expansion
                </h5>
                <p className="text-gray-400 text-sm">
                  Expand to Dallas-Fort Worth and Houston metros. Recruit local
                  appraisers. Target: 2,000 reports/month, unit economics
                  validation.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-24 text-right">
                <span className="text-amber-400 font-mono text-sm">
                  Phase 3
                </span>
                <div className="text-gray-500 text-xs">Q3-Q4 2026</div>
              </div>
              <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">Texas Statewide</h5>
                <p className="text-gray-400 text-sm">
                  Full Texas coverage including San Antonio, El Paso, McAllen.
                  Target: 5,000 reports/month, $500K MRR.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FINANCIAL PROJECTIONS ==================== */}
        <section id="financials" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={BarChart3}
            title="Financial Projections"
            subtitle="Revenue forecasts and key metrics"
            color="lime"
          />

          {/* 3-Year Projection */}
          <h3 className="text-xl font-semibold text-white mb-4">
            3-Year Revenue Projection
          </h3>
          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 text-gray-500 font-mono text-xs uppercase">
                    Metric
                  </th>
                  <th className="text-right py-3 text-gray-500 font-mono text-xs uppercase">
                    Year 1
                  </th>
                  <th className="text-right py-3 text-gray-500 font-mono text-xs uppercase">
                    Year 2
                  </th>
                  <th className="text-right py-3 text-gray-500 font-mono text-xs uppercase">
                    Year 3
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr>
                  <td className="py-4 text-white">
                    Monthly Reports
                    <span className="text-gray-600 text-xs ml-1">
                      (free + paid)
                    </span>
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    2,500
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    12,000
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    35,000
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">
                    Paid Reports
                    <span className="text-gray-600 text-xs ml-1">(~15%)</span>
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    375
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    1,800
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    5,250
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">Annual Revenue</td>
                  <td className="py-4 text-right text-lime-400 font-mono">
                    $720K
                  </td>
                  <td className="py-4 text-right text-lime-400 font-mono">
                    $3.6M
                  </td>
                  <td className="py-4 text-right text-lime-400 font-mono">
                    $12M
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">
                    Gross Margin
                    <span className="text-gray-600 text-xs ml-1">
                      (blended)
                    </span>
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    75%
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    78%
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    80%
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">Active Customers</td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    800
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    3,500
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    10,000
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-white">Appraisers Network</td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    50
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    150
                  </td>
                  <td className="py-4 text-right text-gray-300 font-mono">
                    400
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Revenue Mix */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Revenue Mix (Year 2 Target)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">60%</div>
              <div className="text-gray-400 text-sm">Subscriptions</div>
              <div className="text-gray-600 text-xs mt-1">$0/$99/$299 MRR</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-lime-400 mb-1">25%</div>
              <div className="text-gray-400 text-sm">On-Site Add-ons</div>
              <div className="text-gray-600 text-xs mt-1">
                ${PRICING.ON_SITE}/report
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-400 mb-1">15%</div>
              <div className="text-gray-400 text-sm">Certified Add-ons</div>
              <div className="text-gray-600 text-xs mt-1">
                ${PRICING.CERTIFIED}/report
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Key Business Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h5 className="text-gray-500 text-sm mb-4">Customer Metrics</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">ARPU</span>
                  <span className="text-white font-mono">$75/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CAC</span>
                  <span className="text-white font-mono">$45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">LTV</span>
                  <span className="text-white font-mono">$900</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">LTV:CAC</span>
                  <span className="text-lime-400 font-mono">20:1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payback</span>
                  <span className="text-white font-mono">&lt; 1 month</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h5 className="text-gray-500 text-sm mb-4">Engagement Metrics</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Churn</span>
                  <span className="text-white font-mono">5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reports/Customer/Mo</span>
                  <span className="text-white font-mono">3.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Upgrade Rate</span>
                  <span className="text-lime-400 font-mono">15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">NPS Target</span>
                  <span className="text-white font-mono">50+</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h5 className="text-gray-500 text-sm mb-4">
                Operational Metrics
              </h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">AI Report SLA</span>
                  <span className="text-white font-mono">&lt; 1 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">On-Site SLA</span>
                  <span className="text-white font-mono">48 hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Certified SLA</span>
                  <span className="text-white font-mono">3 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Support Response</span>
                  <span className="text-white font-mono">&lt;4 hrs</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== RISK ANALYSIS ==================== */}
        <section id="risks" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={AlertTriangle}
            title="Risk Analysis"
            subtitle="Key risks and mitigation strategies"
            color="lime"
          />

          <div className="space-y-4">
            <RiskCard
              title="Regulatory Risk"
              severity="high"
              description="Changes in FHFA/state board regulations could limit AVM usage or require more human oversight."
              mitigation="Focus on USPAP-compliant certified appraisals. Relationships with TALCB. Flexibility to adapt products."
            />
            <RiskCard
              title="Competitive Risk"
              severity="medium"
              description="Zillow, Redfin, or incumbents could launch similar products with more resources."
              mitigation="Differentiation through certified appraisals and appraiser marketplace. Texas focus enables specialization."
            />
            <RiskCard
              title="Technology Risk"
              severity="medium"
              description="Dependency on third-party APIs (RapidCanvas, OpenAI, ATTOM). Downtime affects operations."
              mitigation="Fallbacks implemented. Multiple data providers. SLAs with critical vendors."
            />
            <RiskCard
              title="Supply Risk (Appraisers)"
              severity="medium"
              description="Difficulty recruiting and retaining licensed appraisers in competitive market."
              mitigation="Competitive payouts ($75/$225 base + 50%). Tools that facilitate their work. Flexible scheduling."
            />
            <RiskCard
              title="Market Risk"
              severity="low"
              description="Real estate recession would reduce transaction volume and valuation demand."
              mitigation="Diversification of use cases (tax appeals, insurance claims increase in downturns)."
            />
          </div>
        </section>

        {/* ==================== PLATFORM STATUS ==================== */}
        <section id="roadmap" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={CheckCircle}
            title="Platform Status"
            subtitle="All features implemented and production-ready"
            color="lime"
          />

          {/* 100% Complete Banner */}
          <div className="bg-lime-400/10 border border-lime-400/30 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-lime-400" />
              <span className="text-xl font-bold text-white">
                100% Complete
              </span>
            </div>
            <p className="text-gray-400">
              All core features have been implemented and tested. The platform
              is ready for production launch.
            </p>
          </div>

          {/* Feature Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Core Platform */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="text-cyan-400 font-mono text-sm uppercase tracking-wider mb-4">
                Core Platform
              </h4>
              <ul className="space-y-3">
                <FeatureStatusItem title="AI Report Generation" />
                <FeatureStatusItem title="PDF Report Generation" />
                <FeatureStatusItem title="Stripe Payments" />
                <FeatureStatusItem title="User Authentication" />
                <FeatureStatusItem title="Client Dashboard" />
              </ul>
            </div>

            {/* Appraiser Network */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="text-lime-400 font-mono text-sm uppercase tracking-wider mb-4">
                Appraiser Network
              </h4>
              <ul className="space-y-3">
                <FeatureStatusItem title="Onboarding Portal" />
                <FeatureStatusItem title="Job Dispatch System" />
                <FeatureStatusItem title="Mobile Photo Upload" />
                <FeatureStatusItem title="Earnings Dashboard" />
                <FeatureStatusItem title="License Verification" />
              </ul>
            </div>

            {/* Advanced Features */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="text-amber-400 font-mono text-sm uppercase tracking-wider mb-4">
                Advanced Features
              </h4>
              <ul className="space-y-3">
                <FeatureStatusItem title="Interactive Property Map" />
                <FeatureStatusItem title="Subscription Plans" />
                <FeatureStatusItem title="Team Collaboration" />
                <FeatureStatusItem title="Admin Analytics" />
                <FeatureStatusItem title="Multi-role Access Control" />
              </ul>
            </div>
          </div>
        </section>

        {/* ==================== PRICING ==================== */}
        <section id="pricing" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={DollarSign}
            title="Pricing"
            subtitle="Simple pricing with no hidden fees"
            color="cyan"
          />

          {/* How it works */}
          <div className="bg-gradient-to-r from-cyan-400/10 to-transparent border-l-4 border-cyan-400 p-6 mb-8">
            <p className="text-gray-300">
              <span className="text-white font-semibold">Simple model:</span>{" "}
              Pick a monthly plan for AI Reports. Add professional services when
              you need them.
            </p>
          </div>

          {/* Monthly Plans */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Monthly Plans
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Starter */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="text-white font-semibold mb-2">
                {SUBSCRIPTION_PLANS.STARTER.name}
              </h4>
              <div className="text-3xl font-bold text-white mb-1">
                ${SUBSCRIPTION_PLANS.STARTER.price}
                <span className="text-sm text-gray-500 font-normal">/mo</span>
              </div>
              <div className="text-sm text-lime-400 mb-4">
                {SUBSCRIPTION_PLANS.STARTER.reportsPerMonth} AI reports/month
              </div>
              <ul className="space-y-2">
                {SUBSCRIPTION_PLANS.STARTER.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <CheckCircle className="w-4 h-4 text-gray-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Professional - Most Popular */}
            <div className="bg-gray-900 border-2 border-lime-400 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-lime-400 text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Most Popular
                </span>
              </div>
              <h4 className="text-white font-semibold mb-2">
                {SUBSCRIPTION_PLANS.PROFESSIONAL.name}
              </h4>
              <div className="text-3xl font-bold text-white mb-1">
                ${SUBSCRIPTION_PLANS.PROFESSIONAL.price}
                <span className="text-sm text-gray-500 font-normal">/mo</span>
              </div>
              <div className="text-sm text-lime-400 mb-4">
                {SUBSCRIPTION_PLANS.PROFESSIONAL.reportsPerMonth} AI
                reports/month
              </div>
              <ul className="space-y-2">
                {SUBSCRIPTION_PLANS.PROFESSIONAL.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <CheckCircle className="w-4 h-4 text-lime-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise */}
            <div className="bg-gray-900 border border-amber-400/30 rounded-lg p-6">
              <h4 className="text-white font-semibold mb-2">
                {SUBSCRIPTION_PLANS.ENTERPRISE.name}
              </h4>
              <div className="text-3xl font-bold text-white mb-1">
                ${SUBSCRIPTION_PLANS.ENTERPRISE.price}
                <span className="text-sm text-gray-500 font-normal">/mo</span>
              </div>
              <div className="text-sm text-amber-400 mb-4">
                Unlimited AI reports
              </div>
              <ul className="space-y-2">
                {SUBSCRIPTION_PLANS.ENTERPRISE.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Add-On Services */}
          <h3 className="text-xl font-semibold text-white mb-2 mt-8">
            Add-On Services
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Need human verification? Add professional services to any plan:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* On-Site Verification */}
            <div className="bg-gray-900 border border-lime-400/30 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lime-400 font-semibold text-lg">
                    On-Site Verification
                  </h4>
                  <p className="text-gray-500 text-sm">48-hour turnaround</p>
                </div>
                <div className="text-2xl font-bold text-white">
                  +${PRICING.ON_SITE}
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-lime-400" />
                  Licensed appraiser visit
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-lime-400" />
                  Geotagged photo evidence
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-lime-400" />
                  Condition assessment
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-lime-400" />
                  Interior/exterior documentation
                </li>
              </ul>
            </div>

            {/* Certified Appraisal */}
            <div className="bg-gray-900 border border-amber-400/30 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-amber-400 font-semibold text-lg">
                    Certified Appraisal
                  </h4>
                  <p className="text-gray-500 text-sm">3-day turnaround</p>
                </div>
                <div className="text-2xl font-bold text-white">
                  +${PRICING.CERTIFIED}
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  USPAP compliant
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  Court admissible
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  Digital signature & lock
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  Lender-ready format
                </li>
              </ul>
            </div>
          </div>

          {/* Free Tier Note */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h4 className="text-white font-semibold mb-2">
              Why offer a free tier?
            </h4>
            <p className="text-gray-400 text-sm">
              The Starter plan lets users experience TruPlat before committing.
              When they hit the 5-report limit, they see upgrade prompts with
              clear value propositions. This drives conversions to paid plans.
            </p>
          </div>
        </section>

        {/* ==================== FEATURES ==================== */}
        <section id="features" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={Zap}
            title="Core Features"
            subtitle="Platform capabilities and functionality"
            color="cyan"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard
              icon={Zap}
              title="Instant AI Valuations"
              description="Get property valuations in under 1 minute using advanced machine learning models trained on millions of Texas transactions."
            />
            <FeatureCard
              icon={Camera}
              title="Photo Verification"
              description="Licensed appraisers capture geotagged photos with AI-assisted condition assessment and deficiency detection."
            />
            <FeatureCard
              icon={Award}
              title="USPAP Certified Reports"
              description="Full appraisal reports compliant with Uniform Standards of Professional Appraisal Practice, accepted by lenders and courts."
            />
            <FeatureCard
              icon={Map}
              title="Interactive Property Map"
              description="Search and explore properties across Texas with instant access to valuations, comps, and market data."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Comparable Analysis"
              description="AI-selected comparable sales with automated adjustments for property characteristics and market conditions."
            />
            <FeatureCard
              icon={Shield}
              title="Risk Assessment"
              description="Comprehensive risk scoring including flood zones, title issues, market volatility, and neighborhood trends."
            />
            <FeatureCard
              icon={Users}
              title="Appraiser Network"
              description="Marketplace of vetted, licensed Texas appraisers with automated dispatch and real-time tracking."
            />
            <FeatureCard
              icon={FileText}
              title="PDF Report Generation"
              description="Professional PDF reports with your branding, ready to share with clients, lenders, or for legal proceedings."
            />
          </div>
        </section>

        {/* ==================== WORKFLOW ==================== */}
        <section id="workflow" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={TrendingUp}
            title="Workflows"
            subtitle="How reports are generated and delivered"
            color="cyan"
          />

          {/* AI Report Flow */}
          <h3 className="text-xl font-semibold text-white mb-4">
            AI Report Workflow
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
            <WorkflowStep step={1} title="Submit Address" />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep
              step={2}
              title="Data Fetch"
              subtitle="ATTOM + Public Records"
            />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep
              step={3}
              title="AI Valuation"
              subtitle="RapidCanvas AVM"
            />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep
              step={4}
              title="Narrative"
              subtitle="OpenAI Analysis"
            />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep step={5} title="PDF Ready" status="complete" />
          </div>

          {/* On-Site Flow */}
          <h3 className="text-xl font-semibold text-white mb-4">
            On-Site Verification Workflow
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
            <WorkflowStep step={1} title="Order Created" />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep step={2} title="Dispatch" subtitle="Find Appraiser" />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep step={3} title="Accept Job" subtitle="4hr SLA" />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep
              step={4}
              title="Site Visit"
              subtitle="Photos + Notes"
            />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep step={5} title="Submit" />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep step={6} title="Review" subtitle="QA Check" />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep step={7} title="Delivered" status="complete" />
          </div>

          {/* Certified Flow */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Certified Appraisal Workflow
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            <WorkflowStep step={1} title="Order" />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep
              step={2}
              title="Assign"
              subtitle="Licensed Appraiser"
            />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep step={3} title="Inspection" subtitle="Full USPAP" />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep
              step={4}
              title="Analysis"
              subtitle="Comps + Adjustments"
            />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep step={5} title="Report" subtitle="Draft Review" />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep step={6} title="Sign" subtitle="Digital Cert" />
            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <WorkflowStep step={7} title="Locked" status="complete" />
          </div>
        </section>

        {/* ==================== USER ROLES ==================== */}
        <section id="users" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={Users}
            title="User Roles"
            subtitle="Platform user types and permissions"
            color="cyan"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <RoleCard
              title="Client"
              description="Real estate investors, agents, and mortgage professionals who order valuations."
              permissions={[
                "Order all report types",
                "View and download reports",
                "Manage team members",
                "Access billing & invoices",
                "Use interactive map",
              ]}
              color="cyan"
            />
            <RoleCard
              title="Appraiser"
              description="Licensed Texas appraisers who complete on-site inspections and certified appraisals."
              permissions={[
                "View available jobs",
                "Accept/decline assignments",
                "Submit photos & notes",
                "Complete appraisal forms",
                "Track earnings & payouts",
              ]}
              color="lime"
            />
            <RoleCard
              title="Admin"
              description="TruPlat staff managing platform operations, users, and appraisers."
              permissions={[
                "Manage all users",
                "Review & approve appraisers",
                "Configure pricing rules",
                "Process payouts",
                "Access analytics",
              ]}
              color="amber"
            />
            <RoleCard
              title="Super Admin"
              description="Full system access for technical operations and configuration."
              permissions={[
                "All Admin permissions",
                "System configuration",
                "API key management",
                "Database access",
                "Deployment controls",
              ]}
              color="red"
            />
          </div>
        </section>

        {/* ==================== ARCHITECTURE ==================== */}
        <section id="architecture" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={Server}
            title="Technical Architecture"
            subtitle="System design and technology stack"
            color="amber"
          />

          {/* Tech Stack */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Technology Stack
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <TechCard
              category="Frontend"
              items={[
                "Next.js 15 (App Router)",
                "React 19",
                "TypeScript",
                "Tailwind CSS",
                "Mapbox GL",
              ]}
            />
            <TechCard
              category="Backend"
              items={[
                "tRPC",
                "Prisma ORM",
                "NextAuth.js",
                "Zod Validation",
                "Node.js Runtime",
              ]}
            />
            <TechCard
              category="Infrastructure"
              items={[
                "Vercel (Hosting)",
                "Railway (Database)",
                "Cloudflare R2 (Storage)",
                "Inngest (Jobs)",
                "Stripe (Payments)",
              ]}
            />
          </div>

          {/* System Diagram */}
          <h3 className="text-xl font-semibold text-white mb-4">
            System Overview
          </h3>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <pre className="text-sm text-gray-300 overflow-x-auto">
              {`┌─────────────────────────────────────────────────────────────────┐
│                        TRUPLAT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                 │
│  │  Client  │     │ Appraiser│     │  Admin   │                 │
│  │   App    │     │   App    │     │  Portal  │                 │
│  └────┬─────┘     └────┬─────┘     └────┬─────┘                 │
│       │                │                │                        │
│       └────────────────┼────────────────┘                        │
│                        │                                         │
│                        ▼                                         │
│              ┌─────────────────┐                                 │
│              │   Next.js API   │                                 │
│              │    (tRPC)       │                                 │
│              └────────┬────────┘                                 │
│                       │                                          │
│         ┌─────────────┼─────────────┐                           │
│         │             │             │                            │
│         ▼             ▼             ▼                            │
│  ┌────────────┐ ┌──────────┐ ┌───────────┐                      │
│  │  Prisma    │ │ Services │ │  External │                      │
│  │ PostgreSQL │ │  Layer   │ │   APIs    │                      │
│  └────────────┘ └──────────┘ └───────────┘                      │
│                       │             │                            │
│                       │      ┌──────┴──────┐                    │
│                       │      │ RapidCanvas │                    │
│                       │      │   OpenAI    │                    │
│                       │      │   ATTOM     │                    │
│                       │      │   Stripe    │                    │
│                       │      │   Mapbox    │                    │
│                       │      └─────────────┘                    │
│                       │                                          │
│                       ▼                                          │
│              ┌─────────────────┐                                 │
│              │  Cloudflare R2  │                                 │
│              │    (Storage)    │                                 │
│              └─────────────────┘                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>

          {/* App Routes */}
          <h3 className="text-xl font-semibold text-white mb-4">
            Application Routes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h5 className="text-cyan-400 font-mono text-sm mb-3">
                Client Routes
              </h5>
              <ul className="space-y-1 text-sm text-gray-400 font-mono">
                <li>/dashboard</li>
                <li>/appraisals</li>
                <li>/appraisals/new</li>
                <li>/appraisals/[id]</li>
                <li>/map</li>
                <li>/billing</li>
                <li>/settings</li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h5 className="text-lime-400 font-mono text-sm mb-3">
                Appraiser Routes
              </h5>
              <ul className="space-y-1 text-sm text-gray-400 font-mono">
                <li>/appraiser/dashboard</li>
                <li>/appraiser/jobs</li>
                <li>/appraiser/jobs/[id]</li>
                <li>/appraiser/earnings</li>
                <li>/appraiser/profile</li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h5 className="text-amber-400 font-mono text-sm mb-3">
                Admin Routes
              </h5>
              <ul className="space-y-1 text-sm text-gray-400 font-mono">
                <li>/admin/dashboard</li>
                <li>/admin/users</li>
                <li>/admin/appraisals</li>
                <li>/admin/appraisers</li>
                <li>/admin/pricing</li>
                <li>/admin/payouts</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ==================== INTEGRATIONS ==================== */}
        <section id="integrations" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={Globe}
            title="Integrations"
            subtitle="Third-party services and APIs"
            color="amber"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <IntegrationCard
              name="RapidCanvas"
              purpose="AI Valuation Engine"
              description="Primary AVM provider for instant property valuations with confidence scores."
              critical
            />
            <IntegrationCard
              name="OpenAI"
              purpose="Narrative Generation"
              description="GPT-4 powered analysis for report narratives and risk assessments."
              critical
            />
            <IntegrationCard
              name="ATTOM Data"
              purpose="Property Data"
              description="Comprehensive property records, tax data, and transaction history."
              critical
            />
            <IntegrationCard
              name="Stripe"
              purpose="Payments"
              description="Payment processing, subscriptions, and appraiser payouts via Connect."
              critical
            />
            <IntegrationCard
              name="Mapbox"
              purpose="Maps & Geocoding"
              description="Interactive maps, address search, and property visualization."
            />
            <IntegrationCard
              name="Gotenberg"
              purpose="PDF Generation"
              description="HTML to PDF conversion for professional report generation."
            />
            <IntegrationCard
              name="Cloudflare R2"
              purpose="File Storage"
              description="S3-compatible storage for photos, documents, and generated reports."
            />
            <IntegrationCard
              name="Resend"
              purpose="Email"
              description="Transactional emails for notifications, reports, and marketing."
            />
          </div>
        </section>

        {/* ==================== DATABASE ==================== */}
        <section id="database" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={Database}
            title="Database Schema"
            subtitle="Core data models and relationships"
            color="amber"
          />

          <div className="space-y-6">
            <SchemaTable
              name="User"
              fields={[
                { name: "id", type: "String", description: "UUID primary key" },
                {
                  name: "email",
                  type: "String",
                  description: "Unique email address",
                },
                {
                  name: "role",
                  type: "Enum",
                  description: "CLIENT | APPRAISER | ADMIN | SUPER_ADMIN",
                },
                {
                  name: "subscriptionTier",
                  type: "Enum",
                  description: "FREE | PRO | ENTERPRISE",
                },
                {
                  name: "stripeCustomerId",
                  type: "String?",
                  description: "Stripe customer reference",
                },
              ]}
            />
            <SchemaTable
              name="Appraisal"
              fields={[
                { name: "id", type: "String", description: "UUID primary key" },
                {
                  name: "userId",
                  type: "String",
                  description: "Owner reference",
                },
                {
                  name: "type",
                  type: "Enum",
                  description: "AI_REPORT | ON_SITE | CERTIFIED",
                },
                {
                  name: "status",
                  type: "Enum",
                  description: "DRAFT | QUEUED | RUNNING | READY | FAILED",
                },
                {
                  name: "propertyAddress",
                  type: "String",
                  description: "Full street address",
                },
                {
                  name: "valuationAmount",
                  type: "Decimal?",
                  description: "Final valuation in USD",
                },
                {
                  name: "confidenceScore",
                  type: "Float?",
                  description: "AI confidence 0-100",
                },
              ]}
            />
            <SchemaTable
              name="Job"
              fields={[
                {
                  name: "visibleToUser",
                  type: "Boolean",
                  description: "Visible in marketplace",
                },
                { name: "id", type: "String", description: "UUID primary key" },
                {
                  name: "appraisalId",
                  type: "String",
                  description: "Parent appraisal reference",
                },
                {
                  name: "appraiserId",
                  type: "String?",
                  description: "Assigned appraiser",
                },
                {
                  name: "status",
                  type: "Enum",
                  description:
                    "AVAILABLE | ACCEPTED | IN_PROGRESS | SUBMITTED | COMPLETED",
                },
                {
                  name: "payoutAmount",
                  type: "Decimal",
                  description: "Appraiser compensation",
                },
              ]}
            />
            <SchemaTable
              name="AppraiserProfile"
              fields={[
                { name: "id", type: "String", description: "UUID primary key" },
                {
                  name: "userId",
                  type: "String",
                  description: "User reference",
                },
                {
                  name: "licenseNumber",
                  type: "String",
                  description: "Texas license number",
                },
                {
                  name: "licenseLevel",
                  type: "Enum",
                  description: "TRAINEE | LICENSED | CERTIFIED | GENERAL",
                },
                {
                  name: "serviceRadius",
                  type: "Int",
                  description: "Miles from home base",
                },
                {
                  name: "rating",
                  type: "Float",
                  description: "Average rating 0-5",
                },
              ]}
            />
          </div>
        </section>

        {/* ==================== SECURITY ==================== */}
        <section id="security" className="mb-20 scroll-mt-20">
          <SectionHeader
            icon={Shield}
            title="Security"
            subtitle="Authentication, authorization, and data protection"
            color="amber"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                Authentication
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  NextAuth.js with credentials provider
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  bcrypt password hashing (12 rounds)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  JWT session tokens (7 day expiry)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  Email verification required
                </li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Authorization
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  Role-based access control (RBAC)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  Route-level middleware protection
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  tRPC procedure authorization
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  Resource ownership validation
                </li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                Data Protection
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  TLS encryption in transit
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  AES-256 encryption at rest
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  PII data segregation
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  Automated backups (daily)
                </li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                Compliance
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  USPAP compliant reports
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  TALCB licensing verification
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  SOC 2 Type II (planned)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5" />
                  GLBA data handling
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-800 pt-8 mt-16">
          <p className="text-gray-500 text-sm text-center">
            TruPlat Product Documentation v1.0 · Last updated January 2026
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENT DEFINITIONS ====================

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: "lime" | "cyan" | "amber";
}) {
  const colorClasses = {
    lime: "text-lime-400 bg-lime-400/10 border-lime-400/30",
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorClasses[color]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <p className="text-gray-400">{subtitle}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sublabel,
  change,
  positive,
}: {
  label: string;
  value: string;
  sublabel?: string;
  change?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sublabel && <div className="text-gray-600 text-xs mt-1">{sublabel}</div>}
      {change && (
        <div
          className={`text-xs mt-1 ${positive ? "text-lime-400" : "text-red-400"}`}
        >
          {change}
        </div>
      )}
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
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
      <h4 className="font-semibold text-white mb-2">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function WorkflowStep({
  step,
  title,
  subtitle,
  status,
}: {
  step: number;
  title: string;
  subtitle?: string;
  status?: "complete";
}) {
  return (
    <div
      className={`flex-shrink-0 px-4 py-3 rounded-lg border ${
        status === "complete"
          ? "bg-lime-400/10 border-lime-400/30"
          : "bg-gray-900 border-gray-800"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
            status === "complete"
              ? "bg-lime-400 text-black"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          {status === "complete" ? <CheckCircle className="w-4 h-4" /> : step}
        </span>
        <div>
          <div className="text-white text-sm font-medium">{title}</div>
          {subtitle && <div className="text-gray-500 text-xs">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  title,
  description,
  permissions,
  color,
}: {
  title: string;
  description: string;
  permissions: string[];
  color: "cyan" | "lime" | "amber" | "red";
}) {
  const colorClasses = {
    cyan: "text-cyan-400 bg-cyan-400/10",
    lime: "text-lime-400 bg-lime-400/10",
    amber: "text-amber-400 bg-amber-400/10",
    red: "text-red-400 bg-red-400/10",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
        >
          <Users className="w-5 h-5" />
        </div>
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <ul className="space-y-2">
        {permissions.map((p, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
            <CheckCircle className="w-4 h-4 text-gray-600" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TechCard({ category, items }: { category: string; items: string[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h5 className="text-amber-400 font-mono text-sm mb-3">{category}</h5>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-gray-400 text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function IntegrationCard({
  name,
  purpose,
  description,
  critical,
}: {
  name: string;
  purpose: string;
  description: string;
  critical?: boolean;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-semibold text-white">{name}</h5>
        {critical && (
          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded">
            Critical
          </span>
        )}
      </div>
      <div className="text-amber-400 text-xs font-mono mb-2">{purpose}</div>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function SchemaTable({
  name,
  fields,
}: {
  name: string;
  fields: { name: string; type: string; description: string }[];
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-900">
        <h4 className="font-mono text-amber-400">{name}</h4>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-950">
            <th className="text-left px-4 py-2 text-gray-500 font-mono text-xs">
              Field
            </th>
            <th className="text-left px-4 py-2 text-gray-500 font-mono text-xs">
              Type
            </th>
            <th className="text-left px-4 py-2 text-gray-500 font-mono text-xs">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, i) => (
            <tr key={i} className="border-b border-gray-800 last:border-0">
              <td className="px-4 py-2 font-mono text-sm text-cyan-400">
                {field.name}
              </td>
              <td className="px-4 py-2 font-mono text-sm text-gray-400">
                {field.type}
              </td>
              <td className="px-4 py-2 text-sm text-gray-500">
                {field.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiskCard({
  title,
  severity,
  description,
  mitigation,
}: {
  title: string;
  severity: "high" | "medium" | "low";
  description: string;
  mitigation: string;
}) {
  const severityColors = {
    high: "bg-red-500/10 border-red-500/30 text-red-400",
    medium: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    low: "bg-lime-500/10 border-lime-500/30 text-lime-400",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-white">{title}</h4>
        <span
          className={`px-2 py-1 rounded text-xs font-mono border ${severityColors[severity]}`}
        >
          {severity.toUpperCase()}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className="bg-gray-950 rounded p-3">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
          Mitigation
        </div>
        <p className="text-gray-300 text-sm">{mitigation}</p>
      </div>
    </div>
  );
}

function FeatureStatusItem({ title }: { title: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <CheckCircle className="w-4 h-4 text-lime-400" />
      <span className="text-gray-300">{title}</span>
    </li>
  );
}

function PriorityBadge({ level }: { level: "high" | "medium" | "low" }) {
  const colors = {
    high: "bg-lime-400/10 text-lime-400",
    medium: "bg-amber-400/10 text-amber-400",
    low: "bg-gray-400/10 text-gray-400",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-mono ${colors[level]}`}>
      {level.toUpperCase()}
    </span>
  );
}
