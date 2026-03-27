import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // ── Base ─────────────────────────────────────────────────────────────────
  "inline-flex items-center gap-1 rounded-full font-medium tabular-nums whitespace-nowrap",
  {
    variants: {
      variant: {
        // ── Brand ──────────────────────────────────────────────────────────
        default:
          "bg-primary-50 text-primary-700 ring-1 ring-primary-200",

        // ── Neutral ────────────────────────────────────────────────────────
        secondary:
          "bg-secondary text-secondary-foreground ring-1 ring-border",

        outline:
          "bg-transparent text-foreground ring-1 ring-border",

        // ── Semantic ───────────────────────────────────────────────────────
        success:
          "bg-green-50 text-green-700 ring-1 ring-green-200",
        warning:
          "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        destructive:
          "bg-red-50 text-red-700 ring-1 ring-red-200",

        // ── Triage levels (clinical) ───────────────────────────────────────
        emergency:
          "bg-red-50 text-red-700 ring-1 ring-red-200",
        urgent:
          "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
        semi_urgent:
          "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        non_urgent:
          "bg-green-50 text-green-700 ring-1 ring-green-200",
        self_care:
          "bg-blue-50 text-blue-700 ring-1 ring-blue-200",

        // ── Encounter status ───────────────────────────────────────────────
        pending:
          "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        reviewed:
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        closed:
          "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
        in_progress:
          "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
      },

      size: {
        sm:      "px-2    py-0.5 text-[10px] leading-4",
        default: "px-2.5 py-0.5 text-xs    leading-5",
        md:      "px-3    py-1   text-sm    leading-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional leading dot indicator */
  dot?: boolean;
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
