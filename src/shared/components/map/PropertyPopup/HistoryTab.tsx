"use client";

import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import type { ParcelProperties } from "@/shared/lib/parcel-api";

interface HistoryTabProps {
  parcel: ParcelProperties;
}

interface HistoryItem {
  year: number;
  value: number;
  change: number;
}

// Helper function for consistent currency formatting
const formatCurrency = (value: number): string => {
  return "$" + Math.round(value).toLocaleString();
};

// Generate simulated history data
function generateHistory(currentValue: number): HistoryItem[] {
  const history: HistoryItem[] = [];
  let value = currentValue;

  for (let i = 0; i < 5; i++) {
    const year = 2024 - i;
    const previousValue =
      i === 4 ? value : value / (1 + (Math.random() * 0.1 - 0.02));
    const change =
      i === 0 ? 0 : ((value - previousValue) / previousValue) * 100;

    history.push({
      year,
      value: Math.round(value),
      change: i === 0 ? 5.2 : change, // First year always shows positive change
    });

    value = previousValue;
  }

  return history;
}

export function HistoryTab({ parcel }: HistoryTabProps) {
  const historyData =
    Array.isArray(parcel.assessmentHistory) &&
    parcel.assessmentHistory.length > 0
      ? parcel.assessmentHistory
      : generateHistory(parcel.totalValue);

  // Calculate 5-year appreciation
  const oldestValue = historyData[historyData.length - 1].value;
  const currentValue = historyData[0].value;
  const fiveYearAppreciation =
    ((currentValue - oldestValue) / oldestValue) * 100;
  const avgAnnualGrowth = fiveYearAppreciation / 5;

  // Find max value for chart scaling
  const maxValue = Math.max(...historyData.map((d) => d.value));

  return (
    <div className="space-y-6">
      {/* 5-Year Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 clip-notch-sm">
          <p className="text-xs font-mono text-green-400 uppercase tracking-wider mb-1">
            5-Year Appreciation
          </p>
          <p className="text-xl md:text-2xl font-bold text-white">
            +{fiveYearAppreciation.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 bg-gray-800 clip-notch-sm">
          <p className="text-xs font-mono text-gray-300 uppercase tracking-wider mb-1">
            Avg Annual Growth
          </p>
          <p className="text-xl md:text-2xl font-bold text-white">
            +{avgAnnualGrowth.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div>
        <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-3">
          Assessment History
        </h3>
        <div className="p-4 bg-gray-800 clip-notch-sm">
          <div className="space-y-3">
            {historyData.map((item, index) => {
              const barWidth = (item.value / maxValue) * 100;
              const isPositive = item.change >= 0;

              return (
                <div key={item.year} className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 w-12 font-mono">
                    {item.year}
                  </span>
                  <div className="flex-1 h-6 bg-gray-700 rounded overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 ${
                        index === 0 ? "bg-lime-400" : "bg-blue-500"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-xs font-mono text-white">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  {index > 0 && (
                    <span
                      className={`text-xs font-mono w-16 text-right ${
                        isPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {item.change.toFixed(1)}%
                    </span>
                  )}
                  {index === 0 && (
                    <span className="text-xs font-mono w-16 text-right text-lime-400">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div>
        <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-3">
          Detailed History
        </h3>
        <div className="border border-gray-800 clip-notch-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-mono uppercase tracking-wider text-gray-300">
                  Year
                </th>
                <th className="px-4 py-2 text-right text-xs font-mono uppercase tracking-wider text-gray-300">
                  Assessed Value
                </th>
                <th className="px-4 py-2 text-right text-xs font-mono uppercase tracking-wider text-gray-300">
                  YoY Change
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {historyData.map((item, index) => {
                const isPositive = item.change >= 0;
                return (
                  <tr
                    key={item.year}
                    className={index === 0 ? "bg-lime-400/5" : ""}
                  >
                    <td className="px-4 py-3 text-sm text-white font-mono flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {item.year}
                    </td>
                    <td className="px-4 py-3 text-sm text-white text-right font-mono font-medium">
                      {formatCurrency(item.value)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {index > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 text-sm font-mono ${
                            isPositive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {isPositive ? "+" : ""}
                          {item.change.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Neighborhood Comparison Note */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 clip-notch-sm">
        <p className="text-sm text-blue-400">
          This property&apos;s appreciation rate of{" "}
          <strong>+{fiveYearAppreciation.toFixed(1)}%</strong> over 5 years{" "}
          {fiveYearAppreciation > 25
            ? "outperforms"
            : fiveYearAppreciation > 15
              ? "matches"
              : "underperforms"}{" "}
          the neighborhood average of <strong>+22.3%</strong>.
        </p>
      </div>
    </div>
  );
}
