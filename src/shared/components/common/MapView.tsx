"use client";

/**
 * MapView Component - Using MapLibre GL (free, no API key required)
 * Uses free tile sources: OpenStreetMap (streets), ESRI (satellite)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Import from extracted modules
import {
  type MapViewProps,
  type MapMarker,
  type BaseLayerStyle,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  BASE_STYLES,
} from "./map/types";
import { createMarkerElement, toHeatmapGeoJSON } from "./map/utils";
import {
  MapLoading,
  FitAllButton,
  BaseLayerSwitcher,
  LayerControlsPanel,
} from "./map/MapControls";

// Re-export types and StaticMapView for backwards compatibility
export type {
  MapMarker,
  HeatmapPoint,
  BaseLayerStyle,
  MapViewProps,
} from "./map/types";
export { StaticMapView } from "./map/StaticMapView";

export function MapView({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  heatmapData = [],
  showHeatmap = false,
  heatmapRadius = 20,
  heatmapIntensity = 1,
  heatmapOpacity = 0.8,
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

  // Convert heatmap data to GeoJSON
  const heatmapGeoJSON = toHeatmapGeoJSON(heatmapData);

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
      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    }

    if (showScale) {
      map.current.addControl(
        new maplibregl.ScaleControl({ maxWidth: 100 }),
        "bottom-left",
      );
    }

    // Attribution
    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right",
    );

    // Handle load
    map.current.on("load", () => {
      map.current?.resize();
      setIsLoaded(true);
    });

    // Multiple resize calls to handle CSS layout settling
    const resizeDelays = [50, 100, 200, 500];
    const timeouts = resizeDelays.map((delay) =>
      setTimeout(() => {
        map.current?.resize();
      }, delay),
    );

    // Also resize on idle callback
    if (typeof requestIdleCallback !== "undefined") {
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
      timeouts.forEach((t) => clearTimeout(t));
      resizeObserver.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

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
        marker.setLngLat([markerData.longitude, markerData.latitude]);
      } else {
        const el = createMarkerElement(markerData);

        marker = new maplibregl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat([markerData.longitude, markerData.latitude])
          .addTo(map.current!);

        if (markerData.popup) {
          const popup = new maplibregl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false,
          }).setHTML(markerData.popup);
          marker.setPopup(popup);
        }

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

  // Manage heatmap layer
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const HEATMAP_SOURCE_ID = "heatmap-source";
    const HEATMAP_LAYER_ID = "heatmap-layer";

    // Remove existing heatmap layer and source
    if (map.current.getLayer(HEATMAP_LAYER_ID)) {
      map.current.removeLayer(HEATMAP_LAYER_ID);
    }
    if (map.current.getSource(HEATMAP_SOURCE_ID)) {
      map.current.removeSource(HEATMAP_SOURCE_ID);
    }

    // Only add heatmap if we have data and it should be shown
    if (showHeatmap && heatmapGeoJSON.features.length > 0) {
      map.current.addSource(HEATMAP_SOURCE_ID, {
        type: "geojson",
        data: heatmapGeoJSON,
      });

      map.current.addLayer({
        id: HEATMAP_LAYER_ID,
        type: "heatmap",
        source: HEATMAP_SOURCE_ID,
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "intensity"],
            0,
            0,
            1,
            1,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            heatmapIntensity * 0.5,
            9,
            heatmapIntensity * 2,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0, 0, 0, 0)",
            0.1,
            "rgba(163, 230, 53, 0.4)", // lime-400
            0.3,
            "rgba(250, 204, 21, 0.6)", // yellow-400
            0.5,
            "rgba(251, 146, 60, 0.7)", // orange-400
            0.7,
            "rgba(239, 68, 68, 0.8)", // red-500
            1,
            "rgba(185, 28, 28, 0.9)", // red-700
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            heatmapRadius * 0.5,
            9,
            heatmapRadius * 2,
          ],
          "heatmap-opacity": heatmapOpacity,
        },
      });
    }
  }, [
    showHeatmap,
    heatmapGeoJSON,
    heatmapRadius,
    heatmapIntensity,
    heatmapOpacity,
    isLoaded,
  ]);

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

  // Compute final height
  const containerHeight = style?.height ?? 300;

  return (
    <div
      className={`relative ${className}`}
      style={{ ...style, height: containerHeight }}
    >
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height:
            typeof containerHeight === "number" ? containerHeight : "100%",
        }}
        className="rounded-lg"
      />

      <MapLoading isLoaded={isLoaded} />

      <FitAllButton
        isLoaded={isLoaded}
        markerCount={markers.length}
        onFit={fitToMarkers}
      />

      <BaseLayerSwitcher
        isLoaded={isLoaded}
        show={showBaseLayerSwitcher}
        baseLayer={baseLayer}
        onLayerChange={handleBaseLayerChange}
        onResetView={handleResetView}
      />

      <LayerControlsPanel
        isLoaded={isLoaded}
        show={showLayerControls}
        showHeatmap={showHeatmap}
      />
    </div>
  );
}

export default MapView;
