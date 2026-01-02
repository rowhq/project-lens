"use client";

import { useState, useEffect, useRef } from "react";
import {
  Check,
  ChevronDown,
  Zap,
  DollarSign,
  Database,
  Quote,
} from "lucide-react";

// Hero stat data - the 3 most impactful differentiators
const heroStats = [
  {
    icon: Zap,
    multiplier: "10x",
    label: "Faster",
    comparison: "24hrs vs 2 weeks",
    quote: "Turnaround dropped from weeks to 24 hours. Game changer.",
    author: "Sarah M.",
    company: "Texas Home Loans",
  },
  {
    icon: DollarSign,
    multiplier: "80%",
    label: "Cheaper",
    comparison: "$75 vs $400+",
    quote: "Cut our appraisal costs dramatically without sacrificing quality.",
    author: "Michael C.",
    company: "Lone Star Investments",
  },
  {
    icon: Database,
    multiplier: "50+",
    label: "Data Sources",
    comparison: "vs 3-5 comps",
    quote: "The depth of analysis catches risks we would have missed.",
    author: "Jennifer R.",
    company: "Hill Country Bank",
  },
];

// Exclusive TruPlat features
const exclusiveFeatures = [
  "GPS-Verified Evidence",
  "Instant Report Generation",
  "Real-time Market Refresh",
  "AI-Powered Trend Analysis",
];

// Full comparison data for expandable section
const fullComparisonData = [
  {
    aspect: "Turnaround Time",
    traditional: "2-3 weeks",
    truplat: "24-48 hours",
  },
  { aspect: "Starting Cost", traditional: "$400-800", truplat: "From $75" },
  { aspect: "Data Points", traditional: "3-5 comps", truplat: "50+ sources" },
  {
    aspect: "Consistency",
    traditional: "Variable",
    truplat: "Standardized AI",
  },
  { aspect: "Updates", traditional: "Manual re-order", truplat: "Real-time" },
  { aspect: "GPS Evidence", traditional: "No", truplat: "Yes" },
  { aspect: "Instant Reports", traditional: "No", truplat: "Yes" },
];

// Animated counter hook
function useCountUp(
  end: number,
  duration: number = 1500,
  start: boolean = false,
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
}

// Hero Stat Card with integrated testimonial
function HeroStatCard({
  stat,
  isVisible,
  delay,
}: {
  stat: (typeof heroStats)[0];
  isVisible: boolean;
  delay: number;
}) {
  const Icon = stat.icon;
  const numericValue = parseInt(stat.multiplier.replace(/\D/g, "")) || 0;
  const suffix = stat.multiplier.replace(/\d/g, "");
  const count = useCountUp(numericValue, 1500, isVisible);

  return (
    <div
      className="group relative bg-gray-900 border border-gray-800 clip-notch transition-all duration-500 hover:border-lime-500/50 overflow-hidden"
      style={{
        transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* L-bracket corners */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

      {/* Top section - Stat */}
      <div className="p-6 text-center">
        {/* Icon */}
        <div className="w-10 h-10 mx-auto mb-3 bg-lime-500/10 border border-lime-500/30 clip-notch-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-lime-400" />
        </div>

        {/* Multiplier - animated */}
        <div className="text-4xl sm:text-5xl font-bold text-lime-400 mb-1">
          {count}
          {suffix}
        </div>

        {/* Label */}
        <div className="font-mono text-sm uppercase tracking-wider text-white mb-1">
          {stat.label}
        </div>

        {/* Comparison */}
        <div className="font-mono text-xs uppercase tracking-wider text-gray-500">
          {stat.comparison}
        </div>
      </div>

      {/* Bottom section - Quote */}
      <div className="px-5 py-4 bg-gray-950 border-t border-gray-800">
        <div className="flex gap-2">
          <Quote className="w-4 h-4 text-lime-400/30 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-400 leading-relaxed mb-2">
              {stat.quote}
            </p>
            <p className="font-mono text-xs uppercase tracking-wider text-gray-600">
              {stat.author} · {stat.company}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComparisonTable() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-4">
            Real Results
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why Lenders Choose TruPlat
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Measurable impact backed by real client experiences.
          </p>
        </div>

        {/* Hero Stats with integrated testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {heroStats.map((stat, index) => (
            <HeroStatCard
              key={stat.label}
              stat={stat}
              isVisible={isVisible}
              delay={index * 150}
            />
          ))}
        </div>

        {/* Only with TruPlat - Compact feature list */}
        <div
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-8 transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transitionDelay: "500ms",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        >
          <span className="font-mono text-xs uppercase tracking-wider text-gray-500">
            Also included:
          </span>
          {exclusiveFeatures.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 bg-lime-400 flex-shrink-0"
                style={{
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
              />
              <span className="text-sm text-gray-400">{feature}</span>
            </div>
          ))}
        </div>

        {/* Expandable Full Comparison */}
        <div
          className="transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transitionDelay: "600ms",
          }}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-800 bg-gray-900/50 clip-notch-sm font-mono text-xs uppercase tracking-wider text-gray-500 hover:text-white hover:border-gray-700 transition-colors"
            style={{
              transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
            }}
          >
            {isExpanded ? "Hide" : "See"} Full Comparison
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Expandable table */}
          <div
            className={`overflow-hidden transition-all duration-500 ${
              isExpanded
                ? "max-h-[600px] opacity-100 mt-4"
                : "max-h-0 opacity-0"
            }`}
            style={{
              transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
            }}
          >
            <div className="relative bg-gray-900 border border-gray-800 clip-notch overflow-hidden">
              {/* L-bracket corners */}
              <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400 z-10" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400 z-10" />

              {/* Table header */}
              <div className="grid grid-cols-3 border-b border-gray-800 bg-gray-950">
                <div className="p-4 font-mono text-xs uppercase tracking-wider text-gray-500">
                  Feature
                </div>
                <div className="p-4 text-center border-l border-gray-800 font-mono text-xs uppercase tracking-wider text-gray-500">
                  Traditional
                </div>
                <div className="p-4 text-center border-l border-gray-800 bg-lime-500/5 font-mono text-xs uppercase tracking-wider text-lime-400">
                  TruPlat
                </div>
              </div>

              {/* Table rows */}
              {fullComparisonData.map((row, index) => (
                <div
                  key={row.aspect}
                  className={`grid grid-cols-3 border-b border-gray-800 last:border-b-0 ${
                    index % 2 === 0 ? "" : "bg-gray-950/50"
                  }`}
                >
                  <div className="p-4 text-sm text-gray-300">{row.aspect}</div>
                  <div className="p-4 text-center border-l border-gray-800 text-sm text-gray-500">
                    {row.traditional}
                  </div>
                  <div className="p-4 text-center border-l border-gray-800 bg-lime-500/5 text-sm text-white font-medium">
                    {row.traditional === "No" && row.truplat === "Yes" ? (
                      <Check className="w-5 h-5 text-lime-400 mx-auto" />
                    ) : (
                      row.truplat
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div
          className="mt-8 text-center transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transitionDelay: "700ms",
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        >
          <p className="font-mono text-xs uppercase tracking-wider text-gray-600">
            Trusted by <span className="text-lime-400">500+</span> lenders
            across Texas
          </p>
        </div>
      </div>
    </section>
  );
}

export default ComparisonTable;
