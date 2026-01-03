"use client";

import {
  Building,
  Droplets,
  Home,
  Thermometer,
  Car,
  Layers,
  FileText,
} from "lucide-react";
import type { ParcelProperties } from "@/shared/lib/parcel-api";

interface DetailsTabProps {
  parcel: ParcelProperties;
}

export function DetailsTab({ parcel }: DetailsTabProps) {
  return (
    <div className="space-y-6">
      {/* Zoning & Land Use */}
      <div>
        <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-3">
          Zoning & Land Use
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-gray-800 clip-notch-sm">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Building className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider">
                Zoning
              </span>
            </div>
            <p className="text-lg font-bold text-white">
              {parcel.zoning || "R-1"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {parcel.zoningDescription || "Single Family Residential"}
            </p>
          </div>
          <div className="p-4 bg-gray-800 clip-notch-sm">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Droplets className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider">
                Flood Zone
              </span>
            </div>
            <p className="text-lg font-bold text-white">
              {parcel.floodZone || "Zone X"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {parcel.floodZone === "Zone X" || !parcel.floodZone
                ? "Minimal flood risk"
                : "In flood hazard area"}
            </p>
          </div>
        </div>
      </div>

      {/* Building Characteristics */}
      <div>
        <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-3">
          Building Characteristics
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <Home className="w-4 h-4" /> Construction Type
            </span>
            <span className="text-white font-medium">
              {parcel.constructionType || "Frame/Brick Veneer"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <Layers className="w-4 h-4" /> Roof Type
            </span>
            <span className="text-white font-medium">
              {parcel.roofType || "Composition Shingle"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <Home className="w-4 h-4" /> Foundation
            </span>
            <span className="text-white font-medium">
              {parcel.foundation || "Slab"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <Thermometer className="w-4 h-4" /> HVAC
            </span>
            <span className="text-white font-medium">
              {parcel.hvac || "Central A/C"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <Car className="w-4 h-4" /> Parking
            </span>
            <span className="text-white font-medium">
              {parcel.parkingSpaces
                ? `${parcel.parkingSpaces} spaces`
                : "2-car garage"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <Building className="w-4 h-4" /> Stories
            </span>
            <span className="text-white font-medium">
              {parcel.stories || "1"}
            </span>
          </div>
        </div>
      </div>

      {/* Legal Description */}
      <div>
        <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-3">
          Legal Description
        </h3>
        <div className="p-4 bg-gray-800 clip-notch-sm">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-gray-300 mt-0.5" />
            <p className="text-sm text-gray-300 leading-relaxed">
              {parcel.legalDescription ||
                `LOT ${parcel.lot || "1"}, BLOCK ${parcel.block || "A"}, ${parcel.subdivision || "WOODLANDS SECTION"}, according to the map or plat thereof recorded in Volume ${parcel.platVolume || "1"}, Page ${parcel.platPage || "1"} of the Map Records of ${parcel.county || "Montgomery"} County, Texas`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
