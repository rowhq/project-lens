/**
 * Admin Sidebar Navigation
 * For Admin Console - Uses semantic CSS variables for theme consistency
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  AlertTriangle,
  DollarSign,
  Settings,
  BarChart3,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/components/common/Logo";
import { NavItem } from "@/shared/components/common/NavItem";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Appraisers",
    href: "/admin/appraisers",
    icon: Users,
  },
  {
    name: "Organizations",
    href: "/admin/organizations",
    icon: Building2,
  },
  {
    name: "Jobs",
    href: "/admin/jobs",
    icon: Briefcase,
  },
  {
    name: "Disputes",
    href: "/admin/disputes",
    icon: AlertTriangle,
  },
  {
    name: "Pricing",
    href: "/admin/pricing",
    icon: DollarSign,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isMobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
        <Logo href="/admin/dashboard" badge="Admin" badgeColor="bg-amber-500" />
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

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavItem
            key={item.name}
            href={item.href}
            icon={item.icon}
            label={item.name}
            isActive={pathname.startsWith(item.href)}
            variant="admin"
            onClick={onClose}
          />
        ))}
      </nav>

      {/* System Status */}
      <div className="border-t border-[var(--border)] p-4">
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          All systems operational
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] lg:flex">
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
