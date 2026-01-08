"use client";

/**
 * Request Appraisal - Mockup Version
 * Multi-step wizard for requesting property appraisals
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    price: 0,
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
    price: 149,
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
    price: 399,
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

// Mock search results
const MOCK_SEARCH_RESULTS = [
  {
    id: "1",
    address: "1847 Oak Avenue",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    county: "Travis",
  },
  {
    id: "2",
    address: "1850 Oak Street",
    city: "Austin",
    state: "TX",
    zipCode: "78702",
    county: "Travis",
  },
  {
    id: "3",
    address: "1855 Oak Lane",
    city: "Round Rock",
    state: "TX",
    zipCode: "78664",
    county: "Williamson",
  },
];

type SearchResult = (typeof MOCK_SEARCH_RESULTS)[0];

export default function NewAppraisalPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("property");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    addressQuery: "",
    selectedProperty: null as SearchResult | null,
    propertyType: "SINGLE_FAMILY",
    purpose: "",
    notes: "",
    loanNumber: "",
    borrowerName: "",
    reportType: "AI_REPORT",
  });

  const handleSearch = () => {
    if (formData.addressQuery.length < 3) return;

    setIsSearching(true);
    // Mock search delay
    setTimeout(() => {
      // Filter mock results based on query
      const filtered = MOCK_SEARCH_RESULTS.filter(
        (r) =>
          r.address
            .toLowerCase()
            .includes(formData.addressQuery.toLowerCase()) ||
          r.city.toLowerCase().includes(formData.addressQuery.toLowerCase()),
      );
      // If no matches, show all results as suggestions
      setSearchResults(filtered.length > 0 ? filtered : MOCK_SEARCH_RESULTS);
      setIsSearching(false);
    }, 500);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Mock submit delay
    setTimeout(() => {
      // Redirect to appraisals list with success message
      router.push("/appraisals?success=true");
    }, 1500);
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

  // For mockup - allow continuing even without data
  const canContinue = () => {
    if (currentStep === "property") {
      return (
        formData.selectedProperty !== null || formData.addressQuery.length >= 3
      );
    }
    return true; // Allow continuing on other steps
  };

  // Auto-create property from address query if none selected
  const ensureProperty = () => {
    if (!formData.selectedProperty && formData.addressQuery.length >= 3) {
      setFormData((prev) => ({
        ...prev,
        selectedProperty: {
          id: "custom",
          address: formData.addressQuery,
          city: "Austin",
          state: "TX",
          zipCode: "78701",
          county: "Travis",
        },
      }));
    }
  };

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
                <button
                  onClick={() => {
                    if (index <= currentStepIndex) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 clip-notch-sm font-mono text-sm uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-lime-400 text-black"
                      : isCompleted
                        ? "bg-lime-400/10 text-lime-400 border border-lime-400/30 hover:bg-lime-400/20"
                        : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  <span className="font-medium hidden sm:inline">
                    {step.label}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-8 md:w-12 h-0.5 bg-gray-700 mx-1 md:mx-2" />
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
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        addressQuery: e.target.value,
                        selectedProperty: null,
                      });
                      setSearchResults([]);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:border-lime-400/50"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching || formData.addressQuery.length < 3}
                  className="px-4 py-3 bg-lime-400 text-black clip-notch hover:bg-lime-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Type at least 3 characters and click search, or press Enter
              </p>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                  Select a property:
                </p>
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

            {(formData.selectedProperty ||
              formData.addressQuery.length >= 3) && (
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
                      {type.price === 0 ? "Free" : `$${type.price}`}
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
              <p className="text-white">
                {formData.selectedProperty?.address || formData.addressQuery}
              </p>
              <p className="text-sm text-gray-400">
                {formData.selectedProperty
                  ? `${formData.selectedProperty.city}, ${formData.selectedProperty.state} ${formData.selectedProperty.zipCode}`
                  : "Austin, TX 78701"}
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
                  <p className="text-white">{formData.purpose || "Purchase"}</p>
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
                    {selectedReportType?.price === 0
                      ? "Free"
                      : `$${selectedReportType?.price}`}
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
                ensureProperty();
                const nextIndex = currentStepIndex + 1;
                if (nextIndex < steps.length)
                  setCurrentStep(steps[nextIndex].id);
              }}
              disabled={!canContinue()}
              className="flex items-center gap-2 px-6 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:bg-gray-700 disabled:text-gray-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  {selectedReportType?.price === 0
                    ? "Generate Free Report"
                    : `Pay $${selectedReportType?.price}`}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
