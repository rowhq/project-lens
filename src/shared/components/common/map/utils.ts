/**
 * Map Utility Functions
 */

import type { MapMarker, HeatmapPoint } from "./types";

/**
 * Creates a custom marker DOM element for the map
 */
export function createMarkerElement(marker: MapMarker): HTMLElement {
  const el = document.createElement("div");
  el.className = "maplibre-marker";

  const color = marker.color || "#EF4444"; // Default red

  el.innerHTML = `
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.667 16 24 16 24s16-13.333 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="14" r="6" fill="white"/>
    </svg>
    ${marker.label ? `<span class="marker-label">${marker.label}</span>` : ""}
  `;

  el.style.cursor = "pointer";
  el.style.position = "relative";

  // Add label styling if present
  if (marker.label) {
    const style = document.createElement("style");
    style.textContent = `
      .marker-label {
        position: absolute;
        top: -24px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }
    `;
    el.appendChild(style);
  }

  return el;
}

/**
 * Convert heatmap data to GeoJSON format
 */
export function toHeatmapGeoJSON(
  heatmapData: HeatmapPoint[],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: heatmapData.map((point, index) => ({
      type: "Feature" as const,
      properties: {
        intensity: point.intensity ?? 0.5,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [point.lng, point.lat],
      },
      id: index,
    })),
  };
}
