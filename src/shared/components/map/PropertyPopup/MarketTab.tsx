"use client";

import { DollarSign, Calendar, FileText, TrendingUp, Home } from "lucide-react";
import type { ParcelProperties } from "@/shared/lib/parcel-api";

interface MarketTabProps {
  parcel: ParcelProperties;
}

// Helper function for consistent currency formatting
const formatCurrency = (value: number): string => {
  return "$" + Math.round(value).toLocaleString();
};

export function MarketTab({ parcel }: MarketTabProps) {
  // Simulated market data if not available
  const lastSalePrice = parcel.lastSalePrice || parcel.totalValue * 0.85;
  const lastSaleDate = parcel.lastSaleDate || "March 15, 2021";
  const comparablesCount = parcel.comparablesCount || 15;
  const neighborhoodMedian =
    parcel.neighborhoodMedian || parcel.totalValue * 1.05;
  const pricePerSqft =
    parcel.buildingArea || parcel.sqft
      ? parcel.totalValue / (parcel.buildingArea || parcel.sqft || 1)
      : 150;

  return (
    <div className="space-y-6">
      {/* Last Sale */}
      <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 clip-notch">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-1">
              Last Sale Price
            </p>
            <p className="text-2xl md:text-3xl font-bold text-white">
              {formatCurrency(lastSalePrice)}
            </p>
            <p className="text-sm text-gray-300 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {lastSaleDate}
            </p>
          </div>
          <DollarSign className="w-12 h-12 text-blue-400/50" />
        </div>
      </div>

      {/* Market Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-gray-800 clip-notch-sm">
          <p className="text-xs text-gray-300 mb-1">Price per Sqft</p>
          <p className="text-lg md:text-xl font-bold text-white font-mono">
            ${Math.round(pricePerSqft).toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-gray-800 clip-notch-sm">
          <p className="text-xs text-gray-300 mb-1">Neighborhood Median</p>
          <p className="text-lg md:text-xl font-bold text-white font-mono">
            {formatCurrency(neighborhoodMedian)}
          </p>
        </div>
      </div>

      {/* Value vs Neighborhood */}
      <div>
        <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-3">
          Value Comparison
        </h3>
        <div className="p-4 bg-gray-800 clip-notch-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300">This Property</span>
            <span className="text-white font-mono font-bold">
              {formatCurrency(parcel.totalValue || 0)}
            </span>
          </div>
          <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-lime-400 rounded-full"
              style={{
                width: `${Math.min((parcel.totalValue / neighborhoodMedian) * 50, 100)}%`,
              }}
            />
            <div
              className="absolute inset-y-0 bg-gray-500 w-0.5"
              style={{ left: "50%" }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Below Median</span>
            <span>Median: {formatCurrency(neighborhoodMedian)}</span>
            <span>Above Median</span>
          </div>
        </div>
      </div>

      {/* Comparables */}
      <div>
        <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-3">
          Comparable Sales
        </h3>
        <div className="p-4 bg-gray-800 clip-notch-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 clip-notch-sm flex items-center justify-center border border-green-500/30">
              <Home className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium">
                {comparablesCount} Comparable Properties
              </p>
              <p className="text-xs text-gray-300">
                Within 0.5 miles, sold in last 12 months
              </p>
            </div>
          </div>
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
      </div>

      {/* Sale Details */}
      <div>
        <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-3">
          Sale Information
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <FileText className="w-4 h-4" /> Sale Type
            </span>
            <span className="text-white font-medium">
              {parcel.saleType || "Arms Length"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <FileText className="w-4 h-4" /> Deed Type
            </span>
            <span className="text-white font-medium">
              {parcel.deedType || "General Warranty"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <FileText className="w-4 h-4" /> Recording Reference
            </span>
            <span className="text-white font-medium font-mono">
              {parcel.deedReference || "2021-12345"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
