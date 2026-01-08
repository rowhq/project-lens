"use client";

/**
 * Appraisals List - Mockup Version
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  MapPin,
} from "lucide-react";

type AppraisalStatus = "DRAFT" | "QUEUED" | "RUNNING" | "READY" | "FAILED";

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
};

// Mock appraisals data
const MOCK_APPRAISALS = [
  {
    id: "1",
    referenceCode: "APR-2024-001",
    property: {
      addressLine1: "1847 Oak Avenue",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
    },
    requestedType: "AI_REPORT",
    status: "READY" as AppraisalStatus,
    valueEstimate: 485000,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    referenceCode: "APR-2024-002",
    property: {
      addressLine1: "2301 Maple Drive",
      city: "Round Rock",
      state: "TX",
      zipCode: "78664",
    },
    requestedType: "CERTIFIED_APPRAISAL",
    status: "RUNNING" as AppraisalStatus,
    valueEstimate: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    referenceCode: "APR-2024-003",
    property: {
      addressLine1: "445 Commerce St",
      city: "Pflugerville",
      state: "TX",
      zipCode: "78660",
    },
    requestedType: "AI_REPORT",
    status: "READY" as AppraisalStatus,
    valueEstimate: 320000,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    referenceCode: "APR-2024-004",
    property: {
      addressLine1: "789 Cedar Lane",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
    },
    requestedType: "AI_REPORT_WITH_ONSITE",
    status: "READY" as AppraisalStatus,
    valueEstimate: 425000,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    referenceCode: "APR-2024-005",
    property: {
      addressLine1: "123 Main Street",
      city: "Cedar Park",
      state: "TX",
      zipCode: "78613",
    },
    requestedType: "CERTIFIED_APPRAISAL",
    status: "QUEUED" as AppraisalStatus,
    valueEstimate: null,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

export default function AppraisalsPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppraisalStatus | "ALL">(
    "ALL",
  );
  const [showSuccess, setShowSuccess] = useState(false);

  // Check for success message from new appraisal
  useEffect(() => {
    const isSuccess = searchParams.get("success") === "true";
    if (isSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(true);
        const hideTimer = setTimeout(() => setShowSuccess(false), 5000);
        return () => clearTimeout(hideTimer);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const filteredAppraisals = MOCK_APPRAISALS.filter((a) => {
    const matchesSearch =
      a.property.addressLine1
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      a.referenceCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: MOCK_APPRAISALS.length,
    processing: MOCK_APPRAISALS.filter(
      (a) => a.status === "RUNNING" || a.status === "QUEUED",
    ).length,
    ready: MOCK_APPRAISALS.filter((a) => a.status === "READY").length,
    thisMonth: MOCK_APPRAISALS.length,
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-lime-400/10 border border-lime-400/30 text-lime-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <p>
            Appraisal request submitted successfully! You&apos;ll receive your
            report shortly.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Appraisals</h1>
          <p className="text-gray-400">
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by address or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-700 clip-notch bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as AppraisalStatus | "ALL")
            }
            className="border border-gray-700 clip-notch-sm px-4 py-2.5 bg-gray-900 text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
          >
            <option value="ALL">All Status</option>
            <option value="QUEUED">Queued</option>
            <option value="RUNNING">Processing</option>
            <option value="READY">Ready</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative bg-gray-900 p-4 clip-notch border border-gray-800">
          <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-lime-400" />
          <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
            Total Appraisals
          </p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="relative bg-gray-900 p-4 clip-notch border border-gray-800">
          <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-yellow-400" />
          <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
            Processing
          </p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">
            {stats.processing}
          </p>
        </div>
        <div className="relative bg-gray-900 p-4 clip-notch border border-gray-800">
          <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-green-400" />
          <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
            Ready
          </p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {stats.ready}
          </p>
        </div>
        <div className="relative bg-gray-900 p-4 clip-notch border border-gray-800">
          <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-lime-400" />
          <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
            This Month
          </p>
          <p className="text-2xl font-bold text-lime-400 mt-1">
            {stats.thisMonth}
          </p>
        </div>
      </div>

      {/* Appraisals Table */}
      <div className="relative bg-gray-900 clip-notch border border-gray-800 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-800/50 border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredAppraisals.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No appraisals found. Create your first appraisal to get
                  started.
                </td>
              </tr>
            ) : (
              filteredAppraisals.map((appraisal) => {
                const status = statusConfig[appraisal.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={appraisal.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-white">
                        {appraisal.referenceCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-white">
                            {appraisal.property.addressLine1}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appraisal.property.city},{" "}
                            {appraisal.property.state}{" "}
                            {appraisal.property.zipCode}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-300">
                        {appraisal.requestedType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 clip-notch-sm text-xs font-mono uppercase tracking-wider ${status.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {appraisal.valueEstimate ? (
                        <span className="font-medium text-white">
                          ${appraisal.valueEstimate.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-500">
                        {new Date(appraisal.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {appraisal.status === "READY" && (
                          <button
                            onClick={() =>
                              alert("PDF download would happen here")
                            }
                            className="p-2 text-gray-500 hover:text-white"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/appraisals/${appraisal.id}`}
                          className="p-2 text-gray-500 hover:text-white"
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
