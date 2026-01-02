/**
 * Unified Page Header Component
 * Ledger-Inspired Design with L-bracket style
 */

"use client";

import { Bell, Menu, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { UserMenu } from "@/shared/components/common/UserMenu";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { NavSeparator, StatusSquare } from "@/shared/components/ui/Decorations";

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
    client: "SEARCH ADDRESS, REPORT, OR JOB...",
    appraiser: "SEARCH JOBS OR ADDRESSES...",
    admin: "SEARCH USERS, ORGANIZATIONS...",
  };

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between",
        "border-b border-gray-800 bg-gray-950 px-6",
        className,
      )}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuToggle}
        className={cn(
          "lg:hidden p-2",
          "text-gray-400 hover:text-white",
          "transition-colors duration-300",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Search */}
      {showSearch && (
        <div className="flex-1 max-w-md hidden md:block">
          <SearchInput
            placeholder={searchPlaceholder || placeholders[variant]}
            responsive={true}
          />
        </div>
      )}

      {/* Spacer for mobile */}
      <div className="flex-1 md:hidden" />

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Custom Right Content */}
        {rightContent}

        {/* Navigation Separator */}
        <NavSeparator />

        {/* Notifications */}
        <button
          className={cn(
            "relative p-2",
            "text-gray-400 hover:text-white",
            "hover:bg-gray-800/50",
            "transition-colors duration-300",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Notification indicator - square */}
          <StatusSquare
            color="lime"
            pulse
            className="absolute right-1.5 top-1.5"
          />
        </button>

        {/* Divider */}
        <NavSeparator />

        {/* User Menu */}
        <UserMenu size={variant === "appraiser" ? "sm" : undefined} />
      </div>
    </header>
  );
}
