"use client";

/**
 * Interactive Map Page
 * Core product feature - Click on parcels to generate valuations
 */

import { useState, useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Map as MapIcon,
  Layers,
  Satellite,
  Users,
  Briefcase,
  MapPin,
  X,
  Search,
  DollarSign,
  Calendar,
  Home,
  Loader2,
  ChevronRight,
  Building2,
} from "lucide-react";
import { trpc } from "@/shared/lib/trpc";
import {
  parcelAPI,
  type ParcelProperties,
  type Bounds,
} from "@/shared/lib/parcel-api";

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>("parcels");
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("streets");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bounds, setBounds] = useState<Bounds | null>(null);

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

    // Update bounds on move
    map.current.on("moveend", () => {
      updateBounds();
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
      setSidebarOpen(true);
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
        setSidebarOpen(true);
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
    <div className="fixed inset-0 top-16 flex bg-[var(--background)]">
      {/* Sidebar */}
      <div
        className={`absolute top-0 left-0 h-full bg-[var(--card)] border-r border-[var(--border)] z-20 transition-all duration-300 ${
          sidebarOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        <div className="w-80 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--foreground)]">
              {selectedParcel
                ? "Property Details"
                : selectedJob
                  ? "Job Details"
                  : "Map Details"}
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-[var(--secondary)] rounded"
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedParcel && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Address
                  </p>
                  <p className="font-medium text-[var(--foreground)]">
                    {selectedParcel.situs}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {selectedParcel.city}, {selectedParcel.state}{" "}
                    {selectedParcel.zip}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-800 clip-notch-sm">
                    <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                      Total Value
                    </p>
                    <p className="font-bold text-white">
                      ${selectedParcel.totalValue?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-800 clip-notch-sm">
                    <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                      Year Built
                    </p>
                    <p className="font-bold text-white">
                      {selectedParcel.yearBuilt}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      Owner
                    </span>
                    <span className="text-[var(--foreground)]">
                      {selectedParcel.owner}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      Lot Size
                    </span>
                    <span className="text-[var(--foreground)]">
                      {selectedParcel.acres?.toFixed(2)} acres
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      Zoning
                    </span>
                    <span className="text-[var(--foreground)]">
                      {selectedParcel.zoning}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      Flood Zone
                    </span>
                    <span className="text-[var(--foreground)]">
                      {selectedParcel.floodZone}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <button className="w-full py-3 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 flex items-center justify-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Generate AI Valuation
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Get an instant AI-powered property valuation
                  </p>
                </div>

                <div>
                  <button className="w-full py-3 border border-gray-700 text-white font-mono text-sm uppercase tracking-wider clip-notch hover:bg-gray-800 flex items-center justify-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Request Certified Appraisal
                  </button>
                </div>
              </div>
            )}

            {selectedJob && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Address
                  </p>
                  <p className="font-medium text-[var(--foreground)]">
                    {selectedJob.address}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {selectedJob.city}, TX
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${JOB_STATUS_COLORS[selectedJob.status]}20`,
                      color: JOB_STATUS_COLORS[selectedJob.status],
                    }}
                  >
                    {selectedJob.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {selectedJob.jobType}
                  </span>
                </div>

                <div className="p-3 bg-green-500/10 clip-notch-sm border border-green-500/30">
                  <p className="text-xs text-green-400 font-mono uppercase tracking-wider">
                    Payout
                  </p>
                  <p className="font-bold text-green-400 text-lg">
                    ${selectedJob.payoutAmount}
                  </p>
                </div>

                <button
                  onClick={() =>
                    (window.location.href = `/orders/${selectedJob.id}`)
                  }
                  className="w-full py-3 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 flex items-center justify-center gap-2"
                >
                  View Full Details
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {!selectedParcel && !selectedJob && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3" />
                <p className="text-[var(--muted-foreground)]">
                  {activeTab === "parcels"
                    ? "Click on a parcel to see details"
                    : activeTab === "jobs"
                      ? "Click on a job marker to see details"
                      : "Select an appraiser to see their coverage area"}
                </p>
              </div>
            )}
          </div>

          {/* Stats Footer */}
          {mapStats && (
            <div className="p-4 border-t border-[var(--border)] grid grid-cols-2 gap-2">
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--foreground)]">
                  {mapStats.pendingJobs}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Pending Jobs
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--foreground)]">
                  {mapStats.activeJobs}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Active Jobs
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        {/* Map Container */}
        <div ref={mapContainer} className="w-full h-full" />

        {/* Loading Overlay */}
        {(!isLoaded || loadingParcels) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/80 z-10">
            <div className="flex items-center gap-3 text-[var(--foreground)]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>
                {loadingParcels ? "Loading parcels..." : "Loading map..."}
              </span>
            </div>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 bg-gray-900 border border-gray-800 clip-notch shadow-lg hover:bg-gray-800"
          >
            <Layers className="w-5 h-5 text-white" />
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 clip-notch-sm shadow-lg text-sm font-mono text-white placeholder:text-gray-500 focus:outline-none focus:border-lime-400/50"
            />
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
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-mono uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? "bg-lime-400 text-black"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
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
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-gray-900 border border-gray-800 clip-notch shadow-lg">
              <p className="text-sm text-gray-400 font-mono">
                Zoom in to see parcel boundaries
              </p>
            </div>
          )}
      </div>
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
