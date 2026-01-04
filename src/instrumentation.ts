/**
 * Next.js Instrumentation
 * This file runs once when the server starts
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run validation on server startup
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamically import to avoid edge runtime issues
    const { validateEnv } = await import("@/server/lib/env-validation");

    const result = validateEnv();

    if (result.valid) {
      console.log("✅ Environment validation passed");
    } else {
      console.warn("⚠️  Running with incomplete environment configuration");
    }
  }
}
