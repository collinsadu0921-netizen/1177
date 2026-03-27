/**
 * Design Tokens Reference
 *
 * This file documents the design system tokens used across the eHealth MVP.
 * These values mirror the CSS custom properties in globals.css and are
 * extended in tailwind.config.ts.
 *
 * DO NOT import this file in runtime code — it is documentation only.
 * Use Tailwind utility classes or CSS variables directly.
 */

export const TOKENS = {
  // ─── Colors ────────────────────────────────────────────────────────────────
  color: {
    // Brand
    primary:      "hsl(221 83% 53%)",  // #2563EB — deep blue
    primaryLight: "hsl(214 100% 97%)", // #EFF6FF — blue-50
    primaryDark:  "hsl(224 76% 48%)",  // #1D4ED8 — blue-700

    // Surfaces
    background: "hsl(214 32% 97%)",  // #F1F5F9 — slate-50
    card:       "hsl(0   0%  100%)", // #FFFFFF
    popover:    "hsl(0   0%  100%)",

    // Text
    foreground:       "hsl(222 47% 11%)",  // #0F172A — slate-950
    mutedForeground:  "hsl(215 16% 47%)",  // #64748B — slate-500

    // Chrome
    border:  "hsl(214 32% 89%)",  // #CBD5E1 — slate-300 light
    input:   "hsl(214 32% 89%)",

    // Semantic
    success:     "hsl(142 71% 45%)", // #22C55E
    warning:     "hsl(38  92% 50%)", // #F59E0B
    destructive: "hsl(0   84% 60%)", // #EF4444
  },

  // ─── Triage levels ──────────────────────────────────────────────────────────
  triage: {
    emergency:  { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" },
    urgent:     { bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412" },
    semiUrgent: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
    nonUrgent:  { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534" },
    selfCare:   { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF" },
  },

  // ─── Spacing (matches Tailwind's default scale) ─────────────────────────────
  space: {
    1: "0.25rem",   //  4px
    2: "0.5rem",    //  8px
    3: "0.75rem",   // 12px
    4: "1rem",      // 16px
    5: "1.25rem",   // 20px
    6: "1.5rem",    // 24px
    8: "2rem",      // 32px
    10: "2.5rem",   // 40px
    12: "3rem",     // 48px
    16: "4rem",     // 64px
  },

  // ─── Border radius ──────────────────────────────────────────────────────────
  radius: {
    sm:  "0.5rem",    //  8px
    md:  "0.875rem",  // 14px  ← default card/input
    lg:  "1.25rem",   // 20px
    xl:  "1.5rem",    // 24px
    full:"9999px",
  },

  // ─── Typography ─────────────────────────────────────────────────────────────
  font: {
    family: "Inter, system-ui, sans-serif",
    sizes: {
      xs:   "0.75rem",   // 12px
      sm:   "0.875rem",  // 14px
      base: "1rem",      // 16px — body text minimum on mobile
      lg:   "1.125rem",  // 18px
      xl:   "1.25rem",   // 20px
      "2xl":"1.5rem",    // 24px
    },
    weights: {
      normal:    400,
      medium:    500,
      semibold:  600,
      bold:      700,
    },
  },

  // ─── Shadows ────────────────────────────────────────────────────────────────
  shadow: {
    xs:   "0 1px 2px 0 hsl(222 47% 11% / 0.04)",
    sm:   "0 1px 3px 0 hsl(222 47% 11% / 0.06), 0 1px 2px -1px hsl(222 47% 11% / 0.04)",
    card: "0 1px 3px 0 hsl(222 47% 11% / 0.06), 0 0 0 1px hsl(214 32% 89% / 0.6)",
    md:   "0 4px 6px -1px hsl(222 47% 11% / 0.07), 0 2px 4px -2px hsl(222 47% 11% / 0.05)",
    lg:   "0 10px 15px -3px hsl(221 83% 53% / 0.08), 0 4px 6px -4px hsl(222 47% 11% / 0.06)",
  },

  // ─── Motion ─────────────────────────────────────────────────────────────────
  motion: {
    duration: {
      instant: "100ms",
      fast:    "150ms",
      normal:  "200ms",
      slow:    "300ms",
    },
    easing: {
      smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      spring: "cubic-bezier(0.175, 0.885, 0.32, 1.1)",
    },
  },

  // ─── Touch targets ──────────────────────────────────────────────────────────
  touch: {
    minHeight: "44px",  // WCAG 2.5.5 / Apple HIG minimum
    minWidth:  "44px",
  },
} as const;

export type TokenColor   = keyof typeof TOKENS.color;
export type TriageLevel  = keyof typeof TOKENS.triage;
