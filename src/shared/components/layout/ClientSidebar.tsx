/**
 * Client Sidebar Navigation
 * Ledger-Inspired Design with L-bracket corners
 * Hybrid approach: Team link only shows when organization has >1 members
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
  X,
  Map,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/components/common/Logo";
import {
  LedgerCorners,
  StatusSquare,
} from "@/shared/components/ui/Decorations";
import { trpc } from "@/shared/lib/trpc";

// Base navigation items (always shown)
const baseNavigation = [
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
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
];

// Team navigation item (conditionally shown)
const teamNavItem = {
  name: "Team",
  href: "/team",
  icon: Users,
};

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

  // Fetch team status to conditionally show Team link
  const { data: teamStatus } = trpc.organization.teamStatus.useQuery(
    undefined,
    {
      staleTime: 60000, // Cache for 1 minute
      refetchOnWindowFocus: false,
    },
  );

  // Build navigation array based on team status
  const navigation = teamStatus?.showTeamPage
    ? [...baseNavigation.slice(0, 3), teamNavItem, baseNavigation[3]] // Insert Team before Billing
    : baseNavigation;

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
          : "text-gray-400 hover:text-white hover:bg-gray-800/50",
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
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
        <Logo href="/dashboard" />
        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
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
          <span className="font-mono text-xs uppercase tracking-wider text-gray-400">
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
      <div className="border-t border-gray-800 p-3">
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
      <div className="px-6 py-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <StatusSquare color="lime" pulse />
          <span className="font-mono text-xs uppercase tracking-wider text-gray-600">
            Online
          </span>
        </div>
        <p className="font-mono text-xs text-gray-700 mt-1">TRUPLAT V1.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-800 bg-black lg:flex lg:flex-col">
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
          <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-gray-800 bg-black lg:hidden animate-slide-in-left">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
