"use client";

import Link from "next/link";
import { MapPin, Bed, Bath, Square, Calendar } from "lucide-react";
import { cn, formatDate } from "@/shared/lib/utils";
import { PriceDisplay } from "./PriceDisplay";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { StatusBadge } from "./StatusBadge";

interface PropertyCardProps {
  id: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  imageUrl?: string;
  estimatedValue?: number;
  confidenceScore?: number;
  status?: "draft" | "queued" | "running" | "ready" | "failed" | "expired";
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  createdAt?: string | Date;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function PropertyCard({
  id,
  address,
  imageUrl,
  estimatedValue,
  confidenceScore,
  status,
  propertyType,
  bedrooms,
  bathrooms,
  sqft,
  createdAt,
  href,
  onClick,
  className,
}: PropertyCardProps) {
  const formattedAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;

  const cardClassName = cn(
    "block bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden transition-all",
    (href || onClick) && "hover:shadow-md hover:border-[var(--primary)]/50 cursor-pointer",
    className
  );

  const content = (
    <>
      {/* Image */}
      <div className="relative aspect-[16/10] bg-[var(--muted)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={formattedAddress}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-[var(--muted-foreground)]" />
          </div>
        )}
        {status && (
          <div className="absolute top-3 left-3">
            <StatusBadge status={status} size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Address */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-medium text-[var(--foreground)] truncate">
              {address.street}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {address.city}, {address.state} {address.zipCode}
            </p>
          </div>
        </div>

        {/* Property Details */}
        {(bedrooms || bathrooms || sqft) && (
          <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)] mb-3">
            {bedrooms !== undefined && (
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                {bedrooms} bed
              </span>
            )}
            {bathrooms !== undefined && (
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                {bathrooms} bath
              </span>
            )}
            {sqft !== undefined && (
              <span className="flex items-center gap-1">
                <Square className="w-4 h-4" />
                {sqft.toLocaleString()} sqft
              </span>
            )}
          </div>
        )}

        {/* Value & Confidence */}
        {estimatedValue !== undefined && (
          <div className="flex items-center justify-between">
            <PriceDisplay value={estimatedValue} size="md" />
            {confidenceScore !== undefined && (
              <ConfidenceMeter score={confidenceScore} size="sm" showLabel showTooltip={false} />
            )}
          </div>
        )}

        {/* Footer */}
        {createdAt && (
          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mt-3 pt-3 border-t border-[var(--border)]">
            <Calendar className="w-3 h-3" />
            {formatDate(createdAt)}
          </div>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} role="button" tabIndex={0} className={cardClassName}>
        {content}
      </div>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

// Compact Property Card
interface PropertyCardCompactProps {
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  imageUrl?: string;
  estimatedValue?: number;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function PropertyCardCompact({
  address,
  imageUrl,
  estimatedValue,
  onClick,
  selected,
  className,
}: PropertyCardCompactProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "flex items-center gap-3 p-3 bg-[var(--card)] border rounded-lg transition-all",
        onClick && "cursor-pointer hover:bg-[var(--secondary)]",
        selected ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20" : "border-[var(--border)]",
        className
      )}
    >
      <div className="w-16 h-12 rounded-md bg-[var(--muted)] overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={address.street}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-4 h-4 text-[var(--muted-foreground)]" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-[var(--foreground)] truncate">
          {address.street}
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          {address.city}, {address.state}
        </p>
      </div>
      {estimatedValue !== undefined && (
        <PriceDisplay value={estimatedValue} size="sm" className="flex-shrink-0" />
      )}
    </div>
  );
}
