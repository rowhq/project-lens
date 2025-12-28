/**
 * Client Sidebar Navigation
 * For Lenders/Investors Portal
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  CreditCard,
  Settings,
  HelpCircle,
  Plus,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Appraisals",
    href: "/appraisals",
    icon: FileText,
  },
  {
    name: "Jobs",
    href: "/jobs",
    icon: Briefcase,
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

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">LENS</span>
        </Link>
      </div>

      {/* Primary CTA */}
      <div className="p-4">
        <Link
          href="/appraisals/new"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-blue-600" : "text-gray-400"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="border-t border-gray-200 p-3">
        {secondaryNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5 text-gray-400" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
