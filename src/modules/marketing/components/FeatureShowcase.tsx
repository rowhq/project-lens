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
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "End-to-end encryption with enterprise-level security. Your data is protected at every step.",
  },
  {
    icon: BarChart3,
    title: "Deep Market Insights",
    description:
      "Real-time market trends, comparable analysis, and risk assessment in every report.",
  },
  {
    icon: MapPin,
    title: "Texas Coverage",
    description:
      "Comprehensive property data across Texas with hyper-local market intelligence. More states coming 2025.",
  },
  {
    icon: Clock,
    title: "24-48 Hour Delivery",
    description:
      "Get comprehensive appraisal reports in 1-2 business days, not weeks.",
  },
  {
    icon: FileText,
    title: "Detailed Reports",
    description:
      "Professional PDF reports with comparables, market analysis, and value justification.",
  },
  {
    icon: Users,
    title: "Expert Network",
    description:
      "Licensed appraisers available for on-site inspections and certified appraisals.",
  },
  {
    icon: TrendingUp,
    title: "Value Tracking",
    description:
      "Monitor property values over time with automated alerts on market changes.",
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
          <p className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-4">
            Platform Capabilities
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
            Everything You Need for
            <br />
            <span className="text-lime-400">Property Intelligence</span>
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            TruPlat combines cutting-edge AI with professional appraisal
            expertise to deliver the most comprehensive property valuation
            platform.
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
                className="group relative bg-[var(--card)] clip-notch border border-[var(--border)] p-6 hover:border-lime-500/50 transition-all"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
                }}
              >
                {/* L-bracket corners on hover */}
                <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <div className="w-12 h-12 bg-lime-500/10 border border-lime-500/30 clip-notch-sm flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-lime-400" />
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
