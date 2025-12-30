"use client";

import { cn, formatCurrency, formatNumber } from "@/shared/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PriceDisplayProps {
  value: number;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showCents?: boolean;
  className?: string;
}

export function PriceDisplay({
  value,
  currency = "USD",
  size = "md",
  showCents = false,
  className,
}: PriceDisplayProps) {
  const formatted = showCents
    ? formatCurrency(value, currency)
    : `$${formatNumber(Math.round(value))}`;

  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
  };

  return (
    <span className={cn("font-semibold tabular-nums", sizes[size], className)}>
      {formatted}
    </span>
  );
}

// Price Range Display
interface PriceRangeProps {
  low: number;
  high: number;
  midpoint?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceRange({
  low,
  high,
  midpoint,
  size = "md",
  className,
}: PriceRangeProps) {
  const mid = midpoint || (low + high) / 2;

  const sizes = {
    sm: { main: "text-lg", sub: "text-xs" },
    md: { main: "text-2xl", sub: "text-sm" },
    lg: { main: "text-4xl", sub: "text-base" },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={cn("text-center", className)}>
      <div className={cn("font-bold text-neutral-900", sizeConfig.main)}>
        ${formatNumber(Math.round(mid))}
      </div>
      <div className={cn("text-neutral-500 mt-1", sizeConfig.sub)}>
        ${formatNumber(Math.round(low))} - ${formatNumber(Math.round(high))}
      </div>
    </div>
  );
}

// Price with Change Indicator
interface PriceWithChangeProps {
  value: number;
  previousValue?: number;
  changePercent?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceWithChange({
  value,
  previousValue,
  changePercent,
  size = "md",
  className,
}: PriceWithChangeProps) {
  // Calculate change if not provided
  const change = changePercent ??
    (previousValue ? ((value - previousValue) / previousValue) * 100 : 0);

  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const sizes = {
    sm: { price: "text-lg", change: "text-xs" },
    md: { price: "text-2xl", change: "text-sm" },
    lg: { price: "text-4xl", change: "text-base" },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={cn("flex items-end gap-2", className)}>
      <PriceDisplay value={value} size={size} />
      <div
        className={cn(
          "flex items-center gap-0.5 pb-0.5",
          sizeConfig.change,
          isPositive && "text-green-600",
          isNegative && "text-red-600",
          isNeutral && "text-neutral-500"
        )}
      >
        {isPositive && <TrendingUp className="w-4 h-4" />}
        {isNegative && <TrendingDown className="w-4 h-4" />}
        {isNeutral && <Minus className="w-4 h-4" />}
        <span className="font-medium">
          {isPositive ? "+" : ""}
          {change.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// Compact Price Badge
interface PriceBadgeProps {
  value: number;
  label?: string;
  variant?: "default" | "success" | "warning";
  className?: string;
}

export function PriceBadge({
  value,
  label,
  variant = "default",
  className,
}: PriceBadgeProps) {
  const variants = {
    default: "bg-neutral-100 text-neutral-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className={cn("inline-flex items-center gap-1 px-3 py-1.5 rounded-full", variants[variant], className)}>
      {label && <span className="text-xs">{label}</span>}
      <span className="font-semibold text-sm">${formatNumber(Math.round(value))}</span>
    </div>
  );
}
