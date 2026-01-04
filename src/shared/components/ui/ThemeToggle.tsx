"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/shared/stores/themeStore";
import { cn } from "@/shared/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 border border-[var(--border)] hover:border-lime-400",
        "transition-colors duration-300",
        "text-[var(--muted-foreground)] hover:text-lime-400",
        className,
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
