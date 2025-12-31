/**
 * Appraiser Layout Wrapper
 * Client component to handle mobile menu state
 * Desktop: Sidebar navigation
 * Mobile: Bottom navigation (matching mobile-first design)
 */

"use client";

import { useState } from "react";
import { AppraiserSidebar } from "./AppraiserSidebar";
import { AppraiserBottomNav } from "./AppraiserBottomNav";
import { PageHeader } from "./PageHeader";

interface AppraiserLayoutWrapperProps {
  children: React.ReactNode;
}

export function AppraiserLayoutWrapper({ children }: AppraiserLayoutWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <AppraiserSidebar isMobileOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <PageHeader
          variant="appraiser"
          onMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
          showSearch={false}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <AppraiserBottomNav />
      </div>
    </div>
  );
}
