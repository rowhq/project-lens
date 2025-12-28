/**
 * Appraiser Header
 * Mobile-first header for Appraiser Portal
 */

"use client";

import { Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export function AppraiserHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-blue-600">LENS</span>
        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
          Appraiser
        </span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Menu */}
        <UserButton
          afterSignOutUrl="/login"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
}
