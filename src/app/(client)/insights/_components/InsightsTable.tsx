"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, Activity, Info, Check } from "lucide-react";
import {
  InsightItem,
  InsightType,
  SIGNAL_TYPES,
  DEFAULT_FILTERS,
} from "./constants";
import { getInsightIcon } from "./helpers";

interface InsightsTableProps {
  items: InsightItem[] | undefined;
  isLoading: boolean;
  searchQuery: string;
  county: string;
  bufferMiles: number;
  selectedType: InsightType | "ALL";
  hasActiveFilters: boolean;
  compareMode: boolean;
  selectedForCompare: string[];
  onClearSearch: () => void;
  onExpandBuffer: () => void;
  onShowAllTypes: () => void;
  onClearAllFilters: () => void;
  onToggleCompare: (id: string) => void;
}

export function InsightsTable({
  items,
  isLoading,
  searchQuery,
  county,
  bufferMiles,
  selectedType,
  hasActiveFilters,
  compareMode,
  selectedForCompare,
  onClearSearch,
  onExpandBuffer,
  onShowAllTypes,
  onClearAllFilters,
  onToggleCompare,
}: InsightsTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="divide-y divide-[var(--border)]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[var(--secondary)] clip-notch" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--secondary)] rounded w-3/4" />
                <div className="h-3 bg-[var(--secondary)] rounded w-1/2" />
              </div>
              <div className="text-right space-y-2">
                <div className="h-5 bg-[var(--secondary)] rounded w-16 ml-auto" />
                <div className="h-3 bg-[var(--secondary)] rounded w-12 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <Activity className="w-12 h-12 mx-auto text-[var(--muted-foreground)]" />
        <p className="mt-4 text-white font-medium">
          No infrastructure projects found
        </p>
        <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-6">
          {searchQuery
            ? `No results for "${searchQuery}" in ${county} County`
            : `No projects match your current filters in ${county} County`}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="px-4 py-2 text-sm border border-[var(--border)] text-[var(--foreground)] clip-notch hover:border-lime-400/50 transition-colors"
            >
              Clear search
            </button>
          )}
          {bufferMiles < 5 && (
            <button
              onClick={onExpandBuffer}
              className="px-4 py-2 text-sm border border-[var(--border)] text-[var(--foreground)] clip-notch hover:border-lime-400/50 transition-colors"
            >
              Expand to 5 mi buffer
            </button>
          )}
          {selectedType !== "ALL" && (
            <button
              onClick={onShowAllTypes}
              className="px-4 py-2 text-sm border border-[var(--border)] text-[var(--foreground)] clip-notch hover:border-lime-400/50 transition-colors"
            >
              Show all types
            </button>
          )}
          {hasActiveFilters && (
            <button
              onClick={onClearAllFilters}
              className="px-4 py-2 text-sm bg-lime-400/10 text-lime-400 border border-lime-400/30 clip-notch hover:bg-lime-400/20 transition-colors"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="md:hidden divide-y divide-[var(--border)]">
        {items.map((insight) => (
          <Link
            key={insight.id}
            href={`/insights/${insight.id}`}
            className="block p-4 hover:bg-[var(--secondary)]/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-1.5 bg-[var(--secondary)] clip-notch text-[var(--muted-foreground)] shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {insight.title}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {insight.city || insight.county}, {insight.state}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-[var(--secondary)] text-[var(--muted-foreground)] border border-[var(--border)] clip-notch font-mono uppercase">
                      {insight.type
                        .replace(/_/g, " ")
                        .replace(/PROJECT|CONSTRUCTION/g, "")
                        .trim()}
                    </span>
                    {insight.projectYear && (
                      <span className="text-[var(--muted-foreground)] font-mono">
                        {insight.projectYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2">
                {insight.avgValueChange !== null ? (
                  <span
                    className={`text-lg font-bold font-mono ${
                      insight.avgValueChange > 0
                        ? "text-lime-400"
                        : "text-red-400"
                    }`}
                  >
                    {insight.avgValueChange > 0 ? "+" : ""}
                    {insight.avgValueChange.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-[var(--muted-foreground)] text-lg">
                    —
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
              </div>
            </div>
            {/* Metrics row */}
            <div className="mt-3 pt-3 border-t border-[var(--border)]/50 grid grid-cols-4 gap-2 text-xs">
              <div>
                <p className="text-[var(--muted-foreground)]">Parcels</p>
                <p className="font-mono text-white">
                  {insight.parcelsAffected?.toLocaleString() || "—"}
                </p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)]">Lag</p>
                <p className="font-mono text-white">
                  {insight.lagPeriodYears !== null
                    ? `${insight.lagPeriodYears.toFixed(1)}y`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)]">Correlation</p>
                <p
                  className={`font-mono ${
                    insight.correlation !== null && insight.correlation > 0.5
                      ? "text-lime-400"
                      : insight.correlation !== null &&
                          insight.correlation > 0.3
                        ? "text-yellow-400"
                        : "text-white"
                  }`}
                >
                  {insight.correlation !== null
                    ? insight.correlation.toFixed(2)
                    : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[var(--muted-foreground)]">Value</p>
                <p
                  className={`font-mono ${
                    insight.avgValueChange !== null &&
                    insight.avgValueChange > 0
                      ? "text-lime-400"
                      : insight.avgValueChange !== null &&
                          insight.avgValueChange < 0
                        ? "text-red-400"
                        : "text-white"
                  }`}
                >
                  {insight.avgValueChange !== null
                    ? `${insight.avgValueChange > 0 ? "+" : ""}${insight.avgValueChange.toFixed(1)}%`
                    : "—"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/30">
              {compareMode && (
                <th className="px-2 py-3 w-10">
                  <span className="sr-only">Compare</span>
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                Project
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                Year
              </th>
              <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                Parcels
              </th>
              <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                Value Change
              </th>
              <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] group relative">
                <button
                  type="button"
                  className="flex items-center justify-end gap-1 w-full focus:outline-none focus:text-lime-400"
                  aria-describedby="lag-tooltip"
                >
                  Lag
                  <Info className="w-3 h-3 text-[var(--muted-foreground)] group-focus-within:text-lime-400" />
                </button>
                <span
                  id="lag-tooltip"
                  role="tooltip"
                  className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-[var(--secondary)] text-xs text-[var(--foreground)] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity whitespace-nowrap z-10"
                >
                  Time for appreciation to materialize
                </span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] group relative">
                <button
                  type="button"
                  className="flex items-center justify-end gap-1 w-full focus:outline-none focus:text-lime-400"
                  aria-describedby="correlation-tooltip"
                >
                  Correlation
                  <Info className="w-3 h-3 text-[var(--muted-foreground)] group-focus-within:text-lime-400" />
                </button>
                <span
                  id="correlation-tooltip"
                  role="tooltip"
                  className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-[var(--secondary)] text-xs text-[var(--foreground)] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity whitespace-nowrap z-10"
                >
                  0-1 scale: higher = stronger relationship
                </span>
              </th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {items.map((insight) => {
              const isSelected = selectedForCompare.includes(insight.id);
              return (
                <tr
                  key={insight.id}
                  onClick={() => {
                    if (!compareMode) {
                      router.push(`/insights/${insight.id}`);
                    }
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !compareMode) {
                      e.preventDefault();
                      router.push(`/insights/${insight.id}`);
                    }
                  }}
                  tabIndex={0}
                  role={compareMode ? "row" : "link"}
                  aria-label={
                    compareMode
                      ? `Select ${insight.title} for comparison`
                      : `View details for ${insight.title}`
                  }
                  className={`transition-colors focus:outline-none focus:ring-1 focus:ring-lime-400/50 ${
                    compareMode
                      ? isSelected
                        ? "bg-lime-400/10"
                        : "hover:bg-[var(--secondary)]/30 cursor-pointer"
                      : "hover:bg-[var(--secondary)]/30 cursor-pointer"
                  }`}
                >
                  {compareMode && (
                    <td className="px-2 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCompare(insight.id);
                        }}
                        className={`w-5 h-5 border clip-notch flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-lime-400 border-lime-400 text-black"
                            : selectedForCompare.length >= 3
                              ? "border-[var(--border)] text-[var(--muted-foreground)] cursor-not-allowed"
                              : "border-[var(--border)] hover:border-lime-400/50"
                        }`}
                        disabled={!isSelected && selectedForCompare.length >= 3}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-[var(--secondary)] clip-notch text-[var(--muted-foreground)]">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {insight.title}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {insight.city || insight.county}, {insight.state}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-mono uppercase tracking-wider bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] clip-notch">
                      {insight.type
                        .replace(/_/g, " ")
                        .replace(/PROJECT|CONSTRUCTION/g, "")
                        .trim()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-white">
                    {insight.projectYear || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-mono text-white">
                    {insight.parcelsAffected?.toLocaleString() || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {insight.avgValueChange !== null ? (
                      <span
                        className={`text-sm font-mono ${
                          insight.avgValueChange > 0
                            ? "text-lime-400"
                            : "text-red-400"
                        }`}
                      >
                        {insight.avgValueChange > 0 ? "+" : ""}
                        {insight.avgValueChange.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-sm text-[var(--muted-foreground)]">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-mono text-white">
                    {insight.lagPeriodYears !== null
                      ? `${insight.lagPeriodYears.toFixed(1)} yrs`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {insight.correlation !== null ? (
                      <span
                        className={`text-sm font-mono ${
                          insight.correlation > 0.5
                            ? "text-lime-400"
                            : insight.correlation > 0.3
                              ? "text-yellow-400"
                              : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {insight.correlation.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-[var(--muted-foreground)]">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table footer */}
      {items.length > 0 && (
        <div className="px-4 py-3 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)] flex items-center justify-between">
          <span>
            Showing {items.length} projects sorted by correlation strength
          </span>
          <span className="text-[var(--muted-foreground)]">
            Click any row to view details
          </span>
        </div>
      )}
    </>
  );
}
