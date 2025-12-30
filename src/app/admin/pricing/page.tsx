"use client";

import { useState } from "react";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  Check,
  Settings,
  Percent,
  Loader2,
} from "lucide-react";

interface ProductState {
  id: string;
  name: string;
  basePrice: number;
  turnaround: string;
}

interface EditingRule {
  id: string;
  multiplier?: number;
  basePrice?: number;
}

export default function PricingPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"products" | "rules" | "payouts">("products");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductPrice, setEditingProductPrice] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPayoutConfirm, setShowPayoutConfirm] = useState(false);
  const [editingRule, setEditingRule] = useState<EditingRule | null>(null);

  // New rule form state
  const [newRule, setNewRule] = useState({
    name: "",
    type: "FLAT" as "FLAT" | "MULTIPLIER",
    value: "",
    propertyType: "",
    jobType: "",
    county: "",
  });

  const { data: pricingRulesData, refetch } = trpc.admin.pricing.list.useQuery();
  const { data: payoutSummary, refetch: refetchPayouts } = trpc.admin.pricing.payoutSummary.useQuery();

  const createRule = trpc.admin.pricing.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAddModal(false);
      setNewRule({ name: "", type: "FLAT", value: "", propertyType: "", jobType: "", county: "" });
      toast({
        title: "Rule created",
        description: "The pricing rule has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create pricing rule",
        variant: "destructive",
      });
    },
  });
  const updateRule = trpc.admin.pricing.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingRule(null);
      toast({
        title: "Rule updated",
        description: "The pricing rule has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing rule",
        variant: "destructive",
      });
    },
  });
  const deleteRule = trpc.admin.pricing.delete.useMutation({
    onSuccess: () => {
      refetch();
      setShowDeleteConfirm(null);
      toast({
        title: "Rule deleted",
        description: "The pricing rule has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pricing rule",
        variant: "destructive",
      });
    },
  });
  const updateProductPrice = trpc.admin.pricing.updateProductPrice.useMutation({
    onSuccess: () => {
      refetch();
      setEditingProductId(null);
      toast({
        title: "Price updated",
        description: "The product price has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product price",
        variant: "destructive",
      });
    },
  });
  const processPayouts = trpc.admin.pricing.processPayouts.useMutation({
    onSuccess: (data) => {
      refetchPayouts();
      setShowPayoutConfirm(false);
      toast({
        title: "Payouts processed",
        description: `Successfully processed ${data.processed} payouts. ${data.failed > 0 ? `${data.failed} failed.` : ""}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payouts",
        variant: "destructive",
      });
    },
  });

  // Static product definitions with prices from DB overrides
  const getProductPrice = (productId: string, defaultPrice: number): number => {
    const rule = pricingRulesData?.find(r => r.ruleType === `product_${productId}`);
    return rule?.basePrice ? Number(rule.basePrice) : defaultPrice;
  };

  const products: ProductState[] = [
    { id: "ai_report", name: "AI Report", basePrice: getProductPrice("ai_report", 29), turnaround: "5 minutes" },
    { id: "on_site", name: "On-Site Verification", basePrice: getProductPrice("on_site", 149), turnaround: "48 hours" },
    { id: "certified", name: "Certified Appraisal", basePrice: getProductPrice("certified", 449), turnaround: "72 hours" },
  ];

  // Transform pricing rules from DB to display format
  const pricingRules = (pricingRulesData || [])
    .filter(rule => !rule.ruleType.startsWith("product_") && rule.ruleType !== "payout")
    .map(rule => ({
      id: rule.id,
      name: rule.ruleType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      type: rule.multiplier ? "MULTIPLIER" : "FLAT",
      value: rule.multiplier || Number(rule.basePrice || 0),
      condition: rule.propertyType || rule.county || rule.jobType || "custom",
      originalRule: rule,
    }));

  // Transform payout rules from DB
  const payoutRates = (pricingRulesData || [])
    .filter(rule => rule.ruleType === "payout" || rule.appraiserPayoutPercent)
    .map(rule => ({
      id: rule.id,
      jobType: rule.jobType?.replace(/_/g, " ") || "General",
      basePayout: Number(rule.basePrice || 0),
      percentage: rule.appraiserPayoutPercent || 50,
    }));

  // Fallback for empty payout data
  const displayPayoutRates = payoutRates.length > 0 ? payoutRates : [
    { id: "1", jobType: "On-Site Verification", basePayout: 75, percentage: 50 },
    { id: "2", jobType: "Certified Appraisal", basePayout: 225, percentage: 50 },
    { id: "3", jobType: "Rush On-Site", basePayout: 100, percentage: 45 },
    { id: "4", jobType: "Rush Certified", basePayout: 300, percentage: 45 },
  ];

  const handleSaveProduct = (productId: string) => {
    updateProductPrice.mutate({
      productId,
      basePrice: editingProductPrice,
    });
  };

  const handleCreateRule = () => {
    const value = parseFloat(newRule.value);
    if (isNaN(value)) return;

    createRule.mutate({
      ruleType: newRule.name.toLowerCase().replace(/\s+/g, "_"),
      ...(newRule.type === "MULTIPLIER" ? { multiplier: value } : { basePrice: value }),
      ...(newRule.propertyType && { propertyType: newRule.propertyType as "SINGLE_FAMILY" | "MULTI_FAMILY" | "CONDO" | "TOWNHOUSE" | "COMMERCIAL" | "LAND" | "MIXED_USE" }),
      ...(newRule.jobType && { jobType: newRule.jobType as "ONSITE_PHOTOS" | "CERTIFIED_APPRAISAL" }),
      ...(newRule.county && { county: newRule.county }),
    });
  };

  const handleUpdateRule = (ruleId: string) => {
    if (!editingRule) return;

    updateRule.mutate({
      id: ruleId,
      ...(editingRule.multiplier !== undefined && { multiplier: editingRule.multiplier }),
      ...(editingRule.basePrice !== undefined && { basePrice: editingRule.basePrice }),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Pricing Configuration</h1>
          <p className="text-[var(--muted-foreground)]">Manage product prices, rules, and appraiser payouts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <nav className="flex gap-6">
          {[
            { id: "products", label: "Product Prices", icon: DollarSign },
            { id: "rules", label: "Pricing Rules", icon: Settings },
            { id: "payouts", label: "Appraiser Payouts", icon: Percent },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Product Prices */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[var(--foreground)]">{product.name}</h3>
                  <button
                    onClick={() => {
                      setEditingProductId(product.id);
                      setEditingProductPrice(product.basePrice);
                    }}
                    className="p-2 hover:bg-[var(--muted)] rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Base Price</p>
                    {editingProductId === product.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--muted-foreground)]">$</span>
                        <input
                          type="number"
                          value={editingProductPrice}
                          onChange={(e) => setEditingProductPrice(parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)]"
                        />
                        <button
                          onClick={() => handleSaveProduct(product.id)}
                          disabled={updateProductPrice.isPending}
                          className="p-1 text-green-400 hover:bg-green-500/10 rounded disabled:opacity-50"
                        >
                          {updateProductPrice.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingProductId(null)}
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-[var(--foreground)]">${product.basePrice}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Turnaround</p>
                    <p className="font-medium text-[var(--foreground)]">{product.turnaround}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Rules */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>

          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
            <table className="w-full">
              <thead className="bg-[var(--secondary)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Rule Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {pricingRules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--muted-foreground)]">
                      No pricing rules configured. Add a rule to get started.
                    </td>
                  </tr>
                ) : (
                  pricingRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="px-6 py-4 font-medium text-[var(--foreground)]">{rule.name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rule.type === "MULTIPLIER"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {rule.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {editingRule?.id === rule.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              value={rule.type === "MULTIPLIER" ? editingRule?.multiplier : editingRule?.basePrice}
                              onChange={(e) => {
                                if (!editingRule) return;
                                const val = parseFloat(e.target.value) || 0;
                                setEditingRule({
                                  ...editingRule,
                                  ...(rule.type === "MULTIPLIER" ? { multiplier: val } : { basePrice: val }),
                                });
                              }}
                              className="w-20 px-2 py-1 border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)]"
                            />
                            <button
                              onClick={() => handleUpdateRule(rule.id)}
                              disabled={updateRule.isPending}
                              className="p-1 text-green-400 hover:bg-green-500/10 rounded disabled:opacity-50"
                            >
                              {updateRule.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setEditingRule(null)}
                              className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-medium text-[var(--foreground)]">
                            {rule.type === "MULTIPLIER" ? `${rule.value}x` : `+$${rule.value}`}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-[var(--muted-foreground)]">{rule.condition}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingRule({
                                id: rule.id,
                                ...(rule.type === "MULTIPLIER" ? { multiplier: rule.value } : { basePrice: rule.value }),
                              });
                            }}
                            className="p-2 hover:bg-[var(--muted)] rounded-lg"
                          >
                            <Edit className="w-4 h-4 text-[var(--muted-foreground)]" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(rule.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-400">Pricing Rule Order</p>
              <p className="text-sm text-yellow-300">
                Rules are applied in order. Multipliers are calculated on the base price, flat amounts are added after.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Appraiser Payouts */}
      {activeTab === "payouts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Payout Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Payout Schedule
                  </label>
                  <select className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]">
                    <option>Weekly (Every Monday)</option>
                    <option>Bi-weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Minimum Payout Amount
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--muted-foreground)]">$</span>
                    <input
                      type="number"
                      defaultValue={50}
                      className="w-24 px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Payment Method
                  </label>
                  <select className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]">
                    <option>Stripe Connect</option>
                    <option>Bank Transfer (ACH)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Payout Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Total Pending</span>
                  <span className="font-bold text-[var(--foreground)]">
                    ${payoutSummary?.totalPending.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Next Payout Date</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {payoutSummary?.nextPayoutDate
                      ? new Date(payoutSummary.nextPayoutDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Appraisers to Pay</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {payoutSummary?.appraiserCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Avg Payout</span>
                  <span className="font-medium text-[var(--foreground)]">
                    ${payoutSummary?.avgPayout || 0}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPayoutConfirm(true)}
                disabled={!payoutSummary?.appraiserCount || payoutSummary.appraiserCount === 0}
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process Payouts Now
              </button>
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-[var(--foreground)]">Job Type Payout Rates</h3>
            </div>
            <table className="w-full">
              <thead className="bg-[var(--secondary)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Job Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Base Payout</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">% of Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Platform Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {displayPayoutRates.map((rate) => (
                  <tr key={rate.id}>
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">{rate.jobType}</td>
                    <td className="px-6 py-4 text-[var(--foreground)]">${rate.basePayout}</td>
                    <td className="px-6 py-4 text-[var(--foreground)]">{rate.percentage}%</td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{100 - rate.percentage}%</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          toast({
                            title: "Feature in development",
                            description: "Payout rate editing is coming soon. Contact engineering to adjust payout rates.",
                          });
                        }}
                        className="p-2 hover:bg-[var(--muted)] rounded-lg"
                      >
                        <Edit className="w-4 h-4 text-[var(--muted-foreground)]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Add Pricing Rule</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-[var(--muted)] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g., Weekend Premium"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Type</label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value as "FLAT" | "MULTIPLIER" })}
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]"
                  >
                    <option value="FLAT">Flat Amount</option>
                    <option value="MULTIPLIER">Multiplier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={newRule.type === "MULTIPLIER" ? "e.g., 1.25" : "e.g., 50"}
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Property Type (optional)</label>
                <select
                  value={newRule.propertyType}
                  onChange={(e) => setNewRule({ ...newRule, propertyType: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]"
                >
                  <option value="">Any</option>
                  <option value="SINGLE_FAMILY">Single Family</option>
                  <option value="MULTI_FAMILY">Multi Family</option>
                  <option value="CONDO">Condo</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="LAND">Land</option>
                  <option value="MIXED_USE">Mixed Use</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Job Type (optional)</label>
                <select
                  value={newRule.jobType}
                  onChange={(e) => setNewRule({ ...newRule, jobType: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]"
                >
                  <option value="">Any</option>
                  <option value="ONSITE_PHOTOS">On-Site Photos</option>
                  <option value="CERTIFIED_APPRAISAL">Certified Appraisal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">County (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Harris"
                  value={newRule.county}
                  onChange={(e) => setNewRule({ ...newRule, county: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                disabled={!newRule.name || !newRule.value || createRule.isPending}
                className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {createRule.isPending ? "Adding..." : "Add Rule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Delete Rule</h2>
                <p className="text-sm text-[var(--muted-foreground)]">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Are you sure you want to delete this pricing rule? This will deactivate the rule immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteRule.mutate({ id: showDeleteConfirm })}
                disabled={deleteRule.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteRule.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Confirmation Modal */}
      {showPayoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Process Payouts</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Confirm payout processing</p>
              </div>
            </div>
            <div className="bg-[var(--secondary)] rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Total Amount</span>
                <span className="font-bold text-[var(--foreground)]">${payoutSummary?.totalPending.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Appraisers</span>
                <span className="font-medium text-[var(--foreground)]">{payoutSummary?.appraiserCount}</span>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              This will initiate payouts to all eligible appraisers. Payments will be processed via Stripe Connect.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPayoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => processPayouts.mutate({})}
                disabled={processPayouts.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processPayouts.isPending ? "Processing..." : "Process Payouts"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
