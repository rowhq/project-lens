import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/server/db/prisma";
import { getStripe } from "@/shared/lib/stripe";
import { sendPaymentConfirmation } from "@/shared/lib/resend";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        await handleTransferCreated(transfer);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      case "refund.created":
      case "refund.updated": {
        const refund = event.data.object as Stripe.Refund;
        await handleRefundEvent(refund);
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { metadata } = session;
  if (!metadata) return;

  if (metadata.type === "appraisal") {
    // Update appraisal request as paid - starts processing
    const appraisalRequest = await prisma.appraisalRequest.update({
      where: { id: metadata.appraisalRequestId },
      data: { status: "QUEUED" },
      include: {
        requestedBy: true,
        property: true,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        organizationId: metadata.organizationId,
        relatedAppraisalId: metadata.appraisalRequestId,
        stripePaymentIntentId: session.payment_intent as string,
        amount: session.amount_total! / 100,
        status: "COMPLETED",
        type: "CHARGE",
      },
    });

    // Send payment confirmation email
    try {
      await sendPaymentConfirmation({
        email: appraisalRequest.requestedBy.email || "",
        userName: appraisalRequest.requestedBy.firstName,
        amount: session.amount_total! / 100,
        description: `Appraisal for ${appraisalRequest.property.addressFull}`,
      });
    } catch (error) {
      console.error("Failed to send payment confirmation:", error);
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find organization by Stripe customer ID
  const organization = await prisma.organization.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!organization) return;

  // Determine tier from price
  const priceId = subscription.items.data[0]?.price.id;
  let tier: "STARTER" | "PROFESSIONAL" | "ENTERPRISE" = "STARTER";

  if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
    tier = "PROFESSIONAL";
  } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
    tier = "ENTERPRISE";
  }

  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      plan: tier,
    },
  });
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const organization = await prisma.organization.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!organization) return;

  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      plan: "STARTER",
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const organization = await prisma.organization.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!organization) return;

  // Create invoice record
  await prisma.payment.create({
    data: {
      organizationId: organization.id,
      stripePaymentIntentId: invoice.id, // Use invoice ID as reference
      amount: invoice.amount_paid / 100,
      status: "COMPLETED",
      type: "CHARGE",
      description: `Invoice ${invoice.number || invoice.id}`,
    },
  });
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const organization = await prisma.organization.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!organization) return;

  // Create notification for failed payment
  const admins = await prisma.user.findMany({
    where: {
      organizationId: organization.id,
      role: "CLIENT",
    },
    take: 5,
  });

  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: "PAYMENT_FAILED",
        title: "Payment Failed",
        body: `Your subscription payment of $${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method.`,
        channel: "email",
      },
    });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  if (!metadata?.paymentId) return;

  await prisma.payment.update({
    where: { id: metadata.paymentId },
    data: { status: "COMPLETED" },
  });
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  const { metadata } = transfer;
  if (!metadata?.payoutId) return;

  // Update payout record
  await prisma.payment.update({
    where: { id: metadata.payoutId },
    data: {
      status: "COMPLETED",
      stripeTransferId: transfer.id,
    },
  });
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  // Get the payment intent ID from the charge
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  // Find original payment by payment intent
  const originalPayment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { organization: true },
  });

  if (!originalPayment) {
    console.log(`No payment found for refunded charge: ${charge.id}`);
    return;
  }

  // Create notification for the organization
  if (originalPayment.organizationId) {
    const orgUsers = await prisma.user.findMany({
      where: {
        organizationId: originalPayment.organizationId,
        role: { in: ["CLIENT", "ADMIN"] },
      },
      take: 5,
    });

    for (const user of orgUsers) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "PAYMENT_REFUNDED",
          title: "Refund Processed",
          body: `A refund of $${(charge.amount_refunded / 100).toFixed(2)} has been processed for your account.`,
          channel: "email",
        },
      });
    }
  }
}

async function handleRefundEvent(refund: Stripe.Refund) {
  // Update refund payment record if exists
  const refundPayment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: refund.id },
  });

  if (refundPayment) {
    const newStatus = refund.status === "succeeded" ? "COMPLETED" :
                      refund.status === "failed" ? "FAILED" :
                      refund.status === "canceled" ? "CANCELLED" : "PENDING";

    await prisma.payment.update({
      where: { id: refundPayment.id },
      data: {
        status: newStatus,
        statusMessage: refund.status === "failed" ? (refund.failure_reason || "Refund failed") : null,
      },
    });
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  // Handle Stripe Connect account updates for appraisers
  const accountId = account.id;

  // Find appraiser profile by Stripe Connect ID
  const appraiserProfile = await prisma.appraiserProfile.findFirst({
    where: { stripeConnectId: accountId },
    include: { user: true },
  });

  if (!appraiserProfile) {
    console.log(`No appraiser profile found for Stripe account: ${accountId}`);
    return;
  }

  // Check if the account is fully onboarded and can receive payouts
  const chargesEnabled = account.charges_enabled;
  const payoutsEnabled = account.payouts_enabled;
  const detailsSubmitted = account.details_submitted;

  // Account is ready for payouts when all requirements are met
  const isPayoutReady = chargesEnabled && payoutsEnabled && detailsSubmitted;

  // Only update if status has changed
  if (appraiserProfile.payoutEnabled !== isPayoutReady) {
    await prisma.appraiserProfile.update({
      where: { userId: appraiserProfile.userId },
      data: { payoutEnabled: isPayoutReady },
    });

    // Create notification for the appraiser
    if (isPayoutReady && !appraiserProfile.payoutEnabled) {
      await prisma.notification.create({
        data: {
          userId: appraiserProfile.userId,
          type: "PAYOUT_ENABLED",
          title: "Payouts Enabled",
          body: "Your Stripe account is now fully set up. You can now receive payouts for completed jobs.",
          channel: "email",
        },
      });
    } else if (!isPayoutReady && appraiserProfile.payoutEnabled) {
      // Payouts were disabled - notify appraiser
      await prisma.notification.create({
        data: {
          userId: appraiserProfile.userId,
          type: "PAYOUT_DISABLED",
          title: "Payouts Disabled",
          body: "Your Stripe account requires attention. Please update your account information to continue receiving payouts.",
          channel: "email",
        },
      });
    }

    console.log(`Updated appraiser ${appraiserProfile.userId} payoutEnabled: ${isPayoutReady}`);
  }
}
