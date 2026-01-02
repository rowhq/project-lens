"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Clock, DollarSign } from "lucide-react";

const caseStudies = [
  {
    company: "Texas Capital Lending",
    companyInitials: "TCL",
    industry: "Mortgage Lender",
    location: "Dallas, TX",
    quote:
      "TruPlat cut our appraisal turnaround from 2 weeks to 48 hours. Our closings are faster and our borrowers are happier.",
    author: "Sarah Mitchell",
    role: "VP of Operations",
    metrics: [
      { label: "Turnaround Reduced", value: "85%", icon: Clock },
      { label: "Cost Savings", value: "$127K/yr", icon: DollarSign },
      { label: "More Closings", value: "+23%", icon: TrendingUp },
    ],
  },
  {
    company: "Austin Investment Group",
    companyInitials: "AIG",
    industry: "Real Estate Investor",
    location: "Austin, TX",
    quote:
      "The AI reports give us instant property intelligence. We can make offers faster and with more confidence than our competition.",
    author: "Marcus Chen",
    role: "Managing Partner",
    metrics: [
      { label: "Deals Evaluated", value: "3x more", icon: TrendingUp },
      { label: "Report Cost", value: "-67%", icon: DollarSign },
      { label: "Decision Time", value: "< 1 day", icon: Clock },
    ],
  },
];

export function CaseStudySection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <span className="inline-block px-3 py-1 text-sm font-medium bg-[var(--primary)]/10 text-[var(--primary)] rounded-full mb-4">
            Success Stories
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Real Results from Texas Professionals
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            See how lenders and investors are transforming their workflow with
            TruPlat
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.company}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-[var(--border)]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-[var(--primary)]">
                      {study.companyInitials}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">
                      {study.company}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {study.industry} • {study.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="p-6">
                <blockquote className="text-lg text-[var(--foreground)] leading-relaxed">
                  &ldquo;{study.quote}&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--secondary)] flex items-center justify-center">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {study.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {study.author}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {study.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="px-6 pb-6">
                <div className="grid grid-cols-3 gap-3">
                  {study.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="p-3 rounded-xl bg-[var(--secondary)] text-center"
                    >
                      <metric.icon className="w-5 h-5 text-[var(--primary)] mx-auto mb-1" />
                      <p className="text-lg font-bold text-[var(--foreground)]">
                        {metric.value}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="/register"
            className="inline-flex items-center gap-2 text-[var(--primary)] font-semibold hover:underline"
          >
            Join 500+ Texas professionals using TruPlat
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
