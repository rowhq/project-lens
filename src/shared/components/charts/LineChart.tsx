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

// Ledger-inspired color palette
const DEFAULT_COLORS = [
  "#4ADE80", // Lime green (primary)
  "#6B7280", // Gray
  "#A78BFA", // Purple
  "#FBBF24", // Amber
  "#F87171", // Red
  "#22D3EE", // Cyan
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
      aria-label={
        ariaLabel ||
        `Line chart showing ${series.map((s) => s.name).join(", ")}`
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.3}
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xAxisDataKey}
            tick={{
              fill: "#6B7280",
              fontSize: 11,
              fontFamily: "JetBrains Mono, monospace",
            }}
            tickLine={{ stroke: "#374151" }}
            axisLine={{ stroke: "#374151" }}
          />
          <YAxis
            tick={{
              fill: "#6B7280",
              fontSize: 11,
              fontFamily: "JetBrains Mono, monospace",
            }}
            tickLine={{ stroke: "#374151" }}
            axisLine={{ stroke: "#374151" }}
            tickFormatter={formatYAxis}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "#0A0A0A",
                border: "1px solid #374151",
                borderRadius: "0",
                color: "#FFFFFF",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                clipPath:
                  "polygon(0 4px, 4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
              }}
              formatter={(value) => {
                const numValue = typeof value === "number" ? value : 0;
                return formatTooltip
                  ? formatTooltip(numValue)
                  : numValue.toLocaleString();
              }}
              cursor={{
                stroke: "#4ADE80",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{
                color: "#9CA3AF",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
              formatter={(value) => (
                <span style={{ color: "#9CA3AF" }}>{value}</span>
              )}
            />
          )}
          {referenceLines.map((ref, idx) => (
            <ReferenceLine
              key={idx}
              y={ref.value}
              stroke={ref.color || "#6B7280"}
              strokeDasharray="5 5"
              label={
                ref.label
                  ? {
                      value: ref.label,
                      fill: "#9CA3AF",
                      fontSize: 10,
                      fontFamily: "JetBrains Mono, monospace",
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
              dot={
                (s.dot ?? showDots)
                  ? { fill: "#0A0A0A", strokeWidth: 2 }
                  : false
              }
              activeDot={{ r: 6, strokeWidth: 2, fill: "#0A0A0A" }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChart;
