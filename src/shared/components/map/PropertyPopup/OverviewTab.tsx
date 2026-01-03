"use client";

import {
  User,
  MapPin,
  Home,
  Building,
  Hash,
  Layers,
  Droplets,
  FileText,
} from "lucide-react";
import type { ParcelProperties } from "@/shared/lib/parcel-api";

interface OverviewTabProps {
  parcel: ParcelProperties;
}

// Helper function for consistent currency formatting
const formatCurrency = (value: number): string => {
  return "$" + Math.round(value).toLocaleString();
};

export function OverviewTab({ parcel }: OverviewTabProps) {
  // Calculate land vs improvement breakdown
  const landValue = parcel.landValue || parcel.totalValue * 0.3;
  const improvementValue = parcel.improvementValue || parcel.totalValue * 0.7;
  const landPercentage = (landValue / parcel.totalValue) * 100;
  // Only calculate price/sqft if we have building area, otherwise it's misleading
  const pricePerSqft = parcel.buildingArea
    ? parcel.totalValue / parcel.buildingArea
    : null;

  return (
    <div className="space-y-4">
      {/* Total Value Hero */}
      <div className="p-4 bg-gray-800 border border-gray-700 clip-notch">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-lime-400 uppercase tracking-wider mb-1">
              Total Assessed Value
            </p>
            <p className="text-3xl md:text-4xl font-bold text-white">
              {formatCurrency(parcel.totalValue || 0)}
            </p>
          </div>
          {pricePerSqft && (
            <div className="text-right">
              <p className="text-xs text-gray-300">Price/SqFt</p>
              <p className="text-lg font-mono text-lime-400">
                ${Math.round(pricePerSqft).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="p-3 bg-gray-800 clip-notch-sm text-center">
          <p className="text-xs text-gray-300">Year Built</p>
          <p className="text-lg font-bold text-white">
            {parcel.yearBuilt || "N/A"}
          </p>
        </div>
        <div className="p-3 bg-gray-800 clip-notch-sm text-center">
          <p className="text-xs text-gray-300">Lot Size</p>
          <p className="text-lg font-bold text-white">
            {parcel.acres?.toFixed(2) || "N/A"}
          </p>
          <p className="text-xs text-gray-500">acres</p>
        </div>
        <div className="p-3 bg-gray-800 clip-notch-sm text-center">
          <p className="text-xs text-gray-300">Stories</p>
          <p className="text-lg font-bold text-white">
            {parcel.stories || "1"}
          </p>
        </div>
        <div className="p-3 bg-gray-800 clip-notch-sm text-center">
          <p className="text-xs text-gray-300">Flood Zone</p>
          <p className="text-lg font-bold text-white">
            {parcel.floodZone || "X"}
          </p>
        </div>
      </div>

      {/* Value Breakdown */}
      <div>
        <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-2">
          Value Breakdown
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-gray-800 clip-notch-sm">
            <p className="text-xs text-gray-300 mb-1">Land Value</p>
            <p className="text-lg md:text-xl font-bold text-white font-mono">
              {formatCurrency(landValue)}
            </p>
            <p className="text-xs text-gray-500">
              {Math.round(landPercentage)}% of total
            </p>
          </div>
          <div className="p-3 bg-gray-800 clip-notch-sm">
            <p className="text-xs text-gray-300 mb-1">Improvement Value</p>
            <p className="text-lg md:text-xl font-bold text-white font-mono">
              {formatCurrency(improvementValue)}
            </p>
            <p className="text-xs text-gray-500">
              {Math.round(100 - landPercentage)}% of total
            </p>
          </div>
        </div>

        {/* Visual Bar */}
        <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden flex">
          <div
            className="bg-amber-500"
            style={{ width: `${landPercentage}%` }}
          />
          <div
            className="bg-blue-500"
            style={{ width: `${100 - landPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded" /> Land
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded" /> Improvements
          </span>
        </div>
      </div>

      {/* Property Info Grid */}
      <div>
        <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-2">
          Property Information
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <User className="w-4 h-4" /> Owner
            </span>
            <span className="text-white font-medium text-right max-w-[200px] truncate">
              {parcel.owner}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <Hash className="w-4 h-4" /> Account #
            </span>
            <span className="text-white font-mono">
              {parcel.accountNumber || parcel.id}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <Home className="w-4 h-4" /> Property Type
            </span>
            <span className="text-white font-medium">
              {parcel.propertyType || "Residential"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <Layers className="w-4 h-4" /> Zoning
            </span>
            <span className="text-white font-medium">
              {parcel.zoning || "N/A"}
              {parcel.zoningDescription && (
                <span className="text-gray-500 text-xs ml-1">
                  ({parcel.zoningDescription})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4" /> Lot Size
            </span>
            <span className="text-white font-medium">
              {parcel.acres?.toFixed(2)} acres (
              {Math.round(parcel.sqft || 0).toLocaleString()} sqft)
            </span>
          </div>
          {parcel.buildingArea && (
            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="flex items-center gap-2 text-gray-400">
                <Building className="w-4 h-4" /> Building Area
              </span>
              <span className="text-white font-medium">
                {parcel.buildingArea.toLocaleString()} sqft
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <Droplets className="w-4 h-4" /> Flood Zone
            </span>
            <span
              className={`font-medium ${parcel.floodZone === "X" || !parcel.floodZone ? "text-green-400" : "text-yellow-400"}`}
            >
              {parcel.floodZone || "Zone X"} -{" "}
              {parcel.floodZone === "X" || !parcel.floodZone
                ? "Minimal Risk"
                : "Flood Hazard"}
            </span>
          </div>
        </div>
      </div>

      {/* Legal Description */}
      {(parcel.subdivision || parcel.lot || parcel.block) && (
        <div>
          <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-2">
            Legal Description
          </h3>
          <div className="p-3 bg-gray-800 clip-notch-sm">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
              <p className="text-sm text-gray-300">
                {parcel.subdivision && (
                  <span>Subdivision: {parcel.subdivision}</span>
                )}
                {parcel.lot && <span className="ml-2">Lot: {parcel.lot}</span>}
                {parcel.block && (
                  <span className="ml-2">Block: {parcel.block}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
