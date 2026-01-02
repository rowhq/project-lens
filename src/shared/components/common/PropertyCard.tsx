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
    "block bg-gray-900 border border-gray-800 clip-notch overflow-hidden transition-all",
    (href || onClick) &&
      "hover:shadow-md hover:border-lime-400/50 cursor-pointer",
    className,
  );

  const content = (
    <>
      {/* Image */}
      <div className="relative aspect-[16/10] bg-gray-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={formattedAddress}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-600" />
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
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{address.street}</p>
            <p className="text-sm text-gray-400">
              {address.city}, {address.state} {address.zipCode}
            </p>
          </div>
        </div>

        {/* Property Details */}
        {(bedrooms || bathrooms || sqft) && (
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
            {bedrooms !== undefined && (
              <span className="flex items-center gap-1 font-mono">
                <Bed className="w-4 h-4" />
                {bedrooms} bed
              </span>
            )}
            {bathrooms !== undefined && (
              <span className="flex items-center gap-1 font-mono">
                <Bath className="w-4 h-4" />
                {bathrooms} bath
              </span>
            )}
            {sqft !== undefined && (
              <span className="flex items-center gap-1 font-mono">
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
              <ConfidenceMeter
                score={confidenceScore}
                size="sm"
                showLabel
                showTooltip={false}
              />
            )}
          </div>
        )}

        {/* Footer */}
        {createdAt && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-800">
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
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        className={cardClassName}
      >
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
        "flex items-center gap-3 p-3 bg-gray-900 border clip-notch transition-all",
        onClick && "cursor-pointer hover:bg-gray-800",
        selected
          ? "border-lime-400 ring-2 ring-lime-400/20"
          : "border-gray-800",
        className,
      )}
    >
      <div className="w-16 h-12 clip-notch-sm bg-gray-800 overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={address.street}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-4 h-4 text-gray-500" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white truncate">
          {address.street}
        </p>
        <p className="text-xs text-gray-400">
          {address.city}, {address.state}
        </p>
      </div>
      {estimatedValue !== undefined && (
        <PriceDisplay
          value={estimatedValue}
          size="sm"
          className="flex-shrink-0"
        />
      )}
    </div>
  );
}
