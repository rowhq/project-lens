/**
 * Map Types and Constants
 * Free tile sources - no API key required
 */

import type maplibregl from "maplibre-gl";

export interface MapMarker {
  id: string;
  longitude: number;
  latitude: number;
  label?: string;
  color?: string;
  popup?: string;
  onClick?: () => void;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity?: number; // 0-1 value, defaults to 0.5
}

export type BaseLayerStyle = "streets" | "satellite" | "hybrid";

export interface MapViewProps {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  markers?: MapMarker[];
  heatmapData?: HeatmapPoint[];
  showHeatmap?: boolean;
  heatmapRadius?: number;
  heatmapIntensity?: number;
  heatmapOpacity?: number;
  className?: string;
  style?: React.CSSProperties;
  interactive?: boolean;
  showNavigation?: boolean;
  showScale?: boolean;
  showLayerControls?: boolean;
  showBaseLayerSwitcher?: boolean;
  defaultBaseLayer?: BaseLayerStyle;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  fitBounds?: [[number, number], [number, number]]; // [[sw], [ne]]
  padding?: number;
}

// Default to center of Texas
export const DEFAULT_CENTER: [number, number] = [-99.9018, 31.9686];
export const DEFAULT_ZOOM = 6;

// Free tile sources - no API key required
export const BASE_STYLES: Record<
  BaseLayerStyle,
  maplibregl.StyleSpecification
> = {
  streets: {
    version: 8,
    sources: {
      "osm-tiles": {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: [
      {
        id: "osm-tiles",
        type: "raster",
        source: "osm-tiles",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
  satellite: {
    version: 8,
    sources: {
      "satellite-tiles": {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "&copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics",
      },
    },
    layers: [
      {
        id: "satellite-tiles",
        type: "raster",
        source: "satellite-tiles",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
  hybrid: {
    version: 8,
    sources: {
      "satellite-tiles": {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      "labels-tiles": {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "&copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics",
      },
    },
    layers: [
      {
        id: "satellite-tiles",
        type: "raster",
        source: "satellite-tiles",
        minzoom: 0,
        maxzoom: 19,
      },
      {
        id: "labels-tiles",
        type: "raster",
        source: "labels-tiles",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
};
