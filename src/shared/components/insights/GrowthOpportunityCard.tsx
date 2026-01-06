"use client";

import Link from "next/link";
import { MapPin, TrendingUp, AlertTriangle, Shield, Zap } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Infrastructure type icons
const TYPE_ICONS: Record<string, string> = {
  RESIDENTIAL: "🏘️",
  COMMERCIAL: "🏢",
  INFRASTRUCTURE: "🛣️",
  EDUCATIONAL: "🏫",
  HEALTHCARE: "🏥",
  RETAIL: "🛒",
  INDUSTRIAL: "🏭",
  MIXED_USE: "🏙️",
  RECREATIONAL: "🏞️",
  TRANSPORTATION: "🚇",
};

interface Signal {
  id: string;
  title: string;
  type: string;
  distance: number;
  year: number | null;
}

interface Property {
  parcelId: string;
  address: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface GrowthOpportunityCardProps {
  property: Property;
  currentValue: number;
  projectedValue: number;
  projectedAppreciation: number;
  confidence: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  signals: Signal[];
  className?: string;
}

export function GrowthOpportunityCard({
  property,
  currentValue,
  projectedValue,
  projectedAppreciation,
  confidence,
  risk,
  signals,
  className,
}: GrowthOpportunityCardProps) {
  const location = [property.city, property.state].filter(Boolean).join(", ");
  const fullAddress = property.zipCode
    ? `${property.address}, ${location} ${property.zipCode}`
    : `${property.address}, ${location}`;

  // Risk color configuration
  const riskConfig = {
    LOW: {
      bg: "bg-green-400/10",
      shadow: "shadow-[inset_0_0_0_1px_theme(colors.green.400/0.3)]",
      text: "text-green-400",
      label: "Low Risk",
    },
    MEDIUM: {
      bg: "bg-yellow-400/10",
      shadow: "shadow-[inset_0_0_0_1px_theme(colors.yellow.400/0.3)]",
      text: "text-yellow-400",
      label: "Medium Risk",
    },
    HIGH: {
      bg: "bg-red-400/10",
      shadow: "shadow-[inset_0_0_0_1px_theme(colors.red.400/0.3)]",
      text: "text-red-400",
      label: "High Risk",
    },
  };

  // Confidence color based on level
  const getConfidenceColor = (score: number) => {
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div
      className={cn(
        "relative bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch overflow-hidden hover:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)] transition-all",
        className,
      )}
    >
      {/* L-Bracket Corners */}
      <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
      <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

      {/* Header - Address & Metrics */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <p className="font-medium text-white truncate text-sm">
                {fullAddress}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className={cn("font-mono", getConfidenceColor(confidence))}>
                Confidence: {confidence}%
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded font-mono",
                  riskConfig[risk].bg,
                  riskConfig[risk].shadow,
                  riskConfig[risk].text,
                )}
              >
                {riskConfig[risk].label}
              </span>
            </div>
          </div>

          {/* Projected Appreciation */}
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 text-lime-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xl font-bold font-mono">
                +{projectedAppreciation}%
              </span>
            </div>
            <p className="text-xs text-gray-500">Projected</p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="p-4 border-b border-gray-800 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Current Value</p>
          <p className="text-lg font-bold text-white font-mono">
            ${currentValue.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Projected Value (3yr)</p>
          <p className="text-lg font-bold text-lime-400 font-mono">
            ${projectedValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Infrastructure Signals */}
      {signals.length > 0 && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-gray-400 uppercase tracking-wider font-mono">
              Infrastructure Signals
            </p>
          </div>
          <div className="space-y-2">
            {signals.slice(0, 3).map((signal) => (
              <div
                key={signal.id}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <span className="flex-shrink-0">
                  {TYPE_ICONS[signal.type] || "📍"}
                </span>
                <span className="flex-1 truncate">{signal.title}</span>
                <span className="text-xs text-gray-500 font-mono flex-shrink-0">
                  {signal.distance} mi
                  {signal.year && ` • ${signal.year}`}
                </span>
              </div>
            ))}
            {signals.length > 3 && (
              <p className="text-xs text-gray-500">
                +{signals.length - 3} more signals
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 flex gap-3">
        {property.latitude && property.longitude && (
          <Link
            href={`/map?lat=${property.latitude}&lng=${property.longitude}&zoom=15`}
            className="flex-1 px-3 py-2 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] clip-notch text-center text-gray-300 font-mono text-xs uppercase tracking-wider hover:bg-gray-800 hover:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)] transition-colors"
          >
            View on Map
          </Link>
        )}
        <Link
          href={`/insights/property/${property.parcelId}`}
          className="flex-1 px-3 py-2 bg-lime-400 text-black clip-notch text-center font-mono text-xs uppercase tracking-wider hover:bg-lime-300 transition-colors"
        >
          View Analysis
        </Link>
      </div>
    </div>
  );
}

// Loading skeleton for the card
export function GrowthOpportunityCardSkeleton() {
  return (
    <div className="relative bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch overflow-hidden animate-pulse">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
            <div className="flex gap-2">
              <div className="h-4 bg-gray-800 rounded w-24" />
              <div className="h-4 bg-gray-800 rounded w-20" />
            </div>
          </div>
          <div className="h-8 bg-gray-800 rounded w-20" />
        </div>
      </div>

      {/* Values */}
      <div className="p-4 border-b border-gray-800 grid grid-cols-2 gap-4">
        <div>
          <div className="h-3 bg-gray-800 rounded w-20 mb-2" />
          <div className="h-6 bg-gray-800 rounded w-24" />
        </div>
        <div>
          <div className="h-3 bg-gray-800 rounded w-24 mb-2" />
          <div className="h-6 bg-gray-800 rounded w-24" />
        </div>
      </div>

      {/* Signals */}
      <div className="p-4 border-b border-gray-800">
        <div className="h-4 bg-gray-800 rounded w-32 mb-3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-800 rounded" />
          <div className="h-4 bg-gray-800 rounded w-5/6" />
        </div>
      </div>

      {/* Buttons */}
      <div className="p-4 flex gap-3">
        <div className="flex-1 h-9 bg-gray-800 rounded" />
        <div className="flex-1 h-9 bg-gray-800 rounded" />
      </div>
    </div>
  );
}
