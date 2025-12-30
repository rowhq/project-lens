/**
 * Appraiser Portal Layout
 * Mobile-first design for field appraisers
 */

import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { AppraiserBottomNav } from "@/shared/components/layout/AppraiserBottomNav";
import { AppraiserHeader } from "@/shared/components/layout/AppraiserHeader";

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

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      {/* Header */}
      <AppraiserHeader />

      {/* Main Content - with bottom padding for nav */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Bottom Navigation (mobile-first) */}
      <AppraiserBottomNav />
    </div>
  );
}
