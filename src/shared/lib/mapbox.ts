/**
 * Mapbox Client
 * Project LENS - Texas V1
 */

const MAPBOX_GEOCODING_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

interface MapboxConfig {
  accessToken: string;
}

let config: MapboxConfig | null = null;

function getConfig(): MapboxConfig {
  if (!config) {
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("MAPBOX_ACCESS_TOKEN is not configured");
    }
    config = { accessToken };
  }
  return config;
}

export interface GeocodingResult {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  country: string;
  latitude: number;
  longitude: number;
  relevance: number;
  placeType: string[];
}

export interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: {
    accuracy?: string;
    address?: string;
    category?: string;
    maki?: string;
  };
  text: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

export interface MapboxGeocodingResponse {
  type: string;
  query: string[];
  features: MapboxFeature[];
  attribution: string;
}

/**
 * Geocode an address to get coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  const { accessToken } = getConfig();

  const encodedAddress = encodeURIComponent(address);
  const url = `${MAPBOX_GEOCODING_URL}/${encodedAddress}.json?access_token=${accessToken}&country=US&types=address&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data: MapboxGeocodingResponse = await response.json();
    const feature = data.features[0];

    if (!feature) {
      return null;
    }

    return parseMapboxFeature(feature);
  } catch (error) {
    console.error("Mapbox geocoding error:", error);
    return null;
  }
}

/**
 * Search for addresses (autocomplete)
 */
export async function searchAddresses(
  query: string,
  options: {
    limit?: number;
    bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
    proximity?: [number, number]; // [longitude, latitude]
  } = {}
): Promise<GeocodingResult[]> {
  const { accessToken } = getConfig();

  const params = new URLSearchParams({
    access_token: accessToken,
    country: "US",
    types: "address",
    limit: String(options.limit || 5),
    autocomplete: "true",
  });

  if (options.bbox) {
    params.append("bbox", options.bbox.join(","));
  }

  if (options.proximity) {
    params.append("proximity", options.proximity.join(","));
  }

  const encodedQuery = encodeURIComponent(query);
  const url = `${MAPBOX_GEOCODING_URL}/${encodedQuery}.json?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data: MapboxGeocodingResponse = await response.json();
    return data.features.map(parseMapboxFeature);
  } catch (error) {
    console.error("Mapbox search error:", error);
    return [];
  }
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(
  longitude: number,
  latitude: number
): Promise<GeocodingResult | null> {
  const { accessToken } = getConfig();

  const url = `${MAPBOX_GEOCODING_URL}/${longitude},${latitude}.json?access_token=${accessToken}&types=address&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data: MapboxGeocodingResponse = await response.json();
    const feature = data.features[0];

    if (!feature) {
      return null;
    }

    return parseMapboxFeature(feature);
  } catch (error) {
    console.error("Mapbox reverse geocoding error:", error);
    return null;
  }
}

// Re-export from centralized geo module for backwards compatibility
export { calculateDistanceMiles as calculateDistance } from "./geo";

/**
 * Parse Mapbox feature to our format
 */
function parseMapboxFeature(feature: MapboxFeature): GeocodingResult {
  const context = feature.context || [];

  // Extract location components from context
  const getContextValue = (prefix: string): string => {
    const item = context.find((c) => c.id.startsWith(prefix));
    return item?.text || "";
  };

  const getContextShortCode = (prefix: string): string => {
    const item = context.find((c) => c.id.startsWith(prefix));
    return item?.short_code?.replace("US-", "") || "";
  };

  // Parse address number and street from text
  const addressParts = feature.place_name.split(",");
  const streetAddress = addressParts[0]?.trim() || feature.text;

  return {
    id: feature.id,
    address: streetAddress,
    city: getContextValue("place"),
    state: getContextShortCode("region") || getContextValue("region"),
    zipCode: getContextValue("postcode"),
    county: getContextValue("district"),
    country: getContextValue("country") || "United States",
    latitude: feature.center[1],
    longitude: feature.center[0],
    relevance: feature.relevance,
    placeType: feature.place_type,
  };
}

/**
 * Validate if coordinates are within Texas
 */
export function isInTexas(latitude: number, longitude: number): boolean {
  // Approximate bounding box for Texas
  const texasBbox = {
    minLat: 25.8371,
    maxLat: 36.5007,
    minLng: -106.6456,
    maxLng: -93.5083,
  };

  return (
    latitude >= texasBbox.minLat &&
    latitude <= texasBbox.maxLat &&
    longitude >= texasBbox.minLng &&
    longitude <= texasBbox.maxLng
  );
}

/**
 * Get Texas-specific bounding box for searches
 */
export function getTexasBbox(): [number, number, number, number] {
  return [-106.6456, 25.8371, -93.5083, 36.5007];
}

/**
 * Format address for display
 */
export function formatAddress(result: GeocodingResult): string {
  const parts = [
    result.address,
    result.city,
    result.state,
    result.zipCode,
  ].filter(Boolean);
  return parts.join(", ");
}

/**
 * Get static map URL for a location
 */
export function getStaticMapUrl(params: {
  longitude: number;
  latitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  marker?: boolean;
}): string {
  const { accessToken } = getConfig();
  const { longitude, latitude, zoom = 15, width = 600, height = 400, marker = true } = params;

  const markerOverlay = marker
    ? `pin-l+ef4444(${longitude},${latitude})/`
    : "";

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${markerOverlay}${longitude},${latitude},${zoom}/${width}x${height}?access_token=${accessToken}`;
}
