"use client";

import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
  /** Key to listen for (e.g., "/", "?", "n", "Escape", "ArrowLeft") */
  key: string;
  /** Modifier keys required */
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  /** Handler function */
  handler: (event: KeyboardEvent) => void;
  /** Description for help dialog */
  description?: string;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  /** Whether to allow when in input/textarea */
  allowInInput?: boolean;
}

/**
 * Hook for registering keyboard shortcuts
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: "/", handler: () => searchRef.current?.focus(), description: "Focus search" },
 *   { key: "n", handler: () => router.push("/new"), description: "Create new" },
 *   { key: "?", handler: () => setShowHelp(true), description: "Show shortcuts" },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if we're in an input field
    const target = event.target as HTMLElement;
    const isInInput =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.isContentEditable;

    for (const shortcut of shortcutsRef.current) {
      // Skip if in input and shortcut doesn't allow it
      if (isInInput && !shortcut.allowInInput) {
        // Special case: Escape should always work
        if (shortcut.key !== "Escape") {
          continue;
        }
      }

      // Check modifiers
      const modifiers = shortcut.modifiers || {};
      if (
        (modifiers.ctrl && !event.ctrlKey) ||
        (modifiers.shift && !event.shiftKey) ||
        (modifiers.alt && !event.altKey) ||
        (modifiers.meta && !event.metaKey)
      ) {
        continue;
      }

      // Check if no modifiers required but some are pressed
      if (!modifiers.ctrl && event.ctrlKey) continue;
      if (!modifiers.alt && event.altKey) continue;
      if (!modifiers.meta && event.metaKey) continue;
      // Note: shift is often used with characters like "?" so we handle it specially
      if (
        !modifiers.shift &&
        event.shiftKey &&
        shortcut.key.length === 1 &&
        shortcut.key !== shortcut.key.toUpperCase()
      ) {
        continue;
      }

      // Check key match
      const keyMatch =
        event.key === shortcut.key ||
        event.key.toLowerCase() === shortcut.key.toLowerCase() ||
        // Handle special keys
        (shortcut.key === "/" && event.key === "/") ||
        (shortcut.key === "?" && event.key === "?");

      if (keyMatch) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.handler(event);
        break;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Get a formatted string for displaying a shortcut
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.modifiers?.ctrl) parts.push("Ctrl");
  if (shortcut.modifiers?.alt) parts.push("Alt");
  if (shortcut.modifiers?.shift) parts.push("Shift");
  if (shortcut.modifiers?.meta) parts.push("⌘");

  // Format the key nicely
  let key = shortcut.key;
  if (key === "ArrowLeft") key = "←";
  else if (key === "ArrowRight") key = "→";
  else if (key === "ArrowUp") key = "↑";
  else if (key === "ArrowDown") key = "↓";
  else if (key === "Escape") key = "Esc";
  else if (key === " ") key = "Space";
  else if (key.length === 1) key = key.toUpperCase();

  parts.push(key);

  return parts.join(" + ");
}

export default useKeyboardShortcuts;
