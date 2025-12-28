/**
 * Client Portal Layout
 * For Lenders/Investors
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ClientSidebar } from "@/shared/components/layout/ClientSidebar";
import { ClientHeader } from "@/shared/components/layout/ClientHeader";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // TODO: Verify user has CLIENT role

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ClientSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <ClientHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
