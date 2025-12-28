/**
 * Admin Sidebar Navigation
 * For Admin Console
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
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Appraisers",
    href: "/appraisers",
    icon: Users,
  },
  {
    name: "Organizations",
    href: "/organizations",
    icon: Building2,
  },
  {
    name: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    name: "Disputes",
    href: "/disputes",
    icon: AlertTriangle,
  },
  {
    name: "Pricing",
    href: "/pricing",
    icon: DollarSign,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">LENS</span>
          <span className="rounded bg-amber-500 px-1.5 py-0.5 text-xs font-semibold text-gray-900">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          All systems operational
        </div>
      </div>
    </aside>
  );
}
