import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface StepHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 1-based current step number */
  current: number;
  /** Total number of steps */
  total: number;
  /** Label for the current step */
  stepLabel: string;
  /** Optional back handler — renders a back arrow if provided */
  onBack?: () => void;
}

/**
 * StepHeader — sticky progress header for multi-step flows.
 * Shows step count, step label, and a smooth progress bar.
 * Used in the encounter symptom intake flow.
 */
export function StepHeader({
  current,
  total,
  stepLabel,
  onBack,
  className,
  ...props
}: StepHeaderProps) {
  const progress = Math.round((current / total) * 100);

  return (
    <div
      className={cn(
        "sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/60",
        className
      )}
      {...props}
    >
      <div className="page-container py-3 flex flex-col gap-2.5">
        {/* Top row: back + step label */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                "text-muted-foreground",
                "hover:bg-accent hover:text-foreground",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "-ml-1"
              )}
            >
              <svg
                width="16" height="16" viewBox="0 0 16 16"
                fill="none" xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M10 12L6 8l4-4"
                  stroke="currentColor" strokeWidth="1.75"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <div className="flex-1 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {stepLabel}
            </span>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {current} / {total}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progress} size="xs" />
      </div>
    </div>
  );
}
