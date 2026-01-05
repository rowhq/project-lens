"use client";

import { useState } from "react";
import { trpc } from "@/shared/lib/trpc";
import {
  TrendingUp,
  Users,
  Wrench,
  Plus,
  Search,
  MapPin,
  Loader2,
  ExternalLink,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react";

type TabType = "insights" | "owners" | "engineers";

export default function AdminInsightsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("insights");
  const [searchQuery, setSearchQuery] = useState("");
  const [county, setCounty] = useState("");

  // Stats
  const { data: stats } = trpc.insights.getStats.useQuery({});

  // Insights query
  const { data: insightsData, isLoading: insightsLoading } =
    trpc.insights.listInsights.useQuery(
      {
        limit: 50,
        county: county || undefined,
        search: searchQuery || undefined,
      },
      { enabled: activeTab === "insights" },
    );

  // Owners query
  const { data: ownersData, isLoading: ownersLoading } =
    trpc.insights.searchOwners.useQuery(
      {
        limit: 50,
        county: county || undefined,
        search: searchQuery || undefined,
      },
      { enabled: activeTab === "owners" },
    );

  // Engineers query
  const { data: engineersData, isLoading: engineersLoading } =
    trpc.insights.searchEngineers.useQuery(
      {
        limit: 50,
        county: county || undefined,
        search: searchQuery || undefined,
      },
      { enabled: activeTab === "engineers" },
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Insights Management</h1>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-wider mt-1">
            Manage investment insights, property owners, and engineers
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="relative bg-gray-950 border border-gray-800 p-5 clip-notch">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-lime-400/10 text-lime-400 border border-lime-400/20 clip-notch-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {stats?.totalInsights || 0}
              </p>
              <p className="text-label text-gray-500 font-mono uppercase tracking-wider">
                Total Insights
              </p>
            </div>
          </div>
        </div>
        <div className="relative bg-gray-950 border border-gray-800 p-5 clip-notch">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-purple-400/30" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-400/10 text-purple-400 border border-purple-400/20 clip-notch-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {stats?.totalPropertyOwners || 0}
              </p>
              <p className="text-label text-gray-500 font-mono uppercase tracking-wider">
                Property Owners
              </p>
            </div>
          </div>
        </div>
        <div className="relative bg-gray-950 border border-gray-800 p-5 clip-notch">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-orange-400/30" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-400/10 text-orange-400 border border-orange-400/20 clip-notch-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {stats?.totalEngineers || 0}
              </p>
              <p className="text-label text-gray-500 font-mono uppercase tracking-wider">
                Engineers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("insights")}
          className={`px-4 py-3 font-mono text-sm uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "insights"
              ? "text-lime-400 border-lime-400"
              : "text-gray-500 border-transparent hover:text-white"
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Insights ({stats?.totalInsights || 0})
        </button>
        <button
          onClick={() => setActiveTab("owners")}
          className={`px-4 py-3 font-mono text-sm uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "owners"
              ? "text-lime-400 border-lime-400"
              : "text-gray-500 border-transparent hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Property Owners ({stats?.totalPropertyOwners || 0})
        </button>
        <button
          onClick={() => setActiveTab("engineers")}
          className={`px-4 py-3 font-mono text-sm uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "engineers"
              ? "text-lime-400 border-lime-400"
              : "text-gray-500 border-transparent hover:text-white"
          }`}
        >
          <Wrench className="w-4 h-4 inline mr-2" />
          Engineers ({stats?.totalEngineers || 0})
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 text-white placeholder-gray-500 clip-notch-sm focus:outline-none focus:border-lime-400/50"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="County"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="w-40 pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 text-white placeholder-gray-500 clip-notch-sm focus:outline-none focus:border-lime-400/50"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative bg-gray-950 border border-gray-800 clip-notch overflow-hidden">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-lime-400/30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-lime-400/30" />

        {/* Insights Tab */}
        {activeTab === "insights" && (
          <>
            {insightsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
              </div>
            ) : insightsData?.items.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto text-gray-600" />
                <p className="mt-4 text-gray-400">No insights found</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 bg-lime-400/10 text-lime-400 border border-lime-400/20 clip-notch-sm hover:bg-lime-400/20"
                >
                  Add First Insight
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                <div className="px-6 py-3 bg-gray-900 grid grid-cols-12 gap-4 text-xs font-mono uppercase tracking-wider text-gray-500">
                  <div className="col-span-4">Title</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-2">Value</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {insightsData?.items.map((insight) => (
                  <div
                    key={insight.id}
                    className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-900/50"
                  >
                    <div className="col-span-4">
                      <p className="text-white font-medium truncate">
                        {insight.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {insight.description}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="px-2 py-1 text-xs font-mono uppercase bg-lime-400/10 text-lime-400 border border-lime-400/20 clip-notch-sm">
                        {insight.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="col-span-2 text-gray-400 text-sm">
                      {insight.city || insight.county}, {insight.state}
                    </div>
                    <div className="col-span-2 text-lime-400 font-mono">
                      {insight.estimatedValue
                        ? `$${Number(insight.estimatedValue).toLocaleString()}`
                        : "-"}
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      {insight.sourceUrl && (
                        <a
                          href={insight.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-lime-400"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button className="p-2 text-gray-400 hover:text-lime-400">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Owners Tab */}
        {activeTab === "owners" && (
          <>
            {ownersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
              </div>
            ) : ownersData?.items.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-600" />
                <p className="mt-4 text-gray-400">No property owners found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                <div className="px-6 py-3 bg-gray-900 grid grid-cols-12 gap-4 text-xs font-mono uppercase tracking-wider text-gray-500">
                  <div className="col-span-3">Owner Name</div>
                  <div className="col-span-3">Address</div>
                  <div className="col-span-2">County</div>
                  <div className="col-span-2">Assessed Value</div>
                  <div className="col-span-2">Contact</div>
                </div>
                {ownersData?.items.map((owner) => (
                  <div
                    key={owner.id}
                    className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-900/50"
                  >
                    <div className="col-span-3">
                      <p className="text-white font-medium">
                        {owner.ownerName}
                      </p>
                      <span className="text-xs text-gray-500">
                        {owner.ownerType}
                      </span>
                    </div>
                    <div className="col-span-3 text-gray-400 text-sm">
                      {owner.addressLine1}, {owner.city}
                    </div>
                    <div className="col-span-2 text-gray-400 text-sm">
                      {owner.county}
                    </div>
                    <div className="col-span-2 text-lime-400 font-mono">
                      {owner.assessedValue
                        ? `$${Number(owner.assessedValue).toLocaleString()}`
                        : "-"}
                    </div>
                    <div className="col-span-2 text-sm">
                      {owner.phone && (
                        <span className="text-gray-400">{owner.phone}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Engineers Tab */}
        {activeTab === "engineers" && (
          <>
            {engineersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
              </div>
            ) : engineersData?.items.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="w-12 h-12 mx-auto text-gray-600" />
                <p className="mt-4 text-gray-400">No engineers found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                <div className="px-6 py-3 bg-gray-900 grid grid-cols-12 gap-4 text-xs font-mono uppercase tracking-wider text-gray-500">
                  <div className="col-span-3">Company</div>
                  <div className="col-span-3">Specialties</div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-2">Verified</div>
                  <div className="col-span-2">Contact</div>
                </div>
                {engineersData?.items.map((engineer) => (
                  <div
                    key={engineer.id}
                    className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-900/50"
                  >
                    <div className="col-span-3">
                      <p className="text-white font-medium">
                        {engineer.companyName}
                      </p>
                      {engineer.contactName && (
                        <span className="text-xs text-gray-500">
                          {engineer.contactName}
                        </span>
                      )}
                    </div>
                    <div className="col-span-3 flex flex-wrap gap-1">
                      {engineer.specialties.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 text-xs bg-orange-400/10 text-orange-400 border border-orange-400/20 clip-notch-sm"
                        >
                          {s}
                        </span>
                      ))}
                      {engineer.specialties.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{engineer.specialties.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 text-gray-400 text-sm">
                      {engineer.city}, {engineer.county}
                    </div>
                    <div className="col-span-2">
                      {engineer.isVerified ? (
                        <span className="flex items-center gap-1 text-lime-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Verified</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">Pending</span>
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 text-sm text-gray-400">
                      {engineer.phone}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Import Section */}
      <div className="relative bg-gray-950 border border-gray-800 p-6 clip-notch">
        <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4">
          Bulk Import
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Import data from CSV files or external APIs. Contact support for API
          integration.
        </p>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white clip-notch-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Import Insights
          </button>
          <button className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white clip-notch-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Import Owners
          </button>
          <button className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white clip-notch-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Import Engineers
          </button>
        </div>
      </div>
    </div>
  );
}
