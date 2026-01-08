/**
 * Middleware
 * TruPlat - Texas V1
 *
 * MOCKUP MODE: Authentication disabled for demo purposes
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Mockup middleware - no authentication required
export default function middleware(_req: NextRequest) {
  // Allow all routes for mockup demo
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
