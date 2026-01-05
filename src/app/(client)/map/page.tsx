"use client";

/**
 * Interactive Map Page
 * Core product feature - Click on parcels to generate valuations
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  X,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Crosshair,
  Maximize2,
  Share2,
  AlertCircle,
  Phone,
  Mail,
  Award,
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
import { useToast } from "@/shared/hooks/use-toast";

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

// Appraiser type for selected state
interface SelectedAppraiser {
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  licenseNumber: string | null;
  coverageRadiusMiles: number;
  completedJobs: number;
  rating: number | null;
  latitude: number;
  longitude: number;
}

export default function MapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const { toast } = useToast();

  // Read initial position from URL params (from insights page "View on Map" links)
  const initialCenter = useMemo((): [number, number] => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      // Validate coordinates are within reasonable bounds
      if (
        !isNaN(parsedLat) &&
        !isNaN(parsedLng) &&
        parsedLat >= -90 &&
        parsedLat <= 90 &&
        parsedLng >= -180 &&
        parsedLng <= 180
      ) {
        return [parsedLng, parsedLat];
      }
    }
    return DEFAULT_CENTER;
  }, [searchParams]);

  const initialZoom = useMemo((): number => {
    const zoom = searchParams.get("zoom");
    if (zoom) {
      const parsedZoom = parseFloat(zoom);
      if (!isNaN(parsedZoom) && parsedZoom >= 0 && parsedZoom <= 22) {
        return parsedZoom;
      }
    }
    return DEFAULT_ZOOM;
  }, [searchParams]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>("parcels");
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("streets");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [showPropertyPopup, setShowPropertyPopup] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Map info for StatusBar (initialized with URL params or defaults)
  const [mapInfo, setMapInfo] = useState({
    lat: initialCenter[1],
    lng: initialCenter[0],
    zoom: initialZoom,
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
    slaDueAt?: Date | null;
    assignedAppraiser?: string | null;
  } | null>(null);
  const [selectedAppraiser, setSelectedAppraiser] =
    useState<SelectedAppraiser | null>(null);

  // Loading states
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [parcelsData, setParcelsData] =
    useState<GeoJSON.FeatureCollection | null>(null);

  // TRPC queries
  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
  } = trpc.map.getJobsInBounds.useQuery(
    { bounds: bounds! },
    { enabled: !!bounds && activeTab === "jobs" },
  );

  const {
    data: appraisersData,
    isLoading: appraisersLoading,
    error: appraisersError,
  } = trpc.map.getAppraisers.useQuery(undefined, {
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
      toast({
        title: "Location found",
        description: `Navigating to ${result.address}`,
      });
    },
    [toast],
  );

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

    toast({
      title: "Requesting appraisal",
      description: "Redirecting to request form...",
    });

    router.push(`/appraisals/new?${params.toString()}`);
  }, [selectedParcel, router, toast]);

  // Handle layer changes - apply to actual map layers
  const handleLayerChange = useCallback(
    (
      layerId: keyof LayersConfig,
      state: Partial<LayersConfig[keyof LayersConfig]>,
    ) => {
      setLayers((prev) => {
        const newLayers = {
          ...prev,
          [layerId]: { ...prev[layerId], ...state },
        };

        // Apply opacity to parcels layer if it exists
        if (map.current && layerId === "parcels") {
          if (map.current.getLayer("parcels-fill")) {
            const newOpacity = state.opacity ?? prev.parcels.opacity;
            map.current.setPaintProperty(
              "parcels-fill",
              "fill-opacity",
              newOpacity * 0.3,
            );
          }
          if (map.current.getLayer("parcels-outline")) {
            const visible = state.visible ?? prev.parcels.visible;
            map.current.setLayoutProperty(
              "parcels-outline",
              "visibility",
              visible ? "visible" : "none",
            );
            map.current.setLayoutProperty(
              "parcels-fill",
              "visibility",
              visible ? "visible" : "none",
            );
          }
        }

        return newLayers;
      });
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
    toast({
      title: "View reset",
      description: "Map returned to default location",
    });
  }, [toast]);

  // Handle geolocation
  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation unavailable",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Finding your location...",
      description: "Please wait",
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!map.current) return;
        map.current.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 15,
          duration: 2000,
        });
        toast({
          title: "Location found",
          description: "Map centered on your location",
        });
      },
      (error) => {
        toast({
          title: "Location error",
          description: error.message,
          variant: "destructive",
        });
      },
    );
  }, [toast]);

  // Handle fullscreen toggle
  const handleFullscreen = useCallback(() => {
    const container = mapContainer.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setTimeout(() => map.current?.resize(), 100);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        setTimeout(() => map.current?.resize(), 100);
      });
    }
  }, []);

  // Handle share link
  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/map?lat=${mapInfo.lat.toFixed(6)}&lng=${mapInfo.lng.toFixed(6)}&zoom=${Math.round(mapInfo.zoom)}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Map location link copied to clipboard",
    });
  }, [mapInfo, toast]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: BASE_STYLES[baseLayer],
        center: initialCenter,
        zoom: initialZoom,
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

      // Handle errors
      map.current.on("error", (e) => {
        console.error("Map error:", e);
        setLoadError("Failed to load map tiles");
      });

      // Update bounds and map info on move
      map.current.on("moveend", () => {
        updateBounds();
        if (map.current) {
          const center = map.current.getCenter();
          setMapInfo({
            lat: center.lat,
            lng: center.lng,
            zoom: map.current.getZoom(),
          });
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
    } catch (error) {
      console.error("Failed to initialize map:", error);
      setLoadError("Failed to initialize map");
    }

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
  const handleBaseLayerChange = useCallback(
    (newLayer: BaseLayer) => {
      if (!map.current) return;
      setBaseLayer(newLayer);
      map.current.setStyle(BASE_STYLES[newLayer]);

      // Re-add parcel layers after style change
      map.current.once("styledata", () => {
        if (parcelsData && activeTab === "parcels") {
          addParcelsToMap(parcelsData);
        }
      });
    },
    [parcelsData, activeTab],
  );

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
        toast({
          title: "Error loading parcels",
          description: "Failed to fetch parcel data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingParcels(false);
      }
    };

    loadParcels();
  }, [bounds, activeTab, isLoaded, toast]);

  // Add parcels GeoJSON to map
  const addParcelsToMap = useCallback(
    (geojson: GeoJSON.FeatureCollection) => {
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

      // Add fill layer with layer opacity
      map.current.addLayer({
        id: "parcels-fill",
        type: "fill",
        source: "parcels",
        paint: {
          "fill-color": "#3B82F6",
          "fill-opacity": layers.parcels.opacity * 0.3,
        },
        layout: {
          visibility: layers.parcels.visible ? "visible" : "none",
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
        layout: {
          visibility: layers.parcels.visible ? "visible" : "none",
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
    },
    [layers.parcels.opacity, layers.parcels.visible],
  );

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
      el.setAttribute("role", "button");
      el.setAttribute(
        "aria-label",
        `Job at ${job.address}, status: ${job.status}`,
      );
      el.setAttribute("tabindex", "0");

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([job.longitude, job.latitude])
        .addTo(map.current!);

      el.addEventListener("click", () => {
        setSelectedJob(job);
        setSelectedAppraiser(null);
      });

      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSelectedJob(job);
          setSelectedAppraiser(null);
        }
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
      el.setAttribute("role", "button");
      el.setAttribute(
        "aria-label",
        `Appraiser ${appraiser.name}, coverage: ${appraiser.coverageRadiusMiles} miles`,
      );
      el.setAttribute("tabindex", "0");

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([appraiser.longitude, appraiser.latitude])
        .addTo(map.current!);

      // Add click handler for appraiser selection
      el.addEventListener("click", () => {
        setSelectedAppraiser({
          userId: appraiser.userId,
          name: appraiser.name,
          email: appraiser.email,
          phone: appraiser.phone,
          licenseNumber: appraiser.licenseNumber,
          coverageRadiusMiles: appraiser.coverageRadiusMiles,
          completedJobs: appraiser.completedJobs,
          rating: appraiser.rating,
          latitude: appraiser.latitude,
          longitude: appraiser.longitude,
        });
        setSelectedJob(null);
      });

      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSelectedAppraiser({
            userId: appraiser.userId,
            name: appraiser.name,
            email: appraiser.email,
            phone: appraiser.phone,
            licenseNumber: appraiser.licenseNumber,
            coverageRadiusMiles: appraiser.coverageRadiusMiles,
            completedJobs: appraiser.completedJobs,
            rating: appraiser.rating,
            latitude: appraiser.latitude,
            longitude: appraiser.longitude,
          });
          setSelectedJob(null);
        }
      });

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
    setSelectedAppraiser(null);

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

  // Handle keyboard navigation for tabs
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, tabs: ViewTab[]) => {
      const currentIndex = tabs.indexOf(activeTab);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[prevIndex]);
      }
    },
    [activeTab],
  );

  return (
    <div className="fixed inset-0 top-16 left-0 lg:left-64 bg-[var(--background)] z-10">
      {/* Main Map Area */}
      <div
        className="w-full h-full relative"
        role="application"
        aria-label="Interactive property map"
      >
        {/* Map Container */}
        <div
          ref={mapContainer}
          className="w-full h-full"
          role="region"
          aria-label="Map view"
        />

        {/* Error State */}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
            <div className="text-center p-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Map Error</h2>
              <p className="text-gray-400 mb-4">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-lime-400 text-black font-mono text-sm uppercase clip-notch hover:bg-lime-300"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {(!isLoaded || loadingParcels) && !loadError && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/80 z-10"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3 text-white">
              <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
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
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search address..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchOpen(false);
                  setSearchQuery("");
                } else if (e.key === "Enter" && searchResults.length > 0) {
                  handleAddressSelect(searchResults[0]);
                }
              }}
              aria-label="Search for an address"
              aria-expanded={searchOpen && searchQuery.length >= 5}
              aria-controls="search-results"
              aria-busy={searchAddresses.isLoading}
              className="w-full sm:w-48 md:w-64 pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 clip-notch-sm shadow-lg text-sm font-mono text-white placeholder:text-gray-500 focus:outline-none focus:border-lime-400/50"
            />
            {/* Search Results Dropdown */}
            {searchOpen && searchQuery.length >= 5 && (
              <div
                id="search-results"
                role="listbox"
                aria-label="Search results"
                className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 clip-notch-sm shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto"
              >
                {searchAddresses.isLoading ? (
                  <div
                    className="flex items-center gap-2 px-4 py-3 text-gray-400"
                    role="status"
                  >
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span className="text-sm">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    {searchResults.map((result, index) => (
                      <button
                        key={result.id}
                        role="option"
                        aria-selected={index === 0}
                        onClick={() => handleAddressSelect(result)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-800 border-b border-gray-800 last:border-b-0 transition-colors focus:bg-gray-800 focus:outline-none"
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
                  <div className="px-4 py-3 text-center">
                    <p className="text-sm text-gray-400">No results found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Try a different address or check spelling
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 p-1 clip-notch-sm shadow-lg">
            <button
              onClick={handleGeolocate}
              className="p-2 text-gray-400 hover:text-lime-400 hover:bg-gray-800 clip-notch-sm transition-colors"
              aria-label="Go to my location"
              title="My Location"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={handleFullscreen}
              className="p-2 text-gray-400 hover:text-lime-400 hover:bg-gray-800 clip-notch-sm transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-lime-400 hover:bg-gray-800 clip-notch-sm transition-colors"
              aria-label="Share map location"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div
          className="absolute top-4 right-16 z-10 flex bg-gray-900 border border-gray-800 clip-notch shadow-lg overflow-hidden"
          role="tablist"
          aria-label="Map view options"
        >
          {[
            { id: "parcels" as ViewTab, label: "Parcels", icon: Home },
            { id: "jobs" as ViewTab, label: "Jobs", icon: Briefcase },
            { id: "appraisers" as ViewTab, label: "Appraisers", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) =>
                  handleTabKeyDown(e, ["parcels", "jobs", "appraisers"])
                }
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2.5 text-xs md:text-sm font-mono uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? "bg-lime-400 text-black"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Base Layer Switcher */}
        <div
          className="absolute bottom-8 left-4 z-10 flex gap-1 bg-gray-900 border border-gray-800 p-1 clip-notch shadow-lg"
          role="group"
          aria-label="Map style options"
        >
          <button
            onClick={() => handleBaseLayerChange("streets")}
            className={`p-2 clip-notch-sm transition-colors ${
              baseLayer === "streets"
                ? "bg-lime-400 text-black"
                : "text-gray-400 hover:bg-gray-800"
            }`}
            aria-label="Streets map view"
            aria-pressed={baseLayer === "streets"}
          >
            <MapIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => handleBaseLayerChange("satellite")}
            className={`p-2 clip-notch-sm transition-colors ${
              baseLayer === "satellite"
                ? "bg-lime-400 text-black"
                : "text-gray-400 hover:bg-gray-800"
            }`}
            aria-label="Satellite map view"
            aria-pressed={baseLayer === "satellite"}
          >
            <Satellite className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => handleBaseLayerChange("hybrid")}
            className={`p-2 clip-notch-sm transition-colors ${
              baseLayer === "hybrid"
                ? "bg-lime-400 text-black"
                : "text-gray-400 hover:bg-gray-800"
            }`}
            aria-label="Hybrid map view"
            aria-pressed={baseLayer === "hybrid"}
          >
            <Layers className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Empty States */}
        {activeTab === "jobs" &&
          isLoaded &&
          !jobsLoading &&
          !jobsData?.length && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-6 py-4 bg-gray-900 border border-gray-800 clip-notch shadow-lg text-center max-w-sm">
              <Briefcase className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">
                No jobs in this area
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Pan or zoom the map to find available jobs
              </p>
            </div>
          )}

        {activeTab === "appraisers" &&
          isLoaded &&
          !appraisersLoading &&
          !appraisersData?.length && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-6 py-4 bg-gray-900 border border-gray-800 clip-notch shadow-lg text-center max-w-sm">
              <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">
                No appraisers in this area
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Expand your view to find available appraisers
              </p>
            </div>
          )}

        {/* API Error States */}
        {jobsError && activeTab === "jobs" && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-6 py-4 bg-red-900/80 border border-red-700 clip-notch shadow-lg text-center max-w-sm">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">
              Failed to load jobs
            </p>
            <p className="text-xs text-red-300 mt-1">Please try again later</p>
          </div>
        )}

        {appraisersError && activeTab === "appraisers" && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-6 py-4 bg-red-900/80 border border-red-700 clip-notch shadow-lg text-center max-w-sm">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">
              Failed to load appraisers
            </p>
            <p className="text-xs text-red-300 mt-1">Please try again later</p>
          </div>
        )}

        {/* Zoom hint for parcels */}
        {activeTab === "parcels" &&
          isLoaded &&
          (map.current?.getZoom() || 0) < 13 && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-6 py-4 bg-gray-900 border border-lime-400/30 clip-notch shadow-lg text-center">
              <MapPin className="w-6 h-6 text-lime-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">
                Zoom in to see parcels
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Parcel boundaries appear at zoom level 13+
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
          jobCount={activeTab === "jobs" ? jobsData?.length : undefined}
          appraiserCount={
            activeTab === "appraisers" ? appraisersData?.length : undefined
          }
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

      {/* Job Details Panel */}
      {selectedJob && (
        <div
          className="absolute bottom-20 left-4 z-20 w-full sm:w-80 max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-800 clip-notch shadow-xl"
          role="dialog"
          aria-labelledby="job-details-title"
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-mono uppercase tracking-wider clip-notch-sm ${
                    selectedJob.status === "COMPLETED"
                      ? "bg-lime-400/20 text-lime-400"
                      : selectedJob.status === "IN_PROGRESS"
                        ? "bg-blue-400/20 text-blue-400"
                        : "bg-yellow-400/20 text-yellow-400"
                  }`}
                >
                  {selectedJob.status.replace(/_/g, " ")}
                </span>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 text-gray-400 hover:text-white"
                aria-label="Close job details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-start gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 id="job-details-title" className="font-medium text-white">
                  {selectedJob.address}
                </h3>
                <p className="text-sm text-gray-400">{selectedJob.city}</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {selectedJob.jobType.replace(/_/g, " ")}
                </span>
                <span className="font-mono text-lime-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  {selectedJob.payoutAmount}
                </span>
              </div>
              {selectedJob.slaDueAt && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  Due: {new Date(selectedJob.slaDueAt).toLocaleDateString()}
                </div>
              )}
              {selectedJob.assignedAppraiser && (
                <div className="text-xs text-gray-400">
                  Assigned: {selectedJob.assignedAppraiser}
                </div>
              )}
            </div>
            <button
              onClick={() => router.push(`/jobs/${selectedJob.id}`)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-lime-400 text-black font-medium text-sm clip-notch hover:bg-lime-300 transition-colors"
            >
              View Details
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Appraiser Details Panel */}
      {selectedAppraiser && (
        <div
          className="absolute bottom-20 left-4 z-20 w-full sm:w-80 max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-800 clip-notch shadow-xl"
          role="dialog"
          aria-labelledby="appraiser-details-title"
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-500 clip-notch-sm flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3
                    id="appraiser-details-title"
                    className="font-medium text-white"
                  >
                    {selectedAppraiser.name}
                  </h3>
                  {selectedAppraiser.licenseNumber && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {selectedAppraiser.licenseNumber}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedAppraiser(null)}
                className="p-1 text-gray-400 hover:text-white"
                aria-label="Close appraiser details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-800/50 rounded">
                  <p className="text-lg font-bold text-white font-mono">
                    {selectedAppraiser.completedJobs}
                  </p>
                  <p className="text-xs text-gray-500">Jobs completed</p>
                </div>
                <div className="p-2 bg-gray-800/50 rounded">
                  <p className="text-lg font-bold text-lime-400 font-mono">
                    {selectedAppraiser.coverageRadiusMiles} mi
                  </p>
                  <p className="text-xs text-gray-500">Coverage radius</p>
                </div>
              </div>

              {/* Rating */}
              {selectedAppraiser.rating && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < Math.round(selectedAppraiser.rating!)
                            ? "bg-lime-400"
                            : "bg-gray-700"
                        }`}
                      />
                    ))}
                    <span className="text-white font-mono ml-1">
                      {selectedAppraiser.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                {selectedAppraiser.email && (
                  <a
                    href={`mailto:${selectedAppraiser.email}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-lime-400 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {selectedAppraiser.email}
                  </a>
                )}
                {selectedAppraiser.phone && (
                  <a
                    href={`tel:${selectedAppraiser.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-lime-400 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {selectedAppraiser.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
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
