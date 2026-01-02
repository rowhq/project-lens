/**
 * Appraiser Bottom Navigation
 * Mobile-first bottom tab navigation with badge counts
 * Ledger-style design with clipped corners and monospace typography
 */

"use client";

import { useMemo, useState, useEffect } from "react";
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
    },
  );

  const { data: activeJobs } = trpc.job.myActive.useQuery(undefined, {
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: earnings } = trpc.appraiser.earnings.summary.useQuery(
    undefined,
    {
      refetchInterval: 60000,
      staleTime: 30000,
    },
  );

  // Client-side timestamp for hydration safety
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const interval = setInterval(updateNow, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate badge counts
  const availableCount = availableJobs?.length || 0;
  const activeCount = activeJobs?.length || 0;
  const hasPendingPayout = (earnings?.pendingPayout || 0) > 0;

  // Calculate urgent jobs (due within 24 hours) - only on client
  const urgentJobs = useMemo(() => {
    if (!activeJobs || now === null) return [];
    return activeJobs.filter((job) => {
      if (!job.slaDueAt) return false;
      const hoursRemaining =
        (new Date(job.slaDueAt).getTime() - now) / (1000 * 60 * 60);
      return hoursRemaining < 24 && hoursRemaining > 0;
    });
  }, [activeJobs, now]);

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
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-black safe-area-inset-bottom">
      {/* Top border with SVG */}
      <div className="absolute top-0 left-0 right-0 h-px">
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
            pathname === item.href ||
            (item.href === "/appraiser/jobs" &&
              pathname === "/appraiser/jobs") ||
            (item.href.includes("?tab=active") &&
              pathname.includes("/appraiser/jobs") &&
              pathname !== "/appraiser/jobs");

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
                      // Clipped diamond shape for dots, clip-notch-xs for numbers
                      badge === 1 && item.name === "Earnings"
                        ? "w-2 h-2 min-w-0 p-0 bg-lime-400"
                        : "bg-lime-400 clip-notch-xs px-1",
                      badge === 1 &&
                        item.name === "Earnings" &&
                        "clip-path-[polygon(50%_0%,100%_50%,50%_100%,0%_50%)]",
                    )}
                    style={
                      badge === 1 && item.name === "Earnings"
                        ? {
                            clipPath:
                              "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                          }
                        : undefined
                    }
                  >
                    {badge === 1 && item.name === "Earnings"
                      ? ""
                      : badge > 99
                        ? "99+"
                        : badge}
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
