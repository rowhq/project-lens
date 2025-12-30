import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/server/db/prisma";

const authConfig = NextAuth({
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
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // Check if user is active
        if (user.status !== "ACTIVE") {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Update last login timestamp
        await prisma.user
          .update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
          .catch(() => {
            // Non-blocking - don't fail login if this fails
          });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          organizationId: user.organizationId ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.organizationId = (user as { organizationId?: string }).organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string | undefined;
      }
      return session;
    },
  },
});

export const { handlers, auth, signIn, signOut } = authConfig;

/**
 * Safe session getter that catches JWT decode errors
 * Returns null instead of throwing when session can't be decoded
 * Use this instead of auth() when you only need the session
 */
export async function getSession() {
  try {
    return await auth();
  } catch {
    // JWT decode failed (common after restart with stale cookies)
    return null;
  }
}
