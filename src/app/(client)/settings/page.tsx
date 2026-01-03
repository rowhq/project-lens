"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Bell,
  Shield,
  Key,
  Palette,
  Save,
  Camera,
  Mail,
  Building,
  MapPin,
  Loader2,
  Check,
  X,
  LogOut,
  Monitor,
  Users,
  Send,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/components/ui/Toast";

type SettingsTab =
  | "profile"
  | "notifications"
  | "security"
  | "preferences"
  | "team";

// Preferences stored in localStorage
interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  autoDownloadPdf: boolean;
  includeComparableSales: boolean;
  showRiskFlags: boolean;
}

const defaultPreferences: UserPreferences = {
  language: "en-US",
  timezone: "America/Chicago",
  dateFormat: "MM/DD/YYYY",
  currency: "USD",
  autoDownloadPdf: true,
  includeComparableSales: true,
  showRiskFlags: false,
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [profileDirty, setProfileDirty] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailReportReady: true,
    emailStatusUpdate: true,
    emailTeamActivity: true,
    emailBilling: true,
    emailMarketing: false,
    pushUrgent: true,
    pushReports: true,
  });
  const [notificationsDirty, setNotificationsDirty] = useState(false);

  // User preferences state (localStorage)
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);
  const [preferencesDirty, setPreferencesDirty] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Team invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");

  // tRPC queries and mutations
  const { data: userData, refetch: refetchUser } = trpc.user.me.useQuery();
  const { data: notifPrefs } = trpc.user.getNotificationPreferences.useQuery();
  const { data: teamStatus, refetch: refetchTeamStatus } =
    trpc.organization.teamStatus.useQuery();

  // Team invite mutation
  const inviteMember = trpc.organization.members.invite.useMutation({
    onSuccess: () => {
      toast.success("Invitation sent!", "Team member has been invited.");
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      refetchTeamStatus();
    },
    onError: (error) => {
      toast.error("Failed to send invitation", error.message);
    },
  });

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(
        "Profile updated",
        "Your profile has been saved successfully.",
      );
      setProfileDirty(false);
      refetchUser();
    },
    onError: (error) => {
      toast.error("Failed to update profile", error.message);
    },
  });

  const updateNotifications =
    trpc.user.updateNotificationPreferences.useMutation({
      onSuccess: () => {
        toast.success(
          "Preferences saved",
          "Your notification preferences have been updated.",
        );
        setNotificationsDirty(false);
      },
      onError: (error) => {
        toast.error("Failed to save preferences", error.message);
      },
    });

  const getAvatarUploadUrl = trpc.user.getAvatarUploadUrl.useMutation();
  const updateAvatarUrl = trpc.user.updateAvatarUrl.useMutation({
    onSuccess: () => {
      toast.success("Avatar updated", "Your profile photo has been updated.");
      refetchUser();
    },
    onError: (error) => {
      toast.error("Failed to update avatar", error.message);
    },
  });

  const changePassword = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      toast.success(
        "Password updated",
        "Your password has been changed successfully.",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast.error("Password change failed", error.message);
    },
  });

  // Initialize form values when user data loads
  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setJobTitle(userData.jobTitle || "");
      setLocation(userData.location || "");
    }
  }, [userData]);

  // Initialize notification preferences when data loads
  useEffect(() => {
    if (notifPrefs) {
      setNotificationPrefs({
        emailReportReady: notifPrefs.emailReportReady,
        emailStatusUpdate: notifPrefs.emailStatusUpdate,
        emailTeamActivity: notifPrefs.emailTeamActivity,
        emailBilling: notifPrefs.emailBilling,
        emailMarketing: notifPrefs.emailMarketing,
        pushUrgent: notifPrefs.pushUrgent,
        pushReports: notifPrefs.pushReports,
      });
    }
  }, [notifPrefs]);

  // Load user preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem("userPreferences");
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch {
        // Use defaults if parsing fails
      }
    }
  }, []);

  // Handle preferences change
  const handlePreferenceChange = (
    key: keyof UserPreferences,
    value: string | boolean,
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setPreferencesDirty(true);
  };

  // Save preferences to localStorage
  const handleSavePreferences = () => {
    setSavingPreferences(true);
    try {
      localStorage.setItem("userPreferences", JSON.stringify(preferences));
      toast.success(
        "Preferences saved",
        "Your preferences have been saved to this browser.",
      );
      setPreferencesDirty(false);
    } catch {
      toast.error(
        "Failed to save",
        "Could not save preferences. Please try again.",
      );
    } finally {
      setSavingPreferences(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "team", label: "Team", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Palette },
  ];

  // Handle team invite
  const handleInvite = () => {
    if (!inviteEmail || !inviteFirstName || !inviteLastName) return;
    inviteMember.mutate({
      email: inviteEmail,
      firstName: inviteFirstName,
      lastName: inviteLastName,
    });
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    updateProfile.mutate({
      firstName,
      lastName,
      jobTitle: jobTitle || null,
      location: location || null,
    });
  };

  // Handle notification preferences save
  const handleSaveNotifications = () => {
    updateNotifications.mutate(notificationPrefs);
  };

  // Handle notification toggle
  const handleNotificationToggle = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setNotificationsDirty(true);
  };

  // Handle avatar upload
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Invalid file type",
        "Please upload a JPEG, PNG, WebP, or GIF image.",
      );
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", "Please upload an image smaller than 2MB.");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Get presigned upload URL
      const { uploadUrl, publicUrl } = await getAvatarUploadUrl.mutateAsync({
        filename: file.name,
        contentType: file.type,
      });

      // Upload to R2/S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      // Update avatar URL in database
      await updateAvatarUrl.mutateAsync({ avatarUrl: publicUrl });
    } catch {
      toast.error(
        "Upload failed",
        "Failed to upload your profile photo. Please try again.",
      );
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(
        "Passwords don't match",
        "New password and confirmation must match.",
      );
      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        "Password too short",
        "Password must be at least 8 characters.",
      );
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Mark profile as dirty when fields change
  const handleProfileFieldChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
  ) => {
    setter(value);
    setProfileDirty(true);
  };

  // Get avatar URL from database
  const avatarUrl = userData?.avatarUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 clip-notch-sm text-left transition-colors font-mono text-sm ${
                    activeTab === tab.id
                      ? "bg-lime-400/10 text-lime-400 border border-lime-400/30"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">
                Profile Information
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        Upload Photo
                      </>
                    )}
                  </button>
                  <p className="text-sm text-gray-400 mt-1">
                    JPG, PNG, WebP, GIF up to 2MB
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) =>
                      handleProfileFieldChange(setFirstName, e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) =>
                      handleProfileFieldChange(setLastName, e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={session?.user?.email || ""}
                    disabled
                    className="w-full px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-800 text-gray-400 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    <Building className="w-4 h-4 inline mr-1" />
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) =>
                      handleProfileFieldChange(setJobTitle, e.target.value)
                    }
                    placeholder="Loan Officer"
                    className="w-full px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-white mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) =>
                      handleProfileFieldChange(setLocation, e.target.value)
                    }
                    placeholder="Austin, TX"
                    className="w-full px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800 flex items-center gap-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending || !profileDirty}
                  className="flex items-center gap-2 px-6 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                {profileDirty && (
                  <span className="text-sm text-gray-400">
                    You have unsaved changes
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div className="space-y-6">
              {/* Team Status */}
              <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-lime-400/10 clip-notch-sm flex items-center justify-center">
                    <Users className="w-6 h-6 text-lime-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Team Members
                    </h2>
                    <p className="text-sm text-gray-400">
                      {teamStatus?.activeMembers || 1} active member
                      {(teamStatus?.activeMembers || 1) !== 1 ? "s" : ""}
                      {teamStatus?.pendingInvitations
                        ? ` (${teamStatus.pendingInvitations} pending)`
                        : ""}
                    </p>
                  </div>
                </div>

                {/* Benefits of having a team */}
                <div className="mt-6 p-4 bg-lime-400/5 border border-lime-400/20 clip-notch-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-lime-400" />
                    <span className="font-medium text-white">
                      Why invite team members?
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-lime-400" />
                      Collaborate on property valuations
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-lime-400" />
                      Share reports across your organization
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-lime-400" />
                      Centralized billing and usage tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-lime-400" />
                      Role-based access control (Admin, Member)
                    </li>
                  </ul>
                </div>
              </div>

              {/* Invite Form */}
              <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <UserPlus className="w-5 h-5 text-lime-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Invite Team Member
                  </h2>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:border-lime-400/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={inviteFirstName}
                        onChange={(e) => setInviteFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:border-lime-400/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={inviteLastName}
                        onChange={(e) => setInviteLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:border-lime-400/50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleInvite}
                    disabled={
                      !inviteEmail ||
                      !inviteFirstName ||
                      !inviteLastName ||
                      inviteMember.isPending
                    }
                    className="flex items-center gap-2 px-6 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inviteMember.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Team Page Link (if team exists) */}
              {teamStatus?.showTeamPage && (
                <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
                  <p className="text-gray-400 mb-4">
                    Need to manage existing team members, change roles, or
                    remove members?
                  </p>
                  <a
                    href="/team"
                    className="inline-flex items-center gap-2 text-lime-400 hover:text-lime-300 font-mono text-sm uppercase tracking-wider"
                  >
                    <Users className="w-4 h-4" />
                    Go to Team Management
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">
                Notification Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-white mb-4">
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        id: "emailReportReady",
                        label: "Report ready",
                        desc: "When your appraisal report is complete",
                      },
                      {
                        id: "emailStatusUpdate",
                        label: "Status updates",
                        desc: "Changes to appraisal request status",
                      },
                      {
                        id: "emailTeamActivity",
                        label: "Team activity",
                        desc: "When team members join or leave",
                      },
                      {
                        id: "emailBilling",
                        label: "Billing",
                        desc: "Invoices and payment confirmations",
                      },
                      {
                        id: "emailMarketing",
                        label: "Product updates",
                        desc: "New features and improvements",
                      },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-gray-800 clip-notch-sm hover:bg-gray-800 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium text-white">{item.label}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={
                            notificationPrefs[
                              item.id as keyof typeof notificationPrefs
                            ]
                          }
                          onChange={() =>
                            handleNotificationToggle(
                              item.id as keyof typeof notificationPrefs,
                            )
                          }
                          className="w-5 h-5 text-lime-400 rounded focus:ring-[var(--primary)]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-white mb-4">
                    Push Notifications
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        id: "pushUrgent",
                        label: "Urgent updates",
                        desc: "Critical status changes",
                      },
                      {
                        id: "pushReports",
                        label: "Report completion",
                        desc: "When reports are ready",
                      },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-gray-800 clip-notch-sm hover:bg-gray-800 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium text-white">{item.label}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={
                            notificationPrefs[
                              item.id as keyof typeof notificationPrefs
                            ]
                          }
                          onChange={() =>
                            handleNotificationToggle(
                              item.id as keyof typeof notificationPrefs,
                            )
                          }
                          className="w-5 h-5 text-lime-400 rounded focus:ring-[var(--primary)]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800 flex items-center gap-4">
                <button
                  onClick={handleSaveNotifications}
                  disabled={
                    updateNotifications.isPending || !notificationsDirty
                  }
                  className="flex items-center gap-2 px-6 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateNotifications.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </>
                  )}
                </button>
                {notificationsDirty && (
                  <span className="text-sm text-gray-400">
                    You have unsaved changes
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-6">
                  Password
                </h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Must be at least 8 characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        Passwords do not match
                      </p>
                    )}
                    {confirmPassword &&
                      newPassword === confirmPassword &&
                      newPassword.length >= 8 && (
                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Passwords match
                        </p>
                      )}
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={
                      isChangingPassword ||
                      !currentPassword ||
                      !newPassword ||
                      newPassword !== confirmPassword ||
                      newPassword.length < 8
                    }
                    className="flex items-center gap-2 px-6 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Active Sessions
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-800 clip-notch-sm bg-green-500/5">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-white">
                          Current Session
                        </p>
                        <p className="text-sm text-gray-400">This device</p>
                      </div>
                    </div>
                    <span className="text-green-500 text-sm font-medium">
                      Active now
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="mt-4 text-red-500 hover:underline text-sm flex items-center gap-2"
                >
                  <LogOut className="w-3 h-3" />
                  Sign out
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="bg-gray-900 clip-notch border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">
                Preferences
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Language
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) =>
                      handlePreferenceChange("language", e.target.value)
                    }
                    className="w-full max-w-xs px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="es">Espanol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Timezone
                  </label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) =>
                      handlePreferenceChange("timezone", e.target.value)
                    }
                    className="w-full max-w-xs px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
                  >
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Los_Angeles">
                      Pacific Time (PT)
                    </option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Date Format
                  </label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) =>
                      handlePreferenceChange("dateFormat", e.target.value)
                    }
                    className="w-full max-w-xs px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Currency
                  </label>
                  <select
                    value={preferences.currency}
                    onChange={(e) =>
                      handlePreferenceChange("currency", e.target.value)
                    }
                    className="w-full max-w-xs px-4 py-2 border border-gray-700 clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
                  >
                    <option value="USD">USD ($)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <h3 className="font-medium text-white mb-4">
                    Default Report Settings
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.autoDownloadPdf}
                        onChange={(e) =>
                          handlePreferenceChange(
                            "autoDownloadPdf",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4 text-lime-400 rounded"
                      />
                      <span className="text-white">
                        Auto-download PDF when report is ready
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.includeComparableSales}
                        onChange={(e) =>
                          handlePreferenceChange(
                            "includeComparableSales",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4 text-lime-400 rounded"
                      />
                      <span className="text-white">
                        Include comparable sales in reports
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.showRiskFlags}
                        onChange={(e) =>
                          handlePreferenceChange(
                            "showRiskFlags",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4 text-lime-400 rounded"
                      />
                      <span className="text-white">
                        Show risk flags by default
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800 flex items-center gap-4">
                <button
                  onClick={handleSavePreferences}
                  disabled={savingPreferences || !preferencesDirty}
                  className="flex items-center gap-2 px-6 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPreferences ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </>
                  )}
                </button>
                {preferencesDirty && (
                  <span className="text-sm text-gray-400">
                    You have unsaved changes
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
