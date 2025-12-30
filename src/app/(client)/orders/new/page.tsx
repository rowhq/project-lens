"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Check,
  ChevronRight,
  ChevronLeft,
  Home,
  Camera,
  FileText,
  Clock,
  DollarSign,
  User,
  Phone,
  Loader2,
} from "lucide-react";
import { trpc } from "@/shared/lib/trpc";
import { MapView } from "@/shared/components/common/MapView";

type ScopePreset = "EXTERIOR_ONLY" | "INTERIOR_EXTERIOR" | "COMPREHENSIVE" | "FULL_CERTIFIED" | "RUSH_INSPECTION";

const scopePresets: { value: ScopePreset; label: string; description: string; price: number; photos: number; sla: string }[] = [
  {
    value: "EXTERIOR_ONLY",
    label: "Exterior Only",
    description: "Exterior photos, curb appeal assessment",
    price: 99,
    photos: 10,
    sla: "48 hours",
  },
  {
    value: "INTERIOR_EXTERIOR",
    label: "Interior + Exterior",
    description: "Full property walkthrough with detailed photos",
    price: 199,
    photos: 25,
    sla: "72 hours",
  },
  {
    value: "COMPREHENSIVE",
    label: "Comprehensive",
    description: "Complete inspection with measurements and condition notes",
    price: 349,
    photos: 50,
    sla: "5 days",
  },
  {
    value: "FULL_CERTIFIED",
    label: "Full Certified Appraisal",
    description: "USPAP-compliant certified appraisal report",
    price: 549,
    photos: 50,
    sla: "7 days",
  },
  {
    value: "RUSH_INSPECTION",
    label: "Rush Inspection",
    description: "Priority scheduling, expedited report",
    price: 299,
    photos: 25,
    sla: "24 hours",
  },
];

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [addressQuery, setAddressQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<{
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [scopePreset, setScopePreset] = useState<ScopePreset>("INTERIOR_EXTERIOR");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [accessNotes, setAccessNotes] = useState("");

  // Property search
  const { data: searchResults } = trpc.property.search.useQuery(
    { query: addressQuery, limit: 5 },
    { enabled: addressQuery.length >= 3 }
  );

  // Create order mutation
  const createOrder = trpc.job.createOrder.useMutation({
    onSuccess: (data) => {
      router.push(`/orders/${data.id}`);
    },
    onError: (error) => {
      setIsSubmitting(false);
      alert(error.message);
    },
  });

  const handlePropertySelect = (result: {
    id?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  }) => {
    setSelectedProperty({
      address: result.address,
      city: result.city,
      state: result.state,
      zipCode: result.zipCode,
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setAddressQuery(result.address);
  };

  const handleSubmit = () => {
    if (!selectedProperty) return;

    setIsSubmitting(true);
    createOrder.mutate({
      address: selectedProperty.address,
      city: selectedProperty.city,
      state: selectedProperty.state,
      zipCode: selectedProperty.zipCode,
      latitude: selectedProperty.latitude,
      longitude: selectedProperty.longitude,
      scopePreset,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      scheduledTime,
      contactName,
      contactPhone,
      accessNotes,
    });
  };

  const selectedScope = scopePresets.find((s) => s.value === scopePreset)!;

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedProperty;
      case 2: return !!scopePreset;
      case 3: return true; // Scheduling is optional
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {["Property", "Scope", "Schedule", "Review"].map((label, index) => {
          const stepNum = index + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;

          return (
            <div key={label} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span className={`ml-2 text-sm ${isActive ? "font-medium text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                  {label}
                </span>
              </div>
              {index < 3 && (
                <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)] mx-4" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        {/* Step 1: Property */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Select Property</h2>
            <p className="text-[var(--muted-foreground)] mb-6">Enter the property address for inspection</p>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                placeholder="Enter property address..."
                className="w-full pl-10 pr-4 py-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Search Results */}
            {searchResults && searchResults.length > 0 && !selectedProperty && (
              <div className="mt-2 border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)]">
                {searchResults.map((result, index) => (
                  <button
                    key={result.id || index}
                    onClick={() => handlePropertySelect(result)}
                    className="w-full px-4 py-3 text-left hover:bg-[var(--secondary)] border-b border-[var(--border)] last:border-0 transition-colors"
                  >
                    <p className="font-medium text-[var(--foreground)]">{result.address}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {result.city}, {result.state} {result.zipCode}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Property with Map */}
            {selectedProperty && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-[var(--primary)]/10 rounded-lg border border-[var(--primary)]/30">
                  <div className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-[var(--primary)] mt-0.5" />
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{selectedProperty.address}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProperty(null);
                      setAddressQuery("");
                    }}
                    className="mt-2 text-sm text-[var(--primary)] hover:underline"
                  >
                    Change property
                  </button>
                </div>

                {/* Property Location Map */}
                <div className="rounded-lg overflow-hidden border border-[var(--border)]">
                  <MapView
                    center={[selectedProperty.longitude, selectedProperty.latitude]}
                    zoom={16}
                    markers={[{
                      id: "selected-property",
                      latitude: selectedProperty.latitude,
                      longitude: selectedProperty.longitude,
                      label: selectedProperty.address,
                      popup: `<strong>${selectedProperty.address}</strong><br/>${selectedProperty.city}, ${selectedProperty.state} ${selectedProperty.zipCode}`,
                    }]}
                    showBaseLayerSwitcher
                    defaultBaseLayer="dark"
                    style={{ height: 250 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Scope */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Select Inspection Scope</h2>
            <p className="text-[var(--muted-foreground)] mb-6">Choose the type of inspection you need</p>

            <div className="space-y-3">
              {scopePresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setScopePreset(preset.value)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    scopePreset === preset.value
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{preset.label}</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{preset.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          {preset.photos} photos
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {preset.sla}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[var(--foreground)]">${preset.price}</p>
                      {scopePreset === preset.value && (
                        <Check className="w-5 h-5 text-[var(--primary)] ml-auto mt-1" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Schedule & Contact</h2>
            <p className="text-[var(--muted-foreground)] mb-6">Set preferred appointment time and property contact</p>

            <div className="space-y-6">
              {/* Scheduling */}
              <div>
                <h3 className="font-medium text-[var(--foreground)] mb-3">Preferred Appointment (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--muted-foreground)] mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--muted-foreground)] mb-1">Time</label>
                    <select
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="">Flexible</option>
                      <option value="morning">Morning (8am - 12pm)</option>
                      <option value="afternoon">Afternoon (12pm - 5pm)</option>
                      <option value="evening">Evening (5pm - 8pm)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Property Contact */}
              <div>
                <h3 className="font-medium text-[var(--foreground)] mb-3">Property Contact (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--muted-foreground)] mb-1">Contact Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Property owner or tenant"
                        className="w-full pl-10 pr-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--muted-foreground)] mb-1">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="(555) 555-5555"
                        className="w-full pl-10 pr-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Notes */}
              <div>
                <h3 className="font-medium text-[var(--foreground)] mb-3">Access Notes (Optional)</h3>
                <textarea
                  value={accessNotes}
                  onChange={(e) => setAccessNotes(e.target.value)}
                  placeholder="Gate code, parking instructions, etc."
                  rows={3}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Review Order</h2>
            <p className="text-[var(--muted-foreground)] mb-6">Confirm your order details</p>

            <div className="space-y-6">
              {/* Property Summary */}
              <div className="p-4 bg-[var(--secondary)] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="text-sm font-medium text-[var(--muted-foreground)]">Property</span>
                </div>
                <p className="font-medium text-[var(--foreground)]">{selectedProperty?.address}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {selectedProperty?.city}, {selectedProperty?.state} {selectedProperty?.zipCode}
                </p>
              </div>

              {/* Scope Summary */}
              <div className="p-4 bg-[var(--secondary)] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="text-sm font-medium text-[var(--muted-foreground)]">Inspection Scope</span>
                </div>
                <p className="font-medium text-[var(--foreground)]">{selectedScope.label}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{selectedScope.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-[var(--muted-foreground)]">
                  <span>{selectedScope.photos} photos</span>
                  <span>SLA: {selectedScope.sla}</span>
                </div>
              </div>

              {/* Schedule Summary */}
              {(scheduledDate || contactName) && (
                <div className="p-4 bg-[var(--secondary)] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Schedule & Contact</span>
                  </div>
                  {scheduledDate && (
                    <p className="text-[var(--foreground)]">
                      {new Date(scheduledDate).toLocaleDateString()}
                      {scheduledTime && ` - ${scheduledTime}`}
                    </p>
                  )}
                  {contactName && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      Contact: {contactName} {contactPhone && `(${contactPhone})`}
                    </p>
                  )}
                </div>
              )}

              {/* Price Summary */}
              <div className="p-4 bg-[var(--primary)]/10 rounded-lg border border-[var(--primary)]/30">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--foreground)]">Total</span>
                  <span className="text-2xl font-bold text-[var(--foreground)]">
                    ${selectedScope.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 disabled:bg-[var(--muted)] disabled:text-[var(--muted-foreground)] disabled:cursor-not-allowed transition-colors"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 disabled:bg-[var(--primary)]/50 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Order...
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5" />
                Place Order (${selectedScope.price})
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
