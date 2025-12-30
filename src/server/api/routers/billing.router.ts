/**
 * Billing Router
 * Handles subscriptions, payments, and invoices with Stripe integration
 */

import { z } from "zod";
import { createTRPCRouter, clientProcedure, appraiserProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import * as stripe from "@/shared/lib/stripe";

const PRICE_IDS = {
  STARTER: null, // Free tier
  PROFESSIONAL: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID,
};

const PRODUCT_PRICES = {
  AI_REPORT: 2900, // $29.00 in cents
  AI_REPORT_WITH_ONSITE: 14900, // $149.00 in cents
  CERTIFIED_APPRAISAL: 44900, // $449.00 in cents
};

export const billingRouter = createTRPCRouter({
  /**
   * Subscription management
   */
  subscription: createTRPCRouter({
    get: clientProcedure.query(async ({ ctx }) => {
      const org = ctx.organization!;

      let subscriptionData: {
        id: string;
        status: string;
        currentPeriodEnd: Date;
        cancelAtPeriodEnd: boolean;
      } | null = null;

      if (org.stripeCustomerId) {
        try {
          const subscription = await stripe.getSubscription(org.stripeCustomerId);
          if (subscription) {
            // Cast to access raw API response properties
            const sub = subscription as unknown as {
              id: string;
              status: string;
              current_period_end: number;
              cancel_at_period_end: boolean;
            };
            subscriptionData = {
              id: sub.id,
              status: sub.status,
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            };
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
        }
      }

      return {
        plan: org.plan,
        seats: org.seats,
        trialEndsAt: org.trialEndsAt,
        stripeCustomerId: org.stripeCustomerId,
        subscription: subscriptionData,
      };
    }),

    update: clientProcedure
      .input(
        z.object({
          plan: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const org = ctx.organization!;
        const priceId = PRICE_IDS[input.plan];

        if (input.plan === "STARTER") {
          // Downgrading to free tier - cancel subscription
          if (org.stripeCustomerId) {
            const subscription = await stripe.getSubscription(org.stripeCustomerId);
            if (subscription) {
              await stripe.cancelSubscription(subscription.id);
            }
          }

          return ctx.prisma.organization.update({
            where: { id: org.id },
            data: { plan: "STARTER" },
          });
        }

        if (!priceId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid plan or price not configured",
          });
        }

        // Ensure customer exists
        let customerId = org.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.getOrCreateCustomer({
            organizationId: org.id,
            email: ctx.user.email || "",
            name: org.name,
          });
          customerId = customer.id;

          await ctx.prisma.organization.update({
            where: { id: org.id },
            data: { stripeCustomerId: customerId },
          });
        }

        // Check for existing subscription
        const existingSubscription = await stripe.getSubscription(customerId);

        if (existingSubscription) {
          // Update existing subscription
          await stripe.updateSubscription(existingSubscription.id, priceId);
        } else {
          // Create checkout session for new subscription
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          const session = await stripe.createSubscriptionCheckout({
            customerId,
            priceId,
            successUrl: `${baseUrl}/billing?success=true`,
            cancelUrl: `${baseUrl}/billing?canceled=true`,
          });

          return {
            requiresCheckout: true,
            checkoutUrl: session.url,
          };
        }

        return ctx.prisma.organization.update({
          where: { id: org.id },
          data: { plan: input.plan },
        });
      }),

    cancel: clientProcedure.mutation(async ({ ctx }) => {
      const org = ctx.organization!;

      if (org.stripeCustomerId) {
        const subscription = await stripe.getSubscription(org.stripeCustomerId);
        if (subscription) {
          await stripe.cancelSubscription(subscription.id);
        }
      }

      return ctx.prisma.organization.update({
        where: { id: org.id },
        data: { plan: "STARTER" },
      });
    }),
  }),

  /**
   * Payment methods
   */
  paymentMethods: createTRPCRouter({
    list: clientProcedure.query(async ({ ctx }) => {
      const org = ctx.organization!;

      if (!org.stripeCustomerId) {
        return [];
      }

      try {
        const methods = await stripe.listPaymentMethods(org.stripeCustomerId);
        return methods.map((pm) => ({
          id: pm.id,
          brand: pm.card?.brand || "unknown",
          last4: pm.card?.last4 || "****",
          expMonth: pm.card?.exp_month || 0,
          expYear: pm.card?.exp_year || 0,
          isDefault: false, // Will be set by customer query
        }));
      } catch (error) {
        console.error("Error listing payment methods:", error);
        return [];
      }
    }),

    add: clientProcedure.mutation(async ({ ctx }) => {
      const org = ctx.organization!;

      // Ensure customer exists
      let customerId = org.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.getOrCreateCustomer({
          organizationId: org.id,
          email: ctx.user.email || "",
          name: org.name,
        });
        customerId = customer.id;

        await ctx.prisma.organization.update({
          where: { id: org.id },
          data: { stripeCustomerId: customerId },
        });
      }

      // Create SetupIntent for secure payment method collection
      const setupIntent = await stripe.createSetupIntent(customerId);

      return {
        clientSecret: setupIntent.client_secret,
        customerId,
      };
    }),

    remove: clientProcedure
      .input(z.object({ paymentMethodId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await stripe.detachPaymentMethod(input.paymentMethodId);
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove payment method",
          });
        }
      }),

    setDefault: clientProcedure
      .input(z.object({ paymentMethodId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const org = ctx.organization!;

        if (!org.stripeCustomerId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No customer account found",
          });
        }

        try {
          await stripe.setDefaultPaymentMethod(
            org.stripeCustomerId,
            input.paymentMethodId
          );
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to set default payment method",
          });
        }
      }),
  }),

  /**
   * Invoices
   */
  invoices: createTRPCRouter({
    list: clientProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const org = ctx.organization!;

        // First get local payment records
        const payments = await ctx.prisma.payment.findMany({
          where: {
            organizationId: org.id,
            type: "CHARGE",
          },
          orderBy: { createdAt: "desc" },
          take: input.limit + 1,
          ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        });

        let nextCursor: string | undefined;
        if (payments.length > input.limit) {
          const nextItem = payments.pop();
          nextCursor = nextItem?.id;
        }

        // Also fetch Stripe invoices if customer exists
        let stripeInvoices: Array<{
          id: string;
          number: string | null;
          amount: number;
          status: string;
          createdAt: Date;
          pdfUrl: string | null;
        }> = [];

        if (org.stripeCustomerId) {
          try {
            const invoices = await stripe.listInvoices(org.stripeCustomerId, 10);
            stripeInvoices = invoices.map((inv) => ({
              id: inv.id,
              number: inv.number ?? null,
              amount: inv.amount_paid / 100,
              status: inv.status || "unknown",
              createdAt: new Date(inv.created * 1000),
              pdfUrl: inv.invoice_pdf ?? null,
            }));
          } catch (error) {
            console.error("Error fetching Stripe invoices:", error);
          }
        }

        return { items: payments, stripeInvoices, nextCursor };
      }),

    getById: clientProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const payment = await ctx.prisma.payment.findUnique({
          where: { id: input.id },
        });

        if (!payment || payment.organizationId !== ctx.organization!.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return payment;
      }),

    downloadUrl: clientProcedure
      .input(z.object({ invoiceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const url = await stripe.getInvoicePdfUrl(input.invoiceId);
          if (!url) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Invoice PDF not available",
            });
          }
          return { url };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get invoice download URL",
          });
        }
      }),
  }),

  /**
   * Update billing information
   */
  updateBillingInfo: clientProcedure
    .input(
      z.object({
        billingEmail: z.string().email().optional(),
        companyName: z.string().min(1).optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const org = ctx.organization!;

      // Update organization billing info
      const updateData: {
        billingEmail?: string;
        name?: string;
        address?: string;
      } = {};

      if (input.billingEmail) updateData.billingEmail = input.billingEmail;
      if (input.companyName) updateData.name = input.companyName;
      if (input.address) updateData.address = input.address;

      // Update Stripe customer if exists
      if (org.stripeCustomerId && (input.billingEmail || input.companyName)) {
        try {
          const stripeInstance = stripe.getStripe();
          await stripeInstance.customers.update(org.stripeCustomerId, {
            email: input.billingEmail || undefined,
            name: input.companyName || undefined,
          });
        } catch (error) {
          console.error("Failed to update Stripe customer:", error);
          // Don't fail the mutation if Stripe update fails
        }
      }

      return ctx.prisma.organization.update({
        where: { id: org.id },
        data: updateData,
      });
    }),

  /**
   * Usage stats
   */
  usage: clientProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [aiReports, onsiteJobs, certifiedJobs] = await Promise.all([
      ctx.prisma.appraisalRequest.count({
        where: {
          organizationId: ctx.organization!.id,
          createdAt: { gte: startOfMonth },
          requestedType: "AI_REPORT",
        },
      }),
      ctx.prisma.job.count({
        where: {
          organizationId: ctx.organization!.id,
          createdAt: { gte: startOfMonth },
          jobType: "ONSITE_PHOTOS",
        },
      }),
      ctx.prisma.job.count({
        where: {
          organizationId: ctx.organization!.id,
          createdAt: { gte: startOfMonth },
          jobType: "CERTIFIED_APPRAISAL",
        },
      }),
    ]);

    const totalSpent = await ctx.prisma.payment.aggregate({
      where: {
        organizationId: ctx.organization!.id,
        type: "CHARGE",
        status: "COMPLETED",
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });

    return {
      aiReports,
      onsiteJobs,
      certifiedJobs,
      totalSpent: Number(totalSpent._sum.amount || 0),
      billingPeriod: {
        start: startOfMonth,
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      },
    };
  }),

  /**
   * Appraiser payout settings
   */
  payout: createTRPCRouter({
    settings: appraiserProcedure.query(async ({ ctx }) => {
      return {
        stripeConnectId: ctx.appraiserProfile.stripeConnectId,
        payoutEnabled: ctx.appraiserProfile.payoutEnabled,
      };
    }),

    setupLink: appraiserProcedure.mutation(async ({ ctx }) => {
      const profile = ctx.appraiserProfile;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      let accountId = profile.stripeConnectId;

      // Create Connect account if doesn't exist
      if (!accountId) {
        const account = await stripe.createConnectAccount({
          email: ctx.user.email || "",
          userId: ctx.user.id,
        });
        accountId = account.id;

        await ctx.prisma.appraiserProfile.update({
          where: { userId: ctx.user.id },
          data: { stripeConnectId: accountId },
        });
      }

      // Generate onboarding link
      const accountLink = await stripe.createConnectAccountLink({
        accountId,
        refreshUrl: `${baseUrl}/appraiser/profile?tab=payout&refresh=true`,
        returnUrl: `${baseUrl}/appraiser/profile?tab=payout&success=true`,
      });

      return { url: accountLink.url };
    }),

    complete: appraiserProcedure
      .input(z.object({ stripeConnectId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.appraiserProfile.update({
          where: { userId: ctx.user.id },
          data: {
            stripeConnectId: input.stripeConnectId,
            payoutEnabled: true,
          },
        });
      }),

    history: appraiserProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        const payouts = await ctx.prisma.payment.findMany({
          where: {
            type: "PAYOUT",
            userId: ctx.user.id, // Filter payouts for this appraiser only
          },
          orderBy: { createdAt: "desc" },
          take: input.limit,
        });

        return payouts;
      }),
  }),

  /**
   * Create checkout session for appraisal purchase
   */
  checkout: clientProcedure
    .input(
      z.object({
        appraisalRequestId: z.string(),
        reportType: z.enum(["AI_REPORT", "AI_REPORT_WITH_ONSITE", "CERTIFIED_APPRAISAL"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const org = ctx.organization!;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      // Get appraisal request
      const appraisal = await ctx.prisma.appraisalRequest.findUnique({
        where: { id: input.appraisalRequestId },
        include: { property: true },
      });

      if (!appraisal || appraisal.organizationId !== org.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appraisal request not found",
        });
      }

      const priceInCents = PRODUCT_PRICES[input.reportType];
      const productName = input.reportType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      // Ensure customer exists
      let customerId = org.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.getOrCreateCustomer({
          organizationId: org.id,
          email: ctx.user.email || "",
          name: org.name,
        });
        customerId = customer.id;

        await ctx.prisma.organization.update({
          where: { id: org.id },
          data: { stripeCustomerId: customerId },
        });
      }

      // Create checkout session
      const session = await stripe.createCheckoutSession({
        organizationId: org.id,
        appraisalRequestId: input.appraisalRequestId,
        priceInCents,
        productName: `${productName} - ${appraisal.property.addressFull}`,
        customerEmail: ctx.user.email || "",
        successUrl: `${baseUrl}/appraisals/${input.appraisalRequestId}?payment=success`,
        cancelUrl: `${baseUrl}/appraisals/${input.appraisalRequestId}?payment=canceled`,
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Admin: Process refund for a payment
   */
  refund: createTRPCRouter({
    process: adminProcedure
      .input(
        z.object({
          paymentId: z.string(),
          amount: z.number().min(0.01).optional(), // Partial or full refund
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Find the original payment
        const payment = await ctx.prisma.payment.findUnique({
          where: { id: input.paymentId },
        });

        if (!payment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Payment not found",
          });
        }

        if (payment.type !== "CHARGE" || payment.status !== "COMPLETED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only completed charges can be refunded",
          });
        }

        if (!payment.stripePaymentIntentId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Payment does not have a Stripe reference",
          });
        }

        const refundAmount = input.amount || Number(payment.amount);

        // Check refund amount doesn't exceed original payment
        if (refundAmount > Number(payment.amount)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Refund amount cannot exceed original payment amount",
          });
        }

        // Process refund via Stripe
        let stripeRefund;
        try {
          stripeRefund = await stripe.createRefund({
            paymentIntentId: payment.stripePaymentIntentId,
            amount: refundAmount,
            reason: "requested_by_customer",
          });
        } catch (error) {
          console.error("Stripe refund failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to process refund with Stripe",
          });
        }

        // Create refund payment record
        const refundPayment = await ctx.prisma.payment.create({
          data: {
            organizationId: payment.organizationId,
            type: "REFUND",
            amount: -refundAmount,
            description: input.reason || `Refund for payment ${payment.id}`,
            status: "COMPLETED",
            stripePaymentIntentId: stripeRefund.id,
            relatedJobId: payment.relatedJobId,
            relatedAppraisalId: payment.relatedAppraisalId,
          },
        });

        return {
          refundId: refundPayment.id,
          stripeRefundId: stripeRefund.id,
          amount: refundAmount,
          status: stripeRefund.status,
        };
      }),

    /**
     * Get refund history for a payment
     */
    history: adminProcedure
      .input(z.object({ paymentId: z.string() }))
      .query(async ({ ctx, input }) => {
        // Find original payment
        const payment = await ctx.prisma.payment.findUnique({
          where: { id: input.paymentId },
        });

        if (!payment) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Build OR conditions for related entities
        const orConditions: Array<{ relatedJobId?: string; relatedAppraisalId?: string }> = [];
        if (payment.relatedJobId) {
          orConditions.push({ relatedJobId: payment.relatedJobId });
        }
        if (payment.relatedAppraisalId) {
          orConditions.push({ relatedAppraisalId: payment.relatedAppraisalId });
        }

        // If no related entities, return empty array
        if (orConditions.length === 0) {
          return [];
        }

        // Find all refunds for this payment's related entities
        const refunds = await ctx.prisma.payment.findMany({
          where: {
            type: "REFUND",
            OR: orConditions,
          },
          orderBy: { createdAt: "desc" },
        });

        return refunds;
      }),
  }),
});
