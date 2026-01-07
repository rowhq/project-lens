"use client";

import { useState } from "react";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  User,
  Shield,
  MapPin,
  FileText,
  Star,
  Edit,
  Check,
  AlertCircle,
  Clock,
  Save,
  Info,
  Bell,
  BellOff,
  Loader2,
  Sun,
  SunMedium,
} from "lucide-react";
import { usePushNotifications } from "@/shared/hooks/use-push-notifications";
import { useHighContrastMode } from "@/shared/hooks/useHighContrastMode";
import { MapView } from "@/shared/components/common/MapView";

export default function AppraiserProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "license" | "service" | "notifications"
  >("profile");
  const pushNotifications = usePushNotifications();
  const highContrast = useHighContrastMode();

  // Form state for editable fields - null means use profile value
  const [editedCoverageRadius, setEditedCoverageRadius] = useState<
    number | null
  >(null);

  const { data: profile, refetch } = trpc.appraiser.profile.get.useQuery();

  // Use edited value if set, otherwise use profile value
  const coverageRadiusMiles =
    editedCoverageRadius ?? profile?.coverageRadiusMiles ?? 50;
  const setCoverageRadiusMiles = setEditedCoverageRadius;

  const updateProfile = trpc.appraiser.profile.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      setEditedCoverageRadius(null); // Reset to use profile value
      refetch();
      toast({
        title: "Profile updated",
        description: "Your service area has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const verificationStatus = profile?.verificationStatus || "PENDING";
  const statusConfig: Record<
    string,
    { color: string; icon: typeof Check; label: string }
  > = {
    VERIFIED: {
      color: "bg-green-500/20 text-green-400",
      icon: Check,
      label: "Verified",
    },
    PENDING: {
      color: "bg-yellow-500/20 text-yellow-400",
      icon: Clock,
      label: "Pending Review",
    },
    REJECTED: {
      color: "bg-red-500/20 text-red-400",
      icon: AlertCircle,
      label: "Needs Attention",
    },
  };

  const status = statusConfig[verificationStatus] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Profile
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Manage your appraiser profile and credentials
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
        >
          <Edit className="w-4 h-4" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden">
        {/* Cover */}
        <div className="h-24 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80" />

        {/* Avatar & Basic Info */}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12">
            <div className="relative">
              <div className="w-24 h-24 bg-[var(--muted)] rounded-full border-4 border-[var(--card)] flex items-center justify-center">
                <User className="w-10 h-10 text-[var(--muted-foreground)]" />
              </div>
              {/* Profile photo upload coming in a future update */}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  {profile?.user?.firstName} {profile?.user?.lastName}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)] mt-1">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {profile?.rating?.toFixed(1) || "5.0"} rating
                </span>
                <span>{profile?.completedJobs || 0} jobs completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <nav className="flex gap-6">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "license", label: "License", icon: Shield },
            { id: "service", label: "Service Area", icon: MapPin },
            { id: "notifications", label: "Notifications", icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          {/* Info notice */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300">
              Profile information is managed through your account settings. To
              update your name, email, or phone, please visit your account
              settings page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                First Name
              </label>
              <input
                type="text"
                value={profile?.user?.firstName || ""}
                disabled
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--secondary)] text-[var(--foreground)] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={profile?.user?.lastName || ""}
                disabled
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--secondary)] text-[var(--foreground)] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile?.user?.email || ""}
                disabled
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--secondary)] text-[var(--foreground)] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={profile?.user?.phone || ""}
                disabled
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--secondary)] text-[var(--foreground)] cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {/* License Tab */}
      {activeTab === "license" && (
        <div className="space-y-6">
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            {/* Info notice */}
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-300">
                License information is verified by our admin team. To update
                your license details, please contact support.
              </p>
            </div>

            <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--muted-foreground)]" />
              Appraiser License
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  value={profile?.licenseNumber || ""}
                  disabled
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--secondary)] text-[var(--foreground)] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  License State
                </label>
                <input
                  type="text"
                  value="TX"
                  disabled
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--secondary)] text-[var(--foreground)] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  License Level
                </label>
                <input
                  type="text"
                  value={
                    profile?.licenseType === "TRAINEE"
                      ? "Trainee"
                      : profile?.licenseType === "LICENSED"
                        ? "Licensed"
                        : profile?.licenseType === "CERTIFIED_RESIDENTIAL"
                          ? "Certified Residential"
                          : profile?.licenseType === "CERTIFIED_GENERAL"
                            ? "Certified General"
                            : profile?.licenseType || "N/A"
                  }
                  disabled
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--secondary)] text-[var(--foreground)] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Expiration Date
                </label>
                <input
                  type="text"
                  value={
                    profile?.licenseExpiry
                      ? new Date(profile.licenseExpiry).toLocaleDateString()
                      : "N/A"
                  }
                  disabled
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--secondary)] text-[var(--foreground)] cursor-not-allowed"
                />
              </div>
            </div>

            {profile?.verificationStatus === "VERIFIED" && (
              <div className="mt-6 p-4 bg-green-500/20 rounded-lg flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <p className="text-sm text-green-400">
                  <strong>Verified:</strong> Your license has been verified by
                  our admin team.
                </p>
              </div>
            )}
            {profile?.verificationStatus === "PENDING" && (
              <div className="mt-6 p-4 bg-yellow-500/20 rounded-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <p className="text-sm text-yellow-400">
                  <strong>Pending Review:</strong> Your license is being
                  verified by our admin team.
                </p>
              </div>
            )}
          </div>

          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--muted-foreground)]" />
              Bank Panel Memberships
            </h3>

            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Bank panel memberships will be displayed here once the feature is
              available.
            </p>
          </div>
        </div>
      )}

      {/* Service Area Tab */}
      {activeTab === "service" && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[var(--muted-foreground)]" />
            Service Area
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Base Location
              </label>
              <input
                type="text"
                value={
                  profile?.homeBaseLat && profile?.homeBaseLng
                    ? `${profile.homeBaseLat.toFixed(4)}, ${profile.homeBaseLng.toFixed(4)}`
                    : "Not set"
                }
                disabled
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--secondary)] text-[var(--foreground)] cursor-not-allowed"
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Location is set during license registration
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Service Radius
              </label>
              <select
                value={coverageRadiusMiles}
                onChange={(e) => setCoverageRadiusMiles(Number(e.target.value))}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-[var(--secondary)] disabled:cursor-not-allowed bg-[var(--card)] text-[var(--foreground)]"
              >
                <option value={5}>5 miles</option>
                <option value={10}>10 miles</option>
                <option value={25}>25 miles</option>
                <option value={50}>50 miles</option>
                <option value={75}>75 miles</option>
                <option value={100}>100 miles</option>
              </select>
            </div>

            {/* Service Area Map */}
            {profile?.homeBaseLat && profile?.homeBaseLng ? (
              <div className="h-64 rounded-lg overflow-hidden border border-[var(--border)]">
                <MapView
                  center={[profile.homeBaseLng, profile.homeBaseLat]}
                  zoom={9}
                  markers={[
                    {
                      id: "home-base",
                      longitude: profile.homeBaseLng,
                      latitude: profile.homeBaseLat,
                      label: "Home Base",
                      color: "#22c55e",
                      popup: `Coverage: ${coverageRadiusMiles} miles`,
                    },
                  ]}
                  interactive={false}
                  showNavigation={false}
                  showScale={true}
                />
              </div>
            ) : (
              <div className="h-64 bg-[var(--muted)] rounded-lg flex items-center justify-center">
                <p className="text-[var(--muted-foreground)]">
                  Set your location to view service area
                </p>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <button
                onClick={() => updateProfile.mutate({ coverageRadiusMiles })}
                disabled={updateProfile.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
            Push Notifications
          </h3>

          <div className="space-y-6">
            {/* Browser Support Check */}
            {!pushNotifications.isSupported && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-300 font-medium">
                    Browser Not Supported
                  </p>
                  <p className="text-sm text-yellow-300/80 mt-1">
                    Your browser doesn&apos;t support push notifications. Try
                    using Chrome, Firefox, or Edge for the best experience.
                  </p>
                </div>
              </div>
            )}

            {/* Notification Status */}
            {pushNotifications.isSupported && (
              <>
                <div className="p-4 bg-[var(--secondary)] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {pushNotifications.isSubscribed ? (
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-green-400" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center">
                          <BellOff className="w-5 h-5 text-[var(--muted-foreground)]" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {pushNotifications.isSubscribed
                            ? "Notifications Enabled"
                            : "Notifications Disabled"}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {pushNotifications.isSubscribed
                            ? "You'll receive alerts for new jobs in your area"
                            : "Enable to get notified about new appraisal jobs"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (pushNotifications.isSubscribed) {
                          pushNotifications.unsubscribe();
                        } else {
                          pushNotifications.subscribe();
                        }
                      }}
                      disabled={pushNotifications.isLoading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        pushNotifications.isSubscribed
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-[var(--primary)] text-black font-medium hover:bg-[var(--primary)]/90"
                      } disabled:opacity-50`}
                    >
                      {pushNotifications.isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : pushNotifications.isSubscribed ? (
                        <>
                          <BellOff className="w-4 h-4" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          Enable Notifications
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Permission Status */}
                {pushNotifications.permission === "denied" && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-300 font-medium">
                        Notifications Blocked
                      </p>
                      <p className="text-sm text-red-300/80 mt-1">
                        You&apos;ve blocked notifications in your browser. To
                        enable them, click the lock icon in your address bar and
                        allow notifications for this site.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {pushNotifications.error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-300 font-medium">Error</p>
                      <p className="text-sm text-red-300/80 mt-1">
                        {pushNotifications.error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Info about notifications */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-2">
                      What you&apos;ll be notified about:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-300/80">
                      <li>New appraisal jobs available in your service area</li>
                      <li>Job assignment confirmations</li>
                      <li>Important updates to your active jobs</li>
                      <li>Payment confirmations</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Display Settings */}
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-[var(--muted-foreground)]" />
              Display Settings
            </h3>

            <div className="p-4 bg-[var(--secondary)] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      highContrast.enabled
                        ? "bg-yellow-500/20"
                        : "bg-[var(--muted)]"
                    }`}
                  >
                    <SunMedium
                      className={`w-5 h-5 ${
                        highContrast.enabled
                          ? "text-yellow-400"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      High Contrast Mode
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Enhanced visibility for outdoor use and bright sunlight
                    </p>
                  </div>
                </div>
                <button
                  onClick={highContrast.toggle}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    highContrast.enabled ? "bg-yellow-500" : "bg-[var(--muted)]"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                      highContrast.enabled ? "translate-x-8" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {highContrast.enabled && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-300">
                  <strong>High Contrast Active:</strong> Colors and fonts are
                  optimized for outdoor visibility. Toggle off when indoors.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
