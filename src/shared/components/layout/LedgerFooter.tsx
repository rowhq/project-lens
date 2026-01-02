"use client";

/**
 * Ledger-Style Footer Component
 * Inspired by brand.ledger.com design
 */

import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/components/common/Logo";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface LedgerFooterProps {
  variant?: "dark" | "light";
  sections?: FooterSection[];
  showLogo?: boolean;
  copyright?: string;
  className?: string;
}

export function LedgerFooter({
  variant = "dark",
  sections = [],
  showLogo = true,
  copyright = `Copyright © ${new Date().getFullYear()} TruPlat. All rights reserved.`,
  className,
}: LedgerFooterProps) {
  const isDark = variant === "dark";

  return (
    <footer
      className={cn(
        "relative w-full",
        isDark ? "bg-black" : "bg-white",
        className,
      )}
    >
      {/* Top decorative line */}
      <div className="h-px w-full">
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1000 1"
          fill="none"
        >
          <path
            d="M0 0.5 L480 0.5 L500 0.5 L520 0.5 L1000 0.5"
            stroke={isDark ? "rgba(74, 222, 128, 0.3)" : "rgba(0,0,0,0.1)"}
            strokeWidth="1"
          />
          {/* Center notch */}
          <path
            d="M496 0.5 L500 4.5 L504 0.5"
            stroke={isDark ? "rgba(74, 222, 128, 0.5)" : "rgba(0,0,0,0.2)"}
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      <div className="px-6 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo and description */}
          {showLogo && (
            <div className="col-span-1">
              <Logo href="/" />
              <p className="mt-4 text-sm text-gray-500 max-w-xs">
                Enterprise property valuation platform with AI-powered insights.
              </p>
            </div>
          )}

          {/* Footer sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-mono text-label uppercase tracking-wider text-gray-400 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-sm transition-colors duration-300",
                        isDark
                          ? "text-gray-500 hover:text-white"
                          : "text-gray-600 hover:text-black",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="font-mono text-label uppercase tracking-wider text-gray-600">
              {copyright}
            </p>

            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 bg-lime-400"
                style={{
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
              />
              <span className="font-mono text-label uppercase tracking-wider text-gray-500">
                Systems Operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="h-px w-full">
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
            stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Corner decorations */}
      <svg
        className="absolute bottom-0 left-0 w-4 h-4 text-lime-400"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M1 1V23H23"
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
      </svg>
      <svg
        className="absolute bottom-0 right-0 w-4 h-4 text-lime-400"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M23 1V23H1"
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
      </svg>
    </footer>
  );
}

// Simple footer for dashboard pages
export function LedgerFooterSimple({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "relative px-6 py-4 border-t border-gray-800 bg-black",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-label uppercase tracking-wider text-gray-600">
          TRUPLAT V1.0
        </p>
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 bg-lime-400 animate-pulse"
            style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
          />
          <span className="font-mono text-label uppercase tracking-wider text-gray-500">
            Online
          </span>
        </div>
      </div>
    </footer>
  );
}
