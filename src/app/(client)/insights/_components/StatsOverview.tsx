"use client";

import {
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { AnalysisMetrics } from "./constants";

interface StatsOverviewProps {
  metrics: AnalysisMetrics;
  county: string;
  narrativeInsights: string[];
  isLoading: boolean;
}

export function StatsOverview({
  metrics,
  county,
  narrativeInsights,
  isLoading,
}: StatsOverviewProps) {
  const hasRealInsights =
    metrics.projectsAnalyzed > 0 && narrativeInsights.length > 0;

  return (
    <>
      {/* Infrastructure Impact Overview - Stats Cards */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 clip-notch">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-sm uppercase tracking-wider text-[var(--muted-foreground)]">
            Infrastructure Impact Overview
          </h2>
          <button
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] group relative"
            aria-label="What do these metrics mean?"
          >
            <HelpCircle className="w-4 h-4" />
            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-[var(--secondary)] border border-[var(--border)] rounded text-xs text-[var(--foreground)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <p className="font-semibold text-white mb-2">
                Understanding Metrics
              </p>
              <ul className="space-y-1.5">
                <li>
                  <strong>Appreciation:</strong> Average property value increase
                  near projects
                </li>
                <li>
                  <strong>Median Lag:</strong> Time for appreciation to
                  materialize after project completion
                </li>
                <li>
                  <strong>Correlation:</strong> Statistical relationship between
                  infrastructure and value (0-1 scale)
                </li>
              </ul>
            </div>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white font-mono">
              {metrics.projectsAnalyzed}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              Projects analyzed
            </p>
            <p className="text-xs text-[var(--muted-foreground)] hidden md:block">
              Total infrastructure projects in dataset
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-lime-400 font-mono flex items-center gap-1">
              {metrics.avgAppreciation > 0 ? "+" : ""}
              {metrics.avgAppreciation.toFixed(1)}%
              {metrics.avgAppreciation > 0 ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Avg Appreciation
            </p>
            <p className="text-xs text-[var(--muted-foreground)] hidden md:block">
              Property value increase near projects
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white font-mono">
              {metrics.medianLag.toFixed(1)} yrs
            </p>
            <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Median Lag
            </p>
            <p className="text-xs text-[var(--muted-foreground)] hidden md:block">
              Time for appreciation to materialize
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-white">
              {metrics.topSignalType}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Top Signal{" "}
              <span className="text-lime-400 font-mono">
                ({metrics.topCorrelation.toFixed(2)})
              </span>
            </p>
            <p className="text-xs text-[var(--muted-foreground)] hidden md:block">
              Strongest infrastructure-value correlation
            </p>
          </div>
        </div>
      </div>

      {/* Key Insights - Narrative Summary */}
      {hasRealInsights ? (
        <div className="relative bg-[var(--card)] border border-[var(--border)] clip-notch p-6">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-[var(--border)]" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-[var(--border)]" />

          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-lime-400" />
            Key Insights
          </h3>
          <div className="space-y-3">
            <p className="text-[var(--foreground)]">
              Based on analysis of {metrics.projectsAnalyzed} infrastructure
              projects in {county} County:
            </p>
            <ul className="space-y-2">
              {narrativeInsights.map((insight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-[var(--foreground)]"
                >
                  <span className="text-lime-400 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted-foreground)]">
              Data sourced from public infrastructure records, property tax
              assessments, and municipal bond filings (2017-2024)
            </p>
          </div>
        </div>
      ) : !isLoading && metrics.projectsAnalyzed === 0 ? (
        <div className="relative bg-[var(--card)] border border-[var(--border)] clip-notch p-6">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-[var(--border)]" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-[var(--border)]" />

          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-[var(--muted-foreground)]" />
            Key Insights
          </h3>
          <p className="text-[var(--muted-foreground)]">
            No infrastructure projects found for the current filters. Try
            adjusting your search criteria or expanding the buffer radius to see
            insights.
          </p>
        </div>
      ) : null}
    </>
  );
}
