"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Search,
  Building,
  Users,
  CreditCard,
  MoreVertical,
  ChevronRight,
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  X,
  AlertTriangle,
} from "lucide-react";

export default function OrganizationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState<string | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Fixed: Use nested router path - admin.organizations.list
  const { data: organizationsData, isLoading, refetch } = trpc.admin.organizations.list.useQuery({ limit: 50 });
  const organizations = organizationsData?.items;

  const updatePlan = trpc.admin.organizations.updatePlan.useMutation({
    onSuccess: () => {
      refetch();
      setShowPlanModal(null);
      toast({
        title: "Plan updated",
        description: "The organization plan has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan",
        variant: "destructive",
      });
    },
  });
  const suspend = trpc.admin.organizations.suspend.useMutation({
    onSuccess: () => {
      refetch();
      setShowSuspendModal(null);
      setSuspendReason("");
      toast({
        title: "Organization suspended",
        description: "The organization has been suspended successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend organization",
        variant: "destructive",
      });
    },
  });

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOrgs = organizations?.filter(
    (org) =>
      org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.billingEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subscriptionColors: Record<string, string> = {
    FREE_TRIAL: "bg-gray-500/20 text-gray-400",
    STARTER: "bg-gray-500/20 text-gray-400",
    PROFESSIONAL: "bg-blue-500/20 text-blue-400",
    ENTERPRISE: "bg-purple-500/20 text-purple-400",
  };

  const planPrices: Record<string, number> = {
    FREE_TRIAL: 0,
    STARTER: 0,
    PROFESSIONAL: 99,
    ENTERPRISE: 299,
  };

  // Calculate real stats
  const totalOrgs = organizations?.length || 0;
  const enterpriseCount = organizations?.filter((o) => o.plan === "ENTERPRISE").length || 0;
  const professionalCount = organizations?.filter((o) => o.plan === "PROFESSIONAL").length || 0;
  const monthlyRevenue = organizations?.reduce((sum, org) => {
    return sum + (planPrices[org.plan] || 0);
  }, 0) || 0;
  const totalUsers = organizations?.reduce((sum, org) => sum + (org._count?.users || 0), 0) || 0;
  const totalRequests = organizations?.reduce((sum, org) => sum + (org._count?.appraisalRequests || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Organizations</h1>
          <p className="text-[var(--muted-foreground)]">Manage client organizations and subscriptions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (!organizations || organizations.length === 0) {
                toast({
                  title: "No data to export",
                  description: "There are no organizations to export.",
                  variant: "destructive",
                });
                return;
              }
              const csvContent = [
                ["Name", "Email", "Plan", "Members", "Requests", "Created"].join(","),
                ...organizations.map(org => [
                  `"${org.name || ""}"`,
                  `"${org.billingEmail || ""}"`,
                  org.plan,
                  org._count?.users || 0,
                  org._count?.appraisalRequests || 0,
                  new Date(org.createdAt).toLocaleDateString(),
                ].join(","))
              ].join("\n");
              const blob = new Blob([csvContent], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `organizations-${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast({
                title: "Export complete",
                description: `Exported ${organizations.length} organizations to CSV.`,
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
                description: "Adding organizations manually is coming soon. Organizations are currently created through the signup flow.",
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Add Organization
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Total Organizations</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{totalOrgs}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{totalRequests} total requests</p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Paid Plans</p>
          <p className="text-2xl font-bold text-purple-400">{enterpriseCount + professionalCount}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{enterpriseCount} Enterprise, {professionalCount} Pro</p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Monthly Revenue</p>
          <p className="text-2xl font-bold text-green-400">${monthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-[var(--muted-foreground)]">from subscriptions</p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Total Users</p>
          <p className="text-2xl font-bold text-[var(--primary)]">{totalUsers}</p>
          <p className="text-xs text-[var(--muted-foreground)]">across all orgs</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
          />
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--secondary)] border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Members</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Subscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Requests</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[var(--muted-foreground)]">
                  Loading organizations...
                </td>
              </tr>
            ) : filteredOrgs?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[var(--muted-foreground)]">
                  No organizations found
                </td>
              </tr>
            ) : (
              filteredOrgs?.map((org) => (
                <tr key={org.id} className="hover:bg-[var(--secondary)]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{org.name}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">{org.billingEmail || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                      <Users className="w-4 h-4" />
                      <span>{org._count?.users || 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subscriptionColors[org.plan || "STARTER"]
                      }`}
                    >
                      {org.plan?.replace("_", " ") || "Starter"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-[var(--foreground)]">
                      {org._count?.appraisalRequests || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative" ref={activeMenu === org.id ? menuRef : null}>
                      <button
                        onClick={() => setActiveMenu(activeMenu === org.id ? null : org.id)}
                        className="p-2 hover:bg-[var(--muted)] rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4 text-[var(--muted-foreground)]" />
                      </button>
                      {activeMenu === org.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--border)] py-1 z-10">
                          <Link
                            href={`/admin/organizations/${org.id}`}
                            className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedPlan(org.plan);
                              setShowPlanModal(org.id);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                          >
                            Manage Subscription
                          </button>
                          <Link
                            href={`/admin/organizations/${org.id}?tab=payments`}
                            className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                          >
                            View Invoices
                          </Link>
                          <button
                            onClick={() => {
                              setShowSuspendModal(org.id);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                          >
                            Suspend Account
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Change Subscription Plan</h2>
              <button
                onClick={() => setShowPlanModal(null)}
                className="p-2 hover:bg-[var(--muted)] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {(["FREE_TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"] as const).map((plan) => (
                <button
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    selectedPlan === plan
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[var(--foreground)]">
                      {plan.replace("_", " ")}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      ${planPrices[plan]}/mo
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPlanModal(null)}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showPlanModal) {
                    updatePlan.mutate({
                      id: showPlanModal,
                      plan: selectedPlan as "FREE_TRIAL" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE"
                    });
                  }
                }}
                disabled={updatePlan.isPending}
                className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {updatePlan.isPending ? "Updating..." : "Update Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Suspend Organization</h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {organizations?.find(o => o.id === showSuspendModal)?.name}
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              This will suspend all users and cancel active jobs. The organization will not be able to
              access the platform.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Reason for suspension
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter reason..."
                rows={3}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuspendModal(null);
                  setSuspendReason("");
                }}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showSuspendModal) {
                    suspend.mutate({ id: showSuspendModal, reason: suspendReason });
                  }
                }}
                disabled={!suspendReason.trim() || suspend.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {suspend.isPending ? "Suspending..." : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
