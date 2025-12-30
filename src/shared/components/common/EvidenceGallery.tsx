"use client";

import { useState, useCallback } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { Modal } from "@/shared/components/ui/Modal";

export interface EvidenceItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: "photo" | "document" | "video";
  category: string;
  description?: string;
  capturedAt: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  metadata?: Record<string, unknown>;
  verified?: boolean;
}

export interface EvidenceGalleryProps {
  items: EvidenceItem[];
  onItemClick?: (item: EvidenceItem) => void;
  onDelete?: (item: EvidenceItem) => void;
  onDownload?: (item: EvidenceItem) => void;
  showCategories?: boolean;
  editable?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

const categoryLabels: Record<string, string> = {
  front_exterior: "Front Exterior",
  rear_exterior: "Rear Exterior",
  side_exterior: "Side Exterior",
  street_view: "Street View",
  living_room: "Living Room",
  kitchen: "Kitchen",
  bedroom: "Bedroom",
  bathroom: "Bathroom",
  garage: "Garage",
  backyard: "Backyard",
  roof: "Roof",
  hvac: "HVAC",
  water_heater: "Water Heater",
  electrical_panel: "Electrical Panel",
  foundation: "Foundation",
  damage: "Damage",
  improvement: "Improvement",
  document: "Document",
  other: "Other",
};

export function EvidenceGallery({
  items,
  onItemClick,
  onDelete,
  onDownload,
  showCategories = true,
  editable = false,
  columns = 3,
  className = "",
}: EvidenceGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Group items by category
  const categories = [...new Set(items.map((item) => item.category))];

  const filteredItems =
    filter === "all" ? items : items.filter((item) => item.category === filter);

  const handleItemClick = useCallback(
    (item: EvidenceItem) => {
      setSelectedItem(item);
      onItemClick?.(item);
    },
    [onItemClick]
  );

  const handleDownload = useCallback(
    (item: EvidenceItem) => {
      if (onDownload) {
        onDownload(item);
      } else {
        // Default download behavior
        const link = document.createElement("a");
        link.href = item.url;
        link.download = `evidence_${item.id}`;
        link.click();
      }
    },
    [onDownload]
  );

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  if (items.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-foreground">No evidence</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No photos or documents have been uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Category filter */}
      {showCategories && categories.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filter === "all"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((category) => {
            const count = items.filter((i) => i.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  filter === category
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {categoryLabels[category] || category} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            {item.type === "photo" || item.type === "video" ? (
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.description || item.category}
                className="w-full h-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <svg
                  className="w-12 h-12 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>

            {/* Category badge */}
            <div className="absolute top-2 left-2">
              <Badge variant="default" className="bg-black/50 text-white text-xs">
                {categoryLabels[item.category] || item.category}
              </Badge>
            </div>

            {/* Verified badge */}
            {item.verified && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Video indicator */}
            {item.type === "video" && (
              <div className="absolute bottom-2 right-2">
                <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        size="xl"
        title={
          selectedItem
            ? categoryLabels[selectedItem.category] || selectedItem.category
            : ""
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Image */}
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {selectedItem.type === "photo" || selectedItem.type === "video" ? (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.description || selectedItem.category}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Captured:</span>
                <span className="ml-2 text-foreground">
                  {new Date(selectedItem.capturedAt).toLocaleString()}
                </span>
              </div>
              {selectedItem.location && (
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <span className="ml-2 text-foreground">
                    {selectedItem.location.latitude.toFixed(6)},{" "}
                    {selectedItem.location.longitude.toFixed(6)}
                  </span>
                </div>
              )}
              {selectedItem.verified && (
                <div className="flex items-center gap-1 text-green-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  GPS Verified
                </div>
              )}
            </div>

            {/* Description */}
            {selectedItem.description && (
              <p className="text-muted-foreground">{selectedItem.description}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleDownload(selectedItem)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </Button>
              {editable && onDelete && (
                <Button
                  variant="danger"
                  onClick={() => {
                    onDelete(selectedItem);
                    setSelectedItem(null);
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Checklist component for required evidence
export interface EvidenceChecklistProps {
  required: string[];
  captured: string[];
  onCategoryClick?: (category: string) => void;
  className?: string;
}

export function EvidenceChecklist({
  required,
  captured,
  onCategoryClick,
  className = "",
}: EvidenceChecklistProps) {
  const completedCount = required.filter((cat) => captured.includes(cat)).length;
  const progress = (completedCount / required.length) * 100;

  return (
    <div className={className}>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">
            {completedCount} / {required.length}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {required.map((category) => {
          const isComplete = captured.includes(category);
          return (
            <button
              key={category}
              onClick={() => onCategoryClick?.(category)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${
                isComplete
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isComplete ? "bg-green-500" : "border-2 border-border"
                }`}
              >
                {isComplete && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`flex-1 text-left ${
                  isComplete ? "text-green-500" : "text-foreground"
                }`}
              >
                {categoryLabels[category] || category}
              </span>
              {!isComplete && (
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default EvidenceGallery;
