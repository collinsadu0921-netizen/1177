import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Displays a red error ring when true */
  hasError?: boolean;
  /** Icon displayed on the left side */
  startIcon?: React.ReactNode;
  /** Icon or element on the right side */
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, startIcon, endIcon, ...props }, ref) => {
    const hasIcons = startIcon || endIcon;

    if (hasIcons) {
      return (
        <div className="relative flex items-center">
          {startIcon && (
            <span className="absolute left-3.5 flex items-center text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0 pointer-events-none z-10">
              {startIcon}
            </span>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              inputBase,
              startIcon && "pl-10",
              endIcon && "pr-10",
              hasError && inputError,
              className
            )}
            {...props}
          />
          {endIcon && (
            <span className="absolute right-3.5 flex items-center text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
              {endIcon}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(inputBase, hasError && inputError, className)}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// ── Shared style strings ─────────────────────────────────────────────────────

const inputBase = [
  "flex h-12 w-full",
  "rounded-xl border border-input bg-card",
  "px-4 py-2.5",
  "text-base text-foreground",
  "placeholder:text-muted-foreground/60",
  "shadow-xs",
  // Focus
  "transition-all duration-150",
  "focus-visible:outline-none",
  "focus-visible:border-primary/60",
  "focus-visible:shadow-focus-ring",
  // Disabled
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
  // File
  "file:border-0 file:bg-transparent file:text-sm file:font-medium",
].join(" ");

const inputError = [
  "border-destructive/60",
  "focus-visible:border-destructive/80",
  "focus-visible:shadow-focus-destructive",
].join(" ");

export { Input };
