import { z } from "zod";

/**
 * Environment variable validation schema
 * Validates all required environment variables at startup
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Authentication
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),

  // Stripe (required for payments)
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required"),

  // OpenAI (required for AI features)
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),

  // Email (required for transactional emails)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),

  // App URL
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .optional(),

  // Optional but recommended
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and logs warnings for missing ones
 * Does NOT throw - just logs warnings to avoid breaking the app
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );

    console.warn("\n⚠️  Environment validation warnings:\n");
    errors.forEach((err) => console.warn(`  - ${err}`));
    console.warn(
      "\nSome features may not work correctly. Check your environment variables.\n",
    );

    return { valid: false, errors };
  }

  // Warnings for optional but recommended variables
  if (
    !result.data.UPSTASH_REDIS_REST_URL ||
    !result.data.UPSTASH_REDIS_REST_TOKEN
  ) {
    console.warn(
      "⚠️  Upstash Redis not configured. Rate limiting will be disabled.",
    );
  }

  return { valid: true, errors: [] };
}
