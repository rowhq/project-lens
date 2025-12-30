"use client";

/**
 * MapView Component - Using MapLibre GL (free, no API key required)
 * Uses free tile sources: OpenStreetMap (streets), ESRI (satellite)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, Map as MapIcon, Satellite, RotateCcw } from "lucide-react";

export interface MapMarker {
  id: string;
  longitude: number;
  latitude: number;
  label?: string;
  color?: string;
  popup?: string;
  onClick?: () => void;
}

export type BaseLayerStyle = "streets" | "satellite" | "hybrid";

export interface MapViewProps {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  markers?: MapMarker[];
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
const DEFAULT_CENTER: [number, number] = [-99.9018, 31.9686];
const DEFAULT_ZOOM = 6;

// Free tile sources - no API key required
const BASE_STYLES: Record<BaseLayerStyle, maplibregl.StyleSpecification> = {
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
        attribution:
          "&copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics",
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
        attribution:
          "&copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics",
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

export function MapView({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  className = "",
  style,
  interactive = true,
  showNavigation = true,
  showScale = true,
  showLayerControls = false,
  showBaseLayerSwitcher = false,
  defaultBaseLayer = "streets",
  onMapClick,
  onMarkerClick,
  fitBounds,
  padding = 50,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [baseLayer, setBaseLayer] = useState<BaseLayerStyle>(defaultBaseLayer);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: BASE_STYLES[defaultBaseLayer],
      center,
      zoom,
      interactive,
      attributionControl: false,
    });

    // Add controls
    if (showNavigation && interactive) {
      map.current.addControl(
        new maplibregl.NavigationControl(),
        "top-right"
      );
    }

    if (showScale) {
      map.current.addControl(
        new maplibregl.ScaleControl({ maxWidth: 100 }),
        "bottom-left"
      );
    }

    // Attribution
    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    // Handle load
    map.current.on("load", () => {
      // Force resize to ensure map fills container correctly
      map.current?.resize();
      setIsLoaded(true);
    });

    // Multiple resize calls to handle CSS layout settling at different stages
    const resizeDelays = [50, 100, 200, 500];
    const timeouts = resizeDelays.map(delay =>
      setTimeout(() => {
        map.current?.resize();
      }, delay)
    );

    // Also resize on idle callback for smoother handling
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        map.current?.resize();
      });
    }

    // Handle click
    if (onMapClick) {
      map.current.on("click", (e) => {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      });
    }

    // ResizeObserver to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      map.current?.resize();
    });
    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      // Clean up timeouts
      timeouts.forEach(t => clearTimeout(t));

      // Clean up resize observer
      resizeObserver.disconnect();

      // Clean up markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      // Clean up map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle base layer change
  const handleBaseLayerChange = useCallback((newStyle: BaseLayerStyle) => {
    if (!map.current) return;
    setBaseLayer(newStyle);
    map.current.setStyle(BASE_STYLES[newStyle]);
  }, []);

  // Reset view
  const handleResetView = useCallback(() => {
    if (!map.current) return;
    map.current.flyTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      duration: 1000,
    });
  }, []);

  // Update center and zoom
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    if (fitBounds) {
      map.current.fitBounds(fitBounds, { padding });
    } else {
      map.current.flyTo({
        center,
        zoom,
        duration: 1000,
      });
    }
  }, [center, zoom, fitBounds, isLoaded, padding]);

  // Manage markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Track which markers to keep
    const currentMarkerIds = new Set(markers.map((m) => m.id));

    // Remove markers that are no longer needed
    markersRef.current.forEach((marker, id) => {
      if (!currentMarkerIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    markers.forEach((markerData) => {
      let marker = markersRef.current.get(markerData.id);

      if (marker) {
        // Update existing marker position
        marker.setLngLat([markerData.longitude, markerData.latitude]);
      } else {
        // Create new marker
        const el = createMarkerElement(markerData);

        marker = new maplibregl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat([markerData.longitude, markerData.latitude])
          .addTo(map.current!);

        // Add popup if provided
        if (markerData.popup) {
          const popup = new maplibregl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false,
          }).setHTML(markerData.popup);
          marker.setPopup(popup);
        }

        // Add click handler
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          if (markerData.onClick) {
            markerData.onClick();
          }
          if (onMarkerClick) {
            onMarkerClick(markerData);
          }
        });

        markersRef.current.set(markerData.id, marker);
      }
    });
  }, [markers, isLoaded, onMarkerClick]);

  // Fit bounds to markers
  const fitToMarkers = useCallback(() => {
    if (!map.current || markers.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    markers.forEach((marker) => {
      bounds.extend([marker.longitude, marker.latitude]);
    });

    map.current.fitBounds(bounds, {
      padding,
      maxZoom: 15,
    });
  }, [markers, padding]);

  // Compute final height - prefer explicit height from style prop
  const containerHeight = style?.height ?? 300;

  return (
    <div
      className={`relative ${className}`}
      style={{ ...style, height: containerHeight }}
    >
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: typeof containerHeight === 'number' ? containerHeight : '100%'
        }}
        className="rounded-lg"
      />

      {/* Loading state */}
      {!isLoaded && (
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
      )}

      {/* Fit all button */}
      {isLoaded && markers.length > 1 && (
        <button
          onClick={fitToMarkers}
          className="absolute top-2 left-2 z-10 bg-[var(--card)] border border-[var(--border)] px-3 py-1.5 rounded-md shadow-md text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
          title="Fit to all markers"
        >
          Fit All
        </button>
      )}

      {/* Base layer switcher */}
      {isLoaded && showBaseLayerSwitcher && (
        <div className="absolute bottom-6 left-2 z-10 flex gap-1 bg-[var(--card)] border border-[var(--border)] p-1 rounded-lg shadow-lg">
          <button
            onClick={() => handleBaseLayerChange("streets")}
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
            onClick={() => handleBaseLayerChange("satellite")}
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
            onClick={() => handleBaseLayerChange("hybrid")}
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
            onClick={handleResetView}
            className="p-2 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors"
            title="Reset View"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Layer controls panel */}
      {isLoaded && showLayerControls && (
        <div className="absolute top-2 right-14 z-10 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg p-3 min-w-[180px]">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--border)]">
            <Layers className="h-4 w-4 text-[var(--primary)]" />
            <span className="font-medium text-sm text-[var(--foreground)]">
              Layers
            </span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Layer controls coming soon
          </p>
        </div>
      )}
    </div>
  );
}

function createMarkerElement(marker: MapMarker): HTMLElement {
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

// Static map component using OpenStreetMap static API
export function StaticMapView({
  longitude,
  latitude,
  zoom = 15,
  width = 600,
  height = 400,
  marker = true,
  className = "",
}: {
  longitude: number;
  latitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  marker?: boolean;
  className?: string;
}) {
  // Use OpenStreetMap static map service (free)
  const markerParam = marker
    ? `&markers=${longitude},${latitude},red-pushpin`
    : "";
  const url = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&maptype=osmarenderer${markerParam}`;

  return (
    <img
      src={url}
      alt="Map location"
      className={`rounded-lg ${className}`}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}

export default MapView;
