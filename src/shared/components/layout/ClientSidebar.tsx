/**
 * Client Sidebar Navigation
 * For Lenders/Investors Portal with dark theme
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
  HelpCircle,
  Plus,
  X,
  Map,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Map",
    href: "/map",
    icon: Map,
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
  {
    name: "Support",
    href: "/support",
    icon: HelpCircle,
  },
];

interface ClientSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function ClientSidebar({ isMobileOpen, onClose }: ClientSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[var(--primary)]">LENS</span>
        </Link>
        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-[var(--foreground)]" />
          </button>
        )}
      </div>

      {/* Primary CTA */}
      <div className="p-4">
        <Link
          href="/appraisals/new"
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        >
          <Plus className="h-4 w-4" />
          Run Appraisal
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="border-t border-[var(--border)] p-3">
        {secondaryNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--secondary)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
              )}
            >
              <item.icon className="h-5 w-5 text-[var(--muted-foreground)]" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Mobile Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-[var(--border)] bg-[var(--card)] lg:hidden animate-slide-in-left">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
