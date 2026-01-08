"use client";

/**
 * Growth Map - Interactive Map with Real Tiles (Mockup)
 * Shows opportunity zones overlaid on actual map
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  School,
  Route,
  Zap,
  ChevronRight,
  Info,
  Layers,
  Map as MapIcon,
  Satellite,
  Loader2,
} from "lucide-react";

// Type declarations for maplibre-gl
type MaplibreMap = {
  addControl: (control: unknown, position?: string) => void;
  on: (event: string, callback: (e?: MapErrorEvent) => void) => void;
  once: (event: string, callback: () => void) => void;
  setStyle: (style: unknown) => void;
  flyTo: (options: {
    center: [number, number];
    zoom: number;
    duration: number;
  }) => void;
  remove: () => void;
};

type MaplibreMarker = {
  setLngLat: (lngLat: [number, number]) => MaplibreMarker;
  addTo: (map: MaplibreMap) => MaplibreMarker;
  remove: () => void;
};

type MapErrorEvent = {
  error?: { message?: string };
};

// Type for the maplibre-gl module
type MaplibreModule = {
  Map: new (options: {
    container: HTMLElement;
    style: string | object;
    center: [number, number];
    zoom: number;
  }) => MaplibreMap;
  NavigationControl: new () => unknown;
  Marker: new (options: {
    element: HTMLElement;
    anchor: string;
  }) => MaplibreMarker;
};

// Mock opportunity zones with real coordinates (Central Texas)
const OPPORTUNITY_ZONES = [
  {
    id: "1",
    name: "North Austin Corridor",
    county: "Travis",
    lat: 30.4015,
    lng: -97.7255,
    appreciation: 18,
    signals: [
      {
        type: "school",
        label: "New Elementary School",
        status: "Under Construction",
      },
      { type: "road", label: "MoPac Extension Phase 2", status: "Approved" },
    ],
    parcels: 847,
    avgPrice: 425000,
  },
  {
    id: "2",
    name: "Cedar Park Growth Zone",
    county: "Williamson",
    lat: 30.5052,
    lng: -97.8203,
    appreciation: 22,
    signals: [
      {
        type: "utility",
        label: "New Water Treatment Plant",
        status: "Planning",
      },
      {
        type: "school",
        label: "High School Expansion",
        status: "Under Construction",
      },
      { type: "road", label: "183A Toll Extension", status: "Approved" },
    ],
    parcels: 1243,
    avgPrice: 385000,
  },
  {
    id: "3",
    name: "San Marcos South",
    county: "Hays",
    lat: 29.853,
    lng: -97.9414,
    appreciation: 15,
    signals: [
      { type: "road", label: "I-35 Expansion", status: "Under Construction" },
      {
        type: "utility",
        label: "Grid Infrastructure Upgrade",
        status: "Approved",
      },
    ],
    parcels: 562,
    avgPrice: 295000,
  },
  {
    id: "4",
    name: "Round Rock Tech Hub",
    county: "Williamson",
    lat: 30.5083,
    lng: -97.6789,
    appreciation: 20,
    signals: [
      { type: "school", label: "STEM Academy", status: "Under Construction" },
      { type: "road", label: "SH-45 Connector", status: "Approved" },
    ],
    parcels: 934,
    avgPrice: 445000,
  },
  {
    id: "5",
    name: "Pflugerville East",
    county: "Travis",
    lat: 30.4393,
    lng: -97.5801,
    appreciation: 16,
    signals: [
      { type: "utility", label: "Solar Farm Connection", status: "Planning" },
      {
        type: "school",
        label: "Middle School Construction",
        status: "Under Construction",
      },
    ],
    parcels: 678,
    avgPrice: 365000,
  },
  {
    id: "6",
    name: "Kyle Expansion Zone",
    county: "Hays",
    lat: 29.9891,
    lng: -97.8772,
    appreciation: 24,
    signals: [
      { type: "road", label: "FM 1626 Widening", status: "Under Construction" },
      { type: "school", label: "New Elementary Campus", status: "Approved" },
      {
        type: "utility",
        label: "Wastewater Expansion",
        status: "Under Construction",
      },
    ],
    parcels: 1567,
    avgPrice: 315000,
  },
  {
    id: "7",
    name: "Dripping Springs West",
    county: "Hays",
    lat: 30.1902,
    lng: -98.0867,
    appreciation: 19,
    signals: [
      { type: "school", label: "K-8 Campus", status: "Planning" },
      { type: "road", label: "US-290 Improvements", status: "Approved" },
    ],
    parcels: 423,
    avgPrice: 525000,
  },
  {
    id: "8",
    name: "Georgetown North",
    county: "Williamson",
    lat: 30.6478,
    lng: -97.6778,
    appreciation: 17,
    signals: [
      {
        type: "utility",
        label: "Water District Expansion",
        status: "Under Construction",
      },
      { type: "road", label: "Inner Loop Connector", status: "Planning" },
    ],
    parcels: 756,
    avgPrice: 395000,
  },
];

const SignalIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "school":
      return <School className="w-3.5 h-3.5 text-blue-400" />;
    case "road":
      return <Route className="w-3.5 h-3.5 text-orange-400" />;
    case "utility":
      return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
    default:
      return <Info className="w-3.5 h-3.5 text-gray-400" />;
  }
};

type MapStyle = "streets" | "satellite" | "dark";

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<MaplibreMarker[]>([]);

  const [selectedZone, setSelectedZone] = useState<
    (typeof OPPORTUNITY_ZONES)[0] | null
  >(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>("dark");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        // Dynamically import maplibre-gl to avoid SSR issues
        const maplibregl = (await import("maplibre-gl")).default;
        await import("maplibre-gl/dist/maplibre-gl.css");

        if (!isMounted || !mapContainer.current) return;

        const styleUrl =
          mapStyle === "dark"
            ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            : mapStyle === "satellite"
              ? {
                  version: 8 as const,
                  sources: {
                    "satellite-tiles": {
                      type: "raster" as const,
                      tiles: [
                        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                      ],
                      tileSize: 256,
                    },
                  },
                  layers: [
                    {
                      id: "satellite-tiles",
                      type: "raster" as const,
                      source: "satellite-tiles",
                      minzoom: 0,
                      maxzoom: 19,
                    },
                  ],
                }
              : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

        const map = new maplibregl.Map({
          container: mapContainer.current,
          style: styleUrl,
          center: [-97.7431, 30.2672], // Austin, TX
          zoom: 9,
        });

        map.addControl(new maplibregl.NavigationControl(), "top-right");

        map.on("load", () => {
          if (!isMounted) return;
          setIsMapLoaded(true);
          addMarkers(map, maplibregl);
        });

        map.on("error", (e?: MapErrorEvent) => {
          console.error("Map error:", e);
          setMapError("Failed to load map");
        });

        mapRef.current = map;
      } catch (error) {
        console.error("Failed to initialize map:", error);
        setMapError("Failed to initialize map");
      }
    };

    initMap();

    return () => {
      isMounted = false;
      markersRef.current.forEach((marker) => marker.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount only

  // Handle style changes
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    const updateStyle = async () => {
      const styleUrl =
        mapStyle === "dark"
          ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          : mapStyle === "satellite"
            ? {
                version: 8 as const,
                sources: {
                  "satellite-tiles": {
                    type: "raster" as const,
                    tiles: [
                      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    ],
                    tileSize: 256,
                  },
                },
                layers: [
                  {
                    id: "satellite-tiles",
                    type: "raster" as const,
                    source: "satellite-tiles",
                    minzoom: 0,
                    maxzoom: 19,
                  },
                ],
              }
            : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

      mapRef.current.setStyle(styleUrl);

      // Re-add markers after style change
      mapRef.current.once("styledata", async () => {
        const maplibregl = (await import("maplibre-gl")).default;
        addMarkers(mapRef.current, maplibregl);
      });
    };

    updateStyle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapStyle]); // isMapLoaded is used as guard, not trigger

  // Add markers to map
  const addMarkers = (map: MaplibreMap | null, maplibregl: MaplibreModule) => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    OPPORTUNITY_ZONES.forEach((zone) => {
      const isHighGrowth = zone.appreciation >= 20;
      const isModerate = zone.appreciation >= 15 && zone.appreciation < 20;

      // Create custom marker element
      const el = document.createElement("div");
      el.className = "growth-marker";
      el.style.cssText = "cursor: pointer;";

      const color = isHighGrowth
        ? "rgb(163, 230, 53)"
        : isModerate
          ? "rgb(34, 211, 238)"
          : "rgb(107, 114, 128)";

      el.innerHTML = `
        <div style="position: relative;">
          ${
            isHighGrowth
              ? `
            <div style="position: absolute; inset: -4px; width: 32px; height: 32px; border-radius: 50%; background: rgba(163, 230, 53, 0.3); animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          `
              : ""
          }
          <div style="position: relative; width: 24px; height: 24px; border-radius: 50%; background: ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.3);">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedZone(zone);
        map.flyTo({
          center: [zone.lng, zone.lat],
          zoom: 12,
          duration: 1000,
        });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([zone.lng, zone.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  // Fly to zone when selected from panel
  const handleZoneSelect = (zone: (typeof OPPORTUNITY_ZONES)[0]) => {
    setSelectedZone(zone);
    mapRef.current?.flyTo({
      center: [zone.lng, zone.lat],
      zoom: 12,
      duration: 1000,
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Add keyframes for ping animation */}
      <style jsx global>{`
        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Growth Map</h1>
          <p className="text-gray-500 text-sm mt-1">
            Infrastructure projects driving appreciation
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-lime-400/80 animate-pulse" />
            <span>High Growth (20%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400/80" />
            <span>Moderate (15-20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500/80" />
            <span>Emerging (&lt;15%)</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Map */}
        <div className="flex-1 relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden min-h-[400px]">
          <div
            ref={mapContainer}
            className="absolute inset-0 w-full h-full"
            style={{ minHeight: "400px" }}
          />

          {/* Loading State */}
          {!isMapLoaded && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="flex items-center gap-3 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading map...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <p className="text-red-400 mb-2">{mapError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-lime-400 hover:underline"
                >
                  Reload page
                </button>
              </div>
            </div>
          )}

          {/* Map Style Switcher */}
          <div className="absolute top-4 left-4 z-10 flex gap-1 bg-gray-900/90 border border-gray-700 p-1 rounded-lg backdrop-blur-sm">
            <button
              onClick={() => setMapStyle("dark")}
              className={`p-2 rounded transition-colors ${
                mapStyle === "dark"
                  ? "bg-lime-400 text-black"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
              title="Dark Map"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMapStyle("streets")}
              className={`p-2 rounded transition-colors ${
                mapStyle === "streets"
                  ? "bg-lime-400 text-black"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
              title="Street Map"
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMapStyle("satellite")}
              className={`p-2 rounded transition-colors ${
                mapStyle === "satellite"
                  ? "bg-lime-400 text-black"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
              title="Satellite"
            >
              <Satellite className="w-4 h-4" />
            </button>
          </div>

          {/* Legend - Mobile */}
          <div className="absolute bottom-4 left-4 md:hidden flex flex-col gap-1 text-xs bg-gray-900/90 p-2 rounded border border-gray-800 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lime-400/80" />
              <span className="text-gray-400">20%+</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400/80" />
              <span className="text-gray-400">15-20%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500/80" />
              <span className="text-gray-400">&lt;15%</span>
            </div>
          </div>

          {/* Zone Count Badge */}
          <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 bg-gray-900/90 border border-gray-700 rounded-lg backdrop-blur-sm">
            <span className="text-xs text-gray-400 font-mono">
              {OPPORTUNITY_ZONES.length} GROWTH ZONES
            </span>
          </div>
        </div>

        {/* Detail Panel */}
        <div
          className={`
          w-full lg:w-80 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden
          transition-all duration-300 flex flex-col
          ${selectedZone ? "opacity-100" : "opacity-70"}
        `}
        >
          {selectedZone ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                      {selectedZone.county} County
                    </p>
                    <h2 className="text-lg font-bold text-white mt-1">
                      {selectedZone.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedZone(null)}
                    className="p-1 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-lime-400">
                      +{selectedZone.appreciation}%
                    </p>
                    <p className="text-xs text-gray-500">Projected</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-white">
                      {selectedZone.parcels.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Parcels</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-white">
                      ${(selectedZone.avgPrice / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-gray-500">Avg Price</p>
                  </div>
                </div>
              </div>

              {/* Signals */}
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-3">
                  Growth Signals ({selectedZone.signals.length})
                </p>
                <div className="space-y-2">
                  {selectedZone.signals.map((signal, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-gray-800/30 border border-gray-800 rounded-lg"
                    >
                      <div className="p-1.5 bg-gray-800 rounded">
                        <SignalIcon type={signal.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {signal.label}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${
                            signal.status === "Under Construction"
                              ? "text-yellow-400"
                              : signal.status === "Approved"
                                ? "text-cyan-400"
                                : "text-gray-500"
                          }`}
                        >
                          {signal.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-800 space-y-2">
                <Link
                  href={`/insights/${selectedZone.id}`}
                  className="flex items-center justify-between w-full px-4 py-2.5 bg-lime-400 text-black font-medium rounded-lg hover:bg-lime-300 transition-colors"
                >
                  <span>View Properties</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <button className="flex items-center justify-center gap-2 w-full px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm border border-gray-800 rounded-lg hover:border-gray-700">
                  View Source Documents
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Zone List */}
              <div className="p-4 border-b border-gray-800">
                <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                  All Growth Zones
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {OPPORTUNITY_ZONES.sort(
                  (a, b) => b.appreciation - a.appreciation,
                ).map((zone) => {
                  const isHighGrowth = zone.appreciation >= 20;
                  const isModerate =
                    zone.appreciation >= 15 && zone.appreciation < 20;

                  return (
                    <button
                      key={zone.id}
                      onClick={() => handleZoneSelect(zone)}
                      className="w-full p-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isHighGrowth
                              ? "bg-lime-400"
                              : isModerate
                                ? "bg-cyan-400"
                                : "bg-gray-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {zone.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {zone.county} County
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${
                              isHighGrowth
                                ? "text-lime-400"
                                : isModerate
                                  ? "text-cyan-400"
                                  : "text-gray-400"
                            }`}
                          >
                            +{zone.appreciation}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {zone.signals.length} signals
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
