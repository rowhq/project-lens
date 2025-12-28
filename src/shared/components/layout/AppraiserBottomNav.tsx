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
    href: "/jobs",
    icon: Briefcase,
  },
  {
    name: "My Jobs",
    href: "/jobs/active",
    icon: ClipboardList,
  },
  {
    name: "Earnings",
    href: "/earnings",
    icon: DollarSign,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function AppraiserBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white">
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
                isActive ? "text-blue-600" : "text-gray-500"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "text-blue-600")}
              />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
