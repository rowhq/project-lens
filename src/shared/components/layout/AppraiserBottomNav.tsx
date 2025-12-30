/**
 * Appraiser Bottom Navigation
 * Mobile-first bottom tab navigation
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, ClipboardList, DollarSign, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const navigation = [
  {
    name: "Available",
    href: "/appraiser/jobs",
    icon: Briefcase,
  },
  {
    name: "My Jobs",
    href: "/appraiser/jobs/active",
    icon: ClipboardList,
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

export function AppraiserBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-[var(--border)] bg-[var(--card)]">
      <div className="flex h-16 items-center justify-around">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2",
                isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "text-[var(--primary)]")}
              />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
