/**
 * Middleware
 * TruPlat - Texas V1
 *
 * Handles authentication and role-based routing with NextAuth
 */

import NextAuth from "next-auth";
import { authConfig } from "@/server/auth/auth.config";
import { NextResponse } from "next/server";

// Create edge-compatible auth from config (no Prisma/bcrypt)
const { auth } = NextAuth(authConfig);

// Auth middleware wrapper
export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  const user = req.auth?.user;
  const userRole = (user as { role?: string } | undefined)?.role;

  // Public routes that don't require authentication
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/for-appraisers") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/share/");

  // Allow public routes
  if (isPublicRoute) {
    // Redirect to dashboard if already authenticated and trying to access login/register
    if (
      isAuthenticated &&
      (pathname.startsWith("/login") || pathname.startsWith("/register"))
    ) {
      if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      if (userRole === "APPRAISER") {
        return NextResponse.redirect(new URL("/appraiser/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  const isAdminRoute = pathname.startsWith("/admin");
  const isAppraiserRoute = pathname.startsWith("/appraiser");
  const isClientRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/appraisals") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/team") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/marketplace");

  if (isAdminRoute) {
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      // Redirect non-admins to their appropriate dashboard
      if (userRole === "APPRAISER") {
        return NextResponse.redirect(new URL("/appraiser/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isAppraiserRoute) {
    if (userRole !== "APPRAISER") {
      if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isClientRoute) {
    if (userRole === "APPRAISER") {
      return NextResponse.redirect(new URL("/appraiser/dashboard", req.url));
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
