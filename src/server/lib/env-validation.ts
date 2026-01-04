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
 * Validates environment variables and returns typed env object
 * Throws with detailed error messages if validation fails
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error("\n❌ Environment validation failed:\n");
    console.error(errors);
    console.error(
      "\nPlease check your .env file and ensure all required variables are set.\n",
    );

    throw new Error(`Missing or invalid environment variables:\n${errors}`);
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

  return result.data;
}

/**
 * Validated environment variables
 * Import this to get type-safe access to env vars
 */
export const env = validateEnv();
