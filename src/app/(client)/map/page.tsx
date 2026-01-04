"use client";

/**
 * Interactive Map Page
 * Core product feature - Click on parcels to generate valuations
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Map as MapIcon,
  Layers,
  Satellite,
  Users,
  Briefcase,
  Search,
  Home,
  Loader2,
} from "lucide-react";
import { trpc } from "@/shared/lib/trpc";
import {
  parcelAPI,
  type ParcelProperties,
  type Bounds,
} from "@/shared/lib/parcel-api";
import { StatusBar } from "@/shared/components/map/StatusBar";
import {
  LayerControl,
  type LayersConfig,
} from "@/shared/components/map/LayerControl";
import { PropertyPopup } from "@/shared/components/map/PropertyPopup";

type ViewTab = "parcels" | "jobs" | "appraisers";
type BaseLayer = "streets" | "satellite" | "hybrid";

// Job status colors
const JOB_STATUS_COLORS: Record<string, string> = {
  PENDING_DISPATCH: "#3B82F6", // Blue
  DISPATCHED: "#F59E0B", // Yellow
  ACCEPTED: "#10B981", // Green
  IN_PROGRESS: "#8B5CF6", // Purple
  SUBMITTED: "#F97316", // Orange
  COMPLETED: "#059669", // Dark green
  CANCELLED: "#EF4444", // Red
};

// Base styles for map
const BASE_STYLES: Record<BaseLayer, maplibregl.StyleSpecification> = {
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

// Default center: Texas
const DEFAULT_CENTER: [number, number] = [-95.4783, 30.0893]; // Montgomery County
const DEFAULT_ZOOM = 14;

export default function MapPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>("parcels");
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("streets");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [showPropertyPopup, setShowPropertyPopup] = useState(false);

  // Map info for StatusBar
  const [mapInfo, setMapInfo] = useState({
    lat: DEFAULT_CENTER[1],
    lng: DEFAULT_CENTER[0],
    zoom: DEFAULT_ZOOM,
  });

  // Layer controls state
  const [layers, setLayers] = useState<LayersConfig>({
    parcels: { visible: true, opacity: 0.3 },
    propertyLines: { visible: false, opacity: 1 },
    floodZones: { visible: false, opacity: 0.5 },
    zoning: { visible: false, opacity: 0.6 },
  });

  // Selected items
  const [selectedParcel, setSelectedParcel] = useState<ParcelProperties | null>(
    null,
  );
  const [selectedJob, setSelectedJob] = useState<{
    id: string;
    status: string;
    jobType: string;
    payoutAmount: number;
    address: string;
    city: string;
  } | null>(null);

  // Loading states
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [parcelsData, setParcelsData] =
    useState<GeoJSON.FeatureCollection | null>(null);

  // TRPC queries
  const { data: jobsData } = trpc.map.getJobsInBounds.useQuery(
    { bounds: bounds! },
    { enabled: !!bounds && activeTab === "jobs" },
  );

  const { data: appraisersData } = trpc.map.getAppraisers.useQuery(undefined, {
    enabled: activeTab === "appraisers",
  });

  const { data: mapStats } = trpc.map.getMapStats.useQuery(
    { bounds: bounds || undefined },
    { enabled: !!bounds },
  );

  // Address search query
  const searchAddresses = trpc.property.search.useQuery(
    { query: searchQuery, limit: 5 },
    {
      enabled: searchQuery.length >= 5 && searchOpen,
      staleTime: 30000,
    },
  );

  const searchResults = useMemo(() => {
    if (!searchAddresses.data) return [];
    return searchAddresses.data.map((r) => ({
      id: r.id,
      address: r.address,
      city: r.city,
      state: r.state,
      zipCode: r.zipCode,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  }, [searchAddresses.data]);

  // Handle address selection from search
  const handleAddressSelect = useCallback(
    (result: (typeof searchResults)[0]) => {
      if (!map.current) return;
      map.current.flyTo({
        center: [result.longitude, result.latitude],
        zoom: 17,
        duration: 2000,
      });
      setSearchQuery("");
      setSearchOpen(false);
    },
    [],
  );

  // Handle Generate AI Valuation button
  const handleGenerateValuation = useCallback(() => {
    if (!selectedParcel) return;

    const params = new URLSearchParams({
      address: selectedParcel.situs || "",
      city: selectedParcel.city || "",
      state: selectedParcel.state || "TX",
      zipCode: selectedParcel.zip || "",
      type: "AI_REPORT",
    });

    router.push(`/appraisals/new?${params.toString()}`);
  }, [selectedParcel, router]);

  // Handle Request Certified Appraisal button
  const handleRequestCertified = useCallback(() => {
    if (!selectedParcel) return;

    const params = new URLSearchParams({
      address: selectedParcel.situs || "",
      city: selectedParcel.city || "",
      state: selectedParcel.state || "TX",
      zipCode: selectedParcel.zip || "",
      type: "CERTIFIED",
    });

    router.push(`/appraisals/new?${params.toString()}`);
  }, [selectedParcel, router]);

  // Handle layer changes
  const handleLayerChange = useCallback(
    (
      layerId: keyof LayersConfig,
      state: Partial<LayersConfig[keyof LayersConfig]>,
    ) => {
      setLayers((prev) => ({
        ...prev,
        [layerId]: { ...prev[layerId], ...state },
      }));
    },
    [],
  );

  // Handle reset view
  const handleResetView = useCallback(() => {
    if (!map.current) return;
    map.current.flyTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      duration: 1500,
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: BASE_STYLES[baseLayer],
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    // Add controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(
      new maplibregl.ScaleControl({ maxWidth: 100 }),
      "bottom-left",
    );
    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right",
    );

    // Handle load
    map.current.on("load", () => {
      setIsLoaded(true);
      updateBounds();
    });

    // Update bounds and map info on move
    map.current.on("moveend", () => {
      updateBounds();
      if (map.current) {
        const center = map.current.getCenter();
        setMapInfo((prev) => ({
          ...prev,
          lat: center.lat,
          lng: center.lng,
          zoom: map.current!.getZoom(),
        }));
      }
    });

    // Track mouse position for StatusBar
    map.current.on("mousemove", (e) => {
      setMapInfo((prev) => ({
        ...prev,
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
      }));
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update bounds from map
  const updateBounds = useCallback(() => {
    if (!map.current) return;
    const mapBounds = map.current.getBounds();
    setBounds({
      north: mapBounds.getNorth(),
      south: mapBounds.getSouth(),
      east: mapBounds.getEast(),
      west: mapBounds.getWest(),
    });
  }, []);

  // Handle base layer change
  const handleBaseLayerChange = useCallback((newLayer: BaseLayer) => {
    if (!map.current) return;
    setBaseLayer(newLayer);
    map.current.setStyle(BASE_STYLES[newLayer]);
  }, []);

  // Load parcels when bounds change and tab is parcels
  useEffect(() => {
    if (!bounds || activeTab !== "parcels" || !isLoaded) return;

    const loadParcels = async () => {
      // Only load parcels at zoom level 13 or higher
      const currentZoom = map.current?.getZoom() || 0;
      if (currentZoom < 13) {
        setParcelsData(null);
        return;
      }

      setLoadingParcels(true);
      try {
        const data = await parcelAPI.fetchParcelsInBounds(bounds);
        setParcelsData(data);
        addParcelsToMap(data);
      } catch (error) {
        console.error("Failed to load parcels:", error);
      } finally {
        setLoadingParcels(false);
      }
    };

    loadParcels();
  }, [bounds, activeTab, isLoaded]);

  // Add parcels GeoJSON to map
  const addParcelsToMap = useCallback((geojson: GeoJSON.FeatureCollection) => {
    if (!map.current) return;

    // Remove existing layers and source
    if (map.current.getLayer("parcels-fill")) {
      map.current.removeLayer("parcels-fill");
    }
    if (map.current.getLayer("parcels-outline")) {
      map.current.removeLayer("parcels-outline");
    }
    if (map.current.getSource("parcels")) {
      map.current.removeSource("parcels");
    }

    // Add source
    map.current.addSource("parcels", {
      type: "geojson",
      data: geojson,
    });

    // Add fill layer
    map.current.addLayer({
      id: "parcels-fill",
      type: "fill",
      source: "parcels",
      paint: {
        "fill-color": "#3B82F6",
        "fill-opacity": 0.1,
      },
    });

    // Add outline layer
    map.current.addLayer({
      id: "parcels-outline",
      type: "line",
      source: "parcels",
      paint: {
        "line-color": "#3B82F6",
        "line-width": 2,
      },
    });

    // Handle click on parcel
    map.current.on("click", "parcels-fill", (e) => {
      if (!e.features || e.features.length === 0) return;
      const feature = e.features[0];
      const props = feature.properties as ParcelProperties;
      setSelectedParcel(props);
      setShowPropertyPopup(true);
    });

    // Change cursor on hover
    map.current.on("mouseenter", "parcels-fill", () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "parcels-fill", () => {
      if (map.current) map.current.getCanvas().style.cursor = "";
    });
  }, []);

  // Add job markers to map
  useEffect(() => {
    if (!map.current || !isLoaded || activeTab !== "jobs") return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (!jobsData) return;

    jobsData.forEach((job) => {
      const color = JOB_STATUS_COLORS[job.status] || "#6B7280";

      const el = document.createElement("div");
      el.innerHTML = `
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10.667 16 24 16 24s16-13.333 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
          <circle cx="16" cy="14" r="6" fill="white"/>
        </svg>
      `;
      el.style.cursor = "pointer";

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([job.longitude, job.latitude])
        .addTo(map.current!);

      el.addEventListener("click", () => {
        setSelectedJob(job);
        // TODO: Show job details popup or navigate to job page
      });

      markersRef.current.set(job.id, marker);
    });
  }, [jobsData, activeTab, isLoaded]);

  // Add appraiser markers to map
  useEffect(() => {
    if (!map.current || !isLoaded || activeTab !== "appraisers") return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (!appraisersData) return;

    appraisersData.forEach((appraiser) => {
      // Create marker
      const el = document.createElement("div");
      el.innerHTML = `
        <div class="w-10 h-10 bg-green-500 clip-notch-sm border-2 border-lime-400 shadow-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </div>
      `;
      el.style.cursor = "pointer";

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([appraiser.longitude, appraiser.latitude])
        .addTo(map.current!);

      // Add coverage radius circle
      const circleId = `coverage-${appraiser.userId}`;
      if (!map.current!.getSource(circleId)) {
        const radiusInMeters = appraiser.coverageRadiusMiles * 1609.34;
        const circleGeoJSON = createCircleGeoJSON(
          appraiser.longitude,
          appraiser.latitude,
          radiusInMeters,
        );

        map.current!.addSource(circleId, {
          type: "geojson",
          data: circleGeoJSON,
        });

        map.current!.addLayer({
          id: circleId,
          type: "fill",
          source: circleId,
          paint: {
            "fill-color": "#10B981",
            "fill-opacity": 0.1,
          },
        });

        map.current!.addLayer({
          id: `${circleId}-outline`,
          type: "line",
          source: circleId,
          paint: {
            "line-color": "#10B981",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });
      }

      markersRef.current.set(appraiser.userId, marker);
    });

    // Cleanup function to remove sources and layers
    return () => {
      appraisersData?.forEach((appraiser) => {
        const circleId = `coverage-${appraiser.userId}`;
        if (map.current?.getLayer(circleId)) {
          map.current.removeLayer(circleId);
        }
        if (map.current?.getLayer(`${circleId}-outline`)) {
          map.current.removeLayer(`${circleId}-outline`);
        }
        if (map.current?.getSource(circleId)) {
          map.current.removeSource(circleId);
        }
      });
    };
  }, [appraisersData, activeTab, isLoaded]);

  // Clear markers when switching tabs
  useEffect(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();
    setSelectedParcel(null);
    setSelectedJob(null);

    // Remove parcel layers when switching away from parcels tab
    if (map.current && activeTab !== "parcels") {
      if (map.current.getLayer("parcels-fill")) {
        map.current.removeLayer("parcels-fill");
      }
      if (map.current.getLayer("parcels-outline")) {
        map.current.removeLayer("parcels-outline");
      }
      if (map.current.getSource("parcels")) {
        map.current.removeSource("parcels");
      }
    }
  }, [activeTab]);

  return (
    <div className="fixed inset-0 top-16 left-0 lg:left-64 bg-[var(--background)] z-10">
      {/* Main Map Area */}
      <div className="w-full h-full relative">
        {/* Map Container */}
        <div ref={mapContainer} className="w-full h-full" />

        {/* Loading Overlay */}
        {(!isLoaded || loadingParcels) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="flex items-center gap-3 text-white">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>
                {loadingParcels ? "Loading parcels..." : "Loading map..."}
              </span>
            </div>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
            <input
              type="text"
              placeholder="Search address..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-48 md:w-64 pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 clip-notch-sm shadow-lg text-sm font-mono text-white placeholder:text-gray-500 focus:outline-none focus:border-lime-400/50"
            />
            {/* Search Results Dropdown */}
            {searchOpen && searchQuery.length >= 5 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 clip-notch-sm shadow-xl overflow-hidden z-50">
                {searchAddresses.isLoading ? (
                  <div className="flex items-center gap-2 px-4 py-3 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleAddressSelect(result)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-800 border-b border-gray-800 last:border-b-0 transition-colors"
                      >
                        <p className="text-sm font-medium text-white">
                          {result.address}
                        </p>
                        <p className="text-xs text-gray-400">
                          {result.city}, {result.state} {result.zipCode}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* View Tabs */}
        <div className="absolute top-4 right-16 z-10 flex bg-gray-900 border border-gray-800 clip-notch shadow-lg overflow-hidden">
          {[
            { id: "parcels" as ViewTab, label: "Parcels", icon: Home },
            { id: "jobs" as ViewTab, label: "Jobs", icon: Briefcase },
            { id: "appraisers" as ViewTab, label: "Appraisers", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-2.5 md:px-4 py-2.5 text-sm font-mono uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? "bg-lime-400 text-black"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Base Layer Switcher */}
        <div className="absolute bottom-8 left-4 z-10 flex gap-1 bg-gray-900 border border-gray-800 p-1 clip-notch shadow-lg">
          <button
            onClick={() => handleBaseLayerChange("streets")}
            className={`p-2 clip-notch-sm transition-colors ${
              baseLayer === "streets"
                ? "bg-lime-400 text-black"
                : "text-gray-400 hover:bg-gray-800"
            }`}
            title="Streets"
          >
            <MapIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleBaseLayerChange("satellite")}
            className={`p-2 clip-notch-sm transition-colors ${
              baseLayer === "satellite"
                ? "bg-lime-400 text-black"
                : "text-gray-400 hover:bg-gray-800"
            }`}
            title="Satellite"
          >
            <Satellite className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleBaseLayerChange("hybrid")}
            className={`p-2 clip-notch-sm transition-colors ${
              baseLayer === "hybrid"
                ? "bg-lime-400 text-black"
                : "text-gray-400 hover:bg-gray-800"
            }`}
            title="Hybrid"
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom hint for parcels */}
        {activeTab === "parcels" &&
          isLoaded &&
          (map.current?.getZoom() || 0) < 13 && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-gray-900 border border-gray-800 clip-notch shadow-lg">
              <p className="text-sm text-gray-400 font-mono">
                Zoom in to see parcel boundaries
              </p>
            </div>
          )}

        {/* Layer Control Panel */}
        {activeTab === "parcels" && (
          <LayerControl
            layers={layers}
            onLayerChange={handleLayerChange}
            onResetView={handleResetView}
          />
        )}

        {/* Status Bar */}
        <StatusBar
          lat={mapInfo.lat}
          lng={mapInfo.lng}
          zoom={mapInfo.zoom}
          parcelCount={parcelsData?.features.length || 0}
        />
      </div>

      {/* Property Popup Modal */}
      {showPropertyPopup && selectedParcel && (
        <PropertyPopup
          parcel={selectedParcel}
          onClose={() => {
            setShowPropertyPopup(false);
            setSelectedParcel(null);
          }}
          onRequestCertified={() => {
            setShowPropertyPopup(false);
            handleRequestCertified();
          }}
        />
      )}
    </div>
  );
}

// Helper function to create a circle GeoJSON
function createCircleGeoJSON(
  lng: number,
  lat: number,
  radiusInMeters: number,
): GeoJSON.FeatureCollection {
  const points = 64;
  const coords: number[][] = [];

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusInMeters * Math.cos(angle);
    const dy = radiusInMeters * Math.sin(angle);
    const dlng = dx / (111320 * Math.cos((lat * Math.PI) / 180));
    const dlat = dy / 110540;
    coords.push([lng + dlng, lat + dlat]);
  }
  coords.push(coords[0]); // Close the polygon

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [coords],
        },
      },
    ],
  };
}
