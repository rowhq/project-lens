import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (no Prisma, no bcrypt)
 * Used by middleware for authentication checks
 */
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  // Silence ALL JWT-related errors that happen after restart (stale cookies)
  logger: {
    error: (error) => {
      // Skip JWT decode errors - they're expected when cookies are stale
      const errorAny = error as unknown as { message?: string; type?: string };
      const errorStr = String(errorAny?.message || errorAny?.type || error);
      if (
        errorStr.includes("JWTSessionError") ||
        errorStr.includes("no matching decryption secret") ||
        errorAny?.type === "JWTSessionError"
      ) {
        return; // Silently ignore
      }
      console.error("[auth][error]", error);
    },
    warn: () => {}, // Silence warnings too
    debug: () => {}, // Silence debug in production
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  // Providers are added in the full auth.ts (not edge-compatible)
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.organizationId = (user as { organizationId?: string }).organizationId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { organizationId?: string }).organizationId = token.organizationId as string;
      }
      return session;
    },
  },
};
