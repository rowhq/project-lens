"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useCartStore } from "@/shared/lib/cart-store";
import {
  ArrowLeft,
  FileText,
  MapPin,
  Calendar,
  Building2,
  Ruler,
  Bed,
  Bath,
  ShoppingCart,
  Download,
  Shield,
  CheckCircle,
  Loader2,
  Eye,
  Layers,
  File,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/shared/components/ui/Toast";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const listingId = params.id as string;
  const { addItem, hasItem, removeItem } = useCartStore();

  const { data: listing, isLoading } = trpc.marketplace.getById.useQuery({
    id: listingId,
  });

  const isInCart = hasItem(listingId);

  const handleAddToCart = () => {
    if (!listing) return;

    const property = listing.report?.appraisalRequest?.property;

    addItem({
      listingId: listing.id,
      title: listing.title,
      price: Number(listing.price),
      property: property
        ? { city: property.city, state: property.state }
        : listing.city && listing.state
          ? { city: listing.city, state: listing.state }
          : undefined,
      reportType: listing.report?.type || listing.studyCategory || "STUDY",
    });

    toast.success("Added to cart!");
  };

  const handleRemoveFromCart = () => {
    removeItem(listingId);
    toast.success("Removed from cart");
  };

  const handleGoToCart = () => {
    router.push("/marketplace/cart");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-gray-600" />
        <p className="mt-4 text-gray-400">Listing not found</p>
        <Link
          href="/marketplace"
          className="mt-4 inline-block text-lime-400 hover:text-lime-300"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const property = listing.report?.appraisalRequest?.property;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="px-2 py-1 bg-lime-400/10 text-lime-400 text-xs font-mono uppercase tracking-wider clip-notch-sm">
                  {listing.category}
                </span>
                <h1 className="mt-2 text-2xl font-bold text-white">
                  {listing.title}
                </h1>
                {property && (
                  <p className="mt-1 flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {property.city}, {property.state} {property.zipCode}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-lime-400 font-mono">
                  ${Number(listing.price).toFixed(0)}
                </p>
                <p className="text-sm text-gray-400">
                  {listing._count.purchases} sold
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
              <h2 className="font-semibold text-white mb-3">Description</h2>
              <p className="text-gray-400 whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          {/* Property Details */}
          <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
            <h2 className="font-semibold text-white mb-4">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-800 clip-notch-sm">
                <Building2 className="w-5 h-5 text-lime-400" />
                <div>
                  <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                    Type
                  </p>
                  <p className="font-medium text-white">
                    {property?.propertyType?.replace("_", " ") || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800 clip-notch-sm">
                <Ruler className="w-5 h-5 text-lime-400" />
                <div>
                  <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                    Size
                  </p>
                  <p className="font-medium text-white">
                    {property?.sqft?.toLocaleString() || "N/A"} sqft
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800 clip-notch-sm">
                <Bed className="w-5 h-5 text-lime-400" />
                <div>
                  <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                    Bedrooms
                  </p>
                  <p className="font-medium text-white">
                    {property?.bedrooms || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800 clip-notch-sm">
                <Bath className="w-5 h-5 text-lime-400" />
                <div>
                  <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                    Bathrooms
                  </p>
                  <p className="font-medium text-white">
                    {property?.bathrooms || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            {property?.yearBuilt && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                Built in {property.yearBuilt}
              </div>
            )}
          </div>

          {/* Report Details - Only show if report exists */}
          {listing.report && (
            <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
              <h2 className="font-semibold text-white mb-4">
                Report Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">Report Type</span>
                  <span className="font-medium text-white">
                    {listing.report.type.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">Estimated Value</span>
                  <span className="font-medium text-white font-mono">
                    ${Number(listing.report.valueEstimate).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">Value Range</span>
                  <span className="font-medium text-white font-mono">
                    ${Number(listing.report.valueRangeMin).toLocaleString()} - $
                    {Number(listing.report.valueRangeMax).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">Confidence Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-700 clip-notch-sm overflow-hidden">
                      <div
                        className="h-full bg-lime-400 clip-notch-sm"
                        style={{ width: `${listing.report.confidenceScore}%` }}
                      />
                    </div>
                    <span className="font-medium text-white font-mono">
                      {listing.report.confidenceScore}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">Comparables Used</span>
                  <span className="font-medium text-white font-mono">
                    {listing.report.compsCount}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-400">Generated</span>
                  <span className="font-medium text-white">
                    {new Date(listing.report.generatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Study Category - Show if no report */}
          {!listing.report && listing.studyCategory && (
            <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-lime-400" />
                Study Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">Study Type</span>
                  <span className="font-medium text-white">
                    {listing.studyCategory.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400">Location</span>
                  <span className="font-medium text-white">
                    {listing.city}, {listing.county}, {listing.state}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-400">Listed</span>
                  <span className="font-medium text-white">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Documents Section */}
          {listing.documents && listing.documents.length > 0 && (
            <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <File className="w-5 h-5 text-lime-400" />
                Included Documents ({listing.documents.length})
              </h2>
              <div className="space-y-3">
                {listing.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-800 clip-notch-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-lime-400/10 clip-notch-sm">
                        <FileText className="w-5 h-5 text-lime-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {doc.title || doc.fileName}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <span>
                            {doc.documentType?.replace(/_/g, " ") || "Document"}
                          </span>
                          <span>
                            {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-lime-400/10 text-lime-400 hover:bg-lime-400/20 clip-notch-sm transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Documents will be available for download after purchase.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <div className="relative bg-gray-900 clip-notch border border-lime-400/30 p-6 sticky top-6">
            <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-lime-400" />
            <div className="absolute -top-px -right-px w-3 h-3 border-r border-t border-lime-400" />
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-lime-400 font-mono">
                ${Number(listing.price).toFixed(0)}
              </p>
              <p className="text-sm text-gray-400">One-time purchase</p>
            </div>

            {isInCart ? (
              <div className="space-y-2">
                <button
                  onClick={handleGoToCart}
                  className="w-full py-3 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Go to Cart
                </button>
                <button
                  onClick={handleRemoveFromCart}
                  className="w-full py-2 text-gray-400 hover:text-red-500 text-sm flex items-center justify-center gap-1"
                >
                  Remove from cart
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            )}

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-lime-400" />
                Instant PDF download
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-lime-400" />
                Verified appraisal data
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Download className="w-4 h-4 text-lime-400" />
                Unlimited downloads
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
            <h3 className="font-semibold text-white mb-3">Seller</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-800 clip-notch-sm flex items-center justify-center">
                <Building2 className="w-6 h-6 text-lime-400" />
              </div>
              <div>
                <p className="font-medium text-white">{listing.seller.name}</p>
                <p className="text-sm text-gray-400">Verified Seller</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
            <h3 className="font-semibold text-white mb-3">Listing Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Views
                </span>
                <span className="font-medium text-white font-mono">
                  {listing.viewCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Sales
                </span>
                <span className="font-medium text-white font-mono">
                  {listing._count.purchases}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Listed
                </span>
                <span className="font-medium text-white">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
