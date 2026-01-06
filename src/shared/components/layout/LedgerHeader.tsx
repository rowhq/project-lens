"use client";

/**
 * Ledger Brand Header - Exact replica of brand.ledger.com design
 * Features: TruPlat logo, nav with | separators, action button
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/Button";
import { ThemeToggle } from "@/shared/components/ui/ThemeToggle";

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
    <header className={cn("relative w-full bg-[var(--background)]", className)}>
      {/* Main header row - 3 column layout */}
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Docs + Theme toggle + Action button */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/docs"
            className={cn(
              "font-mono text-xs uppercase tracking-widest",
              "transition-colors duration-300",
              "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
            }}
          >
            Docs
          </Link>
          <ThemeToggle />
          <Link href={actionButtonHref}>
            <Button
              variant="outline"
              size="md"
              className="h-10 text-sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {actionButtonText}
            </Button>
          </Link>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <TruPlatLogo />
        </div>

        {/* Right: Navigation with | separators */}
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
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
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
      </div>

      {/* Sub-navigation row (optional) */}
      {showBackLink && (
        <div className="flex justify-center pb-4">
          <Link
            href={backLinkHref}
            className={cn(
              "font-mono text-xs uppercase tracking-widest",
              "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
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
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border)]" />
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
    <header className={cn("relative w-full bg-[var(--background)]", className)}>
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <TruPlatLogo />
          {title && (
            <>
              <span className="w-px h-6 bg-[var(--border)]" />
              <div>
                <h1 className="font-mono text-sm uppercase tracking-wider text-[var(--foreground)]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="font-mono text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
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
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border)]" />
    </header>
  );
}

export { TruPlatLogo };
