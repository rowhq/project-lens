/**
 * Request Timeout Utilities
 * Provides timeout handling for async operations
 */

/**
 * Timeout configuration for different operation types
 */
export const TIMEOUT_CONFIG = {
  // Short operations (API reads)
  SHORT: 10000, // 10 seconds
  // Medium operations (API writes)
  MEDIUM: 30000, // 30 seconds
  // Long operations (file uploads, complex queries)
  LONG: 60000, // 1 minute
  // Very long operations (batch processing)
  VERY_LONG: 120000, // 2 minutes
} as const;

/**
 * Error class for timeout errors
 */
export class TimeoutError extends Error {
  constructor(message: string = "Operation timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Creates a timeout promise that rejects after the specified time
 */
function createTimeoutPromise<T>(ms: number, message?: string): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(message || `Operation timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Wraps a promise with a timeout
 * If the promise doesn't resolve within the timeout, it rejects with TimeoutError
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  options?: {
    message?: string;
    onTimeout?: () => void;
  },
): Promise<T> {
  try {
    return await Promise.race([
      promise,
      createTimeoutPromise<T>(timeoutMs, options?.message),
    ]);
  } catch (error) {
    if (error instanceof TimeoutError && options?.onTimeout) {
      options.onTimeout();
    }
    throw error;
  }
}

/**
 * Fetch with timeout
 * Wrapper around native fetch that adds timeout support
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit & { timeout?: number },
): Promise<Response> {
  const { timeout = TIMEOUT_CONFIG.MEDIUM, ...fetchInit } = init || {};

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(input, {
      ...fetchInit,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Retry with timeout
 * Retries an operation with exponential backoff and timeout per attempt
 */
export async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    timeoutMs?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: unknown) => boolean;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    timeoutMs = TIMEOUT_CONFIG.MEDIUM,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(operation(), timeoutMs);
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if we should retry
      if (!shouldRetry(error)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Hook-friendly timeout wrapper for React Query/tRPC
 * Returns a function that wraps mutations with timeout
 */
export function createTimeoutMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  timeoutMs: number = TIMEOUT_CONFIG.MEDIUM,
): (input: TInput) => Promise<TOutput> {
  return (input: TInput) => withTimeout(mutationFn(input), timeoutMs);
}

/**
 * Checks if an error is a timeout error
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return (
    error instanceof TimeoutError ||
    (error instanceof Error && error.name === "AbortError")
  );
}

/**
 * Format timeout error for user display
 */
export function formatTimeoutError(error: unknown): string {
  if (isTimeoutError(error)) {
    return "The operation took too long. Please check your connection and try again.";
  }
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}
