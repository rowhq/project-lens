/**
 * Admin Console Layout
 * For platform administrators and operations
 * Now with mobile responsiveness
 */

import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { AdminLayoutWrapper } from "@/shared/components/layout/AdminLayoutWrapper";

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

  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
