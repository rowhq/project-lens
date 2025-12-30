"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  FileCheck,
  MapPin,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/shared/lib/trpc";
import { Button } from "@/shared/components/ui/Button";

type Step = "personal" | "license" | "coverage" | "banking";

const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "personal", label: "Personal Info", icon: <User className="w-5 h-5" /> },
  { id: "license", label: "License", icon: <FileCheck className="w-5 h-5" /> },
  { id: "coverage", label: "Coverage", icon: <MapPin className="w-5 h-5" /> },
  { id: "banking", label: "Banking", icon: <CreditCard className="w-5 h-5" /> },
];

const texasCities = [
  "Houston", "San Antonio", "Dallas", "Austin", "Fort Worth",
  "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo",
  "Lubbock", "Irving", "Garland", "Amarillo", "Grand Prairie",
  "McKinney", "Frisco", "Brownsville", "Killeen", "Pasadena",
];

const licenseTypes = [
  { value: "TRAINEE", label: "Trainee Appraiser" },
  { value: "LICENSED", label: "Licensed Appraiser" },
  { value: "CERTIFIED_RESIDENTIAL", label: "Certified Residential" },
  { value: "CERTIFIED_GENERAL", label: "Certified General" },
] as const;

export default function AppraiserOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Info
    phone: "",
    bio: "",
    yearsExperience: 0,

    // License
    licenseType: "LICENSED" as "TRAINEE" | "LICENSED" | "CERTIFIED_RESIDENTIAL" | "CERTIFIED_GENERAL",
    licenseNumber: "",
    licenseExpiry: "",
    licenseFileUrl: "",

    // Coverage
    homeBaseAddress: "",
    homeBaseLat: 29.7604, // Default to Houston
    homeBaseLng: -95.3698,
    coverageRadiusMiles: 25,
    servicedCities: [] as string[],
  });

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [profileCreated, setProfileCreated] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  // Get upload URL for license
  const getUploadUrl = trpc.appraiser.license.getUploadUrl.useMutation();

  // Submit license to create profile
  const submitLicense = trpc.appraiser.license.submit.useMutation({
    onSuccess: () => {
      setProfileCreated(true);
      setCurrentStep("banking");
    },
    onError: (err) => {
      setError(err.message);
      setIsSubmitting(false);
    },
  });

  // Get Stripe Connect onboarding URL
  const getStripeUrl = trpc.billing.payout.setupLink.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const toggleCity = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      servicedCities: prev.servicedCities.includes(city)
        ? prev.servicedCities.filter((c) => c !== city)
        : [...prev.servicedCities, city],
    }));
  };

  const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    setLicenseFile(file);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Get presigned upload URL from server
      const uploadData = await getUploadUrl.mutateAsync({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // Upload file directly to storage using presigned URL
      setUploadProgress(10);

      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      setUploadProgress(100);
      handleInputChange("licenseFileUrl", uploadData.publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Failed to upload file. Please try again.");
      setUploadProgress(0);
      setLicenseFile(null);
    }
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case "personal":
        if (!formData.phone) {
          setError("Phone number is required");
          return false;
        }
        if (formData.yearsExperience < 0) {
          setError("Years of experience must be 0 or more");
          return false;
        }
        return true;

      case "license":
        if (!formData.licenseNumber) {
          setError("License number is required");
          return false;
        }
        if (!formData.licenseExpiry) {
          setError("License expiry date is required");
          return false;
        }
        return true;

      case "coverage":
        if (!formData.homeBaseAddress) {
          setError("Home base address is required");
          return false;
        }
        if (formData.servicedCities.length === 0) {
          setError("Select at least one service area");
          return false;
        }
        return true;

      case "banking":
        return true;

      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (!validateStep()) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleSubmitProfile = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await submitLicense.mutateAsync({
        licenseType: formData.licenseType,
        licenseNumber: formData.licenseNumber,
        licenseExpiry: formData.licenseExpiry,
        licenseFileUrl: formData.licenseFileUrl || undefined,
        homeBaseLat: formData.homeBaseLat,
        homeBaseLng: formData.homeBaseLng,
        coverageRadiusMiles: formData.coverageRadiusMiles,
      });
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectStripe = () => {
    getStripeUrl.mutate();
  };

  const handleComplete = () => {
    router.push("/appraiser/jobs?onboarding=complete");
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--secondary)] py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Appraiser Onboarding</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Complete your profile to start accepting jobs</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      isActive ? "font-medium text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      index < currentStepIndex ? "bg-green-500" : "bg-[var(--muted)]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          {/* Step 1: Personal Info */}
          {currentStep === "personal" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Personal Information</h2>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">
                  Tell us about yourself and your experience
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 555-5555"
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--card)] text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsExperience}
                  onChange={(e) =>
                    handleInputChange("yearsExperience", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--card)] text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Professional Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={4}
                  placeholder="Tell clients about your background and expertise..."
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--card)] text-[var(--foreground)]"
                />
              </div>
            </div>
          )}

          {/* Step 2: License */}
          {currentStep === "license" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">License Information</h2>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">
                  Provide your real estate appraiser license details
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  License Type *
                </label>
                <select
                  value={formData.licenseType}
                  onChange={(e) => handleInputChange("licenseType", e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--card)] text-[var(--foreground)]"
                >
                  {licenseTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  License Number *
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  placeholder="TX-12345"
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--card)] text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  License Expiry Date *
                </label>
                <input
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={(e) => handleInputChange("licenseExpiry", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--card)] text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Upload License Document
                </label>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${
                  uploadError ? "border-red-500" : "border-[var(--border)]"
                }`}>
                  <div className="space-y-1 text-center">
                    {uploadError ? (
                      <div className="flex flex-col items-center gap-2 text-red-400">
                        <AlertCircle className="w-8 h-8" />
                        <span>{uploadError}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadError(null);
                            setLicenseFile(null);
                          }}
                          className="text-sm underline hover:no-underline"
                        >
                          Try again
                        </button>
                      </div>
                    ) : formData.licenseFileUrl ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <Check className="w-5 h-5" />
                        <span>License uploaded successfully</span>
                      </div>
                    ) : uploadProgress > 0 && uploadProgress < 100 ? (
                      <div className="w-full">
                        <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--primary)] transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] mt-2">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-[var(--muted-foreground)]" />
                        <div className="flex text-sm text-[var(--muted-foreground)]">
                          <label className="relative cursor-pointer bg-[var(--card)] rounded-md font-medium text-[var(--primary)] hover:text-[var(--primary)]/80">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleLicenseUpload}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">PDF, JPG, or PNG up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Coverage */}
          {currentStep === "coverage" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Service Coverage</h2>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">
                  Define your service area and coverage radius
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Home Base Address *
                </label>
                <input
                  type="text"
                  value={formData.homeBaseAddress}
                  onChange={(e) => handleInputChange("homeBaseAddress", e.target.value)}
                  placeholder="Enter your home base address"
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--card)] text-[var(--foreground)]"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Jobs will be matched based on distance from this location
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Coverage Radius (miles)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={formData.coverageRadiusMiles}
                    onChange={(e) =>
                      handleInputChange("coverageRadiusMiles", parseInt(e.target.value))
                    }
                    className="flex-1"
                  />
                  <span className="text-lg font-medium text-[var(--foreground)] w-16 text-right">
                    {formData.coverageRadiusMiles} mi
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Serviced Cities *
                </label>
                <p className="text-xs text-[var(--muted-foreground)] mb-3">
                  Select the Texas cities you can service
                </p>
                <div className="flex flex-wrap gap-2">
                  {texasCities.map((city) => {
                    const isSelected = formData.servicedCities.includes(city);
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => toggleCity(city)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-[var(--primary)]/20 text-[var(--primary)] border-2 border-[var(--primary)]"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)] border-2 border-transparent hover:bg-[var(--secondary)]"
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  {formData.servicedCities.length} cities selected
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Banking */}
          {currentStep === "banking" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Banking & Payouts</h2>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">
                  Connect your bank account to receive payouts
                </p>
              </div>

              {profileCreated && (
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-3 mb-4">
                  <Check className="w-5 h-5 text-green-400" />
                  <p className="text-green-400">Profile submitted for verification!</p>
                </div>
              )}

              <div className="p-6 bg-[var(--secondary)] rounded-lg border border-[var(--border)] text-center">
                <CreditCard className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                <h3 className="font-medium text-[var(--foreground)] mb-2">Secure Payments via Stripe</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  We use Stripe Connect for secure, fast payouts directly to your bank account.
                  Your banking information is never stored on our servers.
                </p>

                {stripeConnected ? (
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span>Bank account connected</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleConnectStripe}
                    disabled={getStripeUrl.isPending || !profileCreated}
                    className="w-full max-w-xs"
                  >
                    {getStripeUrl.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect Bank Account"
                    )}
                  </Button>
                )}

                {!profileCreated && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">
                    Submit your profile first to enable bank connection
                  </p>
                )}
              </div>

              <div className="p-4 bg-[var(--primary)]/20 rounded-lg border border-[var(--primary)]/30">
                <h4 className="font-medium text-[var(--primary)] mb-2">What happens next?</h4>
                <ul className="text-sm text-[var(--primary)]/80 space-y-1">
                  <li>1. Your application will be reviewed within 24-48 hours</li>
                  <li>2. We&apos;ll verify your license with the state board</li>
                  <li>3. Once approved, you&apos;ll receive job notifications</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goBack}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep === "coverage" ? (
            <Button
              onClick={handleSubmitProfile}
              disabled={isSubmitting || submitLicense.isPending}
              className="px-8"
            >
              {isSubmitting || submitLicense.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Profile"
              )}
            </Button>
          ) : currentStep === "banking" ? (
            <Button onClick={handleComplete} className="px-8">
              Go to Dashboard
            </Button>
          ) : (
            <Button onClick={goToNextStep}>
              Continue
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
