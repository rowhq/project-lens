/**
 * Client Dashboard
 * Main dashboard for Lenders/Investors
 */

import Link from "next/link";
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function ClientDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back. Here&apos;s an overview of your appraisal activity.
          </p>
        </div>
        <Link
          href="/appraisals/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Run Appraisal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reports"
          value="24"
          icon={FileText}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="In Progress"
          value="3"
          icon={Clock}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Completed"
          value="18"
          icon={CheckCircle}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="On-site Jobs"
          value="2"
          icon={AlertCircle}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Appraisals
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {/* Placeholder items */}
          <div className="px-6 py-8 text-center text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No appraisals yet</p>
            <Link
              href="/appraisals/new"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Run your first appraisal
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
