"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/shared/lib/trpc";
import { PRICING } from "@/shared/config/constants";
import {
  MapPin,
  FileText,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  Home,
  Building,
  Building2,
  Warehouse,
  Mountain,
  Loader2,
} from "lucide-react";

type Step = "property" | "details" | "type" | "review";

const propertyTypes = [
  { id: "SINGLE_FAMILY", label: "Single Family", icon: Home },
  { id: "CONDO", label: "Condo", icon: Building },
  { id: "TOWNHOUSE", label: "Townhouse", icon: Building2 },
  { id: "MULTI_FAMILY", label: "Multi-Family", icon: Building2 },
  { id: "COMMERCIAL", label: "Commercial", icon: Warehouse },
  { id: "LAND", label: "Land", icon: Mountain },
];

const reportTypes = [
  {
    id: "AI_REPORT",
    label: "AI Report",
    description:
      "Instant automated valuation using AI and comparable sales data",
    price: PRICING.AI_REPORT,
    time: "5 minutes",
    features: [
      "Comparable sales analysis",
      "AI-powered insights",
      "Market trends",
      "Risk assessment",
    ],
  },
  {
    id: "ON_SITE",
    label: "On-Site Verification",
    description: "AI report enhanced with property photos and inspection notes",
    price: PRICING.ON_SITE,
    time: "48 hours",
    features: [
      "Everything in AI Report",
      "Property photos",
      "Condition assessment",
      "Field notes",
    ],
  },
  {
    id: "CERTIFIED",
    label: "Certified Appraisal",
    description: "Full USPAP-compliant appraisal signed by licensed appraiser",
    price: PRICING.CERTIFIED,
    time: "72 hours",
    features: [
      "Everything in On-Site",
      "Licensed appraiser review",
      "Digital signature",
      "Bank-ready",
    ],
  },
];

const purposes = [
  "Purchase",
  "Refinance",
  "Home Equity",
  "Listing/Sale",
  "Estate Planning",
  "Tax Appeal",
  "Divorce Settlement",
  "Insurance",
  "Other",
];

export default function NewAppraisalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>("property");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [prefilledFromMap, setPrefilledFromMap] = useState(false);

  const [formData, setFormData] = useState({
    // Property
    addressQuery: "",
    selectedProperty: null as (typeof searchResults)[0] | null,
    propertyType: "SINGLE_FAMILY",

    // Details
    purpose: "",
    notes: "",
    loanNumber: "",
    borrowerName: "",

    // Type
    reportType: "AI_REPORT",
  });

  // Pre-populate form from URL query params (from map page)
  useEffect(() => {
    if (prefilledFromMap) return;

    const address = searchParams.get("address");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const zipCode = searchParams.get("zipCode");
    const type = searchParams.get("type");

    // Only address is required - the rest is optional
    if (address) {
      const prefilledProperty = {
        id: `prefilled-${Date.now()}`,
        address,
        city: city || "",
        state: state || "TX",
        zipCode: zipCode || "",
        county: "",
        latitude: 0,
        longitude: 0,
      };

      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          addressQuery: address,
          selectedProperty: prefilledProperty,
          reportType: type === "CERTIFIED" ? "CERTIFIED" : "AI_REPORT",
        }));
        setPrefilledFromMap(true);
        // Skip to details step since we already have the property
        setCurrentStep("details");
      }, 0);
    }
  }, [searchParams, prefilledFromMap]);

  // Check if Stripe is configured
  const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  const createWithCheckout = trpc.appraisal.createWithCheckout.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Fallback if no checkout URL (shouldn't happen)
        router.push(`/appraisals/${data.appraisalId}`);
      }
    },
  });

  // Development checkout - bypasses Stripe
  const devCheckout = trpc.appraisal.devCheckout.useMutation({
    onSuccess: (data) => {
      // Redirect to appraisal page with success indicator
      router.push(`/appraisals/${data.appraisalId}?payment=success`);
    },
  });

  // Real address search using Mapbox via property.search API
  const searchAddresses = trpc.property.search.useQuery(
    { query: formData.addressQuery, limit: 5 },
    {
      enabled: formData.addressQuery.length >= 5 && searchEnabled,
      staleTime: 30000, // Cache results for 30 seconds
    },
  );

  // Derive search results directly from query data
  const searchResults = useMemo(() => {
    if (!searchAddresses.data) return [];
    return searchAddresses.data.map((r) => ({
      id: r.id,
      address: r.address,
      city: r.city,
      state: r.state,
      zipCode: r.zipCode,
      county: r.county,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  }, [searchAddresses.data]);

  const isSearching = searchEnabled && searchAddresses.isLoading;

  const handleSearch = () => {
    if (formData.addressQuery.length < 5) return;
    setSearchEnabled(true);
  };

  const handleSubmit = () => {
    if (!formData.selectedProperty) return;

    // Map report types to API expected values
    const reportTypeMap: Record<
      string,
      "AI_REPORT" | "AI_REPORT_WITH_ONSITE" | "CERTIFIED_APPRAISAL"
    > = {
      AI_REPORT: "AI_REPORT",
      ON_SITE: "AI_REPORT_WITH_ONSITE",
      CERTIFIED: "CERTIFIED_APPRAISAL",
    };

    const commonData = {
      propertyAddress: formData.selectedProperty.address,
      propertyCity: formData.selectedProperty.city,
      propertyState: formData.selectedProperty.state,
      propertyZipCode: formData.selectedProperty.zipCode,
      propertyType: formData.propertyType as
        | "SINGLE_FAMILY"
        | "MULTI_FAMILY"
        | "CONDO"
        | "TOWNHOUSE"
        | "COMMERCIAL"
        | "LAND"
        | "MIXED_USE",
      purpose: formData.purpose,
      requestedType: reportTypeMap[formData.reportType] || "AI_REPORT",
      notes: formData.notes
        ? `${formData.notes}\nLoan: ${formData.loanNumber || "N/A"}\nBorrower: ${formData.borrowerName || "N/A"}`
        : undefined,
    };

    // Use devCheckout if Stripe is not configured (development mode)
    if (!isStripeConfigured) {
      devCheckout.mutate({
        ...commonData,
        propertyCounty: formData.selectedProperty.county,
      });
    } else {
      createWithCheckout.mutate(commonData);
    }
  };

  const steps: { id: Step; label: string; icon: typeof MapPin }[] = [
    { id: "property", label: "Property", icon: MapPin },
    { id: "details", label: "Details", icon: FileText },
    { id: "type", label: "Report Type", icon: FileText },
    { id: "review", label: "Review", icon: Check },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const selectedReportType = reportTypes.find(
    (t) => t.id === formData.reportType,
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Request Appraisal</h1>
        <p className="text-gray-400">Get a property valuation in minutes</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 clip-notch-sm font-mono text-sm uppercase tracking-wider ${
                    isActive
                      ? "bg-lime-400 text-black"
                      : isCompleted
                        ? "bg-lime-400/10 text-lime-400 border border-lime-400/30"
                        : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  <span className="font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-12 h-0.5 bg-gray-700 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="relative bg-gray-900 clip-notch border border-gray-800 p-6">
        <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-lime-400" />
        {/* Property Step */}
        {currentStep === "property" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-gray-400 mb-2">
                Property Address
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Enter property address..."
                    value={formData.addressQuery}
                    onChange={(e) =>
                      setFormData({ ...formData, addressQuery: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:border-lime-400/50"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching || formData.addressQuery.length < 5}
                  className="px-4 py-3 bg-lime-400 text-black clip-notch hover:bg-lime-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() =>
                      setFormData({ ...formData, selectedProperty: result })
                    }
                    className={`w-full text-left p-4 border clip-notch-sm transition-colors ${
                      formData.selectedProperty?.id === result.id
                        ? "border-lime-400 bg-lime-400/5"
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <p className="font-medium text-white">{result.address}</p>
                    <p className="text-sm text-gray-400">
                      {result.city}, {result.state} {result.zipCode}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {formData.selectedProperty && (
              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-gray-400 mb-2">
                  Property Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {propertyTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() =>
                          setFormData({ ...formData, propertyType: type.id })
                        }
                        className={`p-4 border clip-notch text-center transition-colors ${
                          formData.propertyType === type.id
                            ? "border-lime-400 bg-lime-400/5 text-lime-400"
                            : "border-gray-700 hover:border-gray-600 text-gray-300"
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Details Step */}
        {currentStep === "details" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-gray-400 mb-2">
                Purpose of Appraisal
              </label>
              <select
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
              >
                <option value="">Select purpose...</option>
                {purposes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-gray-400 mb-2">
                Loan Number (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter loan number..."
                value={formData.loanNumber}
                onChange={(e) =>
                  setFormData({ ...formData, loanNumber: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-gray-400 mb-2">
                Borrower Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter borrower name..."
                value={formData.borrowerName}
                onChange={(e) =>
                  setFormData({ ...formData, borrowerName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-gray-400 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                placeholder="Any special instructions or notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:border-lime-400/50 resize-none"
              />
            </div>
          </div>
        )}

        {/* Type Step */}
        {currentStep === "type" && (
          <div className="space-y-4">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() =>
                  setFormData({ ...formData, reportType: type.id })
                }
                className={`w-full text-left p-6 border clip-notch transition-colors ${
                  formData.reportType === type.id
                    ? "border-lime-400 bg-lime-400/5"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{type.label}</h3>
                    <p className="text-sm text-gray-400">{type.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-lime-400">
                      ${type.price}
                    </p>
                    <p className="text-sm text-gray-500">{type.time}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {type.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-gray-800 text-gray-300 text-xs font-mono clip-notch-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Review Step */}
        {currentStep === "review" && (
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 clip-notch">
              <h3 className="font-semibold text-white mb-3 font-mono uppercase tracking-wider text-sm">
                Property
              </h3>
              <p className="text-white">{formData.selectedProperty?.address}</p>
              <p className="text-sm text-gray-400">
                {formData.selectedProperty?.city},{" "}
                {formData.selectedProperty?.state}{" "}
                {formData.selectedProperty?.zipCode}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Type:{" "}
                {
                  propertyTypes.find((t) => t.id === formData.propertyType)
                    ?.label
                }
              </p>
            </div>

            <div className="bg-gray-800 p-4 clip-notch">
              <h3 className="font-semibold text-white mb-3 font-mono uppercase tracking-wider text-sm">
                Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-mono uppercase tracking-wider text-xs">
                    Purpose
                  </p>
                  <p className="text-white">{formData.purpose || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-mono uppercase tracking-wider text-xs">
                    Loan Number
                  </p>
                  <p className="text-white">{formData.loanNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-mono uppercase tracking-wider text-xs">
                    Borrower
                  </p>
                  <p className="text-white">{formData.borrowerName || "-"}</p>
                </div>
              </div>
              {formData.notes && (
                <div className="mt-4">
                  <p className="text-gray-500 text-xs font-mono uppercase tracking-wider">
                    Notes
                  </p>
                  <p className="text-white text-sm">{formData.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-lime-400/10 p-4 clip-notch border border-lime-400/30">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-white">
                    {selectedReportType?.label}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {selectedReportType?.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-lime-400">
                    ${selectedReportType?.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    Delivery: {selectedReportType?.time}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
          <button
            onClick={() => {
              const prevIndex = currentStepIndex - 1;
              if (prevIndex >= 0) setCurrentStep(steps[prevIndex].id);
            }}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white disabled:opacity-50 font-mono text-sm uppercase tracking-wider"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep !== "review" ? (
            <button
              onClick={() => {
                const nextIndex = currentStepIndex + 1;
                if (nextIndex < steps.length)
                  setCurrentStep(steps[nextIndex].id);
              }}
              disabled={
                (currentStep === "property" && !formData.selectedProperty) ||
                (currentStep === "details" && !formData.purpose)
              }
              className="flex items-center gap-2 px-6 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={createWithCheckout.isPending || devCheckout.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:bg-gray-700 disabled:text-gray-500"
            >
              {createWithCheckout.isPending || devCheckout.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isStripeConfigured
                    ? "Redirecting to checkout..."
                    : "Processing..."}
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  {isStripeConfigured
                    ? `Proceed to Payment $${selectedReportType?.price}`
                    : `Process (Dev Mode) $${selectedReportType?.price}`}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
