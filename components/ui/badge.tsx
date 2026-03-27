import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline: "border border-current text-foreground",
        // Triage levels
        emergency: "border-transparent bg-red-100 text-red-700",
        urgent: "border-transparent bg-orange-100 text-orange-700",
        semi_urgent: "border-transparent bg-yellow-100 text-yellow-700",
        non_urgent: "border-transparent bg-green-100 text-green-700",
        self_care: "border-transparent bg-blue-100 text-blue-700",
        // Status
        pending: "border-transparent bg-amber-100 text-amber-700",
        reviewed: "border-transparent bg-emerald-100 text-emerald-700",
        closed: "border-transparent bg-slate-100 text-slate-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
