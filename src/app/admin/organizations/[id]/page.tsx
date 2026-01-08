"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  ArrowLeft,
  Building,
  Users,
  CreditCard,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Edit,
  AlertTriangle,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
} from "lucide-react";

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orgId = params.id as string;

  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "payments" | "activity"
  >("overview");
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const { data, isLoading, refetch } =
    trpc.admin.organizations.getById.useQuery({ id: orgId });
  const updatePlan = trpc.admin.organizations.updatePlan.useMutation({
    onSuccess: () => {
      refetch();
      setShowPlanModal(false);
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
      setShowSuspendModal(false);
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
  const reactivate = trpc.admin.organizations.reactivate.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "Organization reactivated",
        description: "The organization has been reactivated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reactivate organization",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[var(--muted-foreground)]">
          Loading organization...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-[var(--muted-foreground)]">Organization not found</p>
        <Link
          href="/admin/organizations"
          className="text-[var(--primary)] hover:underline"
        >
          Back to organizations
        </Link>
      </div>
    );
  }

  const { org, recentAppraisals, payments, stats } = data;

  const planColors: Record<string, string> = {
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

  const isSuspended = org.users.some((u) => u.status === "SUSPENDED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2.5 hover:bg-[var(--muted)] rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {org.name}
              </h1>
              <p className="text-[var(--muted-foreground)]">
                {org.billingEmail || org.slug}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${planColors[org.plan]}`}
          >
            {org.plan.replace("_", " ")}
          </span>
          {isSuspended && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-400">
              Suspended
            </span>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Members</span>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {org.users.length}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            of {org.seats} seats
          </p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Requests</span>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {org._count.appraisalRequests}
          </p>
          <div className="flex items-center gap-1 text-xs">
            {stats.growthPercent >= 0 ? (
              <>
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400">+{stats.growthPercent}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-red-400">{stats.growthPercent}%</span>
              </>
            )}
            <span className="text-[var(--muted-foreground)]">
              vs last month
            </span>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Monthly Value</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            ${planPrices[org.plan]}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">subscription</p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Member Since</span>
          </div>
          <p className="text-lg font-bold text-[var(--foreground)]">
            {new Date(org.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {Math.floor(
              (new Date().getTime() - new Date(org.createdAt).getTime()) /
                (1000 * 60 * 60 * 24),
            )}{" "}
            days
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setSelectedPlan(org.plan);
            setShowPlanModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:opacity-90"
        >
          <CreditCard className="w-4 h-4" />
          Change Plan
        </button>
        {isSuspended ? (
          <button
            onClick={() => reactivate.mutate({ id: orgId })}
            disabled={reactivate.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {reactivate.isPending ? "Reactivating..." : "Reactivate"}
          </button>
        ) : (
          <button
            onClick={() => setShowSuspendModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/10"
          >
            <AlertTriangle className="w-4 h-4" />
            Suspend
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <nav className="flex gap-6">
          {[
            { id: "overview", label: "Overview" },
            { id: "members", label: "Members" },
            { id: "payments", label: "Payment History" },
            { id: "activity", label: "Recent Activity" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">
              Organization Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Billing Email
                  </p>
                  <p className="text-[var(--foreground)]">
                    {org.billingEmail || "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Phone
                  </p>
                  <p className="text-[var(--foreground)]">{org.phone || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Address
                  </p>
                  <p className="text-[var(--foreground)]">
                    {org.address || "-"}
                  </p>
                </div>
              </div>
              {org.stripeCustomerId && (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Stripe Customer
                    </p>
                    <p className="text-[var(--foreground)] font-mono text-sm">
                      {org.stripeCustomerId}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">
              Subscription
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Current Plan
                </p>
                <p className="text-xl font-bold text-[var(--foreground)]">
                  {org.plan.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Seats</p>
                <p className="text-[var(--foreground)]">
                  {org.users.length} / {org.seats} used
                </p>
              </div>
              {org.trialEndsAt && (
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Trial Ends
                  </p>
                  <p className="text-[var(--foreground)]">
                    {new Date(org.trialEndsAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
          <table className="w-full">
            <thead className="bg-[var(--secondary)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {org.users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--secondary)]">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-[var(--secondary)] rounded text-xs font-medium text-[var(--foreground)]">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "ACTIVE"
                          ? "bg-green-500/20 text-green-400"
                          : user.status === "SUSPENDED"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-[var(--muted-foreground)]">
              <CreditCard className="w-8 h-8 mx-auto mb-2" />
              <p>No payment history</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[var(--secondary)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[var(--secondary)]">
                    <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                      {new Date(payment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.type === "CHARGE"
                            ? "bg-blue-500/20 text-blue-400"
                            : payment.type === "REFUND"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {payment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                      ${Number(payment.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === "COMPLETED"
                            ? "bg-green-500/20 text-green-400"
                            : payment.status === "PENDING"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : payment.status === "FAILED"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      {payment.description || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h3 className="font-semibold text-[var(--foreground)]">
              Recent Appraisal Requests
            </h3>
          </div>
          {recentAppraisals.length === 0 ? (
            <div className="p-8 text-center text-[var(--muted-foreground)]">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <p>No appraisal requests yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[var(--secondary)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentAppraisals.map((request) => (
                  <tr key={request.id} className="hover:bg-[var(--secondary)]">
                    <td className="px-6 py-4 font-mono text-sm text-[var(--foreground)]">
                      {request.referenceCode.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-[var(--foreground)]">
                      {request.property.addressFull}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[var(--secondary)] rounded text-xs font-medium text-[var(--foreground)]">
                        {request.requestedType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === "READY"
                            ? "bg-green-500/20 text-green-400"
                            : request.status === "RUNNING"
                              ? "bg-blue-500/20 text-blue-400"
                              : request.status === "FAILED"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      {new Date(request.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Suspend Organization
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {org.name}
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              This will suspend all users and cancel active jobs. The
              organization will not be able to access the platform.
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
                onClick={() => setShowSuspendModal(false)}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  suspend.mutate({ id: orgId, reason: suspendReason })
                }
                disabled={!suspendReason.trim() || suspend.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {suspend.isPending ? "Suspending..." : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Change Subscription Plan
              </h2>
              <button
                onClick={() => setShowPlanModal(false)}
                className="p-2.5 hover:bg-[var(--muted)] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {["FREE_TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"].map(
                (plan) => (
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
                ),
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPlanModal(false)}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updatePlan.mutate({
                    id: orgId,
                    plan: selectedPlan as
                      | "FREE_TRIAL"
                      | "STARTER"
                      | "PROFESSIONAL"
                      | "ENTERPRISE",
                  })
                }
                disabled={selectedPlan === org.plan || updatePlan.isPending}
                className="flex-1 px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {updatePlan.isPending ? "Updating..." : "Update Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
