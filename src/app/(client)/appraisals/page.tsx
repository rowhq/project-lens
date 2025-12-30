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
} from "lucide-react";

// Match Prisma AppraisalStatus enum
type AppraisalStatus = "DRAFT" | "QUEUED" | "RUNNING" | "READY" | "FAILED" | "EXPIRED";

const statusConfig: Record<AppraisalStatus, { label: string; color: string; icon: typeof Clock }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: FileText },
  QUEUED: { label: "Queued", color: "bg-blue-100 text-blue-700", icon: Clock },
  RUNNING: { label: "Processing", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  READY: { label: "Ready", color: "bg-green-100 text-green-700", icon: CheckCircle },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-700", icon: AlertCircle },
  EXPIRED: { label: "Expired", color: "bg-gray-100 text-gray-700", icon: AlertCircle },
};

export default function AppraisalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppraisalStatus | "ALL">("ALL");

  const { data: appraisals, isLoading } = trpc.appraisal.list.useQuery({
    limit: 50,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const filteredAppraisals = appraisals?.items.filter((a) =>
    a.property?.addressFull?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.referenceCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appraisals</h1>
          <p className="text-gray-600">Manage your property valuation requests</p>
        </div>
        <Link
          href="/appraisals/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Appraisal
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by address or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AppraisalStatus | "ALL")}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="QUEUED">Queued</option>
            <option value="RUNNING">Processing</option>
            <option value="READY">Ready</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Appraisals</p>
          <p className="text-2xl font-bold text-gray-900">{appraisals?.items?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Processing</p>
          <p className="text-2xl font-bold text-yellow-600">
            {appraisals?.items.filter((a: { status: string }) => a.status === "RUNNING" || a.status === "QUEUED").length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Ready</p>
          <p className="text-2xl font-bold text-green-600">
            {appraisals?.items.filter((a: { status: string }) => a.status === "READY").length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-2xl font-bold text-blue-600">
            {appraisals?.items.filter((a) => {
              const date = new Date(a.createdAt);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length || 0}
          </p>
        </div>
      </div>

      {/* Appraisals Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Loading appraisals...
                </td>
              </tr>
            ) : filteredAppraisals?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No appraisals found. Create your first appraisal to get started.
                </td>
              </tr>
            ) : (
              filteredAppraisals?.map((appraisal) => {
                const status = statusConfig[appraisal.status as AppraisalStatus];
                const StatusIcon = status?.icon || FileText;
                return (
                  <tr key={appraisal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900">{appraisal.referenceCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{appraisal.property?.addressLine1}</p>
                        <p className="text-sm text-gray-500">
                          {appraisal.property?.city}, {appraisal.property?.state} {appraisal.property?.zipCode}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {appraisal.requestedType?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {appraisal.report?.valueEstimate ? (
                        <span className="font-medium text-gray-900">
                          ${Number(appraisal.report.valueEstimate).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(appraisal.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {appraisal.report && appraisal.status === "READY" && (
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/appraisals/${appraisal.id}`}
                          className="p-2 text-gray-400 hover:text-gray-600"
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
    </div>
  );
}
