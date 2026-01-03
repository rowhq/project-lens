"use client";

import { useState } from "react";
import {
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  MapPin,
  Droplets,
  Building,
  Grid3X3,
} from "lucide-react";

export interface LayerState {
  visible: boolean;
  opacity: number;
}

export interface LayersConfig {
  parcels: LayerState;
  propertyLines: LayerState;
  floodZones: LayerState;
  zoning: LayerState;
}

interface LayerControlProps {
  layers: LayersConfig;
  onLayerChange: (layerId: keyof LayersConfig, state: Partial<LayerState>) => void;
  onResetView: () => void;
}

const LAYER_CONFIG = [
  {
    id: "parcels" as const,
    label: "Parcels",
    icon: Grid3X3,
    color: "text-blue-400",
    description: "Property boundaries",
  },
  {
    id: "propertyLines" as const,
    label: "Property Lines",
    icon: MapPin,
    color: "text-white",
    description: "Lot boundaries",
  },
  {
    id: "floodZones" as const,
    label: "Flood Zones",
    icon: Droplets,
    color: "text-cyan-400",
    description: "FEMA flood areas",
  },
  {
    id: "zoning" as const,
    label: "Zoning Districts",
    icon: Building,
    color: "text-orange-400",
    description: "Land use zones",
  },
];

export function LayerControl({
  layers,
  onLayerChange,
  onResetView,
}: LayerControlProps) {
  // Start collapsed on mobile for better initial UX
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute top-20 right-4 z-10">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-800 clip-notch-sm shadow-lg hover:bg-gray-800 mb-2"
      >
        <Layers className="w-4 h-4 text-lime-400" />
        <span className="text-sm font-mono text-white uppercase tracking-wider">
          Layers
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Panel */}
      {isExpanded && (
        <div className="w-56 md:w-64 bg-gray-900 border border-gray-800 clip-notch shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              Map Layers
            </span>
            <button
              onClick={onResetView}
              className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Layers */}
          <div className="p-3 space-y-3">
            {LAYER_CONFIG.map((layer) => {
              const Icon = layer.icon;
              const state = layers[layer.id];

              return (
                <div
                  key={layer.id}
                  className={`p-3 rounded border transition-colors ${
                    state.visible
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-gray-900 border-gray-800"
                  }`}
                >
                  {/* Toggle Row */}
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.visible}
                        onChange={(e) =>
                          onLayerChange(layer.id, { visible: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-gray-900"
                      />
                      <Icon className={`w-4 h-4 ${layer.color}`} />
                      <span className="text-sm text-white">{layer.label}</span>
                    </label>
                    <span className="text-xs text-gray-500 font-mono">
                      {Math.round(state.opacity * 100)}%
                    </span>
                  </div>

                  {/* Opacity Slider */}
                  {state.visible && (
                    <div className="mt-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={state.opacity * 100}
                        onChange={(e) =>
                          onLayerChange(layer.id, {
                            opacity: parseInt(e.target.value) / 100,
                          })
                        }
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-lime-400"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-800 bg-gray-800/30">
            <p className="text-xs text-gray-500">
              Toggle layers and adjust opacity
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
