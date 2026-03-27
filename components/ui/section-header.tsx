import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Visual weight */
  variant?: "default" | "subtle";
}

/**
 * SectionHeader — a labelled section within a page.
 * Uses uppercase tracking-wide style for visual hierarchy separation.
 */
export function SectionHeader({
  title,
  description,
  action,
  variant = "default",
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3", className)}
      {...props}
    >
      <div className="min-w-0">
        {variant === "subtle" ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
        ) : (
          <p className="text-sm font-semibold text-foreground">
            {title}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0">{action}</div>
      )}
    </div>
  );
}
