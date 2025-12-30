"use client";

import { useState } from "react";
import { Map, Satellite, Layers2, Moon } from "lucide-react";

export type BaseLayerStyle =
  | "streets"
  | "satellite"
  | "hybrid"
  | "dark";

export interface BaseLayerOption {
  id: BaseLayerStyle;
  label: string;
  icon: React.ElementType;
  styleUrl: string;
}

const baseLayerOptions: BaseLayerOption[] = [
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    styleUrl: "mapbox://styles/mapbox/dark-v11",
  },
  {
    id: "streets",
    label: "Street",
    icon: Map,
    styleUrl: "mapbox://styles/mapbox/streets-v12",
  },
  {
    id: "satellite",
    label: "Satellite",
    icon: Satellite,
    styleUrl: "mapbox://styles/mapbox/satellite-v9",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    icon: Layers2,
    styleUrl: "mapbox://styles/mapbox/satellite-streets-v12",
  },
];

export interface MapBaseLayersProps {
  currentStyle: BaseLayerStyle;
  onStyleChange: (style: BaseLayerStyle, styleUrl: string) => void;
  className?: string;
  compact?: boolean;
}

export function MapBaseLayers({
  currentStyle,
  onStyleChange,
  className = "",
  compact = false,
}: MapBaseLayersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentOption = baseLayerOptions.find((o) => o.id === currentStyle);
  const CurrentIcon = currentOption?.icon || Map;

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-md hover:bg-[var(--secondary)] transition-colors"
          title="Change base map"
        >
          <CurrentIcon className="w-5 h-5 text-[var(--foreground)]" />
        </button>

        {isExpanded && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsExpanded(false)}
            />
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-2 z-20 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden">
              {baseLayerOptions.map((option) => {
                const Icon = option.icon;
                const isActive = option.id === currentStyle;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      onStyleChange(option.id, option.styleUrl);
                      setIsExpanded(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "text-[var(--foreground)] hover:bg-[var(--secondary)]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 p-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-md ${className}`}
    >
      {baseLayerOptions.map((option) => {
        const Icon = option.icon;
        const isActive = option.id === currentStyle;
        return (
          <button
            key={option.id}
            onClick={() => onStyleChange(option.id, option.styleUrl)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isActive
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
            }`}
            title={option.label}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { baseLayerOptions };
export default MapBaseLayers;
