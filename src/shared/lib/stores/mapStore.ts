/**
 * Map Store - Zustand store for map state management
 * Adapted from RTAV implementation
 */

import { create } from "zustand";

export type BaseMapType = "streets" | "satellite" | "hybrid";
export type LayerKey =
  | "parcels"
  | "propertyLines"
  | "floodZones"
  | "zoning"
  | "streets";

interface MapStore {
  // Map state
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  baseMap: BaseMapType;

  // Layers
  layers: Record<LayerKey, boolean>;
  layerOpacity: Record<LayerKey, number>;
  showLabels: boolean;

  // Selected property
  selectedPropertyId: string | null;
  hoveredPropertyId: string | null;

  // Actions
  setMapCenter: (center: { lat: number; lng: number }) => void;
  setMapZoom: (zoom: number) => void;
  setBaseMap: (baseMap: BaseMapType) => void;
  toggleLayer: (layer: LayerKey) => void;
  setLayerOpacity: (layer: LayerKey, opacity: number) => void;
  toggleLabels: () => void;
  setSelectedProperty: (id: string | null) => void;
  setHoveredProperty: (id: string | null) => void;
  resetView: () => void;
}

// Default center: Austin, TX
const DEFAULT_CENTER = { lat: 30.2672, lng: -97.7431 };
const DEFAULT_ZOOM = 12;

export const useMapStore = create<MapStore>((set) => ({
  // Initial state
  mapCenter: DEFAULT_CENTER,
  mapZoom: DEFAULT_ZOOM,
  baseMap: "streets",
  showLabels: true,

  layers: {
    parcels: true,
    propertyLines: true,
    floodZones: false,
    zoning: false,
    streets: true,
  },

  layerOpacity: {
    parcels: 0.3,
    propertyLines: 1,
    floodZones: 0.5,
    zoning: 0.6,
    streets: 0.8,
  },

  selectedPropertyId: null,
  hoveredPropertyId: null,

  // Actions
  setMapCenter: (center) => set({ mapCenter: center }),

  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  setBaseMap: (baseMap) => set({ baseMap }),

  toggleLayer: (layer) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: !state.layers[layer],
      },
    })),

  setLayerOpacity: (layer, opacity) =>
    set((state) => ({
      layerOpacity: {
        ...state.layerOpacity,
        [layer]: opacity,
      },
    })),

  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),

  setSelectedProperty: (id) => set({ selectedPropertyId: id }),

  setHoveredProperty: (id) => set({ hoveredPropertyId: id }),

  resetView: () =>
    set({
      mapCenter: DEFAULT_CENTER,
      mapZoom: DEFAULT_ZOOM,
    }),
}));
