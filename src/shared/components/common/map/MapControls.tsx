"use client";

/**
 * MapControls - UI controls for MapView
 * Loading state, Fit All button, Base Layer Switcher, Layer Controls Panel
 */

import { Layers, Map as MapIcon, Satellite, RotateCcw } from "lucide-react";
import type { BaseLayerStyle } from "./types";

interface MapLoadingProps {
  isLoaded: boolean;
}

export function MapLoading({ isLoaded }: MapLoadingProps) {
  if (isLoaded) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--muted)] rounded-lg">
      <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Loading map...</span>
      </div>
    </div>
  );
}

interface FitAllButtonProps {
  isLoaded: boolean;
  markerCount: number;
  onFit: () => void;
}

export function FitAllButton({
  isLoaded,
  markerCount,
  onFit,
}: FitAllButtonProps) {
  if (!isLoaded || markerCount <= 1) return null;

  return (
    <button
      onClick={onFit}
      className="absolute top-2 left-2 z-10 bg-[var(--card)] border border-[var(--border)] px-3 py-1.5 rounded-md shadow-md text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
      title="Fit to all markers"
    >
      Fit All
    </button>
  );
}

interface BaseLayerSwitcherProps {
  isLoaded: boolean;
  show: boolean;
  baseLayer: BaseLayerStyle;
  onLayerChange: (style: BaseLayerStyle) => void;
  onResetView: () => void;
}

export function BaseLayerSwitcher({
  isLoaded,
  show,
  baseLayer,
  onLayerChange,
  onResetView,
}: BaseLayerSwitcherProps) {
  if (!isLoaded || !show) return null;

  return (
    <div className="absolute bottom-6 left-2 z-10 flex gap-1 bg-[var(--card)] border border-[var(--border)] p-1 rounded-lg shadow-lg">
      <button
        onClick={() => onLayerChange("streets")}
        className={`p-2 rounded-md transition-colors ${
          baseLayer === "streets"
            ? "bg-blue-500 text-white"
            : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
        }`}
        title="Streets"
      >
        <MapIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onLayerChange("satellite")}
        className={`p-2 rounded-md transition-colors ${
          baseLayer === "satellite"
            ? "bg-blue-500 text-white"
            : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
        }`}
        title="Satellite"
      >
        <Satellite className="h-4 w-4" />
      </button>
      <button
        onClick={() => onLayerChange("hybrid")}
        className={`p-2 rounded-md transition-colors ${
          baseLayer === "hybrid"
            ? "bg-blue-500 text-white"
            : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
        }`}
        title="Hybrid"
      >
        <Layers className="h-4 w-4" />
      </button>
      <div className="w-px bg-[var(--border)]" />
      <button
        onClick={onResetView}
        className="p-2 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors"
        title="Reset View"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

interface LayerControlsPanelProps {
  isLoaded: boolean;
  show: boolean;
  showHeatmap?: boolean;
}

export function LayerControlsPanel({
  isLoaded,
  show,
  showHeatmap,
}: LayerControlsPanelProps) {
  if (!isLoaded || !show) return null;

  return (
    <div className="absolute top-2 right-14 z-10 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg p-3 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--border)]">
        <Layers className="h-4 w-4 text-[var(--primary)]" />
        <span className="font-medium text-sm text-[var(--foreground)]">
          Layers
        </span>
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)] cursor-pointer">
          <input type="checkbox" checked disabled className="rounded" />
          <span>Markers</span>
        </label>
        {showHeatmap !== undefined && (
          <label className="flex items-center gap-2 text-sm text-[var(--foreground)] cursor-pointer">
            <input
              type="checkbox"
              checked={showHeatmap}
              disabled
              className="rounded"
            />
            <span>Heatmap</span>
          </label>
        )}
      </div>
    </div>
  );
}
