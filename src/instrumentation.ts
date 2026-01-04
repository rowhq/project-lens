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

    try {
      validateEnv();
      console.log("✅ Environment validation passed");
    } catch (error) {
      // In production, fail fast if env vars are missing
      if (process.env.NODE_ENV === "production") {
        console.error(
          "❌ Server startup aborted due to missing environment variables",
        );
        process.exit(1);
      }
      // In development, just warn
      console.warn("⚠️  Running with incomplete environment configuration");
    }
  }
}
