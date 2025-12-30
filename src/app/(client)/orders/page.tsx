"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";
import { trpc } from "@/shared/lib/trpc";

type OrderStatus = "PENDING_DISPATCH" | "DISPATCHED" | "ACCEPTED" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "CANCELLED";

// Type for job with included relations
type JobWithRelations = {
  id: string;
  status: string;
  scope: string | null;
  createdAt: Date;
  slaDueAt: Date | null;
  property: {
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;
  assignedAppraiser: {
    firstName: string;
    lastName: string;
  } | null;
};

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING_DISPATCH: { label: "Pending", color: "bg-gray-500/20 text-gray-400", icon: Clock },
  DISPATCHED: { label: "Awaiting Appraiser", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  ACCEPTED: { label: "Accepted", color: "bg-blue-500/20 text-blue-400", icon: User },
  IN_PROGRESS: { label: "In Progress", color: "bg-purple-500/20 text-purple-400", icon: Clock },
  SUBMITTED: { label: "Review Pending", color: "bg-orange-500/20 text-orange-400", icon: AlertTriangle },
  COMPLETED: { label: "Completed", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-gray-500/20 text-gray-400", icon: AlertTriangle },
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get jobs for this organization
  const { data: jobs, isLoading } = trpc.job.listForOrganization.useQuery({
    limit: 50,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  // Cast to typed array with relations
  const jobItems = (jobs?.items ?? []) as unknown as JobWithRelations[];

  const filteredJobs = jobItems.filter((job) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      job.property?.addressLine1?.toLowerCase().includes(searchLower) ||
      job.property?.city?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Orders</h1>
          <p className="text-[var(--muted-foreground)]">Manage on-site inspection orders</p>
        </div>
        <Link
          href="/orders/new"
          className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary)]/90"
        >
          <Plus className="w-5 h-5" />
          New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="all">All Status</option>
          <option value="DISPATCHED">Awaiting Appraiser</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="SUBMITTED">Review Pending</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--muted-foreground)]">Loading orders...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-3" />
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">No orders yet</h3>
            <p className="text-[var(--muted-foreground)] mb-4">
              Create an order to schedule on-site property inspections.
            </p>
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)]/80"
            >
              Create your first order
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filteredJobs.map((job) => {
              const status = statusConfig[job.status as OrderStatus];
              const StatusIcon = status?.icon || Clock;

              return (
                <Link
                  key={job.id}
                  href={`/orders/${job.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[var(--secondary)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--muted)] rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[var(--muted-foreground)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {job.property?.addressLine1 || "Unknown Address"}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {job.property?.city}, {job.property?.state} {job.property?.zipCode}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <span>{job.scope?.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status?.color || "bg-gray-500/20 text-gray-400"}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status?.label || job.status}
                      </span>
                      {job.slaDueAt && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Due: {new Date(job.slaDueAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
