/**
 * Root tRPC Router
 * Project LENS - Texas V1
 *
 * This is the main router that aggregates all sub-routers
 */

import { createTRPCRouter } from "./trpc";
import { appraisalRouter } from "./routers/appraisal.router";
import { propertyRouter } from "./routers/property.router";
import { reportRouter } from "./routers/report.router";
import { jobRouter } from "./routers/job.router";
import { evidenceRouter } from "./routers/evidence.router";
import { appraiserRouter } from "./routers/appraiser.router";
import { organizationRouter } from "./routers/organization.router";
import { billingRouter } from "./routers/billing.router";
import { disputeRouter } from "./routers/dispute.router";
import { adminRouter } from "./routers/admin.router";
import { marketplaceRouter } from "./routers/marketplace.router";
import { userRouter } from "./routers/user.router";
import { notificationsRouter } from "./routers/notifications.router";
import { mapRouter } from "./routers/map.router";

/**
 * Main application router
 * All routers are type-safe and accessible via the API
 */
export const appRouter = createTRPCRouter({
  appraisal: appraisalRouter,
  property: propertyRouter,
  report: reportRouter,
  job: jobRouter,
  evidence: evidenceRouter,
  appraiser: appraiserRouter,
  organization: organizationRouter,
  billing: billingRouter,
  dispute: disputeRouter,
  admin: adminRouter,
  marketplace: marketplaceRouter,
  user: userRouter,
  notifications: notificationsRouter,
  map: mapRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
