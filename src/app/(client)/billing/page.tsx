"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/shared/lib/trpc";
import {
  CreditCard,
  Plus,
  Download,
  Check,
  AlertCircle,
  FileText,
  X,
  Loader2,
  AlertTriangle,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { EmptyState } from "@/shared/components/common/EmptyState";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    description: "For individuals getting started",
    features: ["5 AI Reports/month", "Email support", "Basic analytics"],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 99,
    description: "For growing businesses",
    features: [
      "50 AI Reports/month",
      "Priority support",
      "Advanced analytics",
      "Team collaboration",
      "API access",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    description: "For large organizations",
    features: [
      "Unlimited AI Reports",
      "Dedicated support",
      "Custom integrations",
      "White-label reports",
      "SLA guarantee",
      "Custom pricing",
    ],
    popular: false,
  },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "methods">("overview");
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Billing info form state - initialize with undefined to track if user has edited
  const [companyName, setCompanyName] = useState<string | undefined>(undefined);
  const [billingEmail, setBillingEmail] = useState<string | undefined>(undefined);
  const [billingAddress, setBillingAddress] = useState<string | undefined>(undefined);

  // Queries
  const { data: subscription } = trpc.billing.subscription.get.useQuery();
  const { data: invoicesData } = trpc.billing.invoices.list.useQuery({ limit: 10 });
  const invoices = invoicesData?.items || [];
  const stripeInvoices = invoicesData?.stripeInvoices || [];
  const { data: paymentMethods, refetch: refetchPaymentMethods } = trpc.billing.paymentMethods.list.useQuery();
  const { data: usage } = trpc.billing.usage.useQuery();
  const { data: organization } = trpc.organization.get.useQuery();

  // Derive display values - use form state if set, otherwise use org data
  const displayCompanyName = companyName ?? organization?.name ?? "";
  const displayBillingEmail = billingEmail ?? organization?.billingEmail ?? "";
  const displayBillingAddress = billingAddress ?? organization?.address ?? "";

  // Track form changes using useMemo
  const hasChanges = useMemo(() => {
    if (!organization) return false;
    return (
      (companyName !== undefined && companyName !== (organization.name || "")) ||
      (billingEmail !== undefined && billingEmail !== (organization.billingEmail || "")) ||
      (billingAddress !== undefined && billingAddress !== (organization.address || ""))
    );
  }, [companyName, billingEmail, billingAddress, organization]);

  // Mutations
  const updateBillingInfo = trpc.billing.updateBillingInfo.useMutation({
    onSuccess: () => {
      showFeedback("success", "Billing information updated successfully");
      // Reset form state to undefined so it uses fresh org data
      setCompanyName(undefined);
      setBillingEmail(undefined);
      setBillingAddress(undefined);
    },
    onError: (error) => {
      showFeedback("error", error.message);
    },
  });

  const addPaymentMethod = trpc.billing.paymentMethods.add.useMutation({
    onSuccess: (data) => {
      // In a real implementation, you would use Stripe Elements here
      // For now, we'll just show a message about the setup intent
      if (data.clientSecret) {
        // Redirect to Stripe or open Stripe Elements
        showFeedback("success", "Setup intent created. Please complete payment method setup.");
        setShowAddPaymentModal(false);
        // You would typically use @stripe/react-stripe-js here
        // For demo purposes, we just close the modal
      }
    },
    onError: (error) => {
      showFeedback("error", error.message);
    },
  });

  const removePaymentMethod = trpc.billing.paymentMethods.remove.useMutation({
    onSuccess: () => {
      refetchPaymentMethods();
      setShowRemoveConfirm(null);
      showFeedback("success", "Payment method removed");
    },
    onError: (error) => {
      showFeedback("error", error.message);
    },
  });

  const downloadInvoice = trpc.billing.invoices.downloadUrl.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      showFeedback("error", error.message);
    },
  });

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveBillingInfo = () => {
    updateBillingInfo.mutate({
      companyName: displayCompanyName || undefined,
      billingEmail: displayBillingEmail || undefined,
      address: displayBillingAddress || undefined,
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    downloadInvoice.mutate({ invoiceId });
  };

  const handleRemovePaymentMethod = (paymentMethodId: string) => {
    removePaymentMethod.mutate({ paymentMethodId });
  };

  const currentPlan = subscription?.plan || "STARTER";
  const currentPlanData = plans.find((p) => p.id.toUpperCase() === currentPlan) || plans[0];

  // Combine local and Stripe invoices for display
  const allInvoices = [
    ...stripeInvoices.map((inv) => ({
      id: inv.id,
      number: inv.number,
      amount: inv.amount,
      status: inv.status === "paid" ? "COMPLETED" : inv.status.toUpperCase(),
      createdAt: inv.createdAt,
      isStripe: true,
      pdfUrl: inv.pdfUrl,
    })),
    ...invoices.map((inv) => ({
      id: inv.id,
      number: null,
      amount: Number(inv.amount),
      status: inv.status,
      createdAt: inv.createdAt,
      isStripe: false,
      pdfUrl: null,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Billing</h1>
        <p className="text-[var(--muted-foreground)]">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan Summary */}
      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">Current Plan</p>
            <h2 className="text-2xl font-bold">
              {subscription?.plan === "PROFESSIONAL" ? "Professional" :
               subscription?.plan === "ENTERPRISE" ? "Enterprise" : "Starter"}
            </h2>
            <p className="text-white/70 mt-1">
              {subscription?.subscription?.status === "active"
                ? `Renews ${new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}`
                : "Free plan"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">
              ${currentPlanData?.price || 0}
            </p>
            <p className="text-white/70">/month</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-sm">Reports Used</p>
            <p className="text-2xl font-bold">{usage?.aiReports || 0} / {currentPlan === "ENTERPRISE" ? "Unlimited" : currentPlan === "PROFESSIONAL" ? "50" : "5"}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-sm">This Period</p>
            <p className="text-2xl font-bold">${(usage?.totalSpent || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-sm">Billing Period</p>
            <p className="text-2xl font-bold">
              {usage?.billingPeriod?.end
                ? new Date(usage.billingPeriod.end).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <nav className="flex gap-6">
          {[
            { id: "overview", label: "Plans" },
            { id: "invoices", label: "Invoices" },
            { id: "methods", label: "Payment Methods" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Plans */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id.toUpperCase() === currentPlan;
            return (
              <div
                key={plan.id}
                className={`bg-[var(--card)] rounded-lg border p-6 ${
                  plan.popular ? "border-[var(--primary)] ring-2 ring-[var(--primary)]" : "border-[var(--border)]"
                }`}
              >
                {plan.popular && (
                  <span className="inline-block px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-[var(--foreground)]">{plan.name}</h3>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[var(--foreground)]">${plan.price}</span>
                  <span className="text-[var(--muted-foreground)]">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full mt-6 py-2 rounded-lg font-medium transition-colors ${
                    isCurrentPlan
                      ? "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-default"
                      : plan.popular
                      ? "bg-[var(--primary)] text-black font-medium hover:bg-[var(--primary)]/90"
                      : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]"
                  }`}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? "Current Plan" : plan.id === "enterprise" ? "Contact Sales" : "Upgrade"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoices */}
      {activeTab === "invoices" && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--foreground)]">Invoice History</h3>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-[var(--secondary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {allInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={FileText}
                      title="No invoices yet"
                      description="Your invoices will appear here after your first payment"
                    />
                  </td>
                </tr>
              ) : (
                allInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[var(--muted-foreground)]" />
                        <span className="font-mono text-sm text-[var(--foreground)]">
                          {invoice.number || `INV-${invoice.id.slice(-8).toUpperCase()}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === "COMPLETED" || invoice.status === "paid"
                            ? "bg-green-500/10 text-green-500"
                            : invoice.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {invoice.isStripe && invoice.pdfUrl ? (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--primary)] hover:underline text-sm flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </a>
                      ) : invoice.isStripe ? (
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          disabled={downloadInvoice.isPending}
                          className="text-[var(--primary)] hover:underline text-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          {downloadInvoice.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          PDF
                        </button>
                      ) : (
                        <span className="text-[var(--muted-foreground)] text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {activeTab === "methods" && (
        <div className="space-y-6">
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--foreground)]">Payment Methods</h3>
              <button
                onClick={() => setShowAddPaymentModal(true)}
                className="flex items-center gap-2 text-[var(--primary)] hover:underline text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Method
              </button>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {!paymentMethods || paymentMethods.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No payment methods"
                  description="Add a payment method to upgrade your plan or pay for services"
                  action={{
                    label: "Add Payment Method",
                    onClick: () => setShowAddPaymentModal(true),
                  }}
                />
              ) : (
                paymentMethods.map((method) => (
                  <div key={method.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-[var(--secondary)] rounded flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[var(--muted-foreground)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)] capitalize">
                          {method.brand} ending in {method.last4}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Expires {method.expMonth}/{method.expYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">
                          Default
                        </span>
                      )}
                      <button
                        onClick={() => setShowRemoveConfirm(method.id)}
                        className="text-[var(--muted-foreground)] hover:text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Billing Info */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Billing Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={displayCompanyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Billing Email
                </label>
                <input
                  type="email"
                  value={displayBillingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  placeholder="billing@company.com"
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Billing Address
                </label>
                <input
                  type="text"
                  value={displayBillingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="123 Main Street, Austin, TX 78701"
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
            <button
              onClick={handleSaveBillingInfo}
              disabled={!hasChanges || updateBillingInfo.isPending}
              className="mt-4 px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary)]/90 disabled:bg-[var(--muted)] disabled:cursor-not-allowed flex items-center gap-2"
            >
              {updateBillingInfo.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Add Payment Method</h2>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="p-2 hover:bg-[var(--muted)] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[var(--secondary)] rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--primary)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--foreground)]">Secure Payment</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Your payment information is securely processed by Stripe. We never store your card details.
                  </p>
                </div>
              </div>

              <p className="text-sm text-[var(--muted-foreground)]">
                Click below to securely add a payment method through Stripe.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                onClick={() => addPaymentMethod.mutate()}
                disabled={addPaymentMethod.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {addPaymentMethod.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Continue to Stripe
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Payment Method Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Remove Payment Method</h2>
            </div>

            <p className="text-[var(--muted-foreground)] mb-6">
              Are you sure you want to remove this payment method? If this is your only payment method, you may need to add a new one for future payments.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(null)}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemovePaymentMethod(showRemoveConfirm)}
                disabled={removePaymentMethod.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {removePaymentMethod.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
