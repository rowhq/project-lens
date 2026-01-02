"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

export interface PieChartProps {
  data: PieChartDataPoint[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  formatValue?: (value: number) => string;
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
  "#F472B6", // Pink
  "#A3E635", // Lime light
];

export function PieChart({
  data,
  height = 300,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  innerRadius = 0,
  outerRadius = 80,
  formatValue,
  className = "",
  ariaLabel,
}: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const renderLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
    name?: string;
  }) => {
    const {
      cx = 0,
      cy = 0,
      midAngle = 0,
      innerRadius = 0,
      outerRadius = 0,
      percent = 0,
      name = "",
    } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#9CA3AF"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
        fontFamily="JetBrains Mono, monospace"
        style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    );
  };

  return (
    <div
      className={className}
      style={{ height }}
      role="img"
      aria-label={
        ariaLabel || `Pie chart showing ${data.map((d) => d.name).join(", ")}`
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            label={showLabels ? renderLabel : undefined}
            labelLine={showLabels ? { stroke: "#6B7280" } : false}
            stroke="#0A0A0A"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                }
              />
            ))}
          </Pie>
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
              formatter={(value, name) => {
                const numValue = typeof value === "number" ? value : 0;
                return [
                  formatValue
                    ? formatValue(numValue)
                    : numValue.toLocaleString(),
                  name,
                ];
              }}
            />
          )}
          {showLegend && (
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
              }}
              formatter={(value, entry) => {
                const entryValue =
                  (entry.payload as PieChartDataPoint)?.value ?? 0;
                return (
                  <span
                    style={{
                      color: "#9CA3AF",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {value} ({((entryValue / total) * 100).toFixed(0)}%)
                  </span>
                );
              }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Donut chart variant
export function DonutChart(props: Omit<PieChartProps, "innerRadius">) {
  return (
    <PieChart
      {...props}
      innerRadius={60}
      ariaLabel={
        props.ariaLabel ||
        `Donut chart showing ${props.data.map((d) => d.name).join(", ")}`
      }
    />
  );
}

export default PieChart;
