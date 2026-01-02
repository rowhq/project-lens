/**
 * Client Layout Wrapper
 * Client component to handle mobile menu state
 * Ledger-style design
 */

"use client";

import { useState } from "react";
import { ClientSidebar } from "./ClientSidebar";
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
          <div className="p-6">{children}</div>
          <LedgerFooterSimple />
        </main>
      </div>
    </div>
  );
}
