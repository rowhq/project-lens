"use client";

import { useState } from "react";
import { Layers, ChevronDown, Eye, EyeOff } from "lucide-react";

export interface LayerConfig {
  id: string;
  label: string;
  visible: boolean;
  opacity: number;
  color?: string;
  description?: string;
}

export interface MapLayerControlsProps {
  layers: LayerConfig[];
  onLayerChange: (layerId: string, updates: Partial<LayerConfig>) => void;
  className?: string;
}

export function MapLayerControls({
  layers,
  onLayerChange,
  className = "",
}: MapLayerControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`absolute top-2 right-14 z-10 w-64 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[var(--secondary)] border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">
            Map Layers
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform ${
            isExpanded ? "" : "-rotate-90"
          }`}
        />
      </button>

      {/* Layer list */}
      {isExpanded && (
        <div className="max-h-80 overflow-y-auto">
          {layers.length === 0 ? (
            <div className="p-4 text-sm text-[var(--muted-foreground)] text-center">
              No layers available
            </div>
          ) : (
            layers.map((layer) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                onChange={(updates) => onLayerChange(layer.id, updates)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface LayerItemProps {
  layer: LayerConfig;
  onChange: (updates: Partial<LayerConfig>) => void;
}

function LayerItem({ layer, onChange }: LayerItemProps) {
  const [showOpacity, setShowOpacity] = useState(false);

  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Visibility toggle */}
        <button
          onClick={() => onChange({ visible: !layer.visible })}
          className={`p-1 rounded transition-colors ${
            layer.visible
              ? "text-[var(--primary)] hover:bg-[var(--primary)]/10"
              : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
          }`}
          title={layer.visible ? "Hide layer" : "Show layer"}
        >
          {layer.visible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>

        {/* Color indicator */}
        {layer.color && (
          <div
            className="w-3 h-3 rounded-full border border-[var(--border)]"
            style={{ backgroundColor: layer.color }}
          />
        )}

        {/* Label */}
        <div className="flex-1 min-w-0">
          <span
            className={`text-sm truncate block ${
              layer.visible
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            {layer.label}
          </span>
          {layer.description && (
            <span className="text-xs text-[var(--muted-foreground)] truncate block">
              {layer.description}
            </span>
          )}
        </div>

        {/* Opacity toggle */}
        <button
          onClick={() => setShowOpacity(!showOpacity)}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-1.5 py-0.5 rounded hover:bg-[var(--muted)] transition-colors"
        >
          {Math.round(layer.opacity * 100)}%
        </button>
      </div>

      {/* Opacity slider */}
      {showOpacity && layer.visible && (
        <div className="px-3 pb-2">
          <input
            type="range"
            min="0"
            max="100"
            value={layer.opacity * 100}
            onChange={(e) => onChange({ opacity: Number(e.target.value) / 100 })}
            className="w-full h-1.5 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
            <span>0%</span>
            <span>Opacity</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapLayerControls;
