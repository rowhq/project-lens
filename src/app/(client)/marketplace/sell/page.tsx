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
  Loader2,
  CheckCircle,
  MapPin,
  Calendar,
  Upload,
  X,
  Layers,
  Droplets,
  Mountain,
  Building2,
} from "lucide-react";

const PROPERTY_CATEGORIES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  { value: "industrial", label: "Industrial" },
  { value: "multi-family", label: "Multi-Family" },
];

const STUDY_CATEGORIES = [
  { value: "APPRAISAL_REPORT", label: "Appraisal Report", icon: FileText },
  { value: "SOIL_STUDY", label: "Soil Study", icon: Layers },
  { value: "DRAINAGE_STUDY", label: "Drainage Study", icon: Droplets },
  { value: "CIVIL_ENGINEERING", label: "Civil Engineering", icon: Building2 },
  { value: "ENVIRONMENTAL", label: "Environmental", icon: Layers },
  { value: "GEOTECHNICAL", label: "Geotechnical", icon: Mountain },
  { value: "STRUCTURAL", label: "Structural", icon: Building2 },
  { value: "FLOOD_RISK", label: "Flood Risk", icon: Droplets },
  { value: "ZONING_ANALYSIS", label: "Zoning Analysis", icon: MapPin },
  { value: "SURVEY", label: "Survey", icon: MapPin },
  { value: "TITLE_REPORT", label: "Title Report", icon: FileText },
  { value: "OTHER", label: "Other", icon: FileText },
];

type ListingMode = "report" | "standalone";

export default function SellReportPage() {
  const router = useRouter();
  const [listingMode, setListingMode] = useState<ListingMode>("report");
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("residential");
  const [studyCategory, setStudyCategory] = useState("APPRAISAL_REPORT");
  const [price, setPrice] = useState("");

  // Location fields for standalone listings
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [state, setState] = useState("TX");
  const [zipCode, setZipCode] = useState("");

  // Document upload state
  const [uploadedDocs, setUploadedDocs] = useState<
    {
      title: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
    }[]
  >([]);
  const [uploading, setUploading] = useState(false);

  // Get completed appraisals that can be listed
  const { data: appraisals, isLoading: loadingAppraisals } =
    trpc.appraisal.list.useQuery({
      status: "READY",
      limit: 50,
    });

  const createListingMutation = trpc.marketplace.create.useMutation({
    onSuccess: (listing) => {
      router.push(`/marketplace/listing/${listing.id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (listingMode === "report" && !selectedReportId) return;
    if (listingMode === "standalone" && (!county || !city)) return;
    if (!title || !price) return;

    await createListingMutation.mutateAsync({
      reportId: listingMode === "report" ? selectedReportId : undefined,
      title,
      description: description || undefined,
      category,
      studyCategory: studyCategory as
        | "APPRAISAL_REPORT"
        | "SOIL_STUDY"
        | "DRAINAGE_STUDY"
        | "CIVIL_ENGINEERING"
        | "ENVIRONMENTAL"
        | "GEOTECHNICAL"
        | "STRUCTURAL"
        | "FLOOD_RISK"
        | "ZONING_ANALYSIS"
        | "SURVEY"
        | "TITLE_REPORT"
        | "OTHER",
      price: parseFloat(price),
      city: listingMode === "standalone" ? city : undefined,
      county: listingMode === "standalone" ? county : undefined,
      state: listingMode === "standalone" ? state : undefined,
      zipCode: listingMode === "standalone" ? zipCode : undefined,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    // For now, just simulate upload - in production this would upload to S3/Cloudflare
    for (const file of Array.from(files)) {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUploadedDocs((prev) => [
        ...prev,
        {
          title: file.name.replace(/\.[^/.]+$/, ""),
          fileName: file.name,
          fileUrl: URL.createObjectURL(file), // In production: actual S3 URL
          fileSize: file.size,
        },
      ]);
    }

    setUploading(false);
  };

  const removeDoc = (index: number) => {
    setUploadedDocs((prev) => prev.filter((_, i) => i !== index));
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
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Sell on Marketplace
        </h1>
        <p className="text-[var(--muted-foreground)]">
          List your appraisal reports or due diligence studies
        </p>
      </div>

      {/* Listing Mode Toggle */}
      <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
        <h2 className="font-semibold text-[var(--foreground)] mb-4">
          What are you selling?
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setListingMode("report")}
            className={`p-4 clip-notch-sm border text-left transition-colors ${
              listingMode === "report"
                ? "border-lime-400 bg-lime-400/5"
                : "border-gray-700 hover:border-lime-400/50"
            }`}
          >
            <FileText
              className={`w-6 h-6 mb-2 ${listingMode === "report" ? "text-lime-400" : "text-gray-400"}`}
            />
            <h3 className="font-medium text-white">Appraisal Report</h3>
            <p className="text-sm text-gray-400 mt-1">
              Sell a completed appraisal report from your account
            </p>
          </button>
          <button
            type="button"
            onClick={() => setListingMode("standalone")}
            className={`p-4 clip-notch-sm border text-left transition-colors ${
              listingMode === "standalone"
                ? "border-lime-400 bg-lime-400/5"
                : "border-gray-700 hover:border-lime-400/50"
            }`}
          >
            <Layers
              className={`w-6 h-6 mb-2 ${listingMode === "standalone" ? "text-lime-400" : "text-gray-400"}`}
            />
            <h3 className="font-medium text-white">Due Diligence Study</h3>
            <p className="text-sm text-gray-400 mt-1">
              Upload soil, drainage, engineering, or other studies
            </p>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select Report (only for report mode) */}
        {listingMode === "report" && (
          <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
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
                <p className="text-sm mt-1">
                  Complete an appraisal to list it on the marketplace
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {appraisals?.items
                  ?.filter((a) => a.report)
                  .map((appraisal) => (
                    <label
                      key={appraisal.id}
                      className={`block p-4 clip-notch-sm border cursor-pointer transition-colors ${
                        selectedReportId === appraisal.report?.id
                          ? "border-lime-400 bg-lime-400/5"
                          : "border-gray-800 hover:border-lime-400/50"
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
                            {appraisal.property.city},{" "}
                            {appraisal.property.state}
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
                          $
                          {Number(
                            appraisal.report?.valueEstimate || 0,
                          ).toLocaleString()}
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
        )}

        {/* Study Category & Location (for standalone mode) */}
        {listingMode === "standalone" && (
          <>
            <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
              <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Study Type
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {STUDY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setStudyCategory(cat.value)}
                    className={`p-3 clip-notch-sm border text-left transition-colors ${
                      studyCategory === cat.value
                        ? "border-lime-400 bg-lime-400/5"
                        : "border-gray-700 hover:border-lime-400/50"
                    }`}
                  >
                    <cat.icon
                      className={`w-4 h-4 mb-1 ${studyCategory === cat.value ? "text-lime-400" : "text-gray-400"}`}
                    />
                    <p className="text-sm font-medium text-white">
                      {cat.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
              <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Austin"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-lime-400/50"
                    required={listingMode === "standalone"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    County *
                  </label>
                  <input
                    type="text"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    placeholder="Travis"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-lime-400/50"
                    required={listingMode === "standalone"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="TX"
                    maxLength={2}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-lime-400/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="78701"
                    maxLength={10}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-lime-400/50"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
              <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Documents
              </h2>

              <div className="border-2 border-dashed border-gray-700 clip-notch-sm p-6 text-center hover:border-lime-400/50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 mx-auto text-lime-400 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  )}
                  <p className="mt-2 text-sm text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, XLS, XLSX (max 50MB each)
                  </p>
                </label>
              </div>

              {uploadedDocs.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedDocs.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800 clip-notch-sm"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-lime-400" />
                        <div>
                          <p className="text-sm text-white">{doc.fileName}</p>
                          <p className="text-xs text-gray-400">
                            {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDoc(index)}
                        className="p-1 text-gray-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Listing Details */}
        <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
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
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-lime-400/50"
                required
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {title.length}/200 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Property Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
              >
                {PROPERTY_CATEGORIES.map((cat) => (
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
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-lime-400/50 resize-none"
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {description.length}/2000 characters
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
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
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-lime-400/50"
                required
              />
            </div>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Suggested range: $50 - $200 based on report type and property
              value
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/marketplace"
            className="px-6 py-2.5 border border-gray-700 clip-notch text-white font-mono text-sm uppercase tracking-wider hover:bg-gray-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={
              (listingMode === "report" && !selectedReportId) ||
              (listingMode === "standalone" && (!county || !city)) ||
              !title ||
              !price ||
              createListingMutation.isPending
            }
            className="px-6 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          <div className="p-4 bg-red-500/10 border border-red-500/20 clip-notch text-red-500">
            {createListingMutation.error.message}
          </div>
        )}
      </form>
    </div>
  );
}
