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

const DEFAULT_COLORS = [
  "#3B6CF3", // Primary blue
  "#10B981", // Green
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EF4444", // Red
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
  barRadius = 4,
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
      aria-label={ariaLabel || `Bar chart showing ${series.map(s => s.name).join(", ")}`}
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
              stroke="var(--border)"
              opacity={0.5}
              horizontal={!isVertical}
              vertical={isVertical}
            />
          )}
          {isVertical ? (
            <>
              <XAxis
                type="number"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={{ stroke: "var(--border)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickFormatter={formatYAxis}
              />
              <YAxis
                dataKey={xAxisDataKey}
                type="category"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={{ stroke: "var(--border)" }}
                axisLine={{ stroke: "var(--border)" }}
                width={80}
              />
            </>
          ) : (
            <>
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
            </>
          )}
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
              cursor={{ fill: "var(--muted)", opacity: 0.3 }}
            />
          )}
          {showLegend && series.length > 1 && (
            <Legend
              wrapperStyle={{ color: "var(--foreground)" }}
              formatter={(value) => (
                <span style={{ color: "var(--muted-foreground)" }}>{value}</span>
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
