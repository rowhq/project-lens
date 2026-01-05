"use client";

import { useState, useRef } from "react";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
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
  Upload,
  X,
} from "lucide-react";

type TabType = "insights" | "owners" | "engineers";

// Types for editing
interface InsightForm {
  type: string;
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  latitude: number;
  longitude: number;
  city?: string;
  county: string;
  state: string;
  estimatedValue?: number;
  expectedROI?: number;
}

export default function AdminInsightsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("insights");
  const [searchQuery, setSearchQuery] = useState("");
  const [county, setCounty] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Import states
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [insightForm, setInsightForm] = useState<InsightForm>({
    type: "MUNICIPAL_BOND",
    title: "",
    description: "",
    source: "",
    latitude: 31.9686,
    longitude: -99.9018,
    county: "",
    state: "TX",
  });

  const utils = trpc.useUtils();

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

  // Mutations
  const createInsightMutation = trpc.insights.createInsight.useMutation({
    onSuccess: () => {
      utils.insights.listInsights.invalidate();
      utils.insights.getStats.invalidate();
      setShowAddModal(false);
      resetForm();
    },
  });

  const updateInsightMutation = trpc.insights.updateInsight.useMutation({
    onSuccess: () => {
      utils.insights.listInsights.invalidate();
      setEditingId(null);
      resetForm();
    },
  });

  const deleteInsightMutation = trpc.insights.deleteInsight.useMutation({
    onSuccess: () => {
      utils.insights.listInsights.invalidate();
      utils.insights.getStats.invalidate();
      setDeleteConfirmId(null);
    },
  });

  const deleteEngineerMutation = trpc.insights.deleteEngineer.useMutation({
    onSuccess: () => {
      utils.insights.searchEngineers.invalidate();
      utils.insights.getStats.invalidate();
      setDeleteConfirmId(null);
    },
  });

  const deleteOwnerMutation = trpc.insights.deleteOwner.useMutation({
    onSuccess: () => {
      utils.insights.searchOwners.invalidate();
      utils.insights.getStats.invalidate();
      setDeleteConfirmId(null);
    },
  });

  const importOwnersMutation = trpc.insights.importOwners.useMutation({
    onSuccess: (result) => {
      utils.insights.searchOwners.invalidate();
      utils.insights.getStats.invalidate();
      setImporting(false);
      toast({
        title: "Success",
        description: `Successfully imported ${result.imported} property owners`,
      });
    },
    onError: () => {
      setImporting(false);
    },
  });

  const importEngineersMutation = trpc.insights.importEngineers.useMutation({
    onSuccess: (result) => {
      utils.insights.searchEngineers.invalidate();
      utils.insights.getStats.invalidate();
      setImporting(false);
      toast({
        title: "Success",
        description: `Successfully imported ${result.imported} engineers`,
      });
    },
    onError: () => {
      setImporting(false);
    },
  });

  const resetForm = () => {
    setInsightForm({
      type: "MUNICIPAL_BOND",
      title: "",
      description: "",
      source: "",
      latitude: 31.9686,
      longitude: -99.9018,
      county: "",
      state: "TX",
    });
  };

  const handleCreateInsight = () => {
    if (!insightForm.title || !insightForm.description || !insightForm.county) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }
    createInsightMutation.mutate({
      type: insightForm.type as
        | "MUNICIPAL_BOND"
        | "SCHOOL_CONSTRUCTION"
        | "ROAD_PROJECT"
        | "ZONING_CHANGE"
        | "DEVELOPMENT_PERMIT"
        | "INFRASTRUCTURE"
        | "TAX_INCENTIVE",
      title: insightForm.title,
      description: insightForm.description,
      source: insightForm.source || "Manual Entry",
      sourceUrl: insightForm.sourceUrl,
      latitude: insightForm.latitude,
      longitude: insightForm.longitude,
      city: insightForm.city,
      county: insightForm.county,
      state: insightForm.state,
      estimatedValue: insightForm.estimatedValue,
      expectedROI: insightForm.expectedROI,
    });
  };

  const handleEditInsight = (
    insight: NonNullable<typeof insightsData>["items"][0],
  ) => {
    setEditingId(insight.id);
    setInsightForm({
      type: insight.type,
      title: insight.title,
      description: insight.description || "",
      source: insight.source,
      sourceUrl: insight.sourceUrl || undefined,
      latitude: insight.latitude,
      longitude: insight.longitude,
      city: insight.city || undefined,
      county: insight.county,
      state: insight.state,
      estimatedValue: insight.estimatedValue
        ? Number(insight.estimatedValue)
        : undefined,
      expectedROI: insight.expectedROI || undefined,
    });
    setShowAddModal(true);
  };

  const handleUpdateInsight = () => {
    if (!editingId) return;
    updateInsightMutation.mutate({
      id: editingId,
      type: insightForm.type as
        | "MUNICIPAL_BOND"
        | "SCHOOL_CONSTRUCTION"
        | "ROAD_PROJECT"
        | "ZONING_CHANGE"
        | "DEVELOPMENT_PERMIT"
        | "INFRASTRUCTURE"
        | "TAX_INCENTIVE",
      title: insightForm.title,
      description: insightForm.description,
      source: insightForm.source,
      sourceUrl: insightForm.sourceUrl,
      estimatedValue: insightForm.estimatedValue,
      expectedROI: insightForm.expectedROI,
    });
  };

  const handleDelete = (id: string, type: "insight" | "engineer" | "owner") => {
    if (type === "insight") {
      deleteInsightMutation.mutate({ id });
    } else if (type === "engineer") {
      deleteEngineerMutation.mutate({ id });
    } else {
      deleteOwnerMutation.mutate({ id });
    }
  };

  const handleFileImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "owners" | "engineers" | "insights",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const text = await file.text();
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const data = lines
        .slice(1)
        .filter((line) => line.trim())
        .map((line) => {
          const values = line.split(",");
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = values[i]?.trim() || "";
          });
          return obj;
        });

      if (type === "owners") {
        const owners = data.map((row) => ({
          parcelId:
            row.parcelid ||
            row.parcel_id ||
            `P-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          county: row.county || "Travis",
          addressLine1: row.address || row.addressline1 || "",
          city: row.city || "",
          state: row.state || "TX",
          zipCode: row.zipcode || row.zip || "",
          ownerName: row.ownername || row.owner_name || row.owner || "",
          ownerType: row.ownertype || row.owner_type || "individual",
          phone: row.phone || undefined,
          email: row.email || undefined,
          dataSource: "CSV Import",
        }));
        importOwnersMutation.mutate({ owners });
      } else if (type === "engineers") {
        const engineers = data.map((row) => ({
          companyName: row.companyname || row.company_name || row.company || "",
          contactName:
            row.contactname || row.contact_name || row.contact || undefined,
          phone: row.phone || "",
          email: row.email || undefined,
          website: row.website || undefined,
          addressLine1: row.address || row.addressline1 || "",
          city: row.city || "",
          county: row.county || "Travis",
          state: row.state || "TX",
          zipCode: row.zipcode || row.zip || "",
          specialties: (row.specialties || row.specialty || "")
            .split(";")
            .filter(Boolean),
        }));
        importEngineersMutation.mutate({ engineers });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to parse CSV file",
        variant: "destructive",
      });
      setImporting(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const INSIGHT_TYPES = [
    { value: "MUNICIPAL_BOND", label: "Municipal Bond" },
    { value: "SCHOOL_CONSTRUCTION", label: "School Construction" },
    { value: "ROAD_PROJECT", label: "Road Project" },
    { value: "ZONING_CHANGE", label: "Zoning Change" },
    { value: "DEVELOPMENT_PERMIT", label: "Development Permit" },
    { value: "INFRASTRUCTURE", label: "Infrastructure" },
    { value: "TAX_INCENTIVE", label: "Tax Incentive" },
  ];

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
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowAddModal(true);
          }}
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
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
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
                      <button
                        onClick={() => handleEditInsight(insight)}
                        className="p-2 text-gray-400 hover:text-lime-400"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(insight.id)}
                        className="p-2 text-gray-400 hover:text-red-400"
                      >
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
                  <div className="col-span-2">Actions</div>
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
                    <div className="col-span-2 flex items-center gap-2">
                      {owner.phone && (
                        <span className="text-gray-400 text-sm">
                          {owner.phone}
                        </span>
                      )}
                      <button
                        onClick={() => setDeleteConfirmId(owner.id)}
                        className="p-2 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                  <div className="col-span-2">Actions</div>
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
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        {engineer.phone}
                      </span>
                      <button
                        onClick={() => setDeleteConfirmId(engineer.id)}
                        className="p-2 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
          Import data from CSV files. Format: headers in first row,
          comma-separated values.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) =>
            handleFileImport(
              e,
              activeTab === "owners"
                ? "owners"
                : activeTab === "engineers"
                  ? "engineers"
                  : "insights",
            )
          }
          className="hidden"
        />
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveTab("insights");
              fileInputRef.current?.click();
            }}
            disabled={importing}
            className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white clip-notch-sm flex items-center gap-2 disabled:opacity-50"
          >
            {importing && activeTab === "insights" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import Insights
          </button>
          <button
            onClick={() => {
              setActiveTab("owners");
              fileInputRef.current?.click();
            }}
            disabled={importing}
            className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white clip-notch-sm flex items-center gap-2 disabled:opacity-50"
          >
            {importing && activeTab === "owners" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import Owners
          </button>
          <button
            onClick={() => {
              setActiveTab("engineers");
              fileInputRef.current?.click();
            }}
            disabled={importing}
            className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white clip-notch-sm flex items-center gap-2 disabled:opacity-50"
          >
            {importing && activeTab === "engineers" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import Engineers
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 border border-gray-800 clip-notch w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Edit Insight" : "Add New Insight"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Type *
                </label>
                <select
                  value={insightForm.type}
                  onChange={(e) =>
                    setInsightForm({ ...insightForm, type: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-700 text-white clip-notch-sm focus:outline-none focus:border-lime-400/50"
                >
                  {INSIGHT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={insightForm.title}
                  onChange={(e) =>
                    setInsightForm({ ...insightForm, title: e.target.value })
                  }
                  placeholder="e.g., New School Bond Initiative"
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-700 text-white placeholder-gray-500 clip-notch-sm focus:outline-none focus:border-lime-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description *
                </label>
                <textarea
                  value={insightForm.description}
                  onChange={(e) =>
                    setInsightForm({
                      ...insightForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Detailed description of the investment opportunity..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-700 text-white placeholder-gray-500 clip-notch-sm focus:outline-none focus:border-lime-400/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    value={insightForm.source}
                    onChange={(e) =>
                      setInsightForm({ ...insightForm, source: e.target.value })
                    }
                    placeholder="e.g., Travis County Clerk"
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-700 text-white placeholder-gray-500 clip-notch-sm focus:outline-none focus:border-lime-400/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Source URL
                  </label>
                  <input
                    type="url"
                    value={insightForm.sourceUrl || ""}
                    onChange={(e) =>
                      setInsightForm({
                        ...insightForm,
                        sourceUrl: e.target.value || undefined,
                      })
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-700 text-white placeholder-gray-500 clip-notch-sm focus:outline-none focus:border-lime-400/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    County *
                  </label>
                  <input
                    type="text"
                    value={insightForm.county}
                    onChange={(e) =>
                      setInsightForm({ ...insightForm, county: e.target.value })
                    }
                    placeholder="e.g., Travis"
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-700 text-white placeholder-gray-500 clip-notch-sm focus:outline-none focus:border-lime-400/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={insightForm.city || ""}
                    onChange={(e) =>
                      setInsightForm({
                        ...insightForm,
                        city: e.target.value || undefined,
                      })
                    }
                    placeholder="e.g., Austin"
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-700 text-white placeholder-gray-500 clip-notch-sm focus:outline-none focus:border-lime-400/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={insightForm.latitude}
                    onChange={(e) =>
                      setInsightForm({
                        ...insightForm,
                        latitude: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-700 text-white clip-notch-sm focus:outline-none focus:border-lime-400/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={insightForm.longitude}
                    onChange={(e) =>
                      setInsightForm({
                        ...insightForm,
                        longitude: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-700 text-white clip-notch-sm focus:outline-none focus:border-lime-400/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Estimated Value
                  </label>
                  <input
                    type="number"
                    value={insightForm.estimatedValue || ""}
                    onChange={(e) =>
                      setInsightForm({
                        ...insightForm,
                        estimatedValue: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="e.g., 5000000"
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-700 text-white placeholder-gray-500 clip-notch-sm focus:outline-none focus:border-lime-400/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Expected ROI (%)
                  </label>
                  <input
                    type="number"
                    value={insightForm.expectedROI || ""}
                    onChange={(e) =>
                      setInsightForm({
                        ...insightForm,
                        expectedROI: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="e.g., 15"
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-700 text-white placeholder-gray-500 clip-notch-sm focus:outline-none focus:border-lime-400/50"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 p-6 border-t border-gray-800">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-700 text-gray-400 hover:text-white clip-notch-sm"
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdateInsight : handleCreateInsight}
                disabled={
                  createInsightMutation.isPending ||
                  updateInsightMutation.isPending
                }
                className="px-6 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50 flex items-center gap-2"
              >
                {(createInsightMutation.isPending ||
                  updateInsightMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 border border-gray-800 clip-notch p-6 max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this item? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white clip-notch-sm"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleDelete(
                    deleteConfirmId,
                    activeTab === "insights"
                      ? "insight"
                      : activeTab === "engineers"
                        ? "engineer"
                        : "owner",
                  )
                }
                disabled={
                  deleteInsightMutation.isPending ||
                  deleteEngineerMutation.isPending ||
                  deleteOwnerMutation.isPending
                }
                className="px-4 py-2 bg-red-500 text-white clip-notch-sm hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
              >
                {(deleteInsightMutation.isPending ||
                  deleteEngineerMutation.isPending ||
                  deleteOwnerMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
