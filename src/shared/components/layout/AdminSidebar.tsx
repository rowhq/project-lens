/**
 * Admin Sidebar Navigation
 * Ledger-Inspired Design
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
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/components/common/Logo";

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
    name: "Insights",
    href: "/admin/insights",
    icon: TrendingUp,
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
      {/* Logo with Admin badge */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
        <div className="flex items-center gap-2">
          <Logo href="/admin/dashboard" />
          <span className="text-label font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 clip-notch-sm">
            ADMIN
          </span>
        </div>
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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
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

      {/* System Status */}
      <div className="border-t border-[var(--border)] p-4">
        <div className="flex items-center gap-2 text-caption text-[var(--muted-foreground)] font-mono">
          <span
            className="w-2 h-2 bg-lime-400"
            style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
          />
          SYSTEMS OPERATIONAL
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-56 xl:w-64 flex-shrink-0 flex-col border-r border-[var(--border)] bg-[var(--background)] lg:flex">
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
