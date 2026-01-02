"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

export interface BarChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface BarChartSeries {
  dataKey: string;
  name: string;
  color?: string;
  stackId?: string;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  series: BarChartSeries[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisDataKey?: string;
  layout?: "horizontal" | "vertical";
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number) => string;
  barRadius?: number;
  className?: string;
  colorByValue?: (value: number) => string;
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
];

export function BarChart({
  data,
  series,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisDataKey = "name",
  layout = "horizontal",
  formatYAxis,
  formatTooltip,
  barRadius = 0,
  className = "",
  colorByValue,
  ariaLabel,
}: BarChartProps) {
  const isVertical = layout === "vertical";

  return (
    <div
      className={className}
      style={{ height }}
      role="img"
      aria-label={
        ariaLabel || `Bar chart showing ${series.map((s) => s.name).join(", ")}`
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.3}
              horizontal={!isVertical}
              vertical={isVertical}
            />
          )}
          {isVertical ? (
            <>
              <XAxis
                type="number"
                tick={{
                  fill: "#6B7280",
                  fontSize: 11,
                  fontFamily: "JetBrains Mono, monospace",
                }}
                tickLine={{ stroke: "#374151" }}
                axisLine={{ stroke: "#374151" }}
                tickFormatter={formatYAxis}
              />
              <YAxis
                dataKey={xAxisDataKey}
                type="category"
                tick={{
                  fill: "#6B7280",
                  fontSize: 11,
                  fontFamily: "JetBrains Mono, monospace",
                }}
                tickLine={{ stroke: "#374151" }}
                axisLine={{ stroke: "#374151" }}
                width={80}
              />
            </>
          ) : (
            <>
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
            </>
          )}
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
              cursor={{ fill: "#1F2937", opacity: 0.5 }}
            />
          )}
          {showLegend && series.length > 1 && (
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
          {series.map((s, idx) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
              stackId={s.stackId}
              radius={[barRadius, barRadius, 0, 0]}
            >
              {colorByValue &&
                data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorByValue(entry[s.dataKey] as number)}
                  />
                ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChart;
