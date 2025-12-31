"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

export interface LineChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface LineChartSeries {
  dataKey: string;
  name: string;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: boolean;
}

export interface LineChartProps {
  data: LineChartDataPoint[];
  series: LineChartSeries[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showDots?: boolean;
  xAxisDataKey?: string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number) => string;
  referenceLines?: { value: number; label?: string; color?: string }[];
  className?: string;
  /** Accessible label describing the chart content */
  ariaLabel?: string;
}

const DEFAULT_COLORS = [
  "#3B6CF3", // Primary blue
  "#10B981", // Green
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#06B6D4", // Cyan
];

export function LineChart({
  data,
  series,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showDots = true,
  xAxisDataKey = "name",
  formatYAxis,
  formatTooltip,
  referenceLines = [],
  className = "",
  ariaLabel,
}: LineChartProps) {
  return (
    <div
      className={className}
      style={{ height }}
      role="img"
      aria-label={ariaLabel || `Line chart showing ${series.map(s => s.name).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.5}
            />
          )}
          <XAxis
            dataKey={xAxisDataKey}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickLine={{ stroke: "var(--border)" }}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickLine={{ stroke: "var(--border)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickFormatter={formatYAxis}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
              }}
              formatter={(value) => {
                const numValue = typeof value === "number" ? value : 0;
                return formatTooltip ? formatTooltip(numValue) : numValue.toLocaleString();
              }}
            />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{ color: "var(--foreground)" }}
              formatter={(value) => (
                <span style={{ color: "var(--muted-foreground)" }}>{value}</span>
              )}
            />
          )}
          {referenceLines.map((ref, idx) => (
            <ReferenceLine
              key={idx}
              y={ref.value}
              stroke={ref.color || "var(--muted-foreground)"}
              strokeDasharray="5 5"
              label={
                ref.label
                  ? {
                      value: ref.label,
                      fill: "var(--muted-foreground)",
                      fontSize: 10,
                    }
                  : undefined
              }
            />
          ))}
          {series.map((s, idx) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
              strokeWidth={s.strokeWidth ?? 2}
              strokeDasharray={s.strokeDasharray}
              dot={s.dot ?? showDots}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChart;
