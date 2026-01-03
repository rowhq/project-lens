"use client";

import { MapPin, ZoomIn, Ruler, Layers } from "lucide-react";

interface StatusBarProps {
  lat: number;
  lng: number;
  zoom: number;
  parcelCount: number;
}

/**
 * Calculate map scale based on zoom level and latitude
 * Returns scale in meters
 */
function calculateScale(zoom: number, lat: number): string {
  // At zoom 0, the entire world (40075km) fits in 256px
  // Each zoom level doubles the resolution
  const metersPerPixel =
    (40075000 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom + 8);
  const scaleMeters = metersPerPixel * 100; // Scale for 100px

  if (scaleMeters >= 1000) {
    return `${(scaleMeters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(scaleMeters)} m`;
}

export function StatusBar({ lat, lng, zoom, parcelCount }: StatusBarProps) {
  const scale = calculateScale(zoom, lat);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-gray-900/95 border-t border-gray-800 px-4 py-2">
      <div className="flex items-center justify-between text-xs font-mono">
        {/* Coordinates */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gray-300">
            <MapPin className="w-3.5 h-3.5 text-lime-400" />
            <span>
              <span className="text-white">{lat.toFixed(4)}</span>
              <span className="text-gray-500">,</span>{" "}
              <span className="text-white">{lng.toFixed(4)}</span>
            </span>
          </div>

          {/* Zoom Level */}
          <div className="flex items-center gap-1.5 text-gray-300">
            <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Zoom <span className="text-white">{Math.round(zoom)}</span>
            </span>
          </div>

          {/* Scale */}
          <div className="flex items-center gap-1.5 text-gray-300">
            <Ruler className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-white">{scale}</span>
          </div>
        </div>

        {/* Parcel Count */}
        <div className="flex items-center gap-1.5 text-gray-300">
          <Layers className="w-3.5 h-3.5 text-green-400" />
          <span>
            <span className="text-white">{parcelCount}</span> parcels visible
          </span>
        </div>
      </div>
    </div>
  );
}
