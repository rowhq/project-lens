/**
 * Admin Layout Wrapper
 * Client component to handle mobile menu state
 */

"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { PageHeader } from "./PageHeader";
import { AlertTriangle } from "lucide-react";
import { trpc } from "@/shared/lib/trpc";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Fetch SLA breaches count (replace hardcoded value)
  const { data: stats } = trpc.admin.dashboard.stats.useQuery(undefined, {
    staleTime: 60000,
  });

  const slaBreaches = stats?.jobs?.slaBreach || 0;

  // Custom right content for admin header
  const adminRightContent = slaBreaches > 0 ? (
    <div className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400">
      <AlertTriangle className="h-4 w-4" />
      <span>{slaBreaches} SLA breach{slaBreaches !== 1 ? "es" : ""}</span>
    </div>
  ) : null;

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <AdminSidebar isMobileOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <PageHeader
          variant="admin"
          onMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
          showSearch={true}
          searchPlaceholder="Search users, organizations..."
          rightContent={adminRightContent}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6">{children}</main>
      </div>
    </div>
  );
}
