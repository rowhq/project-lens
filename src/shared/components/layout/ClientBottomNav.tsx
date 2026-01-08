/**
 * Client Bottom Navigation
 * Mobile-first bottom tab navigation with badge counts
 * Ledger-style design with clipped corners and monospace typography
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  FileText,
  TrendingUp,
  Settings,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  getBadge?: () => number | null;
  badgeColor?: string;
}

export function ClientBottomNav() {
  const pathname = usePathname();

  const navigation: NavItem[] = [
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
      name: "Opportunities",
      href: "/insights",
      icon: TrendingUp,
    },
    {
      name: "Settings",
      href: "/settings",
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
            stroke="rgba(74, 222, 128, 0.3)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="flex h-16 items-center justify-around">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          const badge = item.getBadge?.();
          const showBadge = badge !== null && badge !== undefined;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-1 py-2 relative",
                "transition-colors duration-300",
                isActive ? "text-lime-400" : "text-gray-500 hover:text-white",
              )}
              style={{
                transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
              }}
            >
              {/* Active indicator line */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-lime-400" />
              )}

              <div className="relative">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                    isActive && "text-lime-400",
                  )}
                />
                {showBadge && (
                  <span
                    className={cn(
                      "absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center",
                      "font-mono text-[9px] font-bold text-black",
                      item.badgeColor || "bg-lime-400",
                      "clip-notch-xs px-1",
                    )}
                  >
                    {badge > 99 ? "99+" : badge}
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
