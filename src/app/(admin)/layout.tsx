/**
 * Admin Console Layout
 * For platform administrators and operations
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AdminSidebar } from "@/shared/components/layout/AdminSidebar";
import { AdminHeader } from "@/shared/components/layout/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // TODO: Verify user has ADMIN or SUPER_ADMIN role

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
