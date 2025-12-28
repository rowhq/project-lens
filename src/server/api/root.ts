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

/**
 * Main application router
 * All routers are type-safe and accessible via the API
 */
export const appRouter = createTRPCRouter({
  appraisal: appraisalRouter,
  property: propertyRouter,
  report: reportRouter,
  job: jobRouter,
  // TODO: Add remaining routers as they are implemented
  // evidence: evidenceRouter,
  // appraiser: appraiserRouter,
  // organization: organizationRouter,
  // billing: billingRouter,
  // dispute: disputeRouter,
  // admin: adminRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
