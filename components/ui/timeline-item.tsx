import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Date or time label on the left */
  timeLabel: string;
  /** Main content */
  children: React.ReactNode;
  /** Show connecting line below (false for last item) */
  hasConnector?: boolean;
  /** Dot color variant */
  dotVariant?: "default" | "success" | "warning" | "danger" | "muted";
}

/**
 * TimelineItem — a single entry in the patient encounter history timeline.
 * Renders a vertical line + dot connector for scannable chronological layout.
 */
export function TimelineItem({
  timeLabel,
  children,
  hasConnector = true,
  dotVariant = "default",
  className,
  ...props
}: TimelineItemProps) {
  const dotColor = {
    default: "bg-primary border-primary/30",
    success: "bg-success border-success/30",
    warning: "bg-warning border-warning/30",
    danger:  "bg-destructive border-destructive/30",
    muted:   "bg-muted-foreground/40 border-muted-foreground/20",
  }[dotVariant];

  return (
    <div className={cn("flex gap-4", className)} {...props}>
      {/* Left: time label + connector */}
      <div className="flex flex-col items-center pt-0.5">
        {/* Dot */}
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full border-2 shrink-0 ring-4 ring-background",
            dotColor
          )}
          aria-hidden
        />
        {/* Connector line */}
        {hasConnector && (
          <span className="flex-1 w-px bg-border mt-2 min-h-[1.5rem]" aria-hidden />
        )}
      </div>

      {/* Right: content + timestamp */}
      <div className="flex-1 pb-5 min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
          {timeLabel}
        </p>
        {children}
      </div>
    </div>
  );
}
