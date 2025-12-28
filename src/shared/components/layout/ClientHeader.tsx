/**
 * Client Header
 * Top navigation bar for Client Portal
 */

"use client";

import { Bell, Search, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export function ClientHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Mobile Menu Button */}
      <button className="lg:hidden">
        <Menu className="h-6 w-6 text-gray-500" />
      </button>

      {/* Search */}
      <div className="hidden flex-1 lg:block lg:max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search address, report, or job..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Menu */}
        <UserButton
          afterSignOutUrl="/login"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </div>
    </header>
  );
}
