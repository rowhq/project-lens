"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  Clock,
  AlertCircle,
  Star,
  MapPin,
  ChevronRight,
  Download,
  Plus,
} from "lucide-react";
import { EmptyState } from "@/shared/components/common/EmptyState";

type VerificationStatus = "PENDING" | "VERIFIED" | "EXPIRED" | "REVOKED" | "ALL";

export default function AppraisersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus>("ALL");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Fixed: Use nested router path - admin.appraisers.list
  const { data: appraisersData, isLoading, refetch } = trpc.admin.appraisers.list.useQuery({
    limit: 50,
    status: statusFilter === "ALL" ? undefined : (statusFilter as "PENDING" | "VERIFIED" | "EXPIRED" | "REVOKED"),
  });
  const appraisers = appraisersData?.items;

  // Fixed: Use appraiser.license.verify for status updates
  const updateStatus = trpc.appraiser.license.verify.useMutation({
    onSuccess: () => {
      refetch();
      setActiveMenu(null);
      toast({
        title: "Status updated",
        description: "The appraiser status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update appraiser status",
        variant: "destructive",
      });
    },
  });

  const suspendAppraiser = trpc.admin.appraisers.suspend.useMutation({
    onSuccess: () => {
      refetch();
      setActiveMenu(null);
      toast({
        title: "Appraiser suspended",
        description: "The appraiser has been suspended successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend appraiser",
        variant: "destructive",
      });
    },
  });

  const reactivateAppraiser = trpc.admin.appraisers.reactivate.useMutation({
    onSuccess: () => {
      refetch();
      setActiveMenu(null);
      toast({
        title: "Appraiser reactivated",
        description: "The appraiser has been reactivated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reactivate appraiser",
        variant: "destructive",
      });
    },
  });

  const statusConfig = {
    PENDING: { color: "bg-yellow-500/20 text-yellow-400", icon: Clock, label: "Pending" },
    VERIFIED: { color: "bg-green-500/20 text-green-400", icon: UserCheck, label: "Verified" },
    EXPIRED: { color: "bg-orange-500/20 text-orange-400", icon: Clock, label: "Expired" },
    REVOKED: { color: "bg-red-500/20 text-red-400", icon: AlertCircle, label: "Revoked" },
  };

  const filteredAppraisers = appraisers?.filter(
    (a) =>
      a.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Appraisers</h1>
          <p className="text-[var(--muted-foreground)]">Manage appraiser profiles and verification</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (!appraisers || appraisers.length === 0) {
                toast({
                  title: "No data to export",
                  description: "There are no appraisers to export.",
                  variant: "destructive",
                });
                return;
              }
              const csvContent = [
                ["Name", "Email", "License Number", "License State", "Status", "Rating", "Jobs"].join(","),
                ...appraisers.map(a => [
                  `"${a.user?.firstName || ""} ${a.user?.lastName || ""}"`,
                  `"${a.user?.email || ""}"`,
                  `"${a.licenseNumber || ""}"`,
                  a.licenseState || "",
                  a.verificationStatus,
                  a.rating?.toFixed(1) || "N/A",
                  a.completedJobs || 0,
                ].join(","))
              ].join("\n");
              const blob = new Blob([csvContent], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `appraisers-${new Date().toISOString().split("T")[0]}.csv`;
              link.click();
              URL.revokeObjectURL(url);
              toast({
                title: "Export complete",
                description: `Exported ${appraisers.length} appraisers to CSV.`,
              });
            }}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => {
              toast({
                title: "Feature in development",
                description: "Adding appraisers manually is coming soon. Appraisers are currently created through the signup flow.",
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Add Appraiser
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Total Appraisers</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{appraisers?.length || 0}</p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Verified</p>
          <p className="text-2xl font-bold text-green-400">
            {appraisers?.filter((a) => a.verificationStatus === "VERIFIED").length || 0}
          </p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-400">
            {appraisers?.filter((a) => a.verificationStatus === "PENDING").length || 0}
          </p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Avg Rating</p>
          <p className="text-2xl font-bold text-[var(--primary)]">
            {appraisers?.length ? (appraisers.reduce((sum, a) => sum + (a.rating || 0), 0) / appraisers.length).toFixed(1) : "0.0"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by name, email, or license..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--muted-foreground)]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VerificationStatus)}
            className="border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--background)] text-[var(--foreground)]"
          >
            <option value="ALL">All Status</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {/* Appraisers Table */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-[var(--secondary)] border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Appraiser</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">License</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Stats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[var(--muted-foreground)]">
                  Loading appraisers...
                </td>
              </tr>
            ) : filteredAppraisers?.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={UserCheck}
                    title="No appraisers found"
                    description={searchQuery ? "Try adjusting your search or filters" : "Appraisers will appear here once they complete onboarding"}
                  />
                </td>
              </tr>
            ) : (
              filteredAppraisers?.map((appraiser) => {
                const status = statusConfig[appraiser.verificationStatus as keyof typeof statusConfig];
                const StatusIcon = status?.icon || Clock;
                return (
                  <tr key={appraiser.userId} className="hover:bg-[var(--secondary)]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--muted)] rounded-full flex items-center justify-center">
                          <span className="font-medium text-[var(--muted-foreground)]">
                            {appraiser.user?.firstName?.[0]}
                            {appraiser.user?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {appraiser.user?.firstName} {appraiser.user?.lastName}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">{appraiser.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-[var(--foreground)]">{appraiser.licenseNumber || "-"}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {appraiser.licenseType?.replace("_", " ")} • {appraiser.licenseState}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                        <MapPin className="w-4 h-4" />
                        {appraiser.coverageRadiusMiles} mile radius
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {appraiser.rating?.toFixed(1) || "5.0"}
                        </span>
                        <span className="text-[var(--muted-foreground)]">
                          {appraiser.completedJobs || 0} jobs
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === appraiser.userId ? null : appraiser.userId)}
                          className="p-2 hover:bg-[var(--muted)] rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4 text-[var(--muted-foreground)]" />
                        </button>
                        {activeMenu === appraiser.userId && (
                          <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--border)] py-1 z-10">
                            <Link
                              href={`/admin/appraisers/${appraiser.userId}`}
                              className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                            >
                              View Details
                            </Link>
                            {appraiser.verificationStatus === "PENDING" && (
                              <>
                                <button
                                  onClick={() =>
                                    updateStatus.mutate({
                                      userId: appraiser.userId,
                                      action: "APPROVE",
                                    })
                                  }
                                  className="w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-green-500/10"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    updateStatus.mutate({
                                      userId: appraiser.userId,
                                      action: "REJECT",
                                    })
                                  }
                                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {appraiser.user?.status === "ACTIVE" ? (
                              <button
                                onClick={() => {
                                  suspendAppraiser.mutate({
                                    userId: appraiser.userId,
                                    reason: "Suspended by admin",
                                  });
                                }}
                                disabled={suspendAppraiser.isPending}
                                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                              >
                                {suspendAppraiser.isPending ? "Suspending..." : "Suspend"}
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  reactivateAppraiser.mutate({
                                    userId: appraiser.userId,
                                  });
                                }}
                                disabled={reactivateAppraiser.isPending}
                                className="w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-green-500/10 disabled:opacity-50"
                              >
                                {reactivateAppraiser.isPending ? "Reactivating..." : "Reactivate"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
