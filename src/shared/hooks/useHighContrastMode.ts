/**
 * High Contrast Mode Hook
 * Provides enhanced visibility for outdoor/bright sunlight conditions
 */

import { useState, useEffect, useCallback } from "react";

const HIGH_CONTRAST_KEY = "appraiser_high_contrast_mode";

interface HighContrastConfig {
  enabled: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

export function useHighContrastMode(): HighContrastConfig {
  // Initialize from localStorage (runs only on client)
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(HIGH_CONTRAST_KEY) === "true";
  });

  // Sync document class and localStorage when state changes
  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add("high-contrast");
      localStorage.setItem(HIGH_CONTRAST_KEY, "true");
    } else {
      document.documentElement.classList.remove("high-contrast");
      localStorage.setItem(HIGH_CONTRAST_KEY, "false");
    }
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const enable = useCallback(() => {
    setEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setEnabled(false);
  }, []);

  return { enabled, toggle, enable, disable };
}

// CSS variables for high contrast mode (add to globals.css):
/*
.high-contrast {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --card: 0 0% 5%;
  --card-foreground: 0 0% 100%;
  --primary: 80 100% 50%;
  --primary-foreground: 0 0% 0%;
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 80%;
  --border: 0 0% 30%;
}

.high-contrast * {
  text-shadow: 0 0 1px rgba(255,255,255,0.5);
}

.high-contrast button,
.high-contrast a {
  font-weight: 600;
}
*/
