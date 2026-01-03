"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Home,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { ParcelProperties } from "@/shared/lib/parcel-api";

interface ValuationResult {
  estimatedValue: number;
  confidenceScore: number;
  valueRange: {
    low: number;
    high: number;
  };
  comparables?: {
    address: string;
    salePrice: number;
    saleDate: string;
    similarity: number;
  }[];
  adjustments?: {
    factor: string;
    impact: number;
    description: string;
  }[];
  marketTrends?: {
    appreciation1Year: number;
    appreciation3Year: number;
    appreciation5Year: number;
  };
  narrative?: string;
}

interface ValuationTabProps {
  parcel: ParcelProperties;
}

// Helper function for consistent currency formatting
const formatCurrency = (value: number): string => {
  return "$" + Math.round(value).toLocaleString();
};

export function ValuationTab({ parcel }: ValuationTabProps) {
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedAI, setUsedAI] = useState(false);

  const runValuation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parcelId: parcel.id,
          address: parcel.situs,
          city: parcel.city,
          state: parcel.state,
          county: parcel.county,
          landArea: parcel.sqft,
          buildingArea: parcel.buildingArea,
          yearBuilt: parcel.yearBuilt,
          zoning: parcel.zoning,
          floodZone: parcel.floodZone,
          landValue: parcel.landValue,
          improvementValue: parcel.improvementValue,
          totalValue: parcel.totalValue,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setValuation(data.data);
        setUsedAI(data.usedAI);
      } else {
        setError(data.error || "Failed to generate valuation");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Valuation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show prompt to run valuation
  if (!valuation && !isLoading && !error) {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-gradient-to-br from-lime-500/10 to-lime-500/5 border border-lime-500/30 clip-notch text-center">
          <Sparkles className="w-12 h-12 text-lime-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            AI Property Valuation
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Get an instant AI-powered property valuation based on comparable
            sales, market trends, and property characteristics.
          </p>
          <button
            onClick={runValuation}
            className="px-8 py-3 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 inline-flex items-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Generate Valuation
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-gray-800 clip-notch-sm">
            <p className="text-xs text-gray-400 mb-1">Powered By</p>
            <p className="text-sm font-bold text-white">RapidCanvas AI</p>
          </div>
          <div className="p-3 bg-gray-800 clip-notch-sm">
            <p className="text-xs text-gray-400 mb-1">Data Sources</p>
            <p className="text-sm font-bold text-white">MLS + Public</p>
          </div>
          <div className="p-3 bg-gray-800 clip-notch-sm">
            <p className="text-xs text-gray-400 mb-1">Accuracy</p>
            <p className="text-sm font-bold text-white">95%+ Range</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-12 h-12 text-lime-400 mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-bold text-white mb-2">
          Analyzing Property...
        </h3>
        <p className="text-gray-400">
          Running AI valuation model with comparable sales data
        </p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Valuation Failed</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={runValuation}
          className="px-6 py-2 bg-gray-800 text-white font-mono text-sm uppercase tracking-wider clip-notch-sm hover:bg-gray-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show valuation results
  if (!valuation) return null;

  const valueDiff = valuation.estimatedValue - parcel.totalValue;
  const valueDiffPct = (valueDiff / parcel.totalValue) * 100;

  return (
    <div className="space-y-6">
      {/* AI Badge */}
      {usedAI && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 clip-notch-sm w-fit">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
            AI-Powered Analysis
          </span>
        </div>
      )}

      {/* Estimated Value */}
      <div className="p-6 bg-gradient-to-br from-lime-500/20 to-lime-500/5 border border-lime-500/30 clip-notch">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-lime-400 uppercase tracking-wider mb-1">
              AI Estimated Value
            </p>
            <p className="text-3xl md:text-4xl font-bold text-white">
              {formatCurrency(valuation.estimatedValue)}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Range: {formatCurrency(valuation.valueRange.low)} -{" "}
              {formatCurrency(valuation.valueRange.high)}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`flex items-center gap-1 ${valueDiff >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {valueDiff >= 0 ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
              <span className="text-lg font-bold">
                {valueDiff >= 0 ? "+" : ""}
                {valueDiffPct.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500">vs assessed value</p>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="mt-4 pt-4 border-t border-lime-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Confidence Score</span>
            <span className="text-sm font-mono text-white">
              {(valuation.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-lime-400 rounded-full transition-all"
              style={{ width: `${valuation.confidenceScore * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Market Trends */}
      {valuation.marketTrends && (
        <div>
          <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-3">
            Market Appreciation
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-800 clip-notch-sm text-center">
              <p className="text-xs text-gray-400 mb-1">1 Year</p>
              <p className="text-lg font-bold text-green-400">
                +{valuation.marketTrends.appreciation1Year}%
              </p>
            </div>
            <div className="p-3 bg-gray-800 clip-notch-sm text-center">
              <p className="text-xs text-gray-400 mb-1">3 Year</p>
              <p className="text-lg font-bold text-green-400">
                +{valuation.marketTrends.appreciation3Year}%
              </p>
            </div>
            <div className="p-3 bg-gray-800 clip-notch-sm text-center">
              <p className="text-xs text-gray-400 mb-1">5 Year</p>
              <p className="text-lg font-bold text-green-400">
                +{valuation.marketTrends.appreciation5Year}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comparables */}
      {valuation.comparables && valuation.comparables.length > 0 && (
        <div>
          <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-3">
            Comparable Sales
          </h3>
          <div className="space-y-2">
            {valuation.comparables.map((comp, index) => (
              <div
                key={index}
                className="p-3 bg-gray-800 clip-notch-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-white">{comp.address}</p>
                    <p className="text-xs text-gray-500">{comp.saleDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-white">
                    {formatCurrency(comp.salePrice)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(comp.similarity * 100)}% match
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adjustments */}
      {valuation.adjustments && valuation.adjustments.length > 0 && (
        <div>
          <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-3">
            Value Adjustments
          </h3>
          <div className="border border-gray-800 clip-notch-sm overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-gray-800">
                {valuation.adjustments.map((adj, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-white">
                      {adj.factor}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-400">
                      {adj.description}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm font-mono text-right ${adj.impact >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {adj.impact >= 0 ? "+" : "-"}
                      {formatCurrency(Math.abs(adj.impact))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Narrative */}
      {valuation.narrative && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 clip-notch-sm">
          <p className="text-sm text-blue-300 leading-relaxed">
            {valuation.narrative}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-gray-800/50 clip-notch-sm">
        <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-500">
          This AI valuation is for informational purposes only and should not be
          used as a substitute for a professional appraisal. Actual market value
          may vary based on property condition, market conditions, and other
          factors.
        </p>
      </div>

      {/* Run Again Button */}
      <button
        onClick={runValuation}
        className="w-full py-2 border border-gray-700 text-gray-400 font-mono text-xs uppercase tracking-wider clip-notch-sm hover:bg-gray-800 hover:text-white"
      >
        Refresh Valuation
      </button>
    </div>
  );
}
