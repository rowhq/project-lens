/**
 * Admin Header
 * Top bar for Admin Console with dark theme
 */

"use client";

import { Bell, Search, AlertTriangle } from "lucide-react";
import { UserMenu } from "@/shared/components/common/UserMenu";

export function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search appraisers, orgs, jobs..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Alerts Count */}
        <div className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span>3 SLA breaches</span>
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--secondary)]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
