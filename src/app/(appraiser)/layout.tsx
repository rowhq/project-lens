/**
 * Appraiser Portal Layout
 * Mobile-first design for field appraisers
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AppraiserBottomNav } from "@/shared/components/layout/AppraiserBottomNav";
import { AppraiserHeader } from "@/shared/components/layout/AppraiserHeader";

export default async function AppraiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // TODO: Verify user has APPRAISER role

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <AppraiserHeader />

      {/* Main Content - with bottom padding for nav */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Bottom Navigation (mobile-first) */}
      <AppraiserBottomNav />
    </div>
  );
}
