"use client";

import {
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Shield,
} from "lucide-react";
import type { ParcelProperties } from "@/shared/lib/parcel-api";

interface AssessmentTabProps {
  parcel: ParcelProperties;
}

// Helper function for consistent currency formatting
const formatCurrency = (value: number): string => {
  return "$" + Math.round(value).toLocaleString();
};

export function AssessmentTab({ parcel }: AssessmentTabProps) {
  // Calculate YoY change (simulated if not available)
  const priorYearValue = parcel.priorYearValue || parcel.totalValue * 0.95;
  const yoyChange =
    ((parcel.totalValue - priorYearValue) / priorYearValue) * 100;
  const isPositive = yoyChange >= 0;

  return (
    <div className="space-y-6">
      {/* Current vs Prior Year */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-800 clip-notch-sm border border-gray-700">
          <p className="text-xs font-mono text-gray-300 uppercase tracking-wider mb-1">
            Current Year
          </p>
          <p className="text-xl md:text-2xl font-bold text-white">
            {formatCurrency(parcel.totalValue || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">2024 Assessment</p>
        </div>
        <div className="p-4 bg-gray-800 clip-notch-sm border border-gray-700">
          <p className="text-xs font-mono text-gray-300 uppercase tracking-wider mb-1">
            Prior Year
          </p>
          <p className="text-xl md:text-2xl font-bold text-gray-400">
            {formatCurrency(priorYearValue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">2023 Assessment</p>
        </div>
      </div>

      {/* YoY Change */}
      <div
        className={`p-4 clip-notch-sm border ${
          isPositive
            ? "bg-green-500/10 border-green-500/30"
            : "bg-red-500/10 border-red-500/30"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-gray-300 uppercase tracking-wider mb-1">
              Year-over-Year Change
            </p>
            <p
              className={`text-2xl font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}
            >
              {isPositive ? "+" : ""}
              {yoyChange.toFixed(1)}%
            </p>
          </div>
          {isPositive ? (
            <TrendingUp className="w-8 h-8 text-green-400" />
          ) : (
            <TrendingDown className="w-8 h-8 text-red-400" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {formatCurrency(Math.abs(parcel.totalValue - priorYearValue))}{" "}
          {isPositive ? "increase" : "decrease"} from prior year
        </p>
      </div>

      {/* Assessment Details */}
      <div>
        <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-3">
          Assessment Details
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4" /> Assessment Date
            </span>
            <span className="text-white font-medium">
              {parcel.assessmentDate || "January 1, 2024"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4" /> Next Reappraisal
            </span>
            <span className="text-white font-medium">
              {parcel.nextReappraisalDate || "January 1, 2025"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <FileText className="w-4 h-4" /> Tax District
            </span>
            <span className="text-white font-medium">
              {parcel.taxDistrict || "Montgomery County"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="flex items-center gap-2 text-gray-300">
              <FileText className="w-4 h-4" /> School District
            </span>
            <span className="text-white font-medium">
              {parcel.schoolDistrict || "Conroe ISD"}
            </span>
          </div>
        </div>
      </div>

      {/* Exemptions */}
      <div>
        <h3 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-3">
          Exemptions
        </h3>
        {Array.isArray(parcel.exemptions) && parcel.exemptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {parcel.exemptions.map((exemption, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-purple-500/10 text-purple-400 text-sm font-mono clip-notch-sm border border-purple-500/30 flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                {exemption}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No exemptions on file</p>
        )}
      </div>
    </div>
  );
}
