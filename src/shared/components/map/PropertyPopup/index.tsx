"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Building2, Sparkles } from "lucide-react";
import type { ParcelProperties } from "@/shared/lib/parcel-api";
import { OverviewTab } from "./OverviewTab";
import { AssessmentTab } from "./AssessmentTab";
import { DetailsTab } from "./DetailsTab";
import { MarketTab } from "./MarketTab";
import { HistoryTab } from "./HistoryTab";
import { ValuationTab } from "./ValuationTab";

type TabId =
  | "overview"
  | "assessment"
  | "details"
  | "market"
  | "history"
  | "valuation";

const TABS: { id: TabId; label: string; highlight?: boolean }[] = [
  { id: "overview", label: "Overview" },
  { id: "assessment", label: "Assessment" },
  { id: "details", label: "Details" },
  { id: "market", label: "Market" },
  { id: "history", label: "History" },
  { id: "valuation", label: "AI Valuation", highlight: true },
];

interface PropertyPopupProps {
  parcel: ParcelProperties;
  onClose: () => void;
  onRequestCertified: () => void;
}

export function PropertyPopup({
  parcel,
  onClose,
  onRequestCertified,
}: PropertyPopupProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 md:pt-20 px-4 isolate">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl md:max-w-2xl bg-gray-900 border border-gray-800 clip-notch shadow-2xl max-h-[90vh] md:max-h-[85vh] flex flex-col z-10">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                {parcel.situs || `Property ${parcel.id}`}
              </h2>
              <p className="text-sm text-gray-400">
                {parcel.city}, {parcel.state} {parcel.zip}
              </p>
            </div>
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 -mr-2 -mt-1 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-lime-400/10 text-lime-400 text-xs font-mono uppercase tracking-wider clip-notch-sm border border-lime-400/30">
              {parcel.zoning || "N/A"}
            </span>
            {parcel.floodZone && (
              <span className="px-2 py-0.5 bg-cyan-400/10 text-cyan-400 text-xs font-mono uppercase tracking-wider clip-notch-sm border border-cyan-400/30">
                {parcel.floodZone}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="relative border-b border-gray-800">
          {/* Scroll fade indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none opacity-0 md:opacity-0" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none md:opacity-0" />

          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 md:px-4 py-2 text-xs md:text-sm font-mono uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-1 ${
                  activeTab === tab.id
                    ? "text-lime-400 border-b-2 border-lime-400 bg-gray-800/50"
                    : tab.highlight
                      ? "text-lime-400/70 hover:text-lime-400 hover:bg-gray-800/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/30"
                }`}
              >
                {tab.highlight && (
                  <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" />
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "overview" && <OverviewTab parcel={parcel} />}
          {activeTab === "assessment" && <AssessmentTab parcel={parcel} />}
          {activeTab === "details" && <DetailsTab parcel={parcel} />}
          {activeTab === "market" && <MarketTab parcel={parcel} />}
          {activeTab === "history" && <HistoryTab parcel={parcel} />}
          {activeTab === "valuation" && (
            <ValuationTab parcel={parcel} onClose={onClose} />
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-800/30 flex gap-3">
          <button
            onClick={() => setActiveTab("valuation")}
            className="flex-1 py-3 bg-lime-400 text-gray-900 font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            AI Valuation
          </button>
          <button
            onClick={onRequestCertified}
            className="flex-1 py-3 border border-gray-600 text-white font-mono text-sm uppercase tracking-wider clip-notch hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Building2 className="w-5 h-5" />
            Certified Appraisal
          </button>
        </div>
      </div>
    </div>
  );

  // Render modal using Portal to escape stacking context
  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}
