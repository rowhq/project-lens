"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  BarChart3,
  MapPin,
  Clock,
  FileText,
  Users,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Analysis",
    description:
      "Advanced machine learning models analyze 50+ data sources for accurate valuations in minutes, not weeks.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description:
      "SOC 2 compliant with end-to-end encryption. Your data is protected with enterprise-level security.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: BarChart3,
    title: "Deep Market Insights",
    description:
      "Real-time market trends, comparable analysis, and risk assessment in every report.",
    color: "text-[var(--primary)]",
    bgColor: "bg-[var(--primary)]/10",
  },
  {
    icon: MapPin,
    title: "Nationwide Coverage",
    description:
      "Access property data across all 50 states with hyper-local market intelligence.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Clock,
    title: "24-48 Hour Delivery",
    description:
      "Get comprehensive appraisal reports in 1-2 business days, not weeks.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: FileText,
    title: "Detailed Reports",
    description:
      "Professional PDF reports with comparables, market analysis, and value justification.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Users,
    title: "Expert Network",
    description:
      "Licensed appraisers available for on-site inspections and certified appraisals.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: TrendingUp,
    title: "Value Tracking",
    description:
      "Monitor property values over time with automated alerts on market changes.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function FeatureShowcase() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
            Everything You Need for
            <span className="text-gradient"> Property Intelligence</span>
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            LENS combines cutting-edge AI with professional appraisal expertise to
            deliver the most comprehensive property valuation platform.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group relative bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 hover:border-[var(--primary)]/50 transition-all duration-300"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--primary)]/0 to-[var(--primary)]/0 group-hover:from-[var(--primary)]/5 group-hover:to-transparent transition-all duration-300" />

                <div className="relative">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
