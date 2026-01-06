"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Download,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  Skeleton,
  SkeletonStats,
  SkeletonTable,
} from "@/shared/components/ui/Skeleton";
import { useToast } from "@/shared/components/ui/Toast";

// Match Prisma AppraisalStatus enum
type AppraisalStatus =
  | "DRAFT"
  | "QUEUED"
  | "RUNNING"
  | "READY"
  | "FAILED"
  | "EXPIRED";

const statusConfig: Record<
  AppraisalStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  DRAFT: {
    label: "Draft",
    color: "bg-gray-500/20 text-gray-400",
    icon: FileText,
  },
  QUEUED: {
    label: "Queued",
    color: "bg-yellow-500/20 text-yellow-400",
    icon: Clock,
  },
  RUNNING: {
    label: "Processing",
    color: "bg-blue-500/20 text-blue-400",
    icon: Clock,
  },
  READY: {
    label: "Ready",
    color: "bg-green-500/20 text-green-400",
    icon: CheckCircle,
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-500/20 text-red-400",
    icon: AlertCircle,
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-gray-500/20 text-gray-400",
    icon: AlertCircle,
  },
};

export default function AppraisalsPage() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppraisalStatus | "ALL">(
    "ALL",
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { data: appraisals, isLoading } = trpc.appraisal.list.useQuery({
    limit: 50,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const downloadMutation = trpc.report.download.useMutation({
    onSuccess: (data) => {
      // Open PDF in new tab
      window.open(data.url, "_blank");
      setDownloadingId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to download PDF");
      setDownloadingId(null);
    },
  });

  const deleteMutation = trpc.appraisal.delete.useMutation({
    onSuccess: () => {
      toast.success("Appraisal deleted successfully");
      utils.appraisal.list.invalidate();
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete appraisal");
      setDeletingId(null);
    },
  });

  const bulkDeleteMutation = trpc.appraisal.bulkDelete.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Deleted ${data.softDeleted + data.hardDeleted} appraisal${data.total > 1 ? "s" : ""} successfully`,
      );
      utils.appraisal.list.invalidate();
      setSelectedIds(new Set());
      setIsBulkDeleting(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete appraisals");
      setIsBulkDeleting(false);
    },
  });

  const handleDownload = (reportId: string) => {
    setDownloadingId(reportId);
    downloadMutation.mutate({ reportId });
  };

  const handleDelete = (appraisalId: string, referenceCode: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete appraisal ${referenceCode}? This action cannot be undone.`,
      )
    ) {
      setDeletingId(appraisalId);
      deleteMutation.mutate({ id: appraisalId });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.size} appraisal${selectedIds.size > 1 ? "s" : ""}? This action cannot be undone.`,
      )
    ) {
      setIsBulkDeleting(true);
      bulkDeleteMutation.mutate({ ids: Array.from(selectedIds) });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredAppraisals) {
      setSelectedIds(new Set(filteredAppraisals.map((a) => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const filteredAppraisals = appraisals?.items.filter(
    (a) =>
      a.property?.addressFull
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      a.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const allSelected =
    filteredAppraisals &&
    filteredAppraisals.length > 0 &&
    filteredAppraisals.every((a) => selectedIds.has(a.id));
  const someSelected = selectedIds.size > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Appraisals
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Manage your property valuation requests
          </p>
        </div>
        <Link
          href="/appraisals/new"
          className="flex items-center gap-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider px-5 py-3 clip-notch hover:bg-lime-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Appraisal
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by address or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] clip-notch bg-gray-900 text-white font-mono text-sm focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--muted-foreground)]" />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as AppraisalStatus | "ALL")
            }
            className="shadow-[inset_0_0_0_1px_theme(colors.gray.700)] clip-notch-sm px-4 py-2.5 bg-gray-900 text-white font-mono text-sm focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="QUEUED">Queued</option>
            <option value="RUNNING">Processing</option>
            <option value="READY">Ready</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        {someSelected && (
          <button
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 shadow-[inset_0_0_0_1px_theme(colors.red.500/0.3)] text-red-400 font-mono text-sm uppercase tracking-wider clip-notch hover:bg-red-500/30 disabled:opacity-50"
          >
            {isBulkDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <SkeletonStats count={4} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative bg-gray-900 p-4 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)]">
            <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-lime-400" />
            <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Total Appraisals
            </p>
            <p className="text-2xl font-bold text-white mt-1">
              {appraisals?.items?.length || 0}
            </p>
          </div>
          <div className="relative bg-gray-900 p-4 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)]">
            <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-yellow-400" />
            <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Processing
            </p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">
              {appraisals?.items.filter(
                (a: { status: string }) =>
                  a.status === "RUNNING" || a.status === "QUEUED",
              ).length || 0}
            </p>
          </div>
          <div className="relative bg-gray-900 p-4 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)]">
            <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-green-400" />
            <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Ready
            </p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {appraisals?.items.filter(
                (a: { status: string }) => a.status === "READY",
              ).length || 0}
            </p>
          </div>
          <div className="relative bg-gray-900 p-4 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)]">
            <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-lime-400" />
            <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
              This Month
            </p>
            <p className="text-2xl font-bold text-lime-400 mt-1">
              {appraisals?.items.filter((a) => {
                const date = new Date(a.createdAt);
                const now = new Date();
                return (
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear()
                );
              }).length || 0}
            </p>
          </div>
        </div>
      )}

      {/* Appraisals Table */}
      {isLoading ? (
        <SkeletonTable rows={5} columns={7} />
      ) : (
        <div className="relative bg-gray-900 clip-notch shadow-[inset_0_0_0_1px_theme(colors.gray.800)] overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[var(--secondary)] border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-gray-900"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase hidden md:table-cell">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase hidden lg:table-cell">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase hidden md:table-cell">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredAppraisals?.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-[var(--muted-foreground)]"
                  >
                    No appraisals found. Create your first appraisal to get
                    started.
                  </td>
                </tr>
              ) : (
                filteredAppraisals?.map((appraisal) => {
                  const status =
                    statusConfig[appraisal.status as AppraisalStatus];
                  const StatusIcon = status?.icon || FileText;
                  const isSelected = selectedIds.has(appraisal.id);
                  return (
                    <tr
                      key={appraisal.id}
                      className={`hover:bg-[var(--secondary)] ${isSelected ? "bg-lime-400/5" : ""}`}
                    >
                      <td className="px-4 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectOne(appraisal.id, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-[var(--foreground)]">
                          {appraisal.referenceCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {appraisal.property?.addressLine1}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {appraisal.property?.city},{" "}
                            {appraisal.property?.state}{" "}
                            {appraisal.property?.zipCode}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-[var(--foreground)]">
                          {appraisal.requestedType?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 clip-notch-sm text-xs font-mono uppercase tracking-wider ${status?.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {appraisal.report?.valueEstimate ? (
                          <span className="font-medium text-[var(--foreground)]">
                            $
                            {Number(
                              appraisal.report.valueEstimate,
                            ).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-[var(--muted-foreground)]">
                          {new Date(appraisal.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {appraisal.report && appraisal.status === "READY" && (
                            <button
                              onClick={() =>
                                handleDownload(appraisal.report!.id)
                              }
                              disabled={downloadingId === appraisal.report.id}
                              className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50"
                              title="Download PDF"
                            >
                              {downloadingId === appraisal.report.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDelete(
                                appraisal.id,
                                appraisal.referenceCode,
                              )
                            }
                            disabled={deletingId === appraisal.id}
                            className="p-2 text-[var(--muted-foreground)] hover:text-red-400 disabled:opacity-50"
                            title="Delete appraisal"
                          >
                            {deletingId === appraisal.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            href={`/appraisals/${appraisal.id}`}
                            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
