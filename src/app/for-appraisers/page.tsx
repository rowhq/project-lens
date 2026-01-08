/**
 * For Appraisers Landing Page
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Shield,
  Smartphone,
  Car,
  ChevronDown,
  Check,
  Sparkles,
  Camera,
  FileText,
} from "lucide-react";
import { LedgerHeader } from "@/shared/components/layout/LedgerHeader";

export default function ForAppraisersPage() {
  const navItems = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Clients", href: "/" },
  ];

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <div className="fixed top-0 left-0 right-0 z-50">
        <LedgerHeader
          navItems={navItems}
          actionButtonText="Apply Now"
          actionButtonHref="/register?role=appraiser"
        />
      </div>

      <div className="h-16" />

      <Hero />
      <HowItWorks />
      <ProductDemo />
      <Requirements />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-400/8 via-transparent to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] mb-6">
            <span className="text-white">Accept jobs.</span>
            <br />
            <span className="bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 bg-clip-text text-transparent">
              AI does the rest.
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join Texas&apos;s fastest-growing appraiser network. Accept jobs on
            your schedule, let AI assemble your reports.
          </p>
          <Link href="/register?role=appraiser">
            <button className="group px-8 py-4 bg-lime-400 text-black font-semibold rounded-full hover:shadow-[0_0_40px_rgba(163,230,53,0.4)] transition-all">
              <span className="flex items-center gap-2">
                Apply Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>

          <div className="mt-10 flex justify-center gap-8 text-sm text-gray-500">
            <span>Weekly payouts</span>
            <span>Your schedule</span>
            <span>AI co-pilot</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProductDemo() {
  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Field capture UI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-xl border border-white/10 bg-gray-950 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 text-center text-xs text-gray-500">
                  On-Site Capture
                </div>
              </div>

              <div className="p-4">
                {/* Property header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                  <MapPin className="w-5 h-5 text-lime-400" />
                  <div>
                    <div className="font-medium text-white">
                      1847 Oak Avenue
                    </div>
                    <div className="text-sm text-gray-500">
                      Austin, TX 78704
                    </div>
                  </div>
                </div>

                {/* Photo grid */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Photos
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg bg-white/5 flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-lime-400" />
                      </div>
                    ))}
                    <div className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Field notes */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Field Notes
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-white/5 text-sm text-gray-300">
                      Kitchen remodeled 2023, granite counters
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 text-sm text-gray-300">
                      New HVAC system, hardwood floors throughout
                    </div>
                    <div className="p-3 rounded-lg border border-dashed border-white/10 text-sm text-gray-500 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Add note...
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button className="w-full py-3 bg-lime-400 text-black font-medium rounded-lg">
                  Submit to AI
                </button>
              </div>
            </div>
          </motion.div>

          {/* AI compiles report */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="rounded-xl border border-white/10 bg-gray-950 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 text-center text-xs text-gray-500">
                  AI Report Builder
                </div>
              </div>

              <div className="p-4">
                {/* Progress header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-lime-400/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-lime-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      Compiling report...
                    </div>
                    <div className="text-sm text-gray-500">1847 Oak Avenue</div>
                  </div>
                  <div className="text-sm text-lime-400">85%</div>
                </div>

                {/* What AI is doing */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-lime-400 flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-sm text-gray-300">
                      Photos organized by room
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-lime-400 flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-sm text-gray-300">
                      Field notes parsed
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-lime-400 flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-sm text-gray-300">
                      6 comparables selected
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-lime-400 flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-sm text-gray-300">
                      Market analysis generated
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-lime-400 flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 bg-lime-400 rounded-full" />
                    </div>
                    <span className="text-sm text-white">
                      Formatting USPAP report...
                    </span>
                  </div>
                </div>

                {/* AI insight */}
                <div className="p-3 rounded-lg bg-lime-400/5 border border-lime-400/20 mb-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-lime-400 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <span className="text-lime-400">AI:</span> Your note about
                      the 2023 kitchen remodel added $12K to suggested value
                      based on comparable adjustments.
                    </div>
                  </div>
                </div>

                {/* Preview button */}
                <button className="w-full py-3 bg-white/5 text-white font-medium rounded-lg">
                  Preview Draft
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Apply online",
      desc: "Submit license info, takes 5 minutes",
    },
    {
      num: "2",
      title: "Set your area",
      desc: "Choose coverage radius and hours",
    },
    { num: "3", title: "Accept jobs", desc: "Get notified, accept what works" },
    {
      num: "4",
      title: "AI assembles report",
      desc: "Review, approve, get paid",
    },
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-16"
        >
          How it works
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-10 h-10 rounded-full bg-lime-400 text-black font-bold flex items-center justify-center mx-auto mb-4">
                {step.num}
              </div>
              <h3 className="font-semibold text-white mb-1">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Requirements() {
  const reqs = [
    { icon: Shield, title: "Valid license", desc: "Texas appraiser license" },
    { icon: Smartphone, title: "Smartphone", desc: "iPhone or Android" },
    { icon: Car, title: "Transportation", desc: "Reliable vehicle" },
  ];

  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl border border-white/10 text-center"
        >
          <h2 className="text-2xl font-bold mb-8">Requirements</h2>
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            {reqs.map((r) => (
              <div key={r.title}>
                <r.icon className="w-8 h-8 text-lime-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-1">{r.title}</h3>
                <p className="text-sm text-gray-500">{r.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/register?role=appraiser">
            <button className="px-8 py-4 bg-lime-400 text-black font-semibold rounded-full hover:bg-lime-300 transition-colors">
              Apply Now
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I get paid?",
      a: "Weekly direct deposits every Friday for completed jobs.",
    },
    {
      q: "How does the AI co-pilot work?",
      a: "Upload your photos and the AI auto-generates comparables, market analysis, and a draft report. You review and approve.",
    },
    {
      q: "How many jobs can I expect?",
      a: "Depends on location. Metro areas typically see multiple jobs per week.",
    },
    {
      q: "How long does approval take?",
      a: "Most applications approved within 24-48 hours after license verification.",
    },
    {
      q: "Can I choose which jobs I take?",
      a: "Yes. Accept jobs that work for you, decline those that don't. No minimums.",
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
                  className={`w-5 h-5 text-gray-500 transition-transform ${open === i ? "rotate-180" : ""}`}
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

function CTA() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-lime-400/10 via-transparent to-transparent" />

      <div className="relative max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-6">Start earning today</h2>
          <p className="text-gray-400 mb-8">
            Free to apply. Most approved within 48 hours.
          </p>
          <Link href="/register?role=appraiser">
            <button className="group px-8 py-4 bg-lime-400 text-black font-semibold rounded-full hover:shadow-[0_0_40px_rgba(163,230,53,0.4)] transition-all">
              <span className="flex items-center gap-2">
                Apply Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/truplat.svg"
              alt="TruPlat"
              width={80}
              height={20}
              className="opacity-50"
            />
            <span className="text-sm text-gray-600">For Appraisers</span>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </footer>
  );
}
