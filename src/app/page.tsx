/**
 * Landing Page - Minimal Premium Design
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  HeroSection,
  CTASection,
  StickyMobileCTA,
} from "@/modules/marketing/components";
import { LedgerHeader } from "@/shared/components/layout/LedgerHeader";
import {
  Check,
  Zap,
  Shield,
  MapPin,
  Building,
  School,
  Route,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

export default function LandingPage() {
  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "For Appraisers", href: "/for-appraisers" },
  ];

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <div className="fixed top-0 left-0 right-0 z-50">
        <LedgerHeader
          navItems={navItems}
          actionButtonText="Get Started"
          actionButtonHref="/register"
        />
      </div>

      <div className="h-16" />

      <HeroSection />
      <HowItWorks />
      <Features />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}

// Features - Product UI Demo
function Features() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Fake browser window */}
          <div className="rounded-xl border border-white/10 bg-gray-950 overflow-hidden shadow-2xl">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded bg-white/5 text-xs text-gray-500 font-mono">
                  truplat.com/dashboard
                </div>
              </div>
            </div>

            {/* UI Content */}
            <div className="p-6 sm:p-8">
              {/* Product selection cards */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="p-6 rounded-xl bg-gradient-to-br from-lime-400/10 to-transparent border border-lime-400/30">
                  <Zap className="w-6 h-6 text-lime-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-1">
                    AI Reports
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Instant. Free tier available.
                  </p>
                  <div className="text-sm text-lime-400 font-medium">
                    Try free →
                  </div>
                </div>
                <div className="p-6 rounded-xl border border-white/10">
                  <Shield className="w-6 h-6 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Certified
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Bank-ready. USPAP compliant.
                  </p>
                  <div className="text-sm text-gray-500 font-medium">
                    Request appraisal →
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/5 my-6" />

              {/* Property header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    1847 Oak Avenue
                  </h3>
                  <p className="text-sm text-gray-500">Austin, TX 78704</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">$485,000</div>
                  <div className="flex items-center gap-1 justify-end text-lime-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12% projected</span>
                  </div>
                </div>
              </div>

              {/* Growth signals */}
              <div className="mb-6">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                  Growth Signals
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      icon: School,
                      label: "New elementary school",
                      status: "Approved",
                      impact: "+8%",
                    },
                    {
                      icon: Route,
                      label: "Highway expansion",
                      status: "Under construction",
                      impact: "+5%",
                    },
                    {
                      icon: Building,
                      label: "12 permits nearby",
                      status: "Last 90 days",
                      impact: "+3%",
                    },
                    {
                      icon: MapPin,
                      label: "Zoning change",
                      status: "Commercial adjacent",
                      impact: "+2%",
                    },
                  ].map((signal) => (
                    <div
                      key={signal.label}
                      className="p-3 rounded-lg bg-white/5 border border-white/5"
                    >
                      <signal.icon className="w-4 h-4 text-lime-400 mb-2" />
                      <div className="text-sm text-white font-medium truncate">
                        {signal.label}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {signal.status}
                      </div>
                      <div className="text-xs text-lime-400 mt-1">
                        {signal.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Confidence</span>
                    <span className="text-lime-400">94%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-lime-400 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: "94%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>
                <button className="px-4 py-2 bg-lime-400 text-black text-sm font-medium rounded-lg">
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// How it works - 3 steps
function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Enter any Texas address",
      desc: "Residential, commercial, or land. All 254 counties covered.",
    },
    {
      num: "2",
      title: "Get instant AI report",
      desc: "Valuation, comparables, and infrastructure growth signals from 50+ data sources.",
    },
    {
      num: "3",
      title: "Certify if needed",
      desc: "Licensed appraiser visits on-site. USPAP-compliant, bank-ready reports.",
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">How it works</h2>
          <p className="text-gray-500">
            From address to insights in three steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-lime-400 text-black font-bold flex items-center justify-center mb-4">
                {step.num}
              </div>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing - Clean 3 column
function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      features: ["5 reports/month", "PDF export"],
      cta: "Start Free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$99",
      period: "/mo",
      features: ["50 reports/month", "API access", "Certification"],
      cta: "Start Trial",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: ["Unlimited", "White-label", "SLA"],
      cta: "Contact",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-16"
        >
          Pricing
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl ${
                plan.highlight
                  ? "bg-lime-400/10 border-2 border-lime-400"
                  : "border border-white/10"
              }`}
            >
              <h3 className="font-semibold text-white mb-4">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-gray-500">{plan.period}</span>
                )}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-gray-400"
                  >
                    <Check className="w-4 h-4 text-lime-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block">
                <button
                  className={`w-full py-3 rounded-full font-medium transition-all ${
                    plan.highlight
                      ? "bg-lime-400 text-black hover:bg-lime-300"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: "What data sources do you use?",
      a: "We aggregate 50+ sources including county permit databases, school district records, DOT road projects, zoning board minutes, and utility filings. We overlay this with MLS records and historical price data showing how values changed when similar infrastructure was announced.",
    },
    {
      q: "How accurate are the valuations?",
      a: "Our AI valuations are within 5% of final sale price 94% of the time. Each report includes a confidence score specific to that property.",
    },
    {
      q: "What's the difference between AI reports and certified appraisals?",
      a: "AI reports are instant valuations for quick decisions. Certified appraisals involve a licensed appraiser visiting on-site and are accepted by banks for lending.",
    },
    {
      q: "Which banks accept your certified appraisals?",
      a: "Our USPAP-compliant appraisals are accepted by most major lenders. Each report includes a list of banks that have previously accepted our appraisals.",
    },
    {
      q: "How often is the data updated?",
      a: "Infrastructure signals are updated daily. We scrape county permit databases, school board announcements, and development filings every 24 hours.",
    },
    {
      q: "Is there an API?",
      a: "Yes. Pro and Enterprise plans include API access. Full documentation available at docs.truplat.com.",
    },
    {
      q: "What areas do you cover?",
      a: "Currently all 254 Texas counties. We're expanding to additional states in 2025.",
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          FAQ
        </motion.h2>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border border-white/5 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-medium text-white">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-4 pb-4 text-gray-400 text-sm">{faq.a}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer - Minimal
function Footer() {
  return (
    <footer className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Image
            src="/truplat.svg"
            alt="TruPlat"
            width={80}
            height={20}
            className="opacity-50"
          />
          <div className="flex gap-6 text-sm text-gray-600">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
