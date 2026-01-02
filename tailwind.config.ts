import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════════
      // LEDGER-INSPIRED COLOR SYSTEM
      // ═══════════════════════════════════════════════════════════════════
      colors: {
        // Gray Scale - Pure Black Based
        gray: {
          50: "#FAFAFA",
          100: "#E5E5E5",
          200: "#D4D4D4",
          300: "#A3A3A3",
          400: "#737373",
          500: "#525252",
          600: "#404040",
          700: "#262626",
          800: "#1A1A1A",
          900: "#121212",
          950: "#0A0A0A",
        },
        // Lime Accent - Signature Ledger Color
        lime: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },
        // Semantic Colors
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
        },
        warning: {
          50: "#FEFCE8",
          100: "#FEF9C3",
          500: "#EAB308",
          600: "#CA8A04",
          700: "#A16207",
        },
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#DC2626",
          600: "#B91C1C",
          700: "#991B1B",
        },
        // Neutral (alias for gray)
        neutral: {
          50: "#FAFAFA",
          100: "#E5E5E5",
          200: "#D4D4D4",
          300: "#A3A3A3",
          400: "#737373",
          500: "#525252",
          600: "#404040",
          700: "#262626",
          800: "#1A1A1A",
          900: "#121212",
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // TYPOGRAPHY - Space Grotesk + JetBrains Mono
      // ═══════════════════════════════════════════════════════════════════
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      fontSize: {
        // Display - Large Headlines
        "display-lg": [
          "3.5rem",
          { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
        "display-md": [
          "2.5rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "display-sm": [
          "2rem",
          { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        // Heading
        "heading-lg": [
          "1.5rem",
          { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "heading-md": [
          "1.25rem",
          { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "heading-sm": ["1.125rem", { lineHeight: "1.35", fontWeight: "500" }],
        // Body
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body-md": ["1rem", { lineHeight: "1.5" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        // Caption & Labels
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
        label: [
          "0.6875rem",
          { lineHeight: "1.2", letterSpacing: "0.08em", fontWeight: "500" },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════
      // SPACING - 8px Grid
      // ═══════════════════════════════════════════════════════════════════
      spacing: {
        "0.5": "0.125rem",
        "1": "0.25rem",
        "1.5": "0.375rem",
        "2": "0.5rem",
        "2.5": "0.625rem",
        "3": "0.75rem",
        "4": "1rem",
        "5": "1.25rem",
        "6": "1.5rem",
        "8": "2rem",
        "10": "2.5rem",
        "12": "3rem",
        "16": "4rem",
        "20": "5rem",
        "24": "6rem",
      },

      // ═══════════════════════════════════════════════════════════════════
      // BORDER RADIUS - Angular Design (mostly 0)
      // ═══════════════════════════════════════════════════════════════════
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        full: "9999px",
      },

      // ═══════════════════════════════════════════════════════════════════
      // SHADOWS - Minimal, Glow-based
      // ═══════════════════════════════════════════════════════════════════
      boxShadow: {
        none: "none",
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
        DEFAULT: "0 2px 4px 0 rgb(0 0 0 / 0.3)",
        md: "0 4px 8px -1px rgb(0 0 0 / 0.4)",
        lg: "0 8px 16px -2px rgb(0 0 0 / 0.5)",
        xl: "0 16px 32px -4px rgb(0 0 0 / 0.6)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.3)",
        // Lime glow variants
        "glow-sm": "0 0 10px rgba(74, 222, 128, 0.2)",
        glow: "0 0 20px rgba(74, 222, 128, 0.3)",
        "glow-lg": "0 0 40px rgba(74, 222, 128, 0.4)",
        // White glow
        "glow-white": "0 0 20px rgba(255, 255, 255, 0.1)",
      },

      // ═══════════════════════════════════════════════════════════════════
      // TRANSITIONS - Ledger Easing
      // ═══════════════════════════════════════════════════════════════════
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
      },
      transitionTimingFunction: {
        ledger: "cubic-bezier(0.85, 0, 0.15, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      // ═══════════════════════════════════════════════════════════════════
      // ANIMATIONS
      // ═══════════════════════════════════════════════════════════════════
      animation: {
        "fade-in": "fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-out": "fadeOut 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "clip-reveal": "clipReveal 0.4s cubic-bezier(0.85, 0, 0.15, 1)",
        "pulse-lime": "pulseLime 2s ease-in-out infinite",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.98)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        clipReveal: {
          "0%": { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
          "100%": { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
        },
        pulseLime: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(74, 222, 128, 0.3)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(74, 222, 128, 0.3)" },
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // Z-INDEX SCALE
      // ═══════════════════════════════════════════════════════════════════
      zIndex: {
        dropdown: "1000",
        sticky: "1020",
        fixed: "1030",
        "modal-backdrop": "1040",
        modal: "1050",
        popover: "1060",
        tooltip: "1070",
        toast: "1080",
      },
    },
  },
  plugins: [],
};

export default config;
