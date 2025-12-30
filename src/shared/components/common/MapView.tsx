"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapLayerControls, type LayerConfig } from "./MapLayerControls";
import { MapBaseLayers, type BaseLayerStyle, baseLayerOptions } from "./MapBaseLayers";

export interface MapMarker {
  id: string;
  longitude: number;
  latitude: number;
  label?: string;
  color?: string;
  popup?: string;
  onClick?: () => void;
}

// Predefined layer configurations
export interface MapLayerDefinition {
  id: string;
  label: string;
  color: string;
  description?: string;
  sourceType: "geojson" | "vector";
  sourceUrl?: string;
  sourceLayer?: string;
  paintType: "fill" | "line" | "circle";
  paint: mapboxgl.FillPaint | mapboxgl.LinePaint | mapboxgl.CirclePaint;
}

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
  enabledLayers?: string[]; // IDs of layers to enable by default
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  fitBounds?: [[number, number], [number, number]]; // [[sw], [ne]]
  padding?: number;
}

// Default to center of Texas
const DEFAULT_CENTER: [number, number] = [-99.9018, 31.9686];
const DEFAULT_ZOOM = 6;

// Available overlay layers
const AVAILABLE_LAYERS: MapLayerDefinition[] = [
  {
    id: "parcels",
    label: "Property Parcels",
    color: "#3B6CF3",
    description: "Property boundary lines",
    sourceType: "vector",
    sourceUrl: "mapbox://mapbox.mapbox-streets-v8",
    sourceLayer: "building",
    paintType: "line",
    paint: {
      "line-color": "#3B6CF3",
      "line-width": 1,
      "line-opacity": 0.6,
    } as mapboxgl.LinePaint,
  },
  {
    id: "flood-zones",
    label: "Flood Zones",
    color: "#06B6D4",
    description: "FEMA flood hazard areas",
    sourceType: "vector",
    sourceUrl: "mapbox://mapbox.mapbox-streets-v8",
    sourceLayer: "water",
    paintType: "fill",
    paint: {
      "fill-color": "#06B6D4",
      "fill-opacity": 0.3,
    } as mapboxgl.FillPaint,
  },
  {
    id: "zoning",
    label: "Zoning",
    color: "#8B5CF6",
    description: "Land use zoning",
    sourceType: "vector",
    sourceUrl: "mapbox://mapbox.mapbox-streets-v8",
    sourceLayer: "landuse",
    paintType: "fill",
    paint: {
      "fill-color": "#8B5CF6",
      "fill-opacity": 0.2,
      "fill-outline-color": "#8B5CF6",
    } as mapboxgl.FillPaint,
  },
];

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
  defaultBaseLayer = "dark",
  enabledLayers = [],
  onMapClick,
  onMarkerClick,
  fitBounds,
  padding = 50,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseLayer, setBaseLayer] = useState<BaseLayerStyle>(defaultBaseLayer);
  const [layers, setLayers] = useState<LayerConfig[]>(
    AVAILABLE_LAYERS.map((layer) => ({
      id: layer.id,
      label: layer.label,
      visible: enabledLayers.includes(layer.id),
      opacity: 1,
      color: layer.color,
      description: layer.description,
    }))
  );

  // Get initial style URL
  const getStyleUrl = useCallback((style: BaseLayerStyle) => {
    return baseLayerOptions.find((o) => o.id === style)?.styleUrl ||
      "mapbox://styles/mapbox/dark-v11";
  }, []);

  // Handle base layer change
  const handleBaseLayerChange = useCallback((style: BaseLayerStyle, styleUrl: string) => {
    if (!map.current) return;
    setBaseLayer(style);
    map.current.setStyle(styleUrl);

    // Re-add overlay layers after style change
    map.current.once("style.load", () => {
      addOverlayLayers();
    });
  }, []);

  // Handle layer config change
  const handleLayerChange = useCallback((layerId: string, updates: Partial<LayerConfig>) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      )
    );
  }, []);

  // Add overlay layers to map
  const addOverlayLayers = useCallback(() => {
    if (!map.current) return;

    AVAILABLE_LAYERS.forEach((layerDef) => {
      const layerConfig = layers.find((l) => l.id === layerDef.id);
      if (!layerConfig) return;

      // Check if source already exists
      if (!map.current!.getSource(`${layerDef.id}-source`)) {
        if (layerDef.sourceType === "vector" && layerDef.sourceUrl) {
          map.current!.addSource(`${layerDef.id}-source`, {
            type: "vector",
            url: layerDef.sourceUrl,
          });
        }
      }

      // Check if layer already exists
      if (!map.current!.getLayer(layerDef.id)) {
        const layerConfig = {
          id: layerDef.id,
          type: layerDef.paintType,
          source: `${layerDef.id}-source`,
          "source-layer": layerDef.sourceLayer,
          paint: layerDef.paint,
          layout: {
            visibility: "none" as const,
          },
        };

        map.current!.addLayer(layerConfig as mapboxgl.AnyLayer);
      }
    });
  }, [layers]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setError("Mapbox token not configured");
      return;
    }

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: getStyleUrl(defaultBaseLayer),
        center,
        zoom,
        interactive,
        attributionControl: false,
      });

      // Add controls
      if (showNavigation && interactive) {
        map.current.addControl(
          new mapboxgl.NavigationControl(),
          "top-right"
        );
      }

      if (showScale) {
        map.current.addControl(
          new mapboxgl.ScaleControl({ maxWidth: 100 }),
          "bottom-left"
        );
      }

      // Attribution
      map.current.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      // Handle load
      map.current.on("load", () => {
        setIsLoaded(true);
        addOverlayLayers();
      });

      // Handle click
      if (onMapClick) {
        map.current.on("click", (e) => {
          onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        });
      }

      // Handle errors
      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        setError("Error loading map");
      });
    } catch (err) {
      console.error("Map initialization error:", err);
      setError("Failed to initialize map");
    }

    return () => {
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

        marker = new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat([markerData.longitude, markerData.latitude])
          .addTo(map.current!);

        // Add popup if provided
        if (markerData.popup) {
          const popup = new mapboxgl.Popup({
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

  // Sync layer visibility and opacity
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    layers.forEach((layerConfig) => {
      if (map.current!.getLayer(layerConfig.id)) {
        // Update visibility
        map.current!.setLayoutProperty(
          layerConfig.id,
          "visibility",
          layerConfig.visible ? "visible" : "none"
        );

        // Update opacity based on layer type
        const layerDef = AVAILABLE_LAYERS.find((l) => l.id === layerConfig.id);
        if (layerDef) {
          const opacityProp =
            layerDef.paintType === "fill"
              ? "fill-opacity"
              : layerDef.paintType === "line"
              ? "line-opacity"
              : "circle-opacity";
          map.current!.setPaintProperty(
            layerConfig.id,
            opacityProp,
            layerConfig.opacity
          );
        }
      }
    });
  }, [layers, isLoaded]);

  // Fit bounds to markers
  const fitToMarkers = useCallback(() => {
    if (!map.current || markers.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    markers.forEach((marker) => {
      bounds.extend([marker.longitude, marker.latitude]);
    });

    map.current.fitBounds(bounds, {
      padding,
      maxZoom: 15,
    });
  }, [markers, padding]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] rounded-lg ${className}`}
        style={{ minHeight: 300, ...style }}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-[var(--muted-foreground)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ minHeight: 300, ...style }}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />

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
        <MapBaseLayers
          currentStyle={baseLayer}
          onStyleChange={handleBaseLayerChange}
          className="absolute bottom-6 left-2 z-10"
        />
      )}

      {/* Layer controls */}
      {isLoaded && showLayerControls && (
        <MapLayerControls
          layers={layers}
          onLayerChange={handleLayerChange}
        />
      )}
    </div>
  );
}

function createMarkerElement(marker: MapMarker): HTMLElement {
  const el = document.createElement("div");
  el.className = "mapbox-marker";

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

// Static map component for non-interactive displays
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
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
        style={{ width, height }}
      >
        Map not available
      </div>
    );
  }

  const markerOverlay = marker
    ? `pin-l+ef4444(${longitude},${latitude})/`
    : "";

  const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${markerOverlay}${longitude},${latitude},${zoom}/${width}x${height}@2x?access_token=${token}`;

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
