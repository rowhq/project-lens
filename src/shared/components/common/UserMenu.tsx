"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useUser } from "@/shared/hooks/useUser";

interface UserMenuProps {
  size?: "sm" | "md";
}

export function UserMenu({ size = "md" }: UserMenuProps) {
  const { fullName, email, role, signOut } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials =
    fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const avatarSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 clip-notch-sm p-1 hover:bg-gray-800 transition-colors ${
          isOpen ? "bg-gray-800" : ""
        }`}
      >
        <div
          className={`${avatarSize} rounded-full bg-lime-400 flex items-center justify-center text-black font-medium ${textSize}`}
        >
          {initials}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 clip-notch border border-gray-700 bg-gray-900 shadow-lg z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="font-medium text-white truncate">
              {fullName || "User"}
            </p>
            <p className="text-sm text-gray-400 truncate">{email}</p>
            <span className="mt-1 inline-block px-2 py-0.5 clip-notch-sm text-xs font-mono uppercase tracking-wider bg-lime-400/10 text-lime-400 border border-lime-400/30">
              {role}
            </span>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              Settings
            </Link>
            <button
              onClick={async () => {
                setIsOpen(false);
                await signOut();
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
