"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/shared/lib/trpc";
import {
  DollarSign,
  TrendingUp,
  Home,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
  FileText,
} from "lucide-react";
import type { ParcelProperties } from "@/shared/lib/parcel-api";

interface ValuationTabProps {
  parcel: ParcelProperties;
  onClose?: () => void;
}

export function ValuationTab({ parcel, onClose }: ValuationTabProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  // Get usage status
  const usageStatus = trpc.appraisal.usageStatus.useQuery(undefined, {
    staleTime: 30000, // Cache for 30 seconds
  });

  // Quick AI Report mutation
  const quickReport = trpc.appraisal.quickAIReport.useMutation({
    onSuccess: (data) => {
      // Navigate to the appraisal detail page
      router.push(`/appraisals/${data.appraisalId}?source=map`);
      onClose?.();
    },
    onError: (error) => {
      console.error("Failed to create AI report:", error);
    },
  });

  const handleGenerateReport = () => {
    setIsGenerating(true);
    quickReport.mutate({
      propertyAddress: parcel.situs || "",
      propertyCity: parcel.city || "",
      propertyState: parcel.state || "TX",
      propertyZipCode: parcel.zip || "",
      propertyCounty: parcel.county || "",
      propertyType: mapPropertyType(parcel.zoning),
      purpose: "Property Analysis",
    });
  };

  // Map zoning/use code to property type
  function mapPropertyType(
    zoning?: string,
  ):
    | "SINGLE_FAMILY"
    | "MULTI_FAMILY"
    | "CONDO"
    | "TOWNHOUSE"
    | "COMMERCIAL"
    | "LAND"
    | "MIXED_USE" {
    if (!zoning) return "SINGLE_FAMILY";
    const z = zoning.toUpperCase();
    if (z.includes("MULTI") || z.includes("MF") || z.includes("DUPLEX"))
      return "MULTI_FAMILY";
    if (z.includes("CONDO")) return "CONDO";
    if (z.includes("TOWN")) return "TOWNHOUSE";
    if (z.includes("COMM") || z.includes("RETAIL") || z.includes("OFFICE"))
      return "COMMERCIAL";
    if (z.includes("VAC") || z.includes("LAND") || z.includes("AG"))
      return "LAND";
    if (z.includes("MIX")) return "MIXED_USE";
    return "SINGLE_FAMILY";
  }

  // Calculate display info
  const isLoading =
    usageStatus.isLoading || quickReport.isPending || isGenerating;
  const hasError = quickReport.error;
  const freeRemaining = usageStatus.data?.remaining ?? 0;
  const totalLimit = usageStatus.data?.limit ?? 5;
  const unlimited = usageStatus.data?.unlimited ?? false;
  const isFree = !usageStatus.data?.exceeded;

  return (
    <div className="space-y-6">
      {/* Free Reports Counter */}
      {usageStatus.data && !unlimited && (
        <div className="flex items-center justify-between p-3 bg-gray-800 clip-notch-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-lime-400" />
            <span className="text-sm text-gray-300">
              Free Reports This Month
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold ${freeRemaining > 0 ? "text-lime-400" : "text-red-400"}`}
            >
              {freeRemaining}
            </span>
            <span className="text-sm text-gray-500">/ {totalLimit}</span>
          </div>
        </div>
      )}

      {unlimited && (
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 clip-notch-sm">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-300">
            Unlimited AI Reports (Enterprise)
          </span>
        </div>
      )}

      {/* Main CTA */}
      <div className="p-8 bg-gradient-to-br from-lime-500/10 to-lime-500/5 border border-lime-500/30 clip-notch text-center">
        <Sparkles className="w-12 h-12 text-lime-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          AI Property Valuation
        </h3>
        <p className="text-gray-300 mb-2 max-w-md mx-auto">
          Get an instant AI-powered property valuation with downloadable PDF
          report.
        </p>

        {/* Price/Free indicator */}
        <div className="mb-6">
          {isFree ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 clip-notch-sm">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-mono text-sm">FREE</span>
              <span className="text-gray-400 text-xs">
                ({freeRemaining} remaining)
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 clip-notch-sm">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-mono text-sm">$29</span>
              <span className="text-gray-400 text-xs">
                (free limit reached)
              </span>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="px-8 py-3 bg-lime-400 text-gray-900 font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5" />
              {isFree ? "Generate Free Report" : "Generate Report - $29"}
            </>
          )}
        </button>

        {/* Error message */}
        {hasError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 clip-notch-sm">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{quickReport.error.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-800 clip-notch-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-lime-400" />
            <span className="text-xs text-gray-300">PDF Report</span>
          </div>
          <p className="text-sm font-bold text-white">Downloadable</p>
        </div>
        <div className="p-3 bg-gray-800 clip-notch-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-lime-400" />
            <span className="text-xs text-gray-300">Market Analysis</span>
          </div>
          <p className="text-sm font-bold text-white">Included</p>
        </div>
        <div className="p-3 bg-gray-800 clip-notch-sm">
          <div className="flex items-center gap-2 mb-1">
            <Home className="w-4 h-4 text-lime-400" />
            <span className="text-xs text-gray-300">Comparables</span>
          </div>
          <p className="text-sm font-bold text-white">5+ Properties</p>
        </div>
        <div className="p-3 bg-gray-800 clip-notch-sm">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <span className="text-xs text-gray-300">AI Analysis</span>
          </div>
          <p className="text-sm font-bold text-white">RapidCanvas</p>
        </div>
      </div>

      {/* What's included */}
      <div className="p-4 bg-gray-800/50 clip-notch-sm">
        <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">
          Report Includes
        </h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-lime-400" />
            AI-powered value estimate with confidence score
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-lime-400" />
            Comparable sales analysis (5+ properties)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-lime-400" />
            Local market trends and appreciation data
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-lime-400" />
            Risk assessment and value adjustments
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-lime-400" />
            Downloadable PDF report
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-gray-800/50 clip-notch-sm">
        <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-400">
          This AI valuation is for informational purposes only. For official
          purposes, consider a Certified Appraisal from a licensed appraiser.
        </p>
      </div>
    </div>
  );
}
