"use client";

import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useMemo } from "react";
import type { UserRole } from "@/shared/types";

interface UseUserReturn {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  role: UserRole | null;
  organizationId: string | null;
  signOut: () => Promise<void>;
}

/**
 * Extended user hook with role information
 * Uses NextAuth session
 */
export function useUser(): UseUserReturn {
  const { data: session, status } = useSession();

  return useMemo(() => {
    if (status === "loading") {
      return {
        isLoaded: false,
        isSignedIn: false,
        userId: null,
        email: null,
        firstName: null,
        lastName: null,
        fullName: null,
        imageUrl: null,
        role: null,
        organizationId: null,
        signOut: async () => {},
      };
    }

    if (status === "unauthenticated" || !session?.user) {
      return {
        isLoaded: true,
        isSignedIn: false,
        userId: null,
        email: null,
        firstName: null,
        lastName: null,
        fullName: null,
        imageUrl: null,
        role: null,
        organizationId: null,
        signOut: async () => {},
      };
    }

    const user = session.user;
    const nameParts = user.name?.split(" ") || [];
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(" ") || null;

    return {
      isLoaded: true,
      isSignedIn: true,
      userId: user.id || null,
      email: user.email || null,
      firstName,
      lastName,
      fullName: user.name || null,
      imageUrl: user.image || null,
      role: (user.role as UserRole) || "CLIENT",
      organizationId: user.organizationId || null,
      signOut: async () => {
        await nextAuthSignOut({ callbackUrl: "/login" });
      },
    };
  }, [session, status]);
}
