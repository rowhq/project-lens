/**
 * Support Router
 * Handles support ticket submission via email
 */

import { z } from "zod";
import { createTRPCRouter, clientProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "@/shared/lib/resend";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@truplat.com";

export const supportRouter = createTRPCRouter({
  /**
   * Submit a support ticket
   */
  createTicket: clientProcedure
    .input(
      z.object({
        subject: z.string().min(1, "Subject is required"),
        message: z.string().min(10, "Message must be at least 10 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      const org = ctx.organization;
      const fullName = `${user.firstName} ${user.lastName}`.trim() || user.email;

      const subjectLabels: Record<string, string> = {
        technical: "Technical Issue",
        billing: "Billing Question",
        valuation: "Valuation Dispute",
        account: "Account Help",
        feature: "Feature Request",
        other: "Other",
      };

      const subjectLabel = subjectLabels[input.subject] || input.subject;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">TruPlat Support</h1>
          </div>

          <h2 style="color: #1f2937;">New Support Request</h2>

          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0;"><strong>From:</strong> ${fullName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 10px 0;"><strong>Organization:</strong> ${org?.name || "N/A"}</p>
            <p style="margin: 10px 0 0;"><strong>Category:</strong> ${subjectLabel}</p>
          </div>

          <div style="background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px; color: #374151;">Message:</h3>
            <p style="margin: 0; white-space: pre-wrap;">${input.message}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This ticket was submitted via TruPlat Support Form.
          </p>
        </body>
        </html>
      `;

      try {
        await sendEmail({
          to: SUPPORT_EMAIL,
          subject: `[Support] ${subjectLabel} - ${fullName}`,
          html,
          replyTo: user.email || undefined,
        });

        return {
          success: true,
          message: "Your message has been sent. We'll respond within 24 hours.",
        };
      } catch (error) {
        console.error("Failed to send support email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send support message. Please try again or email us directly.",
        });
      }
    }),
});
