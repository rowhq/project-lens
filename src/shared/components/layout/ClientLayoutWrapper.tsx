/**
 * Client Layout Wrapper
 * Client component to handle mobile menu state
 * Desktop: Sidebar navigation
 * Mobile: Bottom navigation (matching mobile-first design)
 * Ledger-style design
 */

"use client";

import { useState } from "react";
import { ClientSidebar } from "./ClientSidebar";
import { ClientBottomNav } from "./ClientBottomNav";
import { PageHeader } from "./PageHeader";
import { LedgerFooterSimple } from "./LedgerFooter";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <ClientSidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <PageHeader
          variant="client"
          onMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
          showSearch={true}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 pb-20 lg:pb-8 max-w-[1600px] 2xl:mx-auto">
            {children}
          </div>
          <div className="hidden lg:block">
            <LedgerFooterSimple />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <ClientBottomNav />
      </div>
    </div>
  );
}
