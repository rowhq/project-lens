"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
} from "lucide-react";

type DisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "ESCALATED"
  | "CLOSED"
  | "ALL";

export default function DisputesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<DisputeStatus>("ALL");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [pageLimit, setPageLimit] = useState(25);

  // Fixed: Use dispute.listAll for admin view - search moved to backend
  const {
    data: disputesData,
    isLoading,
    refetch,
  } = trpc.dispute.listAll.useQuery({
    limit: pageLimit,
    status:
      statusFilter === "ALL"
        ? undefined
        : (statusFilter as
            | "OPEN"
            | "UNDER_REVIEW"
            | "RESOLVED"
            | "ESCALATED"
            | "CLOSED"),
    search: debouncedSearchQuery || undefined,
  });
  const disputes = disputesData?.items;
  const hasMore = disputesData?.nextCursor !== undefined;

  const resolveDispute = trpc.dispute.resolve.useMutation({
    onSuccess: () => {
      refetch();
      setActiveMenu(null);
      toast({
        title: "Dispute resolved",
        description: "The dispute has been resolved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve dispute",
        variant: "destructive",
      });
    },
  });

  const statusConfig = {
    OPEN: {
      color: "bg-yellow-500/20 text-yellow-400",
      icon: AlertTriangle,
      label: "Open",
    },
    UNDER_REVIEW: {
      color: "bg-blue-500/20 text-blue-400",
      icon: Clock,
      label: "Under Review",
    },
    RESOLVED: {
      color: "bg-green-500/20 text-green-400",
      icon: CheckCircle,
      label: "Resolved",
    },
    ESCALATED: {
      color: "bg-orange-500/20 text-orange-400",
      icon: AlertTriangle,
      label: "Escalated",
    },
    CLOSED: {
      color: "bg-[var(--muted)] text-[var(--muted-foreground)]",
      icon: XCircle,
      label: "Closed",
    },
  };

  // Priority is 0-100 where lower = higher priority
  const getPriorityLabel = (priority: number | null) => {
    if (priority === null || priority === undefined)
      return {
        label: "Normal",
        color: "bg-[var(--muted)] text-[var(--muted-foreground)]",
      };
    if (priority <= 1)
      return { label: "Critical", color: "bg-red-500/20 text-red-400" };
    if (priority <= 3)
      return { label: "High", color: "bg-orange-500/20 text-orange-400" };
    if (priority <= 5)
      return { label: "Medium", color: "bg-yellow-500/20 text-yellow-400" };
    return {
      label: "Low",
      color: "bg-[var(--muted)] text-[var(--muted-foreground)]",
    };
  };

  // Filtering now done on backend via search parameter
  const filteredDisputes = disputes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Disputes
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Manage and resolve customer disputes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Total Disputes
          </p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {disputes?.length || 0}
          </p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Open</p>
          <p className="text-2xl font-bold text-yellow-400">
            {disputes?.filter((d) => d.status === "OPEN").length || 0}
          </p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Under Review</p>
          <p className="text-2xl font-bold text-blue-400">
            {disputes?.filter((d) => d.status === "UNDER_REVIEW").length || 0}
          </p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Avg Resolution Time
          </p>
          <p className="text-2xl font-bold text-green-400">
            {disputes?.filter((d) => d.status === "RESOLVED").length
              ? "< 3 days"
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search disputes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--muted-foreground)]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DisputeStatus)}
            className="border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] rounded-lg px-3 py-2"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--secondary)] border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Dispute
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Type
              </th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Status
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-[var(--muted-foreground)]"
                >
                  Loading disputes...
                </td>
              </tr>
            ) : filteredDisputes?.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-[var(--muted-foreground)]"
                >
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                  No disputes found
                </td>
              </tr>
            ) : (
              filteredDisputes?.map((dispute) => {
                const status =
                  statusConfig[dispute.status as keyof typeof statusConfig];
                const StatusIcon = status?.icon || AlertTriangle;
                return (
                  <tr key={dispute.id} className="hover:bg-[var(--secondary)]">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-[var(--foreground)] truncate">
                          {dispute.subject}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)] truncate">
                          {dispute.organization?.name}
                        </p>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {dispute.category?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4">
                      {(() => {
                        const priority = getPriorityLabel(dispute.priority);
                        return (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}
                          >
                            {priority.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status?.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status?.label}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      {new Date(dispute.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === dispute.id ? null : dispute.id,
                            )
                          }
                          className="p-2.5 hover:bg-[var(--secondary)] rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4 text-[var(--muted-foreground)]" />
                        </button>
                        {activeMenu === dispute.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--border)] py-1 z-10">
                            <Link
                              href={`/admin/disputes/${dispute.id}`}
                              className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                            >
                              View Details
                            </Link>
                            {(dispute.status === "OPEN" ||
                              dispute.status === "UNDER_REVIEW") && (
                              <>
                                <button
                                  onClick={() =>
                                    resolveDispute.mutate({
                                      disputeId: dispute.id,
                                      resolution:
                                        "Resolved in favor of customer",
                                    })
                                  }
                                  className="w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-green-500/10"
                                >
                                  Resolve
                                </button>
                              </>
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

      {/* Pagination */}
      {filteredDisputes && filteredDisputes.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <p className="text-sm text-[var(--muted-foreground)]">
            Showing {filteredDisputes.length} dispute
            {filteredDisputes.length !== 1 ? "s" : ""}
          </p>
          {hasMore && (
            <button
              onClick={() => setPageLimit((prev) => prev + 25)}
              className="px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
