"use client";

/**
 * Client Dashboard - Mockup Version
 */

import Link from "next/link";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  MapPin,
} from "lucide-react";

// Mock data
const MOCK_STATS = {
  total: 24,
  inProgress: 3,
  completed: 21,
  thisMonth: 8,
};

const MOCK_RECENT_APPRAISALS = [
  {
    id: "1",
    address: "1847 Oak Avenue, Austin, TX",
    status: "READY",
    type: "AI_REPORT",
    value: 485000,
    date: "2 hours ago",
  },
  {
    id: "2",
    address: "2301 Maple Drive, Round Rock, TX",
    status: "RUNNING",
    type: "CERTIFIED",
    value: null,
    date: "1 day ago",
  },
  {
    id: "3",
    address: "445 Commerce St, Pflugerville, TX",
    status: "READY",
    type: "AI_REPORT",
    value: 320000,
    date: "2 days ago",
  },
  {
    id: "4",
    address: "789 Cedar Lane, Austin, TX",
    status: "READY",
    type: "ON_SITE",
    value: 425000,
    date: "3 days ago",
  },
];

export default function ClientDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back</p>
        </div>
        <Link
          href="/appraisals/new"
          className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-black font-medium rounded-lg hover:bg-lime-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Report
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {MOCK_STATS.total}
              </p>
              <p className="text-xs text-gray-500">Total Reports</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {MOCK_STATS.inProgress}
              </p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-400/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {MOCK_STATS.completed}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-400/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {MOCK_STATS.thisMonth}
              </p>
              <p className="text-xs text-gray-500">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/appraisals/new"
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-lime-400/10 rounded-lg">
                <FileText className="w-6 h-6 text-lime-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Get AI Report</h3>
                <p className="text-sm text-gray-500">
                  Instant valuation with growth signals
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-lime-400 transition-colors" />
          </div>
        </Link>
        <Link
          href="/insights"
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-400/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Explore Opportunities
                </h3>
                <p className="text-sm text-gray-500">Find high-growth areas</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Appraisals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Reports</h2>
          <Link
            href="/appraisals"
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {MOCK_RECENT_APPRAISALS.map((appraisal) => (
            <div
              key={appraisal.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {appraisal.address}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {appraisal.type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">
                        {appraisal.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {appraisal.value && (
                    <p className="text-lg font-semibold text-white">
                      ${(appraisal.value / 1000).toFixed(0)}K
                    </p>
                  )}
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      appraisal.status === "READY"
                        ? "bg-lime-400/10 text-lime-400"
                        : "bg-yellow-400/10 text-yellow-400"
                    }`}
                  >
                    {appraisal.status === "READY" ? "Complete" : "In Progress"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
