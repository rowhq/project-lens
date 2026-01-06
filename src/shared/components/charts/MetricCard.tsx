"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { cn } from "@/shared/lib/utils";

export interface SparklineDataPoint {
  value: number;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  sparklineData?: SparklineDataPoint[];
  sparklineColor?: string;
  icon?: React.ElementType;
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  sparklineData,
  sparklineColor = "#4ADE80",
  icon: Icon,
  iconColor = "text-lime-400",
  iconBgColor = "bg-lime-400/10 border-lime-400/20",
  className = "",
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const trendColor = isPositive
    ? "text-lime-400"
    : isNegative
      ? "text-red-400"
      : "text-gray-500";

  const trendBgColor = isPositive
    ? "bg-lime-400/10 border-lime-400/20"
    : isNegative
      ? "bg-red-400/10 border-red-400/20"
      : "bg-gray-800 border-gray-700";

  return (
    <div
      className={cn(
        // Use inset box-shadow for border (follows clip-path)
        "relative bg-gray-950 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-5 overflow-hidden clip-notch",
        className,
      )}
    >
      {/* Bracket corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30 z-10" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30 z-10" />

      {/* Background sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="absolute inset-0 opacity-10">
          <ResponsiveContainer width="100%" height="100%" minHeight={100}>
            <AreaChart
              data={sparklineData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                fill={sparklineColor}
                fillOpacity={0.3}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <div
                className={cn(
                  "p-2 clip-notch-sm shadow-[inset_0_0_0_1px]",
                  iconBgColor,
                )}
              >
                <Icon className={cn("w-4 h-4", iconColor)} />
              </div>
            )}
            <span className="font-mono text-label uppercase tracking-wider text-gray-500">
              {title}
            </span>
          </div>

          {/* Trend indicator */}
          {change !== undefined && (
            <div
              className={cn(
                // Use inset box-shadow for border (follows clip-path)
                "flex items-center gap-1 px-2 py-0.5 clip-notch-sm shadow-[inset_0_0_0_1px]",
                trendBgColor,
              )}
            >
              <TrendIcon className={cn("w-3 h-3", trendColor)} />
              <span className={cn("text-label font-mono", trendColor)}>
                {isPositive && "+"}
                {change}%
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className="text-2xl font-bold text-white tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        </div>

        {/* Subtitle / Change label */}
        {(subtitle || changeLabel) && (
          <div className="flex items-center gap-2">
            {subtitle && (
              <span className="text-sm text-gray-500">{subtitle}</span>
            )}
            {changeLabel && (
              <span className="text-label text-gray-500 font-mono">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mini sparkline at bottom */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="relative mt-4 h-10 z-10">
          <ResponsiveContainer width="100%" height="100%" minHeight={40}>
            <AreaChart
              data={sparklineData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                fill={sparklineColor}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default MetricCard;
