"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Layers, Zap, TrendingUp } from "lucide-react";

// Hero stat data
const heroStats = [
  {
    icon: Layers,
    value: 50,
    suffix: "+",
    label: "Data Sources",
    comparison: "vs 3-5 Traditional",
  },
  {
    icon: Zap,
    value: 30,
    suffix: "s",
    label: "AI Report",
    comparison: "vs 2-3 Weeks",
  },
  {
    icon: TrendingUp,
    value: 80,
    suffix: "%",
    label: "Cost Savings",
    comparison: "vs Traditional",
  },
];

// Unique features
const uniqueFeatures = [
  "County permit scraping",
  "Infrastructure signals",
  "Growth forecasts",
  "GPS-verified photos",
];

// Full comparison data
const comparisonData = [
  { aspect: "AI Report", traditional: "Not available", truplat: "~30 seconds" },
  {
    aspect: "On-Site Inspection",
    traditional: "2-3 weeks",
    truplat: "24-48 hours",
  },
  { aspect: "Starting Cost", traditional: "$400-800", truplat: "Free" },
  { aspect: "Data Points", traditional: "3-5 comps", truplat: "50+ sources" },
  { aspect: "Infrastructure Data", traditional: "No", truplat: "Yes" },
  { aspect: "GPS Evidence", traditional: "No", truplat: "Yes" },
];

// Animated counter
function AnimatedNumber({
  value,
  suffix = "",
  isVisible,
}: {
  value: number;
  suffix?: string;
  isVisible: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  return (
    <>
      {count}
      {suffix}
    </>
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
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-lime-400 mb-4">
            Why TruPlat
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Data no one else has.
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We scrape county infrastructure documents daily. See growth signals
            before they hit property values.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {heroStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.6s ease-out ${index * 0.15}s`,
                }}
              >
                <div className="absolute -inset-px bg-gradient-to-b from-lime-400/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gray-900/80 backdrop-blur border border-gray-800 group-hover:border-lime-400/50 rounded-xl p-8 text-center transition-all duration-500">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-lime-400/50 group-hover:border-lime-400 rounded-tl-xl transition-colors" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-lime-400/30 group-hover:border-lime-400 rounded-br-xl transition-colors" />

                  <div className="w-12 h-12 mx-auto mb-4 bg-lime-400/10 border border-lime-400/30 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-lime-400" />
                  </div>

                  <div className="text-5xl font-bold text-white mb-2">
                    <AnimatedNumber
                      value={stat.value}
                      suffix={stat.suffix}
                      isVisible={isVisible}
                    />
                  </div>

                  <div className="font-mono text-sm uppercase tracking-wider text-white mb-1">
                    {stat.label}
                  </div>

                  <div className="font-mono text-xs uppercase tracking-wider text-gray-500">
                    {stat.comparison}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unique features */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.6s ease-out 0.5s",
          }}
        >
          <span className="font-mono text-xs uppercase tracking-wider text-gray-500">
            Only with TruPlat:
          </span>
          {uniqueFeatures.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 px-3 py-1.5 bg-lime-400/5 border border-lime-400/20 rounded-full"
            >
              <div className="w-1.5 h-1.5 bg-lime-400 rounded-full" />
              <span className="text-sm text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* Expandable comparison */}
        <div
          style={{
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.6s ease-out 0.6s",
          }}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900/50 border border-gray-800 rounded-xl font-mono text-sm uppercase tracking-wider text-gray-400 hover:text-white hover:border-gray-700 transition-all duration-300"
          >
            {isExpanded ? "Hide" : "See"} Full Comparison
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-500 ${
              isExpanded
                ? "max-h-[600px] opacity-100 mt-4"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-3 border-b border-gray-800">
                <div className="p-4 font-mono text-xs uppercase tracking-wider text-gray-500">
                  Feature
                </div>
                <div className="p-4 text-center border-l border-gray-800 font-mono text-xs uppercase tracking-wider text-gray-500">
                  Traditional
                </div>
                <div className="p-4 text-center border-l border-gray-800 bg-lime-400/5 font-mono text-xs uppercase tracking-wider text-lime-400">
                  TruPlat
                </div>
              </div>

              {/* Table rows */}
              {comparisonData.map((row, index) => (
                <div
                  key={row.aspect}
                  className={`grid grid-cols-3 border-b border-gray-800 last:border-b-0 ${
                    index % 2 === 1 ? "bg-gray-950/30" : ""
                  }`}
                >
                  <div className="p-4 text-gray-300">{row.aspect}</div>
                  <div className="p-4 text-center border-l border-gray-800 text-gray-500">
                    {row.traditional}
                  </div>
                  <div className="p-4 text-center border-l border-gray-800 bg-lime-400/5">
                    {row.traditional === "No" && row.truplat === "Yes" ? (
                      <Check className="w-5 h-5 text-lime-400 mx-auto" />
                    ) : (
                      <span className="text-white font-medium">
                        {row.truplat}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ComparisonTable;
