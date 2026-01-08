"use client";

import { GitCompare, Download, Share2 } from "lucide-react";
import { InsightItem } from "./constants";

interface ComparisonPanelProps {
  comparisonItems: InsightItem[];
  selectedForCompare: string[];
  onClearSelection: () => void;
}

export function ComparisonPanel({
  comparisonItems,
  selectedForCompare,
  onClearSelection,
}: ComparisonPanelProps) {
  const handleExportCSV = () => {
    const headers = ["Metric", ...comparisonItems.map((i) => i.title)];
    const rows = [
      ["Type", ...comparisonItems.map((i) => i.type.replace(/_/g, " "))],
      [
        "Location",
        ...comparisonItems.map((i) => `${i.city || i.county}, ${i.state}`),
      ],
      ["Year", ...comparisonItems.map((i) => i.projectYear?.toString() || "—")],
      [
        "Value Change",
        ...comparisonItems.map((i) =>
          i.avgValueChange !== null
            ? `${i.avgValueChange > 0 ? "+" : ""}${i.avgValueChange.toFixed(1)}%`
            : "—",
        ),
      ],
      [
        "Parcels",
        ...comparisonItems.map(
          (i) => i.parcelsAffected?.toLocaleString() || "—",
        ),
      ],
      [
        "Lag",
        ...comparisonItems.map((i) =>
          i.lagPeriodYears !== null
            ? `${i.lagPeriodYears.toFixed(1)} yrs`
            : "—",
        ),
      ],
      [
        "Correlation",
        ...comparisonItems.map((i) =>
          i.correlation !== null ? i.correlation.toFixed(2) : "—",
        ),
      ],
    ];
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `truplat-comparison-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleCopyLink = () => {
    const ids = comparisonItems.map((i) => i.id).join(",");
    const url = `${window.location.origin}/insights?compare=${ids}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] p-4 clip-notch">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-lime-400" />
          <span className="font-mono text-sm uppercase tracking-wider text-[var(--muted-foreground)]">
            Compare Mode
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">
            (Select up to 3 projects from the table below)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted-foreground)]">
            {selectedForCompare.length}/3 selected
          </span>
          {selectedForCompare.length > 0 && (
            <button
              onClick={onClearSelection}
              className="text-xs text-[var(--muted-foreground)] hover:text-white underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {comparisonItems.length >= 2 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-2 px-3 text-left text-xs font-mono uppercase text-[var(--muted-foreground)]">
                  Metric
                </th>
                {comparisonItems.map((item) => (
                  <th
                    key={item.id}
                    className="py-2 px-3 text-left text-xs font-mono uppercase text-[var(--muted-foreground)]"
                  >
                    {item.title.length > 25
                      ? `${item.title.substring(0, 25)}...`
                      : item.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              <tr>
                <td className="py-2 px-3 text-[var(--muted-foreground)]">
                  Type
                </td>
                {comparisonItems.map((item) => (
                  <td
                    key={item.id}
                    className="py-2 px-3 text-[var(--foreground)]"
                  >
                    {item.type.replace(/_/g, " ")}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-3 text-[var(--muted-foreground)]">
                  Location
                </td>
                {comparisonItems.map((item) => (
                  <td
                    key={item.id}
                    className="py-2 px-3 text-[var(--foreground)]"
                  >
                    {item.city || item.county}, {item.state}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-3 text-[var(--muted-foreground)]">
                  Year
                </td>
                {comparisonItems.map((item) => (
                  <td key={item.id} className="py-2 px-3 font-mono text-white">
                    {item.projectYear || "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-3 text-[var(--muted-foreground)]">
                  Value Change
                </td>
                {comparisonItems.map((item) => (
                  <td
                    key={item.id}
                    className={`py-2 px-3 font-mono ${
                      item.avgValueChange !== null && item.avgValueChange > 0
                        ? "text-lime-400"
                        : item.avgValueChange !== null &&
                            item.avgValueChange < 0
                          ? "text-red-400"
                          : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {item.avgValueChange !== null
                      ? `${item.avgValueChange > 0 ? "+" : ""}${item.avgValueChange.toFixed(1)}%`
                      : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-3 text-[var(--muted-foreground)]">
                  Parcels
                </td>
                {comparisonItems.map((item) => (
                  <td key={item.id} className="py-2 px-3 font-mono text-white">
                    {item.parcelsAffected?.toLocaleString() || "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-3 text-[var(--muted-foreground)]">
                  Lag
                </td>
                {comparisonItems.map((item) => (
                  <td key={item.id} className="py-2 px-3 font-mono text-white">
                    {item.lagPeriodYears !== null
                      ? `${item.lagPeriodYears.toFixed(1)} yrs`
                      : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-3 text-[var(--muted-foreground)]">
                  Correlation
                </td>
                {comparisonItems.map((item) => (
                  <td
                    key={item.id}
                    className={`py-2 px-3 font-mono ${
                      item.correlation !== null && item.correlation > 0.5
                        ? "text-lime-400"
                        : item.correlation !== null && item.correlation > 0.3
                          ? "text-yellow-400"
                          : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {item.correlation !== null
                      ? item.correlation.toFixed(2)
                      : "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Export Actions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--secondary)] border border-[var(--border)] clip-notch-sm text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--secondary)] border border-[var(--border)] clip-notch-sm text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Copy Link
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-[var(--muted-foreground)] py-4">
          Select at least 2 projects to compare
        </p>
      )}
    </div>
  );
}
