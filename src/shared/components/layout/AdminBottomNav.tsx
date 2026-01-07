/**
 * Admin Bottom Navigation
 * Mobile-first bottom tab navigation with badge counts
 * Ledger-style design with clipped corners and monospace typography
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { trpc } from "@/shared/lib/trpc";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number | null;
  badgeColor?: string;
}

export function AdminBottomNav() {
  const pathname = usePathname();

  // Fetch counts for badges
  const { data: stats } = trpc.admin.dashboard.stats.useQuery(undefined, {
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const { data: disputes } = trpc.dispute.listAll.useQuery(
    { status: "OPEN" },
    {
      staleTime: 30000,
      refetchInterval: 60000,
    },
  );

  // Calculate badge counts
  const slaBreaches = stats?.jobs?.slaBreach || 0;
  const openDisputes = disputes?.items?.length || 0;

  const navigation: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Jobs",
      href: "/admin/jobs",
      icon: Briefcase,
      badge: slaBreaches > 0 ? slaBreaches : null,
      badgeColor: "bg-red-500",
    },
    {
      name: "Disputes",
      href: "/admin/disputes",
      icon: AlertTriangle,
      badge: openDisputes > 0 ? openDisputes : null,
      badgeColor: "bg-yellow-500",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--background)] safe-area-inset-bottom border-t border-[var(--border)]">
      {/* Top accent line - only in dark mode */}
      <div className="absolute top-0 left-0 right-0 h-px dark:block hidden">
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1000 1"
          fill="none"
        >
          <line
            x1="0"
            y1="0.5"
            x2="1000"
            y2="0.5"
            stroke="rgba(251, 191, 36, 0.3)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="flex h-16 items-center justify-around">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          const showBadge =
            item.badge !== null && item.badge !== undefined && item.badge > 0;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-1 py-2 relative",
                "transition-colors duration-300",
                isActive
                  ? "text-amber-400"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
              style={{
                transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
              }}
            >
              {/* Active indicator line - amber for admin */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400" />
              )}

              <div className="relative">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                    isActive && "text-amber-400",
                  )}
                />
                {showBadge && (
                  <span
                    className={cn(
                      "absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center",
                      "font-mono text-[9px] font-bold text-black",
                      item.badgeColor || "bg-amber-400",
                      "clip-notch-xs px-1",
                    )}
                  >
                    {item.badge && item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
