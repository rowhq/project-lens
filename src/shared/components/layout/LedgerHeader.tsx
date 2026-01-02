"use client";

/**
 * Ledger Brand Header - Exact replica of brand.ledger.com design
 * Features: TruPlat logo, nav with | separators, action button
 */

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { LedgerCorners } from "@/shared/components/ui/Decorations";

interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface LedgerHeaderProps {
  navItems?: NavItem[];
  showBackLink?: boolean;
  backLinkText?: string;
  backLinkHref?: string;
  actionButtonText?: string;
  actionButtonHref?: string;
  className?: string;
}

// TruPlat Logo Component
function TruPlatLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex-shrink-0">
      <Image
        src="/truplat.svg"
        alt="TruPlat"
        width={120}
        height={36}
        priority
      />
    </Link>
  );
}

export function LedgerHeader({
  navItems = [],
  showBackLink = false,
  backLinkText = "BACK TO CITY",
  backLinkHref = "/",
  actionButtonText = "ALL ASSETS",
  actionButtonHref = "/assets",
  className,
}: LedgerHeaderProps) {
  return (
    <header className={cn("relative w-full bg-black", className)}>
      {/* Main header row */}
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Logo */}
        <TruPlatLogo />

        {/* Center: Navigation with | separators */}
        <nav className="hidden lg:flex items-center">
          {navItems.map((item, index) => (
            <div key={item.href} className="flex items-center">
              {/* Separator before item (except first) */}
              {index > 0 && <span className="w-px h-3 bg-gray-600 mx-6" />}
              <Link
                href={item.href}
                className={cn(
                  "font-mono text-xs uppercase tracking-widest",
                  "transition-colors duration-300",
                  item.isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-white",
                )}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
                }}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        {/* Right: Action button with L-brackets */}
        <Link
          href={actionButtonHref}
          className={cn(
            "relative hidden lg:flex items-center justify-center",
            "px-6 py-2.5",
            "font-mono text-xs uppercase tracking-widest",
            "text-white",
            "border border-gray-600 hover:border-white",
            "transition-colors duration-300",
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
          }}
        >
          <LedgerCorners color="gray" size="sm" />
          {actionButtonText}
        </Link>
      </div>

      {/* Sub-navigation row (optional) */}
      {showBackLink && (
        <div className="flex justify-center pb-4">
          <Link
            href={backLinkHref}
            className={cn(
              "font-mono text-xs uppercase tracking-widest",
              "text-gray-500 hover:text-white",
              "transition-colors duration-300",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
            }}
          >
            {backLinkText}
          </Link>
        </div>
      )}

      {/* Bottom border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-800" />
    </header>
  );
}

// Simpler header for dashboard pages
export function LedgerDashboardHeader({
  title,
  subtitle,
  rightContent,
  className,
}: {
  title?: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative w-full bg-black", className)}>
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <TruPlatLogo />
          {title && (
            <>
              <span className="w-px h-6 bg-gray-800" />
              <div>
                <h1 className="font-mono text-sm uppercase tracking-wider text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
                    {subtitle}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Custom content */}
        {rightContent && (
          <div className="flex items-center gap-4">{rightContent}</div>
        )}
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-800" />
    </header>
  );
}

export { TruPlatLogo };
