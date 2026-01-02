"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (showEllipsisStart) {
      pages.push("ellipsis");
    }

    // Show pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (showEllipsisEnd) {
      pages.push("ellipsis");
    }

    // Always show last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-1", className)}
    >
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "p-2 clip-notch-sm transition-all text-gray-400",
          "hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
              <MoreHorizontal className="w-5 h-5" />
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "min-w-[36px] h-9 px-3 clip-notch-sm font-mono text-sm font-medium transition-all",
                page === currentPage
                  ? "bg-lime-500 text-black"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )}
              style={{
                transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
              }}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ),
        )}
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "p-2 clip-notch-sm transition-all text-gray-400",
          "hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}

// Simple Pagination Info
interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  pageSize,
  totalItems,
  className,
}: PaginationInfoProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <p className={cn("text-sm text-gray-400 font-mono", className)}>
      Showing <span className="font-medium text-white">{start}</span> to{" "}
      <span className="font-medium text-white">{end}</span> of{" "}
      <span className="font-medium text-lime-400">{totalItems}</span> results
    </p>
  );
}
