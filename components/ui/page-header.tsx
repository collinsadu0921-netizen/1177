import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  /** Optional right-side element (e.g. a settings icon or badge) */
  action?: React.ReactNode;
  /** Size variant */
  size?: "default" | "lg";
}

/**
 * PageHeader — top of a screen section.
 * Provides consistent title/subtitle hierarchy across all patient and clinician pages.
 */
export function PageHeader({
  title,
  subtitle,
  action,
  size = "default",
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn("flex items-start justify-between gap-4", className)}
      {...props}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <h1
          className={cn(
            "font-bold tracking-tight text-foreground text-balance",
            size === "lg" ? "text-2xl" : "text-xl"
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground text-pretty">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0 mt-0.5">{action}</div>
      )}
    </div>
  );
}
