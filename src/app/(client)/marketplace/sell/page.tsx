"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Tag,
  AlignLeft,
  Loader2,
  CheckCircle,
  MapPin,
  Calendar,
} from "lucide-react";

const CATEGORIES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  { value: "industrial", label: "Industrial" },
  { value: "multi-family", label: "Multi-Family" },
];

export default function SellReportPage() {
  const router = useRouter();
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("residential");
  const [price, setPrice] = useState("");

  // Get completed appraisals that can be listed
  const { data: appraisals, isLoading: loadingAppraisals } = trpc.appraisal.list.useQuery({
    status: "READY",
    limit: 50,
  });

  const createListingMutation = trpc.marketplace.create.useMutation({
    onSuccess: (listing) => {
      router.push(`/marketplace/listing/${listing.id}`);
    },
  });

  const selectedAppraisal = appraisals?.items?.find(
    (a) => a.report?.id === selectedReportId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReportId || !title || !price) return;

    await createListingMutation.mutateAsync({
      reportId: selectedReportId,
      title,
      description: description || undefined,
      category,
      price: parseFloat(price),
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Sell a Report</h1>
        <p className="text-[var(--muted-foreground)]">
          List your completed appraisal report on the marketplace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select Report */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Select Report
          </h2>

          {loadingAppraisals ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
            </div>
          ) : appraisals?.items?.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted-foreground)]">
              <FileText className="w-12 h-12 mx-auto mb-2 text-[var(--muted)]" />
              <p>No completed reports available</p>
              <p className="text-sm mt-1">Complete an appraisal to list it on the marketplace</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {appraisals?.items?.filter((a) => a.report).map((appraisal) => (
                <label
                  key={appraisal.id}
                  className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedReportId === appraisal.report?.id
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="report"
                    value={appraisal.report?.id}
                    checked={selectedReportId === appraisal.report?.id}
                    onChange={(e) => setSelectedReportId(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {appraisal.property.addressLine1}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {appraisal.property.city}, {appraisal.property.state}
                      </p>
                    </div>
                    <div className="text-right">
                      {selectedReportId === appraisal.report?.id && (
                        <CheckCircle className="w-5 h-5 text-[var(--primary)]" />
                      )}
                      <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(appraisal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="text-green-500 font-medium">
                      ${Number(appraisal.report?.valueEstimate || 0).toLocaleString()}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      {appraisal.requestedType.replace(/_/g, " ")}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Listing Details */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Listing Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Detailed Residential Appraisal - Austin Downtown"
                maxLength={200}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {title.length}/200 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what's included in this report..."
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {description.length}/2000 characters
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing
          </h2>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Price *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="75"
                min="1"
                max="10000"
                step="1"
                className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              />
            </div>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Suggested range: $50 - $200 based on report type and property value
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/marketplace"
            className="px-6 py-2 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--secondary)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!selectedReportId || !title || !price || createListingMutation.isPending}
            className="px-6 py-2 bg-[var(--primary)] text-black font-medium rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {createListingMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Listing"
            )}
          </button>
        </div>

        {createListingMutation.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {createListingMutation.error.message}
          </div>
        )}
      </form>
    </div>
  );
}
