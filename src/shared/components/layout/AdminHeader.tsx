/**
 * Admin Header
 * Top bar for Admin Console
 */

"use client";

import { Bell, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search appraisers, orgs, jobs..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Alerts Count */}
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span>3 SLA breaches</span>
        </div>

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

function AlertTriangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
