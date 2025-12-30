/**
 * Admin Console Layout
 * For platform administrators and operations
 */

import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { AdminSidebar } from "@/shared/components/layout/AdminSidebar";
import { AdminHeader } from "@/shared/components/layout/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verify user has ADMIN or SUPER_ADMIN role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.status !== "ACTIVE") {
    redirect("/login?error=account_suspended");
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/dashboard?error=unauthorized");
  }

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6">{children}</main>
      </div>
    </div>
  );
}
