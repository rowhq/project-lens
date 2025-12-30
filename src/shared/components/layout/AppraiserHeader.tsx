/**
 * Appraiser Header
 * Mobile-first header for Appraiser Portal
 */

"use client";

import { Bell } from "lucide-react";
import { UserMenu } from "@/shared/components/common/UserMenu";

export function AppraiserHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-[var(--primary)]">LENS</span>
        <span className="rounded bg-[var(--primary)]/20 px-1.5 py-0.5 text-xs font-medium text-[var(--primary)]">
          Appraiser
        </span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Menu */}
        <UserMenu size="sm" />
      </div>
    </header>
  );
}
