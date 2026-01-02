"use client";

import { Check, X } from "lucide-react";

interface ComparisonRow {
  aspect: string;
  traditional: string | boolean;
  truplat: string | boolean;
  highlight?: boolean;
}

const comparisonData: ComparisonRow[] = [
  {
    aspect: "Turnaround Time",
    traditional: "2-3 weeks",
    truplat: "24-48 hours",
    highlight: true,
  },
  {
    aspect: "Cost",
    traditional: "$400-800",
    truplat: "Starting at $75",
    highlight: true,
  },
  {
    aspect: "Data Points Analyzed",
    traditional: "3-5 comps",
    truplat: "50+ data sources",
    highlight: true,
  },
  {
    aspect: "Consistency",
    traditional: "Variable by appraiser",
    truplat: "Standardized AI",
  },
  {
    aspect: "Updates",
    traditional: "Manual re-order",
    truplat: "Real-time refresh",
  },
  {
    aspect: "Photo Verification",
    traditional: true,
    truplat: true,
  },
  {
    aspect: "GPS-Verified Evidence",
    traditional: false,
    truplat: true,
  },
  {
    aspect: "Instant Report Generation",
    traditional: false,
    truplat: true,
  },
  {
    aspect: "Market Trend Analysis",
    traditional: "Limited",
    truplat: "AI-powered insights",
  },
  {
    aspect: "USPAP Compliant",
    traditional: true,
    truplat: true,
  },
];

function renderValue(value: string | boolean) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-lime-400" />
    ) : (
      <X className="w-5 h-5 text-gray-600" />
    );
  }
  return <span>{value}</span>;
}

export function ComparisonTable() {
  return (
    <section className="py-24 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-wider text-lime-400 mb-4">
            Side by side
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Traditional vs. <span className="text-lime-400">TruPlat AI</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            See how TruPlat transforms the appraisal process with AI-powered
            efficiency and accuracy.
          </p>
        </div>

        {/* Desktop Comparison table */}
        <div className="hidden md:block relative overflow-hidden clip-notch-lg border border-gray-800 bg-gray-900">
          {/* L-bracket corners */}
          <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-lime-400 z-10" />
          <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-lime-400 z-10" />
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-lime-400 z-10" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-lime-400 z-10" />

          {/* Table header */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="p-6 font-mono text-xs uppercase tracking-wider text-gray-500">
              Feature
            </div>
            <div className="p-6 text-center border-l border-gray-800">
              <span className="font-semibold text-white">Traditional</span>
              <span className="block font-mono text-xs uppercase tracking-wider text-gray-500 mt-1">
                Standard Process
              </span>
            </div>
            <div className="p-6 text-center border-l border-gray-800 bg-lime-500/5">
              <span className="font-semibold text-lime-400">TruPlat AI</span>
              <span className="block font-mono text-xs uppercase tracking-wider text-gray-500 mt-1">
                AI-Powered
              </span>
            </div>
          </div>

          {/* Table rows */}
          {comparisonData.map((row) => (
            <div
              key={row.aspect}
              className={`grid grid-cols-3 border-b border-gray-800 last:border-b-0 ${
                row.highlight ? "bg-lime-500/[0.02]" : ""
              }`}
            >
              <div className="p-5 flex items-center">
                <span
                  className={`text-sm ${
                    row.highlight ? "font-medium text-white" : "text-gray-400"
                  }`}
                >
                  {row.aspect}
                </span>
              </div>
              <div className="p-5 flex items-center justify-center border-l border-gray-800 text-sm text-gray-400">
                {renderValue(row.traditional)}
              </div>
              <div className="p-5 flex items-center justify-center border-l border-gray-800 bg-lime-500/5">
                <span
                  className={`text-sm ${
                    row.highlight ? "font-semibold text-lime-400" : "text-white"
                  }`}
                >
                  {renderValue(row.truplat)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Comparison cards */}
        <div className="md:hidden space-y-4">
          {comparisonData.map((row) => (
            <div
              key={row.aspect}
              className={`relative clip-notch border border-gray-800 bg-gray-900 overflow-hidden ${
                row.highlight ? "border-lime-500/30" : ""
              }`}
            >
              {/* L-bracket corners for highlighted rows */}
              {row.highlight && (
                <>
                  <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-lime-400" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-lime-400" />
                </>
              )}

              {/* Feature name */}
              <div
                className={`px-4 py-3 border-b border-gray-800 ${
                  row.highlight ? "bg-lime-500/5" : ""
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    row.highlight ? "text-lime-400" : "text-white"
                  }`}
                >
                  {row.aspect}
                </span>
              </div>

              {/* Values comparison */}
              <div className="grid grid-cols-2 divide-x divide-gray-800">
                {/* Traditional */}
                <div className="p-4 text-center">
                  <span className="block font-mono text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Traditional
                  </span>
                  <div className="flex items-center justify-center text-sm text-gray-400">
                    {renderValue(row.traditional)}
                  </div>
                </div>

                {/* TruPlat AI */}
                <div className="p-4 text-center bg-lime-500/5">
                  <span className="block font-mono text-xs uppercase tracking-wider text-lime-400 mb-2">
                    TruPlat AI
                  </span>
                  <div
                    className={`flex items-center justify-center text-sm ${
                      row.highlight
                        ? "font-semibold text-lime-400"
                        : "text-white"
                    }`}
                  >
                    {renderValue(row.truplat)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center font-mono text-xs uppercase tracking-wider text-gray-500 mt-8">
          All TruPlat appraisals include GPS-verified photos and are reviewed by
          licensed professionals.
        </p>
      </div>
    </section>
  );
}

export default ComparisonTable;
