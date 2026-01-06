"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/shared/lib/trpc";
import {
  FileText,
  Plus,
  DollarSign,
  ShoppingCart,
  Download,
  Eye,
  Calendar,
  MapPin,
  MoreVertical,
  Archive,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/shared/components/ui/Toast";

type Tab = "listings" | "purchases";

export default function MyListingsPage() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const initialTab = (searchParams.get("tab") as Tab) || "listings";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const { data: listings, isLoading: loadingListings } =
    trpc.marketplace.myListings.useQuery({
      limit: 50,
    });

  const { data: purchases, isLoading: loadingPurchases } =
    trpc.marketplace.myPurchases.useQuery({
      limit: 50,
    });

  const downloadMutation = trpc.marketplace.download.useMutation();

  const handleDownload = async (purchaseId: string) => {
    try {
      const result = await downloadMutation.mutateAsync({ purchaseId });
      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
        toast.success("Download started");
      } else {
        toast.error("Download URL not available");
      }
    } catch (error) {
      toast.error("Download failed. Please try again.");
    }
  };

  // Calculate stats
  const totalEarnings =
    listings?.items?.reduce(
      (sum, listing) => sum + Number(listing.price) * listing._count.purchases,
      0,
    ) || 0;

  const totalSales =
    listings?.items?.reduce(
      (sum, listing) => sum + listing._count.purchases,
      0,
    ) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Marketplace</h1>
          <p className="text-gray-400">Manage your listings and purchases</p>
        </div>
        <Link
          href="/marketplace/sell"
          className="px-4 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch flex items-center gap-2 hover:bg-lime-300"
        >
          <Plus className="w-4 h-4" />
          Sell a Report
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-400/10 clip-notch-sm flex items-center justify-center">
              <FileText className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono">
                {listings?.items?.length || 0}
              </p>
              <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                Active Listings
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-400/10 clip-notch-sm flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono">
                {totalSales}
              </p>
              <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                Total Sales
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-400/10 clip-notch-sm flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono">
                ${totalEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                Total Earnings
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-400/10 clip-notch-sm flex items-center justify-center">
              <Download className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono">
                {purchases?.items?.length || 0}
              </p>
              <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                Purchases
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("listings")}
            className={`pb-3 px-1 font-mono text-sm uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === "listings"
                ? "border-lime-400 text-lime-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`pb-3 px-1 font-mono text-sm uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === "purchases"
                ? "border-lime-400 text-lime-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            My Purchases
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "listings" ? (
        <div>
          {loadingListings ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
            </div>
          ) : listings?.items?.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)]">
              <FileText className="w-12 h-12 mx-auto text-gray-600" />
              <p className="mt-4 text-gray-400">No listings yet</p>
              <Link
                href="/marketplace/sell"
                className="mt-4 inline-flex items-center gap-2 text-lime-400 hover:text-lime-300"
              >
                <Plus className="w-4 h-4" />
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="bg-gray-900 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800">
                    <th className="text-left px-4 py-3 text-sm font-mono uppercase tracking-wider text-gray-400">
                      Listing
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-mono uppercase tracking-wider text-gray-400">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-mono uppercase tracking-wider text-gray-400">
                      Sales
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-mono uppercase tracking-wider text-gray-400">
                      Views
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-mono uppercase tracking-wider text-gray-400">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-mono uppercase tracking-wider text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {listings?.items?.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-4">
                        <Link
                          href={`/marketplace/listing/${listing.id}`}
                          className="hover:text-lime-400"
                        >
                          <p className="font-medium text-white">
                            {listing.title}
                          </p>
                          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {listing.city ||
                              listing.report?.appraisalRequest?.property?.city}
                            ,{" "}
                            {listing.state ||
                              listing.report?.appraisalRequest?.property?.state}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-lime-400 font-mono">
                          ${Number(listing.price).toFixed(0)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-white font-mono">
                          {listing._count.purchases}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-400 font-mono">
                          {listing.viewCount}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 clip-notch-sm text-xs font-mono uppercase tracking-wider ${
                            listing.status === "ACTIVE"
                              ? "bg-lime-400/10 text-lime-400 border border-lime-400/30"
                              : "bg-gray-700/50 text-gray-400 border border-gray-600"
                          }`}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/marketplace/listing/${listing.id}`}
                          className="text-lime-400 hover:text-lime-300 text-sm font-mono uppercase tracking-wider"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          {loadingPurchases ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
            </div>
          ) : purchases?.items?.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)]">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-600" />
              <p className="mt-4 text-gray-400">No purchases yet</p>
              <Link
                href="/marketplace"
                className="mt-4 inline-block text-lime-400 hover:text-lime-300"
              >
                Browse the marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases?.items?.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-gray-900 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">
                        {purchase.listing.title}
                      </h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {purchase.listing.report?.appraisalRequest?.property
                          ?.addressLine1 || ""}
                        {purchase.listing.report?.appraisalRequest?.property
                          ?.city && ", "}
                        {
                          purchase.listing.report?.appraisalRequest?.property
                            ?.city
                        }
                        {purchase.listing.report?.appraisalRequest?.property
                          ?.state && ", "}
                        {
                          purchase.listing.report?.appraisalRequest?.property
                            ?.state
                        }
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1 font-mono">
                          <DollarSign className="w-3 h-3" />
                          Paid ${Number(purchase.price).toFixed(0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(purchase.purchasedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Download className="w-3 h-3" />
                          Downloaded {purchase.downloadCount}x
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(purchase.id)}
                      disabled={downloadMutation.isPending}
                      className="px-4 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50 flex items-center gap-2"
                    >
                      {downloadMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
