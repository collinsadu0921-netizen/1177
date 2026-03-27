import * as React from "react";
import { cn } from "@/lib/utils";

// ── Card ──────────────────────────────────────────────────────────────────────
// Uses shadow + minimal border rather than heavy border-only for a modern feel.
// shadow-card = subtle elevation without harsh lines.

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Adds hover lift + press-scale for interactive/clickable cards */
    interactive?: boolean;
  }
>(({ className, interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base surface
      "rounded-xl bg-card",
      // Subtle shadow + very light border (for contrast on white-on-white)
      "shadow-card border border-border/50",
      // Interactive mode
      interactive && [
        "cursor-pointer transition-all duration-150 ease-smooth",
        "hover:shadow-md hover:border-border",
        "active:scale-[0.985] active:shadow-sm",
      ],
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

// ── CardHeader ────────────────────────────────────────────────────────────────
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 p-5 pb-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// ── CardTitle ─────────────────────────────────────────────────────────────────
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-semibold leading-tight tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// ── CardDescription ───────────────────────────────────────────────────────────
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// ── CardContent ───────────────────────────────────────────────────────────────
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// ── CardFooter ────────────────────────────────────────────────────────────────
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-3 p-5 pt-0",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// ── CardDivider ───────────────────────────────────────────────────────────────
// Thin rule between card sections — avoids hard borders.
const CardDivider = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn("mx-5 border-t border-border/60", className)}
    {...props}
  />
));
CardDivider.displayName = "CardDivider";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardDivider,
};
