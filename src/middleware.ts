/**
 * Middleware
 * Project LENS - Texas V1
 *
 * Handles authentication and role-based routing
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/register(.*)",
  "/forgot-password(.*)",
  "/api/webhooks/(.*)",
  "/shared/(.*)", // Shared report links
]);

// Admin routes
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/(admin)/(.*)",
]);

// Appraiser routes
const isAppraiserRoute = createRouteMatcher([
  "/appraiser(.*)",
  "/(appraiser)/(.*)",
]);

// Client routes
const isClientRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/appraisals(.*)",
  "/jobs(.*)",
  "/team(.*)",
  "/billing(.*)",
  "/settings(.*)",
  "/(client)/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!userId) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Get user role from session claims (set up in Clerk Dashboard)
  const userRole = sessionClaims?.metadata?.role as string | undefined;

  // Role-based route protection
  if (isAdminRoute(req)) {
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      // Redirect non-admins to their appropriate dashboard
      if (userRole === "APPRAISER") {
        return NextResponse.redirect(new URL("/jobs", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isAppraiserRoute(req)) {
    if (userRole !== "APPRAISER") {
      if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isClientRoute(req)) {
    if (userRole === "APPRAISER") {
      return NextResponse.redirect(new URL("/jobs", req.url));
    }
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
