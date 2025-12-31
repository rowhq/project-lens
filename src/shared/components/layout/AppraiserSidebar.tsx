/**
 * Appraiser Sidebar Navigation
 * For Appraiser Portal - Desktop sidebar with mobile overlay
 * Matches Client interface pattern for consistency
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  User,
  Calendar,
  Settings,
  HelpCircle,
  X,
  MapPin,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/components/common/Logo";
import { NavItem } from "@/shared/components/common/NavItem";
import { trpc } from "@/shared/lib/trpc";

const navigation = [
  {
    name: "Dashboard",
    href: "/appraiser/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Available Jobs",
    href: "/appraiser/jobs",
    icon: Briefcase,
  },
  {
    name: "My Schedule",
    href: "/appraiser/schedule",
    icon: Calendar,
  },
  {
    name: "Earnings",
    href: "/appraiser/earnings",
    icon: DollarSign,
  },
  {
    name: "Profile",
    href: "/appraiser/profile",
    icon: User,
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/appraiser/settings",
    icon: Settings,
  },
  {
    name: "Support",
    href: "/appraiser/support",
    icon: HelpCircle,
  },
];

interface AppraiserSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function AppraiserSidebar({ isMobileOpen, onClose }: AppraiserSidebarProps) {
  const pathname = usePathname();

  // Fetch job counts for badges
  const { data: availableJobs } = trpc.job.available.useQuery(
    { limit: 100 },
    { staleTime: 30000 }
  );
  const { data: activeJobs } = trpc.job.myActive.useQuery(undefined, {
    staleTime: 30000,
  });

  const availableCount = availableJobs?.length || 0;
  const activeCount = activeJobs?.length || 0;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
        <Logo href="/appraiser/dashboard" badge="Appraiser" badgeColor="bg-green-500" />
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

      {/* Quick Stats */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/appraiser/jobs"
            onClick={onClose}
            className="flex flex-col items-center p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
          >
            <span className="text-2xl font-bold text-green-400">{availableCount}</span>
            <span className="text-xs text-[var(--muted-foreground)]">Available</span>
          </Link>
          <Link
            href="/appraiser/jobs?tab=active"
            onClick={onClose}
            className="flex flex-col items-center p-3 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors"
          >
            <span className="text-2xl font-bold text-yellow-400">{activeCount}</span>
            <span className="text-xs text-[var(--muted-foreground)]">Active</span>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = item.href === "/appraiser/jobs"
            ? pathname === "/appraiser/jobs" || pathname.startsWith("/appraiser/jobs/")
            : pathname.startsWith(item.href);

          // Add badges for jobs
          let badge: number | undefined;
          if (item.href === "/appraiser/jobs" && availableCount > 0) {
            badge = availableCount;
          }

          return (
            <NavItem
              key={item.name}
              href={item.href}
              icon={item.icon}
              label={item.name}
              isActive={isActive}
              variant="sidebar"
              badge={badge}
              badgeColor="bg-green-500"
              onClick={onClose}
            />
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="border-t border-[var(--border)] p-3">
        {secondaryNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <NavItem
              key={item.name}
              href={item.href}
              icon={item.icon}
              label={item.name}
              isActive={isActive}
              variant="sidebar"
              onClick={onClose}
            />
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
