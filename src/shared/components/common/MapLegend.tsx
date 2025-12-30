"use client";

import { useState } from "react";
import { Info, ChevronDown } from "lucide-react";

export interface LegendItem {
  color: string;
  label: string;
  value?: string | number;
  description?: string;
}

export interface LegendCategory {
  title: string;
  items: LegendItem[];
  type?: "gradient" | "discrete" | "continuous";
}

export interface MapLegendProps {
  categories: LegendCategory[];
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export function MapLegend({
  categories,
  title = "Legend",
  collapsible = true,
  defaultExpanded = true,
  className = "",
}: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.title))
  );

  const toggleCategory = (categoryTitle: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryTitle)) {
      newExpanded.delete(categoryTitle);
    } else {
      newExpanded.add(categoryTitle);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div
      className={`absolute bottom-4 left-4 z-10 w-56 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      {collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 bg-[var(--secondary)] border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              {title}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform ${
              isExpanded ? "" : "-rotate-90"
            }`}
          />
        </button>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--secondary)] border-b border-[var(--border)]">
          <Info className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">
            {title}
          </span>
        </div>
      )}

      {/* Content */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto">
          {categories.map((category) => (
            <LegendCategorySection
              key={category.title}
              category={category}
              isExpanded={expandedCategories.has(category.title)}
              onToggle={() => toggleCategory(category.title)}
              showToggle={categories.length > 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LegendCategorySectionProps {
  category: LegendCategory;
  isExpanded: boolean;
  onToggle: () => void;
  showToggle: boolean;
}

function LegendCategorySection({
  category,
  isExpanded,
  onToggle,
  showToggle,
}: LegendCategorySectionProps) {
  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      {showToggle ? (
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--muted)] transition-colors"
        >
          <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
            {category.title}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-[var(--muted-foreground)] transition-transform ${
              isExpanded ? "" : "-rotate-90"
            }`}
          />
        </button>
      ) : (
        <div className="px-3 py-2">
          <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
            {category.title}
          </span>
        </div>
      )}

      {isExpanded && (
        <div className="px-3 pb-2">
          {category.type === "gradient" ? (
            <GradientLegend items={category.items} />
          ) : (
            <DiscreteLegend items={category.items} />
          )}
        </div>
      )}
    </div>
  );
}

function GradientLegend({ items }: { items: LegendItem[] }) {
  if (items.length < 2) return <DiscreteLegend items={items} />;

  const gradientColors = items.map((item) => item.color).join(", ");

  return (
    <div className="space-y-1">
      <div
        className="h-3 rounded-sm"
        style={{
          background: `linear-gradient(to right, ${gradientColors})`,
        }}
      />
      <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
        <span>{items[0].label}</span>
        <span>{items[items.length - 1].label}</span>
      </div>
    </div>
  );
}

function DiscreteLegend({ items }: { items: LegendItem[] }) {
  return (
    <div className="space-y-1.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm flex-shrink-0 border border-[var(--border)]"
            style={{ backgroundColor: item.color }}
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs text-[var(--foreground)] truncate block">
              {item.label}
            </span>
            {item.description && (
              <span className="text-xs text-[var(--muted-foreground)] truncate block">
                {item.description}
              </span>
            )}
          </div>
          {item.value !== undefined && (
            <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default MapLegend;
