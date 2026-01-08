/**
 * Client Sidebar Navigation
 * Ledger-Inspired Design with L-bracket corners
 * MOCKUP MODE: Static navigation without API calls
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Settings,
  X,
  TrendingUp,
  Map,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/components/common/Logo";
import {
  LedgerCorners,
  StatusSquare,
} from "@/shared/components/ui/Decorations";

// Navigation items for mockup - includes Team for demo
const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Growth Map",
    href: "/map",
    icon: Map,
  },
  {
    name: "Opportunities",
    href: "/insights",
    icon: TrendingUp,
  },
  {
    name: "Appraisals",
    href: "/appraisals",
    icon: FileText,
  },
  {
    name: "Team",
    href: "/team",
    icon: Users,
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface ClientSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function ClientSidebar({ isMobileOpen, onClose }: ClientSidebarProps) {
  const pathname = usePathname();

  const NavItem = ({
    href,
    icon: Icon,
    label,
    isActive,
  }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    isActive: boolean;
  }) => (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5",
        "text-sm font-mono uppercase tracking-wider",
        "transition-all duration-fast",
        isActive
          ? "text-lime-400 bg-lime-400/5"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50",
      )}
    >
      {/* Active indicator */}
      <span
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4",
          "transition-all duration-normal ease-ledger",
          isActive ? "bg-lime-400" : "bg-transparent group-hover:bg-gray-600",
        )}
      />
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
        <Logo href="/dashboard" />
        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Menu container with L-brackets */}
      <div className="relative flex-1 mx-3 my-2 p-2">
        {/* L-bracket corners */}
        <LedgerCorners color="gray" size="md" />

        {/* Menu header */}
        <div className="flex items-center gap-2 px-2 py-2 mb-2">
          <StatusSquare color="lime" />
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            Menu
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5">
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              href={item.href}
              icon={item.icon}
              label={item.name}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </nav>
      </div>

      {/* Secondary Navigation */}
      <div className="border-t border-[var(--border)] p-3">
        {secondaryNavigation.map((item) => (
          <NavItem
            key={item.name}
            href={item.href}
            icon={item.icon}
            label={item.name}
            isActive={pathname.startsWith(item.href)}
          />
        ))}
      </div>

      {/* Version indicator */}
      <div className="px-6 py-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <StatusSquare color="lime" pulse />
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            Online
          </span>
        </div>
        <p className="font-mono text-xs text-[var(--muted-foreground)] mt-1">
          TRUPLAT V1.0
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-56 xl:w-64 flex-shrink-0 border-r border-[var(--border)] bg-[var(--background)] lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Mobile Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-[var(--border)] bg-[var(--background)] lg:hidden animate-slide-in-left">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
