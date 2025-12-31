/**
 * Standardized Error Handling
 * Consistent error messages and types across the application
 */

import { TRPCError } from "@trpc/server";

/**
 * Standard error factory functions
 * Usage: throw Errors.notFound("Job")
 */
export const Errors = {
  // Not Found errors
  notFound: (entity: string) =>
    new TRPCError({
      code: "NOT_FOUND",
      message: `${entity} not found`,
    }),

  // Forbidden/Access Denied errors
  forbidden: (action?: string) =>
    new TRPCError({
      code: "FORBIDDEN",
      message: action ? `Access denied: ${action}` : "Access denied",
    }),

  // Unauthorized errors
  unauthorized: (reason?: string) =>
    new TRPCError({
      code: "UNAUTHORIZED",
      message: reason || "Authentication required",
    }),

  // Bad Request errors
  badRequest: (message: string) =>
    new TRPCError({
      code: "BAD_REQUEST",
      message,
    }),

  // Conflict errors (e.g., duplicate entries)
  conflict: (message: string) =>
    new TRPCError({
      code: "CONFLICT",
      message,
    }),

  // Invalid state transition
  invalidTransition: (from: string, to: string) =>
    new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid status transition: ${from} → ${to}`,
    }),

  // Resource already exists
  alreadyExists: (entity: string) =>
    new TRPCError({
      code: "CONFLICT",
      message: `${entity} already exists`,
    }),

  // Rate limiting
  tooManyRequests: (message?: string) =>
    new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: message || "Too many requests. Please try again later.",
    }),

  // Internal server error
  internal: (message?: string) =>
    new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: message || "An unexpected error occurred",
    }),

  // Precondition failed
  preconditionFailed: (message: string) =>
    new TRPCError({
      code: "PRECONDITION_FAILED",
      message,
    }),

  // Payment required (using BAD_REQUEST as PAYMENT_REQUIRED is not a standard tRPC code)
  paymentRequired: (message?: string) =>
    new TRPCError({
      code: "BAD_REQUEST",
      message: message || "Payment required to proceed",
    }),

  // Custom error with any code
  custom: (code: TRPCError["code"], message: string) =>
    new TRPCError({
      code,
      message,
    }),
};

/**
 * Type guard to check if error is a TRPCError
 */
export function isTRPCError(error: unknown): error is TRPCError {
  return error instanceof TRPCError;
}

/**
 * Wrap async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (isTRPCError(error)) {
      throw error;
    }
    console.error("Unexpected error:", error);
    throw Errors.internal(errorMessage);
  }
}
