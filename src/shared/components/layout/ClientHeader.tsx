/**
 * Client Header
 * Top navigation bar for Client Portal with dark theme
 */

"use client";

import { Bell, Search, Menu, X } from "lucide-react";
import { UserMenu } from "@/shared/components/common/UserMenu";

interface ClientHeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function ClientHeader({ onMenuToggle, isMobileMenuOpen }: ClientHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-[var(--foreground)]" />
        ) : (
          <Menu className="h-6 w-6 text-[var(--foreground)]" />
        )}
      </button>

      {/* Search */}
      <div className="hidden flex-1 lg:block lg:max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search address, report, or job..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:bg-[var(--card)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" aria-label="Unread notifications" />
        </button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
