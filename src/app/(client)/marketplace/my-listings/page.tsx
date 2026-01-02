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

  const { data: listings, isLoading: loadingListings } = trpc.marketplace.myListings.useQuery({
    limit: 50,
  });

  const { data: purchases, isLoading: loadingPurchases } = trpc.marketplace.myPurchases.useQuery({
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
  const totalEarnings = listings?.items?.reduce(
    (sum, listing) => sum + Number(listing.price) * listing._count.purchases,
    0
  ) || 0;

  const totalSales = listings?.items?.reduce(
    (sum, listing) => sum + listing._count.purchases,
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">My Marketplace</h1>
          <p className="text-[var(--muted-foreground)]">
            Manage your listings and purchases
          </p>
        </div>
        <Link
          href="/marketplace/sell"
          className="px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Sell a Report
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {listings?.items?.length || 0}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">Active Listings</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{totalSales}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Total Sales</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                ${totalEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">Total Earnings</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {purchases?.items?.length || 0}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">Purchases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("listings")}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "listings"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "purchases"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
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
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : listings?.items?.length === 0 ? (
            <div className="text-center py-12 bg-[var(--card)] rounded-lg border border-[var(--border)]">
              <FileText className="w-12 h-12 mx-auto text-[var(--muted)]" />
              <p className="mt-4 text-[var(--muted-foreground)]">No listings yet</p>
              <Link
                href="/marketplace/sell"
                className="mt-4 inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
              >
                <Plus className="w-4 h-4" />
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--secondary)]">
                    <th className="text-left px-4 py-3 text-sm font-medium text-[var(--muted-foreground)]">
                      Listing
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[var(--muted-foreground)]">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[var(--muted-foreground)]">
                      Sales
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[var(--muted-foreground)]">
                      Views
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[var(--muted-foreground)]">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[var(--muted-foreground)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {listings?.items?.map((listing) => (
                    <tr key={listing.id} className="hover:bg-[var(--secondary)]/50">
                      <td className="px-4 py-4">
                        <Link
                          href={`/marketplace/listing/${listing.id}`}
                          className="hover:text-[var(--primary)]"
                        >
                          <p className="font-medium text-[var(--foreground)]">{listing.title}</p>
                          <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {listing.report.appraisalRequest?.property?.city},{" "}
                            {listing.report.appraisalRequest?.property?.state}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-green-500">
                          ${Number(listing.price).toFixed(0)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[var(--foreground)]">{listing._count.purchases}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[var(--muted-foreground)]">{listing.viewCount}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            listing.status === "ACTIVE"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-[var(--muted)]/20 text-[var(--muted-foreground)]"
                          }`}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/marketplace/listing/${listing.id}`}
                          className="text-[var(--primary)] hover:underline text-sm"
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
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : purchases?.items?.length === 0 ? (
            <div className="text-center py-12 bg-[var(--card)] rounded-lg border border-[var(--border)]">
              <ShoppingCart className="w-12 h-12 mx-auto text-[var(--muted)]" />
              <p className="mt-4 text-[var(--muted-foreground)]">No purchases yet</p>
              <Link
                href="/marketplace"
                className="mt-4 inline-block text-[var(--primary)] hover:underline"
              >
                Browse the marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases?.items?.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-[var(--foreground)]">
                        {purchase.listing.title}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {purchase.listing.report.appraisalRequest?.property?.addressLine1},{" "}
                        {purchase.listing.report.appraisalRequest?.property?.city},{" "}
                        {purchase.listing.report.appraisalRequest?.property?.state}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Paid ${Number(purchase.price).toFixed(0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(purchase.purchasedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          Downloaded {purchase.downloadCount}x
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(purchase.id)}
                      disabled={downloadMutation.isPending}
                      className="px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm"
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
