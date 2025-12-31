/**
 * Appraiser Bottom Navigation
 * Mobile-first bottom tab navigation with badge counts
 */

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, ClipboardList, DollarSign, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { trpc } from "@/shared/lib/trpc";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  getBadge?: () => number | null;
  badgeColor?: string;
}

export function AppraiserBottomNav() {
  const pathname = usePathname();

  // Fetch counts for badges
  const { data: availableJobs } = trpc.job.available.useQuery(
    { limit: 100 },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 10000,
    }
  );

  const { data: activeJobs } = trpc.job.myActive.useQuery(undefined, {
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: earnings } = trpc.appraiser.earnings.summary.useQuery(undefined, {
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Calculate badge counts
  const availableCount = availableJobs?.length || 0;
  const activeCount = activeJobs?.length || 0;
  const hasPendingPayout = (earnings?.pendingPayout || 0) > 0;

  // Calculate urgent jobs (due within 24 hours)
  const urgentJobs = useMemo(() => {
    if (!activeJobs) return [];
    const now = Date.now();
    return activeJobs.filter((job) => {
      if (!job.slaDueAt) return false;
      const hoursRemaining = (new Date(job.slaDueAt).getTime() - now) / (1000 * 60 * 60);
      return hoursRemaining < 24 && hoursRemaining > 0;
    });
  }, [activeJobs]);

  const navigation: NavItem[] = [
    {
      name: "Available",
      href: "/appraiser/jobs",
      icon: Briefcase,
      getBadge: () => (availableCount > 0 ? availableCount : null),
      badgeColor: "bg-green-500",
    },
    {
      name: "My Jobs",
      href: "/appraiser/jobs?tab=active",
      icon: ClipboardList,
      getBadge: () => {
        if (urgentJobs.length > 0) return urgentJobs.length;
        if (activeCount > 0) return activeCount;
        return null;
      },
      badgeColor: urgentJobs.length > 0 ? "bg-red-500" : "bg-yellow-500",
    },
    {
      name: "Earnings",
      href: "/appraiser/earnings",
      icon: DollarSign,
      getBadge: () => (hasPendingPayout ? 1 : null), // Show dot if pending payout
      badgeColor: "bg-green-500",
    },
    {
      name: "Profile",
      href: "/appraiser/profile",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-[var(--border)] bg-[var(--card)] safe-area-inset-bottom">
      <div className="flex h-16 items-center justify-around">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/appraiser/jobs" && pathname === "/appraiser/jobs") ||
            (item.href.includes("?tab=active") && pathname.includes("/appraiser/jobs") && pathname !== "/appraiser/jobs");

          const badge = item.getBadge?.();
          const showBadge = badge !== null && badge !== undefined;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 relative",
                isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn("h-5 w-5", isActive && "text-[var(--primary)]")}
                />
                {showBadge && (
                  <span
                    className={cn(
                      "absolute -top-1.5 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1",
                      item.badgeColor || "bg-red-500",
                      badge === 1 && item.name === "Earnings" ? "w-2 h-2 min-w-0 p-0" : "" // Dot for earnings
                    )}
                  >
                    {badge === 1 && item.name === "Earnings" ? "" : badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
