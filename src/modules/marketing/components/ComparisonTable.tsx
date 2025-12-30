"use client";

import { Check, X } from "lucide-react";

interface ComparisonRow {
  aspect: string;
  traditional: string | boolean;
  lens: string | boolean;
  highlight?: boolean;
}

const comparisonData: ComparisonRow[] = [
  {
    aspect: "Turnaround Time",
    traditional: "2-3 weeks",
    lens: "24-48 hours",
    highlight: true,
  },
  {
    aspect: "Cost",
    traditional: "$400-800",
    lens: "Starting at $75",
    highlight: true,
  },
  {
    aspect: "Data Points Analyzed",
    traditional: "3-5 comps",
    lens: "50+ data sources",
    highlight: true,
  },
  {
    aspect: "Consistency",
    traditional: "Variable by appraiser",
    lens: "Standardized AI",
  },
  {
    aspect: "Updates",
    traditional: "Manual re-order",
    lens: "Real-time refresh",
  },
  {
    aspect: "Photo Verification",
    traditional: true,
    lens: true,
  },
  {
    aspect: "GPS-Verified Evidence",
    traditional: false,
    lens: true,
  },
  {
    aspect: "Instant Report Generation",
    traditional: false,
    lens: true,
  },
  {
    aspect: "Market Trend Analysis",
    traditional: "Limited",
    lens: "AI-powered insights",
  },
  {
    aspect: "USPAP Compliant",
    traditional: true,
    lens: true,
  },
];

function renderValue(value: string | boolean, isLens?: boolean) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-green-500" />
    ) : (
      <X className="w-5 h-5 text-red-400" />
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
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
            Traditional vs. <span className="text-gradient">LENS AI</span>
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            See how LENS transforms the appraisal process with AI-powered
            efficiency and accuracy.
          </p>
        </div>

        {/* Desktop Comparison table */}
        <div className="hidden md:block relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          {/* Table header */}
          <div className="grid grid-cols-3 border-b border-[var(--border)]">
            <div className="p-6 font-medium text-[var(--muted-foreground)]">
              Feature
            </div>
            <div className="p-6 text-center border-l border-[var(--border)]">
              <span className="font-semibold text-[var(--foreground)]">
                Traditional
              </span>
              <span className="block text-sm text-[var(--muted-foreground)] mt-1">
                Standard Process
              </span>
            </div>
            <div className="p-6 text-center border-l border-[var(--border)] bg-[var(--primary)]/5">
              <span className="font-semibold text-[var(--primary)]">
                LENS AI
              </span>
              <span className="block text-sm text-[var(--muted-foreground)] mt-1">
                AI-Powered
              </span>
            </div>
          </div>

          {/* Table rows */}
          {comparisonData.map((row) => (
            <div
              key={row.aspect}
              className={`grid grid-cols-3 border-b border-[var(--border)] last:border-b-0 ${
                row.highlight ? "bg-[var(--primary)]/[0.02]" : ""
              }`}
            >
              <div className="p-5 flex items-center">
                <span
                  className={`text-sm ${
                    row.highlight
                      ? "font-medium text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {row.aspect}
                </span>
              </div>
              <div className="p-5 flex items-center justify-center border-l border-[var(--border)] text-sm text-[var(--muted-foreground)]">
                {renderValue(row.traditional)}
              </div>
              <div className="p-5 flex items-center justify-center border-l border-[var(--border)] bg-[var(--primary)]/5">
                <span
                  className={`text-sm ${
                    row.highlight
                      ? "font-semibold text-[var(--primary)]"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {renderValue(row.lens)}
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
              className={`rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden ${
                row.highlight ? "ring-1 ring-[var(--primary)]/30" : ""
              }`}
            >
              {/* Feature name */}
              <div className={`px-4 py-3 border-b border-[var(--border)] ${
                row.highlight ? "bg-[var(--primary)]/5" : ""
              }`}>
                <span className={`text-sm font-medium ${
                  row.highlight ? "text-[var(--primary)]" : "text-[var(--foreground)]"
                }`}>
                  {row.aspect}
                </span>
              </div>

              {/* Values comparison */}
              <div className="grid grid-cols-2 divide-x divide-[var(--border)]">
                {/* Traditional */}
                <div className="p-4 text-center">
                  <span className="block text-xs text-[var(--muted-foreground)] mb-2">Traditional</span>
                  <div className="flex items-center justify-center text-sm text-[var(--muted-foreground)]">
                    {renderValue(row.traditional)}
                  </div>
                </div>

                {/* LENS AI */}
                <div className="p-4 text-center bg-[var(--primary)]/5">
                  <span className="block text-xs text-[var(--primary)] mb-2 font-medium">LENS AI</span>
                  <div className={`flex items-center justify-center text-sm ${
                    row.highlight ? "font-semibold text-[var(--primary)]" : "text-[var(--foreground)]"
                  }`}>
                    {renderValue(row.lens)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
          All LENS appraisals include GPS-verified photos and are reviewed by
          licensed professionals.
        </p>
      </div>
    </section>
  );
}

export default ComparisonTable;
