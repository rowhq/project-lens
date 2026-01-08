/**
 * Appraiser Sidebar Navigation
 * Ledger-Inspired Design
 */

"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/components/common/Logo";
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

export function AppraiserSidebar({
  isMobileOpen,
  onClose,
}: AppraiserSidebarProps) {
  const pathname = usePathname();
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle open/close with animation
  useEffect(() => {
    if (isMobileOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);

      setIsClosing(false);
    }
  }, [isMobileOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
      onClose?.();
    }, 200); // Match animation duration
  }, [onClose]);

  // Fetch job counts for badges
  const { data: availableJobs } = trpc.job.available.useQuery(
    { limit: 100 },
    { staleTime: 30000 },
  );
  const { data: activeJobs } = trpc.job.myActive.useQuery(undefined, {
    staleTime: 30000,
  });

  const availableCount = availableJobs?.length || 0;
  const activeCount = activeJobs?.length || 0;

  const NavItem = ({
    href,
    icon: Icon,
    label,
    isActive,
    badge,
  }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    isActive: boolean;
    badge?: number;
  }) => (
    <Link
      href={href}
      onClick={isMobileOpen ? handleClose : undefined}
      aria-current={isActive ? "page" : undefined}
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
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-label px-1.5 py-0.5 bg-lime-400/20 text-lime-400 border border-lime-400/30 clip-notch-sm">
          {badge}
        </span>
      )}
    </Link>
  );

  const sidebarContent = (
    <>
      {/* Logo with Appraiser badge */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
        <div className="flex items-center gap-2">
          <Logo href="/appraiser/dashboard" />
          <span className="text-label font-mono px-1.5 py-0.5 bg-lime-400/20 text-lime-400 border border-lime-400/30 clip-notch-sm">
            PRO
          </span>
        </div>
        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            onClick={handleClose}
            className="lg:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/appraiser/jobs"
            onClick={isMobileOpen ? handleClose : undefined}
            className={cn(
              "flex flex-col items-center p-3",
              "bg-[var(--card)] border border-[var(--border)]",
              "hover:border-lime-400/50",
              "clip-notch-sm",
              "transition-colors duration-fast",
            )}
          >
            <span className="text-2xl font-bold text-lime-400">
              {availableCount}
            </span>
            <span className="text-label text-[var(--muted-foreground)] font-mono">
              AVAILABLE
            </span>
          </Link>
          <Link
            href="/appraiser/jobs?tab=active"
            onClick={isMobileOpen ? handleClose : undefined}
            className={cn(
              "flex flex-col items-center p-3",
              "bg-[var(--card)] border border-[var(--border)]",
              "hover:border-yellow-400/50",
              "clip-notch-sm",
              "transition-colors duration-fast",
            )}
          >
            <span className="text-2xl font-bold text-yellow-400">
              {activeCount}
            </span>
            <span className="text-label text-[var(--muted-foreground)] font-mono">
              ACTIVE
            </span>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4" aria-label="Main navigation">
        {navigation.map((item) => {
          // Precise active state detection
          const isActive =
            item.href === "/appraiser/jobs"
              ? pathname === "/appraiser/jobs" ||
                pathname.startsWith("/appraiser/jobs/")
              : pathname === item.href;

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
              badge={badge}
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
            />
          );
        })}
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
      {shouldRender && (
        <>
          {/* Backdrop */}
          <div
            className={cn(
              "fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity duration-200",
              isClosing ? "opacity-0" : "opacity-100",
            )}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Mobile Sidebar */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-[var(--border)] bg-[var(--background)] lg:hidden",
              isClosing ? "animate-slide-out-left" : "animate-slide-in-left",
            )}
          >
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
