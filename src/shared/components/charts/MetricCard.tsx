"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

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
  sparklineColor = "#3B6CF3",
  icon: Icon,
  iconColor = "text-[var(--primary)]",
  iconBgColor = "bg-[var(--primary)]/10",
  className = "",
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  const getTrendIcon = () => {
    if (isPositive) return TrendingUp;
    if (isNegative) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (isPositive) return "text-green-500";
    if (isNegative) return "text-red-500";
    return "text-[var(--muted-foreground)]";
  };

  const getTrendBgColor = () => {
    if (isPositive) return "bg-green-500/10";
    if (isNegative) return "bg-red-500/10";
    return "bg-[var(--muted)]/50";
  };

  const TrendIcon = getTrendIcon();

  return (
    <div
      className={`relative bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 overflow-hidden ${className}`}
    >
      {/* Background sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="absolute inset-0 opacity-20">
          <ResponsiveContainer width="100%" height="100%">
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
              <div className={`p-2 rounded-lg ${iconBgColor}`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
            )}
            <span className="text-sm font-medium text-[var(--muted-foreground)]">
              {title}
            </span>
          </div>

          {/* Trend indicator */}
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full ${getTrendBgColor()}`}
            >
              <TrendIcon className={`w-3 h-3 ${getTrendColor()}`} />
              <span className={`text-xs font-medium ${getTrendColor()}`}>
                {isPositive && "+"}
                {change}%
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className="text-2xl font-bold text-[var(--foreground)]">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        </div>

        {/* Subtitle / Change label */}
        {(subtitle || changeLabel) && (
          <div className="flex items-center gap-2">
            {subtitle && (
              <span className="text-sm text-[var(--muted-foreground)]">
                {subtitle}
              </span>
            )}
            {changeLabel && (
              <span className="text-xs text-[var(--muted-foreground)]">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mini sparkline at bottom */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sparklineData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                fill={sparklineColor}
                fillOpacity={0.2}
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
