/**
 * Stripe Client
 * Project LENS - Texas V1
 */

import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(key, {
      apiVersion: "2025-12-15.clover",
    });
  }
  return stripeInstance;
}

/**
 * Create a Stripe Checkout Session for appraisal payment
 */
export async function createCheckoutSession(params: {
  organizationId: string;
  appraisalRequestId: string;
  priceInCents: number;
  productName: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: params.productName,
            description: `Appraisal Request ID: ${params.appraisalRequestId}`,
          },
          unit_amount: params.priceInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "appraisal",
      organizationId: params.organizationId,
      appraisalRequestId: params.appraisalRequestId,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
}

/**
 * Create a Stripe subscription checkout session
 */
export async function createSubscriptionCheckout(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: params.customerId,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
}

/**
 * Get or create a Stripe customer for an organization
 */
export async function getOrCreateCustomer(params: {
  organizationId: string;
  email: string;
  name: string;
  existingCustomerId?: string | null;
}): Promise<Stripe.Customer> {
  const stripe = getStripe();

  if (params.existingCustomerId) {
    const customer = await stripe.customers.retrieve(params.existingCustomerId);
    if (!customer.deleted) {
      return customer as Stripe.Customer;
    }
  }

  return stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      organizationId: params.organizationId,
    },
  });
}

/**
 * List payment methods for a customer
 */
export async function listPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  const stripe = getStripe();

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });

  return paymentMethods.data;
}

/**
 * Create a SetupIntent for adding a new payment method
 */
export async function createSetupIntent(
  customerId: string
): Promise<Stripe.SetupIntent> {
  const stripe = getStripe();

  return stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
  });
}

/**
 * Detach a payment method from a customer
 */
export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  const stripe = getStripe();
  return stripe.paymentMethods.detach(paymentMethodId);
}

/**
 * Set default payment method for a customer
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.Customer> {
  const stripe = getStripe();

  return stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
}

/**
 * Get subscription for a customer
 */
export async function getSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe();

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });

  return subscriptions.data[0] || null;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const itemId = subscription.items.data[0]?.id;

  if (!itemId) {
    throw new Error("Subscription has no items");
  }

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: itemId,
        price: priceId,
      },
    ],
  });
}

/**
 * List invoices for a customer
 */
export async function listInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  const stripe = getStripe();

  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data;
}

/**
 * Get invoice PDF URL
 */
export async function getInvoicePdfUrl(
  invoiceId: string
): Promise<string | null> {
  const stripe = getStripe();
  const invoice = await stripe.invoices.retrieve(invoiceId);
  return invoice.invoice_pdf ?? null;
}

/**
 * Create Stripe Connect account link for appraiser onboarding
 */
export async function createConnectAccountLink(params: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<Stripe.AccountLink> {
  const stripe = getStripe();

  return stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: "account_onboarding",
  });
}

/**
 * Create a Stripe Connect account for an appraiser
 */
export async function createConnectAccount(params: {
  email: string;
  userId: string;
}): Promise<Stripe.Account> {
  const stripe = getStripe();

  return stripe.accounts.create({
    type: "express",
    country: "US",
    email: params.email,
    capabilities: {
      transfers: { requested: true },
    },
    metadata: {
      userId: params.userId,
    },
  });
}

/**
 * Create a transfer to an appraiser's Connect account
 */
export async function createTransfer(params: {
  amount: number;
  destinationAccountId: string;
  description: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Transfer> {
  const stripe = getStripe();

  return stripe.transfers.create({
    amount: Math.round(params.amount * 100), // Convert to cents
    currency: "usd",
    destination: params.destinationAccountId,
    description: params.description,
    metadata: params.metadata,
  });
}

/**
 * Create a refund
 */
export async function createRefund(params: {
  paymentIntentId: string;
  amount?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}): Promise<Stripe.Refund> {
  const stripe = getStripe();

  return stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    amount: params.amount ? Math.round(params.amount * 100) : undefined,
    reason: params.reason,
  });
}

/**
 * Create a Stripe Checkout Session for marketplace purchases
 */
export async function createMarketplaceCheckout(params: {
  organizationId: string;
  listingIds: string[];
  lineItems: Array<{
    name: string;
    description: string;
    amount: number;
    quantity: number;
  }>;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: params.customerEmail,
    line_items: params.lineItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: item.amount,
      },
      quantity: item.quantity,
    })),
    metadata: {
      type: "marketplace",
      organizationId: params.organizationId,
      listingIds: params.listingIds.join(","),
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
}
