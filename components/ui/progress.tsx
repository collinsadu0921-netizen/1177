"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Show percentage label inline */
  showLabel?: boolean;
  /** Override track height */
  size?: "xs" | "sm" | "default" | "lg";
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, showLabel, size = "default", ...props }, ref) => {
  const trackHeight = {
    xs:      "h-1",
    sm:      "h-1.5",
    default: "h-2",
    lg:      "h-3",
  }[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex-1 overflow-hidden rounded-full bg-secondary",
          trackHeight
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-smooth",
            // Gradient fill for premium feel
            "bg-gradient-to-r from-primary-600 to-primary-500"
          )}
          style={{ width: `${value ?? 0}%` }}
        />
      </ProgressPrimitive.Root>

      {showLabel && (
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground w-8 text-right">
          {Math.round(value ?? 0)}%
        </span>
      )}
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
