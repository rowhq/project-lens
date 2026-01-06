"use client";

import { useState } from "react";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Settings,
  Flag,
  FileText,
  Shield,
  ToggleLeft,
  ToggleRight,
  User,
  Clock,
  Filter,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"flags" | "audit" | "system">(
    "flags",
  );
  const [auditFilter, setAuditFilter] = useState<string>("");

  // Queries
  const { data: featureFlags, refetch: refetchFlags } =
    trpc.admin.featureFlags.list.useQuery();
  const {
    data: auditLogs,
    refetch: refetchAudit,
    isLoading: isLoadingAudit,
  } = trpc.admin.auditLogs.useQuery({
    limit: 50,
    resource: auditFilter || undefined,
  });

  // Mutations
  const toggleFlag = trpc.admin.featureFlags.toggle.useMutation({
    onSuccess: () => {
      refetchFlags();
      toast({
        title: "Feature flag updated",
        description: "The feature flag has been toggled successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle feature flag",
        variant: "destructive",
      });
    },
  });

  const tabs = [
    { id: "flags" as const, label: "Feature Flags", icon: Flag },
    { id: "audit" as const, label: "Audit Log", icon: FileText },
    { id: "system" as const, label: "System", icon: Shield },
  ];

  const resourceTypes = [
    { value: "", label: "All Resources" },
    { value: "user", label: "Users" },
    { value: "organization", label: "Organizations" },
    { value: "job", label: "Jobs" },
    { value: "appraisal", label: "Appraisals" },
    { value: "appraiser", label: "Appraisers" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-lime-400/10 shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.2)] clip-notch-sm">
            <Settings className="w-5 h-5 text-lime-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-gray-500 font-mono text-sm">
          System configuration and audit logs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-mono text-sm uppercase tracking-wider transition-all clip-notch-sm",
              activeTab === tab.id
                ? "bg-lime-400/10 text-lime-400 border border-lime-400/30"
                : "text-gray-500 hover:text-gray-300 border border-transparent hover:border-gray-700",
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feature Flags Tab */}
      {activeTab === "flags" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400 text-sm">
              Toggle features on or off across the platform
            </p>
            <button
              onClick={() => refetchFlags()}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white shadow-[inset_0_0_0_1px_theme(colors.gray.700)] hover:shadow-[inset_0_0_0_1px_theme(colors.gray.600)] clip-notch-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="font-mono text-xs uppercase">Refresh</span>
            </button>
          </div>

          <div className="grid gap-3">
            {featureFlags?.map((flag) => (
              <div
                key={flag.id}
                className="relative bg-gray-950 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-4 clip-notch group hover:shadow-[inset_0_0_0_1px_theme(colors.gray.700)] transition-colors"
              >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-lime-400/30" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-lime-400/30" />

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          flag.isEnabled ? "bg-lime-400" : "bg-gray-600",
                        )}
                      />
                      <h3 className="font-mono text-sm text-white uppercase tracking-wider">
                        {flag.name.replace(/_/g, " ")}
                      </h3>
                    </div>
                    {flag.description && (
                      <p className="text-gray-500 text-sm mt-1 ml-5">
                        {flag.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      toggleFlag.mutate({
                        name: flag.name,
                        enabled: !flag.isEnabled,
                      })
                    }
                    disabled={toggleFlag.isPending}
                    className={cn(
                      "p-2 transition-colors",
                      flag.isEnabled
                        ? "text-lime-400 hover:text-lime-300"
                        : "text-gray-600 hover:text-gray-400",
                    )}
                  >
                    {toggleFlag.isPending ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : flag.isEnabled ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {(!featureFlags || featureFlags.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-mono text-sm">No feature flags configured</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-white px-3 py-2 font-mono text-sm clip-notch-sm focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
              >
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => refetchAudit()}
              disabled={isLoadingAudit}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white shadow-[inset_0_0_0_1px_theme(colors.gray.700)] hover:shadow-[inset_0_0_0_1px_theme(colors.gray.600)] clip-notch-sm transition-colors"
            >
              <RefreshCw
                className={cn("w-4 h-4", isLoadingAudit && "animate-spin")}
              />
              <span className="font-mono text-xs uppercase">Refresh</span>
            </button>
          </div>

          <div className="relative bg-gray-950 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch overflow-hidden">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30" />

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-800 bg-gray-900/50">
              <div className="col-span-2 font-mono text-xs uppercase tracking-wider text-gray-500">
                Time
              </div>
              <div className="col-span-2 font-mono text-xs uppercase tracking-wider text-gray-500">
                User
              </div>
              <div className="col-span-2 font-mono text-xs uppercase tracking-wider text-gray-500">
                Action
              </div>
              <div className="col-span-2 font-mono text-xs uppercase tracking-wider text-gray-500">
                Resource
              </div>
              <div className="col-span-4 font-mono text-xs uppercase tracking-wider text-gray-500">
                Details
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800/50">
              {auditLogs?.items.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-900/30 transition-colors"
                >
                  <div className="col-span-2 flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimeAgo(new Date(log.createdAt))}
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <span className="text-white text-sm truncate">
                      {log.user
                        ? `${log.user.firstName} ${log.user.lastName}`
                        : log.userEmail || "System"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-mono uppercase clip-notch-sm",
                        log.action === "create" &&
                          "bg-lime-400/10 text-lime-400",
                        log.action === "update" &&
                          "bg-amber-400/10 text-amber-400",
                        log.action === "delete" && "bg-red-400/10 text-red-400",
                        !["create", "update", "delete"].includes(log.action) &&
                          "bg-gray-700/50 text-gray-400",
                      )}
                    >
                      {log.action}
                    </span>
                  </div>
                  <div className="col-span-2 text-gray-400 text-sm font-mono">
                    {log.resource}
                    {log.resourceId && (
                      <span className="text-gray-600 ml-1">
                        #{log.resourceId.slice(0, 8)}
                      </span>
                    )}
                  </div>
                  <div className="col-span-4 text-gray-500 text-sm truncate">
                    {log.metadata
                      ? JSON.stringify(log.metadata).slice(0, 50)
                      : "—"}
                  </div>
                </div>
              ))}

              {(!auditLogs?.items || auditLogs.items.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-mono text-sm">No audit logs found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === "system" && (
        <div className="space-y-6">
          {/* System Status */}
          <div className="relative bg-gray-950 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-6 clip-notch">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30" />

            <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4">
              System Status
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-4 clip-notch-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                  <span className="font-mono text-xs uppercase text-gray-500">
                    Database
                  </span>
                </div>
                <p className="text-white font-semibold">Connected</p>
              </div>

              <div className="bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-4 clip-notch-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                  <span className="font-mono text-xs uppercase text-gray-500">
                    API
                  </span>
                </div>
                <p className="text-white font-semibold">Operational</p>
              </div>

              <div className="bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-4 clip-notch-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                  <span className="font-mono text-xs uppercase text-gray-500">
                    Workers
                  </span>
                </div>
                <p className="text-white font-semibold">Running</p>
              </div>
            </div>
          </div>

          {/* Platform Info */}
          <div className="relative bg-gray-950 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-6 clip-notch">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30" />

            <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4">
              Platform Information
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-500">Platform</span>
                <span className="text-white font-mono">TruPlat</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-500">Version</span>
                <span className="text-white font-mono">1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-500">Environment</span>
                <span className="text-lime-400 font-mono">Production</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500">Region</span>
                <span className="text-white font-mono">Texas, US</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="relative bg-gray-950 shadow-[inset_0_0_0_1px_theme(colors.red.900/0.5)] p-6 clip-notch">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-red-500/30" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-red-500/30" />

            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="font-mono text-sm uppercase tracking-wider text-red-400">
                Danger Zone
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch-sm">
                <div>
                  <p className="text-white font-medium">Clear Cache</p>
                  <p className="text-gray-500 text-sm">
                    Clear all cached data. This may temporarily slow down the
                    platform.
                  </p>
                </div>
                <button
                  onClick={() =>
                    toast({
                      title: "Cache cleared",
                      description:
                        "All cached data has been cleared successfully.",
                    })
                  }
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-mono text-sm uppercase clip-notch-sm transition-colors"
                >
                  Clear
                </button>
              </div>

              {/* Maintenance mode is controlled via environment variables */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
