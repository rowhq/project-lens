/**
 * Appraiser Portal Layout
 * Desktop: Sidebar navigation (consistent with Client)
 * Mobile: Bottom navigation (mobile-first for field work)
 */

import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { AppraiserLayoutWrapper } from "@/shared/components/layout/AppraiserLayoutWrapper";

export default async function AppraiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verify user has APPRAISER role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      status: true,
      appraiserProfile: {
        select: { verificationStatus: true }
      }
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.status !== "ACTIVE") {
    redirect("/login?error=account_suspended");
  }

  if (user.role !== "APPRAISER") {
    redirect("/dashboard?error=unauthorized");
  }

  // Check if appraiser needs to complete onboarding
  if (!user.appraiserProfile) {
    redirect("/appraiser/onboarding");
  }

  return <AppraiserLayoutWrapper>{children}</AppraiserLayoutWrapper>;
}
