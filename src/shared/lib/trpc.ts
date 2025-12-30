/**
 * tRPC Client Configuration
 * Project LENS - Texas V1
 */

"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/api/root";

/**
 * tRPC React hooks
 * Use this to call API endpoints from React components
 *
 * @example
 * const { data } = trpc.appraisal.list.useQuery({ limit: 10 });
 */
export const trpc = createTRPCReact<AppRouter>();
