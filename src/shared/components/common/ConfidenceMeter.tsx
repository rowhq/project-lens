"use client";

import { cn } from "@/shared/lib/utils";
import { Tooltip } from "../ui/Tooltip";
import { Info } from "lucide-react";

interface ConfidenceMeterProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function ConfidenceMeter({
  score,
  size = "md",
  showLabel = true,
  showTooltip = true,
  className,
}: ConfidenceMeterProps) {
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  // Determine confidence level
  const getLevel = () => {
    if (normalizedScore >= 85) return { label: "High", color: "green" };
    if (normalizedScore >= 70) return { label: "Good", color: "blue" };
    if (normalizedScore >= 55) return { label: "Moderate", color: "yellow" };
    return { label: "Low", color: "red" };
  };

  const level = getLevel();

  const colors = {
    green: {
      bar: "bg-green-500",
      bg: "bg-green-100",
      text: "text-green-700",
    },
    blue: {
      bar: "bg-blue-500",
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    yellow: {
      bar: "bg-yellow-500",
      bg: "bg-yellow-100",
      text: "text-yellow-700",
    },
    red: {
      bar: "bg-red-500",
      bg: "bg-red-100",
      text: "text-red-700",
    },
  };

  const sizes = {
    sm: { height: "h-1.5", width: "w-24", text: "text-xs" },
    md: { height: "h-2", width: "w-32", text: "text-sm" },
    lg: { height: "h-3", width: "w-40", text: "text-base" },
  };

  const colorConfig = colors[level.color as keyof typeof colors];
  const sizeConfig = sizes[size];

  const tooltipContent = (
    <div className="text-xs max-w-[200px]">
      <p className="font-medium mb-1">Confidence Score: {normalizedScore}%</p>
      <p className="text-neutral-300">
        {normalizedScore >= 85
          ? "High confidence based on strong comparable data."
          : normalizedScore >= 70
          ? "Good confidence with solid market data available."
          : normalizedScore >= 55
          ? "Moderate confidence. Consider on-site verification."
          : "Low confidence due to limited data. On-site inspection recommended."}
      </p>
    </div>
  );

  const meter = (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("rounded-full overflow-hidden", colorConfig.bg, sizeConfig.height, sizeConfig.width)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorConfig.bar)}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn("font-medium", sizeConfig.text, colorConfig.text)}>
          {normalizedScore}%
        </span>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <Tooltip content={tooltipContent} position="top">
        <div className="inline-flex items-center gap-1 cursor-help">
          {meter}
          <Info className="w-4 h-4 text-neutral-400" />
        </div>
      </Tooltip>
    );
  }

  return meter;
}

// Large Confidence Display (for report pages)
interface ConfidenceDisplayProps {
  score: number;
  className?: string;
}

export function ConfidenceDisplay({ score, className }: ConfidenceDisplayProps) {
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  const getLevel = () => {
    if (normalizedScore >= 85) return { label: "High Confidence", color: "green", description: "Strong comparable data supports this valuation." };
    if (normalizedScore >= 70) return { label: "Good Confidence", color: "blue", description: "Solid market data available for this property." };
    if (normalizedScore >= 55) return { label: "Moderate Confidence", color: "yellow", description: "Consider ordering an on-site inspection." };
    return { label: "Low Confidence", color: "red", description: "On-site inspection strongly recommended." };
  };

  const level = getLevel();

  const colors = {
    green: "text-green-600 bg-green-50 border-green-200",
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
    red: "text-red-600 bg-red-50 border-red-200",
  };

  return (
    <div className={cn("p-4 rounded-xl border", colors[level.color as keyof typeof colors], className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">{level.label}</span>
        <span className="text-2xl font-bold">{normalizedScore}%</span>
      </div>
      <div className="h-2 bg-white/50 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-current transition-all duration-500"
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
      <p className="text-xs opacity-80">{level.description}</p>
    </div>
  );
}
