/**
 * Unified Page Header Component
 * Shared across Client, Appraiser, and Admin interfaces
 */

"use client";

import { Bell, Menu, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { UserMenu } from "@/shared/components/common/UserMenu";
import { SearchInput } from "@/shared/components/common/SearchInput";

interface PageHeaderProps {
  variant?: "client" | "appraiser" | "admin";
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  rightContent?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  variant = "client",
  onMenuToggle,
  isMobileMenuOpen,
  showSearch = true,
  searchPlaceholder = "Search...",
  rightContent,
  className,
}: PageHeaderProps) {
  const placeholders: Record<string, string> = {
    client: "Search address, report, or job...",
    appraiser: "Search jobs or addresses...",
    admin: "Search users, organizations...",
  };

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6",
        className
      )}
    >
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
      {showSearch && (
        <SearchInput
          placeholder={searchPlaceholder || placeholders[variant]}
          responsive={true}
        />
      )}

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Custom Right Content */}
        {rightContent}

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"
            aria-label="Unread notifications"
          />
        </button>

        {/* User Menu */}
        <UserMenu size={variant === "appraiser" ? "sm" : undefined} />
      </div>
    </header>
  );
}
