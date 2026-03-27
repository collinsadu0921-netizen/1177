import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./domains/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // ── Override default container so we control it via .page-container
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "48rem" }, // cap at 768px
    },

    extend: {
      // ─── Color tokens wired to CSS custom properties ───────────────
      colors: {
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",

        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50:  "hsl(214 100% 97%)",
          100: "hsl(214 95%  92%)",
          200: "hsl(213 97%  87%)",
          300: "hsl(212 96%  78%)",
          400: "hsl(213 94%  68%)",
          500: "hsl(217 91%  60%)",
          600: "hsl(221 83%  53%)",  // ← DEFAULT
          700: "hsl(224 76%  48%)",
          800: "hsl(226 71%  40%)",
          900: "hsl(224 64%  33%)",
          950: "hsl(226 57%  21%)",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT:    "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",

        // ── Triage semantic palette (self-contained, not tokenised)
        triage: {
          emergency:  { DEFAULT: "#EF4444", light: "#FEF2F2", border: "#FECACA" },
          urgent:     { DEFAULT: "#F97316", light: "#FFF7ED", border: "#FED7AA" },
          semiurgent: { DEFAULT: "#F59E0B", light: "#FFFBEB", border: "#FDE68A" },
          nonurgent:  { DEFAULT: "#22C55E", light: "#F0FDF4", border: "#BBF7D0" },
          selfcare:   { DEFAULT: "#3B82F6", light: "#EFF6FF", border: "#BFDBFE" },
        },
      },

      // ─── Border radius scale ────────────────────────────────────────
      borderRadius: {
        none: "0",
        sm:   "var(--radius-sm)",  /* 8px  */
        DEFAULT: "var(--radius)", /* 14px */
        md:   "var(--radius)",
        lg:   "var(--radius-lg)", /* 20px */
        xl:   "var(--radius-xl)", /* 24px */
        "2xl": "2rem",
        full: "9999px",
      },

      // ─── Typography ─────────────────────────────────────────────────
      fontFamily: {
        sans:  ["var(--font-sans)", "system-ui", "sans-serif"],
        mono:  ["var(--font-mono)", "monospace"],
      },

      fontSize: {
        // Adds a few tokens for consistent scale
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      letterSpacing: {
        tighter: "-0.03em",
        tight:   "-0.015em",
        normal:  "0",
        wide:    "0.02em",
        wider:   "0.05em",
        widest:  "0.1em",
      },

      // ─── Shadow scale ────────────────────────────────────────────────
      boxShadow: {
        xs:    "var(--shadow-xs)",
        sm:    "var(--shadow-sm)",
        DEFAULT: "var(--shadow-sm)",
        md:    "var(--shadow-md)",
        lg:    "var(--shadow-lg)",
        xl:    "var(--shadow-xl)",
        card:  "var(--shadow-card)",
        // Coloured focus shadow for inputs
        "focus-ring": "0 0 0 3px hsl(var(--primary) / 0.18)",
        "focus-destructive": "0 0 0 3px hsl(var(--destructive) / 0.18)",
        none:  "none",
      },

      // ─── Spacing additions ───────────────────────────────────────────
      spacing: {
        "4.5":  "1.125rem",
        "13":   "3.25rem",
        "15":   "3.75rem",
        "18":   "4.5rem",
        "22":   "5.5rem",
        "safe": "env(safe-area-inset-bottom)",
      },

      // ─── Height utilities ────────────────────────────────────────────
      height: {
        "input":    "3rem",    /* 48px — standard touch-friendly */
        "input-lg": "3.5rem",  /* 56px — xl CTA */
      },

      minHeight: {
        "input": "3rem",
      },

      // ─── Z-index scale ───────────────────────────────────────────────
      zIndex: {
        "header": "40",
        "nav":    "50",
        "modal":  "60",
        "toast":  "70",
      },

      // ─── Keyframes ───────────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)"   },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)"    },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to:   { opacity: "1", transform: "scale(1)"    },
        },
        "page-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)"   },
        },
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },

      animation: {
        "fade-in":        "fade-in 0.25s ease-out both",
        "slide-up":       "slide-up 0.3s ease-out both",
        "scale-in":       "scale-in 0.2s ease-out both",
        "page-in":        "page-in 0.22s ease-out both",
        "accordion-down": "accordion-down 0.18s ease-out",
        "accordion-up":   "accordion-up 0.18s ease-out",
      },

      // ─── Transition timing ───────────────────────────────────────────
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
