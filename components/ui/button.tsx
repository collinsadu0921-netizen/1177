import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // ── Base ──────────────────────────────────────────────────────────────
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold tracking-tight leading-none",
    "transition-all duration-150 ease-smooth",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "select-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    // Press feedback on touch
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        // ── Filled primary ─────────────────────────────────────────────
        default: [
          "bg-primary text-primary-foreground",
          "shadow-sm",
          "hover:bg-primary-700",
          "active:bg-primary-800",
        ],

        // ── Soft / secondary ───────────────────────────────────────────
        soft: [
          "bg-primary-50 text-primary-700",
          "hover:bg-primary-100",
          "active:bg-primary-200",
        ],

        // ── Outlined ───────────────────────────────────────────────────
        outline: [
          "border border-border bg-card text-foreground",
          "shadow-xs",
          "hover:border-primary/40 hover:bg-accent hover:text-primary",
        ],

        // ── Ghost ──────────────────────────────────────────────────────
        ghost: [
          "text-foreground",
          "hover:bg-accent hover:text-primary",
        ],

        // ── Destructive ────────────────────────────────────────────────
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-sm",
          "hover:bg-destructive/90",
        ],

        // ── Destructive soft ───────────────────────────────────────────
        "destructive-soft": [
          "bg-red-50 text-red-700",
          "hover:bg-red-100",
        ],

        // ── Link ───────────────────────────────────────────────────────
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
          "active:scale-100",
          "h-auto p-0",
        ],
      },

      size: {
        xs:   "h-8 rounded-lg px-3 text-xs [&_svg]:size-3.5",
        sm:   "h-9 rounded-[10px] px-3.5 text-sm [&_svg]:size-4",
        default: "h-11 rounded-xl px-5 text-sm [&_svg]:size-4",
        lg:   "h-12 rounded-xl px-6 text-base [&_svg]:size-5",
        xl:   "h-14 rounded-2xl px-8 text-base [&_svg]:size-5 w-full",
        icon: "h-10 w-10 rounded-xl [&_svg]:size-5",
        "icon-sm": "h-8 w-8 rounded-lg [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
