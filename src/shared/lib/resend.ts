/**
 * Resend Email Client
 * Project TruPlat - Texas V1
 */

import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

const FROM_EMAIL = process.env.FROM_EMAIL || "TruPlat <noreply@truplat.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://truplat.com";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send a generic email
 */
export async function sendEmail(
  params: SendEmailParams,
): Promise<{ id: string }> {
  const resend = getResend();

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo: params.replyTo,
  });

  if (result.error) {
    throw new Error(`Failed to send email: ${result.error.message}`);
  }

  return { id: result.data?.id || "" };
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(params: {
  email: string;
  userName: string;
  resetToken: string;
}): Promise<{ id: string }> {
  const resetUrl = `${APP_URL}/reset-password?token=${params.resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">TruPlat</h1>
        <p style="color: #666; margin: 5px 0;">Fast Appraisals for Lenders</p>
      </div>

      <h2 style="color: #1f2937;">Reset Your Password</h2>

      <p>Hi ${params.userName},</p>

      <p>We received a request to reset your password. Click the button below to create a new password:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          Reset Password
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        This link will expire in 1 hour for security reasons.
      </p>

      <p style="color: #666; font-size: 14px;">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} TruPlat. All rights reserved.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.email,
    subject: "Reset your TruPlat password",
    html,
  });
}

/**
 * Send team invitation email
 */
export async function sendTeamInvitation(params: {
  email: string;
  inviterName: string;
  organizationName: string;
  role: string;
  inviteToken: string;
}): Promise<{ id: string }> {
  const inviteUrl = `${APP_URL}/invite/${params.inviteToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">TruPlat</h1>
        <p style="color: #666; margin: 5px 0;">Fast Appraisals for Lenders</p>
      </div>

      <h2 style="color: #1f2937;">You're Invited!</h2>

      <p>${params.inviterName} has invited you to join <strong>${params.organizationName}</strong> on TruPlat as a <strong>${params.role}</strong>.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          Accept Invitation
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        If you didn't expect this invitation, you can safely ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} TruPlat. All rights reserved.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.email,
    subject: `${params.inviterName} invited you to join ${params.organizationName} on TruPlat`,
    html,
  });
}

/**
 * Send appraisal ready notification
 */
export async function sendAppraisalReady(params: {
  email: string;
  userName: string;
  propertyAddress: string;
  appraisalId: string;
  reportType: string;
}): Promise<{ id: string }> {
  const viewUrl = `${APP_URL}/appraisals/${params.appraisalId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">TruPlat</h1>
      </div>

      <h2 style="color: #1f2937;">Your Appraisal is Ready!</h2>

      <p>Hi ${params.userName},</p>

      <p>Great news! Your ${params.reportType} for <strong>${params.propertyAddress}</strong> is now complete and ready for download.</p>

      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Property:</strong> ${params.propertyAddress}</p>
        <p style="margin: 10px 0 0;"><strong>Report Type:</strong> ${params.reportType}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${viewUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          View Report
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} TruPlat. All rights reserved.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.email,
    subject: `Your appraisal for ${params.propertyAddress} is ready`,
    html,
  });
}

/**
 * Send job assignment notification to appraiser
 */
export async function sendJobAssignment(params: {
  email: string;
  appraiserName: string;
  propertyAddress: string;
  jobId: string;
  deadline: Date;
  payout: number;
}): Promise<{ id: string }> {
  const jobUrl = `${APP_URL}/appraiser/jobs/${params.jobId}`;
  const deadlineStr = params.deadline.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">TruPlat</h1>
      </div>

      <h2 style="color: #1f2937;">New Job Available!</h2>

      <p>Hi ${params.appraiserName},</p>

      <p>A new on-site inspection job is available in your service area!</p>

      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Property:</strong> ${params.propertyAddress}</p>
        <p style="margin: 10px 0;"><strong>Deadline:</strong> ${deadlineStr}</p>
        <p style="margin: 10px 0 0;"><strong>Payout:</strong> $${params.payout.toFixed(2)}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${jobUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          View & Accept Job
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        Jobs are assigned on a first-come, first-served basis. Accept quickly to secure this job!
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} TruPlat. All rights reserved.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.email,
    subject: `New job available: ${params.propertyAddress}`,
    html,
  });
}

/**
 * Send dispute notification to admin
 */
export async function sendDisputeNotification(params: {
  adminEmail: string;
  disputeId: string;
  reason: string;
  submitterName: string;
  propertyAddress: string;
}): Promise<{ id: string }> {
  const disputeUrl = `${APP_URL}/admin/disputes/${params.disputeId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">TruPlat Admin</h1>
      </div>

      <h2 style="color: #dc2626;">New Dispute Filed</h2>

      <p>A new dispute has been submitted and requires your attention.</p>

      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Submitted by:</strong> ${params.submitterName}</p>
        <p style="margin: 10px 0;"><strong>Property:</strong> ${params.propertyAddress}</p>
        <p style="margin: 10px 0 0;"><strong>Reason:</strong> ${params.reason}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${disputeUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          Review Dispute
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        This is an automated admin notification from TruPlat.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.adminEmail,
    subject: `[Action Required] New Dispute: ${params.propertyAddress}`,
    html,
  });
}

/**
 * Send report email with share link
 */
export async function sendReportEmail(params: {
  recipientEmail: string;
  senderName: string;
  organizationName: string;
  propertyAddress: string;
  reportType: string;
  valueEstimate: number;
  shareUrl: string;
  message?: string;
  allowDownload: boolean;
}): Promise<{ id: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">TruPlat</h1>
        <p style="color: #666; margin: 5px 0;">Fast Appraisals for Lenders</p>
      </div>

      <h2 style="color: #1f2937;">Property Valuation Report</h2>

      <p>${params.senderName} from <strong>${params.organizationName}</strong> has shared a property valuation report with you.</p>

      ${
        params.message
          ? `
      <div style="background-color: #f3f4f6; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-style: italic; color: #4b5563;">"${params.message}"</p>
      </div>
      `
          : ""
      }

      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Property:</strong> ${params.propertyAddress}</p>
        <p style="margin: 10px 0;"><strong>Report Type:</strong> ${params.reportType}</p>
        <p style="margin: 10px 0 0;"><strong>Estimated Value:</strong> $${params.valueEstimate.toLocaleString()}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${params.shareUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          View Report
        </a>
      </div>

      ${
        params.allowDownload
          ? `
      <p style="text-align: center; color: #666; font-size: 14px;">
        You can also download the full PDF report from the link above.
      </p>
      `
          : ""
      }

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        This report was generated by TruPlat and shared by ${params.organizationName}.
        <br>
        The link will expire in 7 days.
      </p>

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} TruPlat. All rights reserved.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.recipientEmail,
    subject: `Property Valuation Report: ${params.propertyAddress}`,
    html,
  });
}

/**
 * Send appraisal order confirmation
 */
export async function sendAppraisalOrderConfirmation(params: {
  email: string;
  userName: string;
  propertyAddress: string;
  appraisalId: string;
  reportType: string;
  estimatedDelivery: string;
  amount: number;
}): Promise<{ id: string }> {
  const viewUrl = `${APP_URL}/appraisals/${params.appraisalId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">TruPlat</h1>
        <p style="color: #666; margin: 5px 0;">Fast Appraisals for Lenders</p>
      </div>

      <h2 style="color: #1f2937;">Order Confirmed!</h2>

      <p>Hi ${params.userName},</p>

      <p>Thank you for your order! Your appraisal request has been received and is being processed.</p>

      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Property:</strong> ${params.propertyAddress}</p>
        <p style="margin: 10px 0;"><strong>Report Type:</strong> ${params.reportType}</p>
        <p style="margin: 10px 0;"><strong>Estimated Delivery:</strong> ${params.estimatedDelivery}</p>
        <p style="margin: 10px 0 0;"><strong>Amount:</strong> $${params.amount.toFixed(2)}</p>
      </div>

      <div style="background-color: #eff6ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">
          <strong>What happens next?</strong><br>
          An appraiser will be assigned to your property and will conduct an on-site inspection.
          You'll receive notifications as your appraisal progresses.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${viewUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          Track Your Order
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        If you have questions, reply to this email or contact support@truplat.com
        <br><br>
        © ${new Date().getFullYear()} TruPlat. All rights reserved.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.email,
    subject: `Order Confirmed: Appraisal for ${params.propertyAddress}`,
    html,
  });
}

/**
 * Send payment confirmation
 */
export async function sendPaymentConfirmation(params: {
  email: string;
  userName: string;
  amount: number;
  description: string;
  invoiceUrl?: string;
}): Promise<{ id: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">TruPlat</h1>
      </div>

      <h2 style="color: #16a34a;">Payment Confirmed</h2>

      <p>Hi ${params.userName},</p>

      <p>Your payment has been successfully processed.</p>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #16a34a;">$${params.amount.toFixed(2)}</p>
        <p style="margin: 10px 0 0; color: #666;">${params.description}</p>
      </div>

      ${
        params.invoiceUrl
          ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${params.invoiceUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          Download Invoice
        </a>
      </div>
      `
          : ""
      }

      <p style="color: #666; font-size: 14px;">
        If you have any questions about this payment, please contact our support team.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} TruPlat. All rights reserved.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.email,
    subject: `Payment confirmed: $${params.amount.toFixed(2)}`,
    html,
  });
}
