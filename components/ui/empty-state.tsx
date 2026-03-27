import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon element — recommend a Lucide icon at ~h-8 w-8 */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Primary CTA */
  action?: React.ReactNode;
  /** Visual style */
  variant?: "default" | "dashed";
}

/**
 * EmptyState — zero-data placeholder.
 * Used when a list is empty or data is pending.
 * Keep content concise: one line title, one line description, one CTA.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl px-6 py-12",
        variant === "dashed"
          ? "border-2 border-dashed border-border bg-transparent"
          : "bg-card shadow-card border border-border/50",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="text-center space-y-1.5 max-w-[200px]">
        <p className="font-semibold text-sm text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
