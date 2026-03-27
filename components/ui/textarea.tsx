import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[100px] w-full",
          "rounded-xl border border-input bg-card",
          "px-4 py-3",
          "text-base text-foreground",
          "placeholder:text-muted-foreground/60",
          "shadow-xs",
          "resize-none",
          // Focus
          "transition-all duration-150",
          "focus-visible:outline-none",
          "focus-visible:border-primary/60",
          "focus-visible:shadow-focus-ring",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
          // Error
          hasError && "border-destructive/60 focus-visible:border-destructive/80 focus-visible:shadow-focus-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
